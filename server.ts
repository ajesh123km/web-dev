import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createHttpServer } from 'http';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import { Resend } from 'resend';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = !isProd ? 3000 : parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Persistent local storage path as safe fallback/cache
const DATA_DIR = path.join(__dirname, 'data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed initial enquiries if none exist
if (!fs.existsSync(ENQUIRIES_FILE)) {
  fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify([
    {
      id: "demo-enq-001",
      full_name: "S. Murugan",
      mobile_number: "9842109876",
      email: "murugan.kkl@gmail.com",
      city: "Nagercoil",
      preferred_scheme: "₹2,00,000 Scheme",
      preferred_language: "ta",
      message: "Interested in the 20-month ₹2 Lakh chit scheme. Please share the joining formalities and auction dates.",
      consent: true,
      enquiry_status: "New",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: "demo-enq-002",
      full_name: "K. Anitha",
      mobile_number: "9443215678",
      email: "anitha.kanya@gmail.com",
      city: "Villukuri",
      preferred_scheme: "₹1,00,000 Scheme",
      preferred_language: "ta",
      message: "Would like to know the prompt payment bonus rules and guarantor requirement.",
      consent: true,
      enquiry_status: "Contacted",
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ], null, 2));
}

// Helpers for reading/writing local enquiries
function getLocalEnquiries(): any[] {
  try {
    const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalEnquiry(enquiry: any): void {
  const all = getLocalEnquiries();
  all.unshift(enquiry);
  fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(all, null, 2));
}

function updateLocalEnquiryStatus(id: string, status: string): boolean {
  const all = getLocalEnquiries();
  const target = all.find((item: any) => item.id === id);
  if (target) {
    target.enquiry_status = status;
    target.updated_at = new Date().toISOString();
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(all, null, 2));
    return true;
  }
  return false;
}

function broadcastPublicUpdate(event: 'schemes' | 'announcements'): void {
  for (const client of publicRealtimeClients) {
    client.write(`event: ${event}\ndata: {}\n\n`);
  }
}

function startPublicRealtime(): void {
  if (!supabase || publicRealtimeChannel) return;

  publicRealtimeChannel = supabase
    .channel('public-website-updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chit_schemes' }, () => {
      broadcastPublicUpdate('schemes');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
      broadcastPublicUpdate('announcements');
    })
    .subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        console.info('[Supabase Realtime] Public content subscription active.');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(
          `[Supabase Realtime] Public content subscription ${status.toLowerCase()}: ${error?.message || 'No details.'}`
        );
      }
    });
}

const SCHEMES_FILE = path.join(DATA_DIR, 'schemes.json');
const SCHEME_VERSIONS_FILE = path.join(DATA_DIR, 'scheme_versions.json');
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PAYMENT_CONFIGS_FILE = path.join(DATA_DIR, 'payment_configs.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit_logs.json');

function normalizeSupabaseUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const dashboardMatch = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch?.[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }
  return trimmed;
}

// Supabase Client initialization (initialized early so write-through helpers are safely accessible)
const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY;
const supabaseKeyMode = process.env.SUPABASE_SECRET_KEY
  ? 'secret'
  : process.env.SUPABASE_SERVICE_ROLE_KEY
  ? 'service_role'
  : process.env.SUPABASE_KEY
  ? 'key'
  : 'none';
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project'));

let supabase: ReturnType<typeof createClient> | null = null;
let publicRealtimeChannel: RealtimeChannel | null = null;
const publicRealtimeClients = new Set<Response>();
let supabaseTablesReady = false;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl!, supabaseKey!);
    console.log(`[Supabase] Client initialized (${supabaseKeyMode} key).`);
  } catch (err) {
    console.warn('[Supabase] Initialization failed:', err);
  }
} else {
  console.log('[Supabase] Credentials not set in env. Using persistent local storage.');
}

async function syncTableUpsert(
  table: string,
  rows: any[],
  onConflict: string = 'id'
): Promise<{ ok: boolean; error?: string; code?: string }> {
  if (!supabase || !rows || rows.length === 0) return { ok: true };
  try {
    const { error } = await (supabase as any).from(table).upsert(rows, { onConflict });
    if (error) {
      console.warn(`[Supabase] Upsert warning (${table}):`, error.message);
      return { ok: false, error: error.message, code: error.code };
    }
    return { ok: true };
  } catch (err: any) {
    console.warn(`[Supabase] Upsert exception (${table}):`, err);
    return { ok: false, error: err?.message || 'Supabase upsert failed' };
  }
}

async function syncTableDelete(
  table: string,
  column: string,
  value: string
): Promise<{ ok: boolean; error?: string; code?: string }> {
  if (!supabase) return { ok: true };
  try {
    const { error } = await (supabase as any).from(table).delete().eq(column, value);
    if (error) {
      console.warn(`[Supabase] Delete warning (${table}):`, error.message);
      return { ok: false, error: error.message, code: error.code };
    }
    return { ok: true };
  } catch (err: any) {
    console.warn(`[Supabase] Delete exception (${table}):`, err);
    return { ok: false, error: err?.message || 'Supabase delete failed' };
  }
}

function schemeToDbRow(s: any) {
  return {
    id: s.id,
    scheme_code: s.schemeCode,
    name_en: s.nameEn,
    name_ta: s.nameTa,
    chit_value: Number(s.chitValue),
    duration_months: Number(s.durationMonths || 20),
    available_durations: Array.isArray(s.availableDurations) ? s.availableDurations.map(Number) : [Number(s.durationMonths || 20)],
    first_month_instalment: Number(s.firstMonthInstalment),
    min_instalment: Number(s.minInstalment),
    max_instalment: Number(s.maxInstalment),
    total_instalments_paid: Number(s.totalInstalmentsPaid),
    dividend_benefit: Number(s.dividendBenefit),
    prompt_bonus: Number(s.promptBonus || 0),
    last_month_bonus: Number(s.lastMonthBonus || 0),
    total_bonus: Number(s.totalBonus || 0),
    tagline_en: s.taglineEn || null,
    tagline_ta: s.taglineTa || null,
    document_image: s.documentImage || '/images/5-lakh-scheme.jpeg',
    schedule_json: Array.isArray(s.schedule) ? s.schedule : [],
    rules_en: Array.isArray(s.rulesEn) ? s.rulesEn : [],
    rules_ta: Array.isArray(s.rulesTa) ? s.rulesTa : [],
    status: s.status || 'active',
    start_date: s.startDate ? String(s.startDate).split('T')[0] : new Date().toISOString().split('T')[0],
    version: Number(s.version || 1),
    created_at: s.createdAt || new Date().toISOString(),
    updated_at: s.updatedAt || new Date().toISOString()
  };
}

function dbRowToScheme(row: any) {
  const chitValue = Number(row.chit_value);
  const durationMonths = Number(row.duration_months || 20);
  const promptBonus = Number(row.prompt_bonus || 0);
  const lastMonthBonus = Number(row.last_month_bonus || 0);
  const calc = (!Array.isArray(row.schedule_json) || row.schedule_json.length === 0)
    ? buildProportionalSchedule(chitValue, durationMonths)
    : null;
  return {
    id: row.id,
    schemeCode: row.scheme_code,
    nameEn: row.name_en,
    nameTa: row.name_ta,
    chitValue,
    chitValueFormatted: formatInr(chitValue),
    chitValueFormattedTa: formatInr(chitValue),
    durationMonths,
    availableDurations: Array.isArray(row.available_durations) && row.available_durations.length > 0
      ? row.available_durations.map(Number)
      : [durationMonths],
    firstMonthInstalment: Number(row.first_month_instalment || calc?.firstMonthInstalment || 0),
    minInstalment: Number(row.min_instalment || calc?.minInstalment || 0),
    maxInstalment: Number(row.max_instalment || calc?.maxInstalment || 0),
    totalInstalmentsPaid: Number(row.total_instalments_paid || calc?.totalInstalmentsPaid || 0),
    dividendBenefit: Number(row.dividend_benefit || calc?.dividendBenefit || 0),
    promptBonus,
    lastMonthBonus,
    totalBonus: Number(row.total_bonus ?? promptBonus + lastMonthBonus),
    taglineEn: row.tagline_en || '',
    taglineTa: row.tagline_ta || '',
    documentImage: row.document_image || '/images/5-lakh-scheme.jpeg',
    schedule: Array.isArray(row.schedule_json) && row.schedule_json.length > 0 ? row.schedule_json : (calc?.schedule || []),
    rulesEn: Array.isArray(row.rules_en) && row.rules_en.length > 0 ? row.rules_en : getDefaultRulesEn(promptBonus, lastMonthBonus, durationMonths),
    rulesTa: Array.isArray(row.rules_ta) && row.rules_ta.length > 0 ? row.rules_ta : getDefaultRulesTa(promptBonus, lastMonthBonus),
    status: row.status || 'active',
    startDate: row.start_date || undefined,
    version: Number(row.version || 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function schemeVersionToDbRow(v: any) {
  return {
    id: v.id,
    scheme_id: v.scheme_id,
    version: Number(v.version || 1),
    name_en: v.name_en,
    chit_value: Number(v.chit_value),
    duration_months: Number(v.duration_months || 20),
    available_durations: Array.isArray(v.available_durations) ? v.available_durations.map(Number) : [Number(v.duration_months || 20)],
    snapshot_data: v.snapshot_data || {},
    change_reason: v.change_reason || null,
    created_by: v.created_by || 'Admin',
    created_at: v.created_at || new Date().toISOString()
  };
}

function groupToDbRow(g: any) {
  const row: any = {
    id: g.id,
    name: g.name,
    scheme_id: g.scheme_id || null,
    scheme_version: Number(g.scheme_version || 1),
    scheme_name: g.scheme_name,
    chit_value: Number(g.chit_value),
    duration_months: Number(g.duration_months || 20),
    start_date: g.start_date ? String(g.start_date).split('T')[0] : new Date().toISOString().split('T')[0],
    status: g.status || 'active',
    max_members: Number(g.max_members || 99),
    created_at: g.created_at || new Date().toISOString(),
    updated_at: g.updated_at || g.created_at || new Date().toISOString()
  };
  if (g.archived_at) {
    row.archived_at = g.archived_at;
  }
  return row;
}

function dbRowToGroup(row: any) {
  return {
    id: row.id,
    name: row.name,
    scheme_id: row.scheme_id || undefined,
    scheme_version: Number(row.scheme_version || 1),
    scheme_name: row.scheme_name,
    chit_value: Number(row.chit_value),
    duration_months: Number(row.duration_months || 20),
    start_date: row.start_date,
    status: row.status || 'active',
    max_members: Number(row.max_members || 99),
    archived_at: row.archived_at || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function userToDbRow(u: any) {
  return {
    id: u.id,
    user_id: u.user_id,
    full_name: u.full_name,
    mobile_number: u.mobile_number,
    address: u.address,
    city: u.city || 'Villukuri',
    email: u.email || null,
    group_id: u.group_id || null,
    group_name: u.group_name || null,
    password_hash: u.password_hash,
    status: u.status || 'active',
    is_deleted: Boolean(u.is_deleted),
    deleted_at: u.deleted_at || null,
    auth_uid: u.auth_uid || null,
    role: 'user',
    created_at: u.created_at || new Date().toISOString(),
    updated_at: u.updated_at || u.created_at || new Date().toISOString()
  };
}

function paymentConfigToDbRow(c: any) {
  return {
    id: c.id,
    group_id: c.group_id,
    group_name: c.group_name || null,
    month: Number(c.month),
    month_label: c.month_label,
    year: Number(c.year),
    payment_amount: Number(c.payment_amount),
    due_date: c.due_date ? String(c.due_date).split('T')[0] : new Date().toISOString().split('T')[0],
    created_by: c.created_by || 'Admin',
    created_at: c.created_at || new Date().toISOString()
  };
}

function paymentToDbRow(p: any) {
  return {
    id: p.id,
    user_id: p.user_id,
    user_name: p.user_name,
    group_id: p.group_id,
    group_name: p.group_name,
    payment_month: Number(p.payment_month),
    month_name: p.month_name,
    payment_year: Number(p.payment_year),
    payment_amount: Number(p.payment_amount),
    payment_status: p.payment_status || 'UNPAID',
    payment_date: p.payment_date || null,
    updated_by: p.updated_by || 'Admin',
    receipt_number: p.receipt_number || null,
    notes: p.notes || null,
    last_updated: p.last_updated || new Date().toISOString(),
    created_at: p.created_at || new Date().toISOString()
  };
}

function dbRowToPayment(row: any) {
  return {
    ...row,
    payment_month: Number(row.payment_month),
    payment_year: Number(row.payment_year),
    payment_amount: Number(row.payment_amount),
    receipt_number: row.receipt_number || undefined
  };
}

function announcementToDbRow(a: any) {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category || 'General',
    target_type: a.target_type || (a.target_group_id && a.target_group_id !== 'all' ? 'group' : 'all'),
    target_group_id: a.target_group_id || null,
    target_group_name: a.target_group_name || null,
    target_scheme_id: a.target_scheme_id || null,
    target_scheme_name: a.target_scheme_name || null,
    is_auto_generated: Boolean(a.is_auto_generated),
    source_event_key: a.source_event_key || null,
    is_published: a.is_published !== undefined ? Boolean(a.is_published) : true,
    is_archived: Boolean(a.is_archived),
    archived_at: a.archived_at || null,
    publish_date: a.publish_date ? String(a.publish_date).split('T')[0] : new Date().toISOString().split('T')[0],
    created_by: a.created_by || 'Admin',
    created_at: a.created_at || new Date().toISOString(),
    updated_at: a.updated_at || a.created_at || new Date().toISOString()
  };
}

function auditLogToDbRow(l: any) {
  return {
    id: l.id,
    action: l.action,
    details: l.details,
    performed_by: l.performed_by || 'Admin',
    target_id: l.target_id || null,
    timestamp: l.timestamp || new Date().toISOString()
  };
}

// Security & Password Hashing (scrypt + backwards compatibility for legacy SHA-256 hashes)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || typeof password !== 'string') return false;
  if (storedHash.startsWith('scrypt:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const [, salt, hex] = parts;
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(hex, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  }
  const legacySalt = 'teamstars_chit_salt_2025';
  const legacyHash = crypto.createHash('sha256').update(password + legacySalt).digest('hex');
  return legacyHash === storedHash;
}

function validateStrongPassword(password: string): string | null {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  if (/\s/.test(password)) {
    return 'Password must not contain spaces.';
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include at least one letter and one number.';
  }
  return null;
}

// User In-Memory Sessions
const userSessions = new Map<string, { userId: string; expiresAt: number }>();

function generateUserToken(userId: string): string {
  const token = `ts_usr_${userId}_${crypto.randomBytes(16).toString('hex')}`;
  userSessions.set(token, {
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  return token;
}

function revokeUserSessions(userId: string): number {
  let removed = 0;
  for (const [tok, sess] of userSessions.entries()) {
    if (sess.userId.toLowerCase() === userId.toLowerCase()) {
      userSessions.delete(tok);
      removed++;
    }
  }
  return removed;
}

function getAuthenticatedUser(req: Request): any | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const session = userSessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    userSessions.delete(token);
    return null;
  }
  const users = getLocalUsers();
  return users.find((u: any) => u.user_id === session.userId && u.status === 'active' && !u.is_deleted) || null;
}

// 0. Schemes & Version History Storage & Seeding
function buildProportionalSchedule(chitValue: number, durationMonths: number) {
  const safeMonths = Math.max(2, Math.min(60, Math.round(durationMonths) || 20));
  const baseInstalment = Math.round(chitValue / safeMonths);
  const schedule = [];
  for (let m = 1; m <= safeMonths; m++) {
    const progress = safeMonths > 1 ? (m - 1) / (safeMonths - 1) : 1;
    const factor = m === 1 || m === safeMonths ? 1 : 0.83 + 0.17 * progress;
    const instalment = Math.round((baseInstalment * factor) / 10) * 10;
    const prizeFactor = m === 1 || m === safeMonths ? 0.95 : 0.78 + 0.17 * progress;
    const chitAmount = Math.round((chitValue * prizeFactor) / 100) * 100;
    schedule.push({ month: m, instalment, chitAmount });
  }
  const totalInstalmentsPaid = schedule.reduce((acc, r) => acc + r.instalment, 0);
  const minInstalment = Math.min(...schedule.map((r) => r.instalment));
  const maxInstalment = Math.max(...schedule.map((r) => r.instalment));
  const dividendBenefit = Math.max(0, chitValue - totalInstalmentsPaid);
  return {
    schedule,
    firstMonthInstalment: schedule[0]?.instalment || baseInstalment,
    minInstalment,
    maxInstalment,
    totalInstalmentsPaid,
    dividendBenefit
  };
}

function formatInr(amount: number): string {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

function getDefaultRulesEn(promptBonus: number, lastMonthBonus: number, durationMonths: number) {
  return [
    'Instalment Payment: Monthly instalments can be paid directly or via bank transfer on or before the 10th of every month. Bank transfer is preferred; account details shared separately.',
    'Late Fee: If the instalment is not paid on or before the 10th, a late fee of ₹20 per delayed day will be added.',
    'Draw / Auction: Conducted on the 11th of every month. If a member voluntarily requests on or before the 10th, the amount will be disbursed to them. If 2 or more members request, selection will be conducted by lucky draw (குலுக்கல்).',
    'Disbursement: The prize amount is disbursed to the selected member on or before the 25th of the month.',
    'Guarantors & Documents: The recipient must provide 2 persons as co-signers/guarantors to sign, submit 2 blank cheques, and furnish all required KYC documents and collateral documents as per government rules.',
    'Mode of Payment: Disbursed via Cheque or direct Bank Transfer to the selected member.',
    'Statutory Compliance: Any changes or amendments issued by the government or the company must be strictly complied with by members.',
    `Prompt Payment Bonus: All members who regularly pay their instalments on or before the 10th of every month receive a special BONUS of ${formatInr(promptBonus)} at chit conclusion.`,
    `Last Month Special Benefit: For the member taking the chit in the final (${durationMonths}th) month, if all previous monthly instalments were paid on time, an additional ${formatInr(lastMonthBonus)} is given (Total: ${formatInr(promptBonus)} + ${formatInr(lastMonthBonus)} = ${formatInr(promptBonus + lastMonthBonus)}).`
  ];
}

function getDefaultRulesTa(promptBonus: number, lastMonthBonus: number) {
  return [
    'தவணை தொகை செலுத்துதல்: தவணை தொகையை ஒவ்வொரு மாதமும் 10-ஆம் தேதியோ அல்லது அதற்கு முன்னரோ நேரடியாகவோ அல்லது வங்கி பரிமாற்றம் மூலமாகவோ செலுத்தலாம்.',
    'தாமத கட்டணம்: 10-ஆம் தேதிக்கு அல்லது அதற்கு முன் தவணை தொகை செலுத்தப்படாவிட்டால், தாமதமான ஒவ்வொரு நாளுக்கும் ₹20 வீதம் தாமத கட்டணம் சேர்த்து செலுத்த வேண்டும்.',
    'குலுக்கல் / ஏலம்: ஒவ்வொரு மாதமும் 11-ஆம் தேதி குலுக்கல்/ஏலம் நடைபெறும். இரண்டு அல்லது அதற்கு மேற்பட்டவர்கள் கேட்டால் குலுக்கல் முறையில் ஒருவர் தேர்வு செய்யப்படுவார்.',
    'தொகை வழங்குதல்: தேர்வு செய்யப்பட்ட நபருக்கு ஒவ்வொரு மாதமும் 25-ஆம் தேதிக்குள் தொகை வழங்கப்படும்.',
    'உத்தரவாதம், ஆவணங்கள் மற்றும் காசோலைகள்: பணம் பெறுபவர் 2 உத்தரவாத கையொப்பம், 2 வெற்று காசோலைகள் மற்றும் KYC ஆவணங்களை வழங்க வேண்டும்.',
    'பணம் வழங்கும் முறை: தொகை காசோலை அல்லது வங்கி பரிமாற்றம் மூலமாக வழங்கப்படும்.',
    'அரசாங்க விதிமுறைகள்: அரசாங்கம் அல்லது நிறுவன விதிமுறைகளை உறுப்பினர்கள் கட்டாயமாக பின்பற்ற வேண்டும்.',
    `சிறப்பு ஊக்கத்தொகை (BONUS): 10-ஆம் தேதிக்குள் முறையாக செலுத்திய உறுப்பினர்களுக்கு சீட்டு முடிவடைந்த பின் ${formatInr(promptBonus)} வழங்கப்படும்.`,
    `கடைசி மாத சிறப்பு நன்மை: கடைசி மாதத்தில் சீட்டு பெறுபவருக்கு கூடுதலாக ${formatInr(lastMonthBonus)} வழங்கப்படும் (மொத்தம்: ${formatInr(promptBonus + lastMonthBonus)}).`
  ];
}

function getLocalSchemes(): any[] {
  try {
    if (!fs.existsSync(SCHEMES_FILE)) return [];
    return JSON.parse(fs.readFileSync(SCHEMES_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLocalSchemes(schemes: any[]): void {
  fs.writeFileSync(SCHEMES_FILE, JSON.stringify(schemes, null, 2));
}

function getLocalSchemeVersions(): any[] {
  try {
    if (!fs.existsSync(SCHEME_VERSIONS_FILE)) return [];
    return JSON.parse(fs.readFileSync(SCHEME_VERSIONS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLocalSchemeVersions(versions: any[]): void {
  fs.writeFileSync(SCHEME_VERSIONS_FILE, JSON.stringify(versions, null, 2));
}

function recordSchemeVersion(scheme: any, changeReason: string, createdBy: string = 'Admin') {
  const versions = getLocalSchemeVersions();
  const entry = {
    id: `schv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    scheme_id: scheme.id,
    version: scheme.version || 1,
    name_en: scheme.nameEn,
    chit_value: scheme.chitValue,
    duration_months: scheme.durationMonths,
    available_durations: scheme.availableDurations || [scheme.durationMonths],
    snapshot_data: scheme,
    change_reason: changeReason,
    created_by: createdBy,
    created_at: new Date().toISOString()
  };
  versions.unshift(entry);
  saveLocalSchemeVersions(versions);
  void syncTableUpsert('scheme_versions', [schemeVersionToDbRow(entry)], 'id');
}

if (!fs.existsSync(SCHEMES_FILE)) {
  const now = new Date().toISOString();
  const base1L = {
    id: 'scheme-1-lakh',
    schemeCode: 'TSC-1L-20M',
    nameEn: '₹1,00,000 Chit Scheme',
    nameTa: '₹1,00,000 சீட்டு திட்டம் (1 லக்)',
    chitValue: 100000,
    chitValueFormatted: '₹1,00,000',
    chitValueFormattedTa: '₹1,00,000',
    durationMonths: 20,
    availableDurations: [20],
    firstMonthInstalment: 5000,
    minInstalment: 4150,
    maxInstalment: 5000,
    totalInstalmentsPaid: 90375,
    dividendBenefit: 9625,
    promptBonus: 2000,
    lastMonthBonus: 400,
    totalBonus: 2400,
    taglineEn: 'Ideal for disciplined individual savings, household planning, and festival preparedness.',
    taglineTa: 'தனிநபர் சேமிப்பு, குடும்ப திட்டமிடல் மற்றும் திருவிழா செலவுகளுக்கு ஏற்ற சிறந்த திட்டம்.',
    documentImage: '/images/1-lakh-scheme.jpeg',
    status: 'active',
    version: 1,
    rulesEn: getDefaultRulesEn(2000, 400, 20),
    rulesTa: getDefaultRulesTa(2000, 400),
    schedule: [
      { month: 1, instalment: 5000, chitAmount: 95000 },
      { month: 2, instalment: 4150, chitAmount: 78000 },
      { month: 3, instalment: 4170, chitAmount: 78400 },
      { month: 4, instalment: 4200, chitAmount: 79000 },
      { month: 5, instalment: 4220, chitAmount: 79400 },
      { month: 6, instalment: 4250, chitAmount: 80000 },
      { month: 7, instalment: 4280, chitAmount: 80600 },
      { month: 8, instalment: 4310, chitAmount: 81200 },
      { month: 9, instalment: 4350, chitAmount: 82000 },
      { month: 10, instalment: 4400, chitAmount: 83000 },
      { month: 11, instalment: 4420, chitAmount: 83400 },
      { month: 12, instalment: 4450, chitAmount: 84000 },
      { month: 13, instalment: 4500, chitAmount: 85000 },
      { month: 14, instalment: 4575, chitAmount: 86500 },
      { month: 15, instalment: 4650, chitAmount: 88000 },
      { month: 16, instalment: 4750, chitAmount: 90000 },
      { month: 17, instalment: 4850, chitAmount: 92000 },
      { month: 18, instalment: 4900, chitAmount: 93000 },
      { month: 19, instalment: 4950, chitAmount: 94000 },
      { month: 20, instalment: 5000, chitAmount: 95000 }
    ],
    createdAt: now,
    updatedAt: now
  };
  const scaleScheme = (base: any, mult: number, id: string, code: string, nameEn: string, nameTa: string, taglineEn: string, taglineTa: string, img: string) => ({
    ...base,
    id,
    schemeCode: code,
    nameEn,
    nameTa,
    chitValue: base.chitValue * mult,
    chitValueFormatted: formatInr(base.chitValue * mult),
    chitValueFormattedTa: formatInr(base.chitValue * mult),
    firstMonthInstalment: base.firstMonthInstalment * mult,
    minInstalment: base.minInstalment * mult,
    maxInstalment: base.maxInstalment * mult,
    totalInstalmentsPaid: base.totalInstalmentsPaid * mult,
    dividendBenefit: base.dividendBenefit * mult,
    promptBonus: base.promptBonus * mult,
    lastMonthBonus: base.lastMonthBonus * mult,
    totalBonus: base.totalBonus * mult,
    taglineEn,
    taglineTa,
    documentImage: img,
    rulesEn: getDefaultRulesEn(base.promptBonus * mult, base.lastMonthBonus * mult, 20),
    rulesTa: getDefaultRulesTa(base.promptBonus * mult, base.lastMonthBonus * mult),
    schedule: base.schedule.map((r: any) => ({
      month: r.month,
      instalment: r.instalment * mult,
      chitAmount: r.chitAmount * mult
    }))
  });
  const seededSchemes = [
    base1L,
    scaleScheme(
      base1L,
      2,
      'scheme-2-lakh',
      'TSC-2L-20M',
      '₹2,00,000 Chit Scheme',
      '₹2,00,000 சீட்டு திட்டம் (2 லக்)',
      'Our most popular scheme for family milestones, medical contingencies, and education funds.',
      'குடும்ப நிகழ்வுகள், கல்விச் செலவுகள் மற்றும் அவசர நிதிக்கான வாடிக்கையாளர்களின் விருப்பத் திட்டம்.',
      '/images/2-lakh-scheme.jpeg'
    ),
    scaleScheme(
      base1L,
      5,
      'scheme-5-lakh',
      'TSC-5L-20M',
      '₹5,00,000 Chit Scheme',
      '₹5,00,000 சீட்டு திட்டம் (5 லக்)',
      'High-value scheme engineered for small business working capital, asset purchase, and property development.',
      'சிறு தொழில் மூலதனம், சொத்து உருவாக்கம் மற்றும் வணிக விரிவாக்கத்திற்கான பிரீமியம் திட்டம்.',
      '/images/5-lakh-scheme.jpeg'
    ),
    scaleScheme(
      base1L,
      10,
      'scheme-10-lakh',
      'TSC-10L-20M',
      '₹10,00,000 Chit Scheme',
      '₹10,00,000 சீட்டு திட்டம் (10 லக்)',
      'Enterprise-scale 20-month chit plan built for commercial expansion, real estate milestones, and major capital needs.',
      'பெரிய வணிக விரிவாக்கம், சொத்து வாங்குதல் மற்றும் பெருந்தொகை மூலதனத் தேவைகளுக்கான 20 மாத பிரத்யேக திட்டம்.',
      '/images/5-lakh-scheme.jpeg'
    )
  ];
  saveLocalSchemes(seededSchemes);
  if (!fs.existsSync(SCHEME_VERSIONS_FILE)) {
    seededSchemes.forEach((s) => recordSchemeVersion(s, 'Initial seeded scheme', 'System'));
  }
} else {
  // Non-destructive upgrade: ensure ₹10,00,000 scheme exists if not already present
  const existingSchemes = getLocalSchemes();
  if (!existingSchemes.some((s: any) => s.id === 'scheme-10-lakh' || Number(s.chitValue) === 1000000)) {
    const base1L = existingSchemes.find((s: any) => s.id === 'scheme-1-lakh');
    const now = new Date().toISOString();
    const tenLakh = {
      id: 'scheme-10-lakh',
      schemeCode: 'TSC-10L-20M',
      nameEn: '₹10,00,000 Chit Scheme',
      nameTa: '₹10,00,000 சீட்டு திட்டம் (10 லக்)',
      chitValue: 1000000,
      chitValueFormatted: '₹10,00,000',
      chitValueFormattedTa: '₹10,00,000',
      durationMonths: 20,
      availableDurations: [20],
      firstMonthInstalment: 50000,
      minInstalment: 41500,
      maxInstalment: 50000,
      totalInstalmentsPaid: 903750,
      dividendBenefit: 96250,
      promptBonus: 20000,
      lastMonthBonus: 4000,
      totalBonus: 24000,
      taglineEn: 'Enterprise-scale 20-month chit plan built for commercial expansion, real estate milestones, and major capital needs.',
      taglineTa: 'பெரிய வணிக விரிவாக்கம், சொத்து வாங்குதல் மற்றும் பெருந்தொகை மூலதனத் தேவைகளுக்கான 20 மாத பிரத்யேக திட்டம்.',
      documentImage: '/images/5-lakh-scheme.jpeg',
      status: 'active',
      version: 1,
      rulesEn: getDefaultRulesEn(20000, 4000, 20),
      rulesTa: getDefaultRulesTa(20000, 4000),
      schedule: (base1L?.schedule || buildProportionalSchedule(100000, 20).schedule).map((r: any) => ({
        month: r.month,
        instalment: r.instalment * 10,
        chitAmount: r.chitAmount * 10
      })),
      createdAt: now,
      updatedAt: now
    };
    existingSchemes.push(tenLakh);
    saveLocalSchemes(existingSchemes);
    recordSchemeVersion(tenLakh, 'Added default ₹10,00,000 scheme', 'System');
  }
}

// 1. Groups Storage & Seeding
function getLocalGroups(): any[] {
  try {
    if (!fs.existsSync(GROUPS_FILE)) return [];
    return JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLocalGroups(groups: any[]): void {
  fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));
}

if (!fs.existsSync(GROUPS_FILE)) {
  const initialGroups = [
    {
      id: "GRP-2L-01",
      name: "₹2 Lakh Scheme - Batch 2026A",
      scheme_name: "₹2,00,000 Scheme",
      chit_value: 200000,
      duration_months: 20,
      start_date: "2026-01-01",
      status: "active",
      max_members: 99,
      created_at: new Date(Date.now() - 86400000 * 300).toISOString()
    },
    {
      id: "GRP-1L-01",
      name: "₹1 Lakh Scheme - Batch 2026B",
      scheme_name: "₹1,00,000 Scheme",
      chit_value: 100000,
      duration_months: 20,
      start_date: "2026-02-01",
      status: "active",
      max_members: 99,
      created_at: new Date(Date.now() - 86400000 * 270).toISOString()
    },
    {
      id: "GRP-5L-01",
      name: "₹5 Lakh Scheme - Premium Batch",
      scheme_name: "₹5,00,000 Scheme",
      chit_value: 500000,
      duration_months: 20,
      start_date: "2026-03-01",
      status: "active",
      max_members: 99,
      created_at: new Date(Date.now() - 86400000 * 240).toISOString()
    }
  ];
  saveLocalGroups(initialGroups);
}

// 2. Users Storage & Seeding
function getLocalUsers(): any[] {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLocalUsers(users: any[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

if (!fs.existsSync(USERS_FILE)) {
  const initialUsers = [
    {
      id: "usr-001",
      user_id: "TS-2026-001",
      full_name: "S. Murugan",
      mobile_number: "9842109876",
      address: "45/2 Temple Street, Madathattuvillai",
      city: "Villukuri",
      email: "murugan.kkl@gmail.com",
      group_id: "GRP-2L-01",
      group_name: "₹2 Lakh Scheme - Batch 2026A",
      password_hash: hashPassword("user123"),
      status: "active",
      role: "user",
      created_at: new Date(Date.now() - 86400000 * 290).toISOString()
    },
    {
      id: "usr-002",
      user_id: "TS-2026-002",
      full_name: "K. Anitha",
      mobile_number: "9443215678",
      address: "12 Church Road, Nagercoil",
      city: "Nagercoil",
      email: "anitha.kanya@gmail.com",
      group_id: "GRP-1L-01",
      group_name: "₹1 Lakh Scheme - Batch 2026B",
      password_hash: hashPassword("user123"),
      status: "active",
      role: "user",
      created_at: new Date(Date.now() - 86400000 * 260).toISOString()
    },
    {
      id: "usr-003",
      user_id: "TS-2026-003",
      full_name: "R. Ramesh",
      mobile_number: "9789825684",
      address: "88 West Car Street, Kalkulam",
      city: "Kalkulam",
      email: "ramesh.test@gmail.com",
      group_id: "GRP-2L-01",
      group_name: "₹2 Lakh Scheme - Batch 2026A",
      password_hash: hashPassword("user123"),
      status: "active",
      role: "user",
      created_at: new Date(Date.now() - 86400000 * 280).toISOString()
    }
  ];
  saveLocalUsers(initialUsers);
}

// 3. Payment Configs Storage
function getLocalPaymentConfigs(): any[] {
  try {
    if (!fs.existsSync(PAYMENT_CONFIGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(PAYMENT_CONFIGS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLocalPaymentConfigs(configs: any[]): void {
  fs.writeFileSync(PAYMENT_CONFIGS_FILE, JSON.stringify(configs, null, 2));
}

// 4. Payments Storage & Seeding
function getLocalPayments(): any[] {
  try {
    if (!fs.existsSync(PAYMENTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLocalPayments(payments: any[]): void {
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
}

if (!fs.existsSync(PAYMENTS_FILE)) {
  const initialPayments: any[] = [];
  
  // Seed past 10 months history for Murugan (TS-2026-001)
  const pastInstalments = [
    { month: 1, amount: 10000, date: "2026-01-08T10:30:00.000Z", receipt: "REC-2026-0101" },
    { month: 2, amount: 9200, date: "2026-02-09T11:00:00.000Z", receipt: "REC-2026-0201" },
    { month: 3, amount: 9300, date: "2026-03-08T14:20:00.000Z", receipt: "REC-2026-0301" },
    { month: 4, amount: 9350, date: "2026-04-09T16:10:00.000Z", receipt: "REC-2026-0401" },
    { month: 5, amount: 9400, date: "2026-05-07T10:45:00.000Z", receipt: "REC-2026-0501" },
    { month: 6, amount: 9400, date: "2026-06-08T09:15:00.000Z", receipt: "REC-2026-0601" },
    { month: 7, amount: 9450, date: "2026-07-09T12:00:00.000Z", receipt: "REC-2026-0701" },
    { month: 8, amount: 9500, date: "2026-08-08T15:30:00.000Z", receipt: "REC-2026-0801" },
    { month: 9, amount: 9550, date: "2026-09-09T11:20:00.000Z", receipt: "REC-2026-0901" },
    { month: 10, amount: 9600, date: "2026-10-08T10:00:00.000Z", receipt: "REC-2026-1001" },
  ];

  pastInstalments.forEach((item) => {
    initialPayments.push({
      id: `pay-murugan-m${item.month}`,
      user_id: "TS-2026-001",
      user_name: "S. Murugan",
      group_id: "GRP-2L-01",
      group_name: "₹2 Lakh Scheme - Batch 2026A",
      payment_month: item.month,
      month_name: `Month ${item.month} - 2026`,
      payment_year: 2026,
      payment_amount: item.amount,
      payment_status: "PAID",
      payment_date: item.date,
      updated_by: "Admin (Ajesh / Master)",
      receipt_number: item.receipt,
      notes: "Cash payment received directly at Villukuri office counter.",
      last_updated: item.date,
      created_at: item.date
    });
  });

  // Current Month 11 (November 2026) for TS-2026-001 - PAID
  initialPayments.push({
    id: "pay-murugan-m11",
    user_id: "TS-2026-001",
    user_name: "S. Murugan",
    group_id: "GRP-2L-01",
    group_name: "₹2 Lakh Scheme - Batch 2026A",
    payment_month: 11,
    month_name: "Month 11 - Nov 2026",
    payment_year: 2026,
    payment_amount: 9400,
    payment_status: "PAID",
    payment_date: "2026-11-09T10:15:00.000Z",
    updated_by: "Admin (Cash Verification)",
    receipt_number: "REC-2026-1101",
    notes: "Prompt cash payment received before 10th. Eligible for prompt payment bonus.",
    last_updated: "2026-11-09T10:15:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z"
  });

  // Month 11 for Ramesh (TS-2026-003) - UNPAID
  initialPayments.push({
    id: "pay-ramesh-m11",
    user_id: "TS-2026-003",
    user_name: "R. Ramesh",
    group_id: "GRP-2L-01",
    group_name: "₹2 Lakh Scheme - Batch 2026A",
    payment_month: 11,
    month_name: "Month 11 - Nov 2026",
    payment_year: 2026,
    payment_amount: 9400,
    payment_status: "UNPAID",
    payment_date: null,
    updated_by: "System (Batch Generation)",
    receipt_number: undefined,
    notes: "Awaiting physical cash collection at office counter.",
    last_updated: "2026-11-01T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z"
  });

  // Month 11 for Anitha (TS-2026-002) - PAID
  initialPayments.push({
    id: "pay-anitha-m11",
    user_id: "TS-2026-002",
    user_name: "K. Anitha",
    group_id: "GRP-1L-01",
    group_name: "₹1 Lakh Scheme - Batch 2026B",
    payment_month: 11,
    month_name: "Month 11 - Nov 2026",
    payment_year: 2026,
    payment_amount: 4700,
    payment_status: "PAID",
    payment_date: "2026-11-08T15:45:00.000Z",
    updated_by: "Admin (Cash Verification)",
    receipt_number: "REC-2026-1102",
    notes: "Cash received at office counter.",
    last_updated: "2026-11-08T15:45:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z"
  });

  saveLocalPayments(initialPayments);
}

// 5. Announcements Storage & Seeding
function getLocalAnnouncements(): any[] {
  try {
    if (!fs.existsSync(ANNOUNCEMENTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLocalAnnouncements(announcements: any[]): void {
  fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
}

if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
  const initialAnnouncements = [
    {
      id: "ann-001",
      title: "November 2026 Monthly Draw Scheduled for 11th Nov",
      description: "The 11th monthly draw for all active batches will be held at our Villukuri Registered Office on 11th November 2026 at 10:30 AM. Members are requested to complete cash instalments on or before 10th November.",
      category: "Auction Date",
      target_group_id: "all",
      is_published: true,
      publish_date: "2026-11-05",
      created_by: "Admin",
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
    },
    {
      id: "ann-002",
      title: "Prompt Payment Bonus Reminder: Pay on or before 10th",
      description: "Members who maintain 100% timely cash payments by the 10th of every month qualify for up to ₹12,000 completion bonus at the end of the 20-month cycle. Delayed payments after 10th incur ₹20/day penalty.",
      category: "Bonus Update",
      target_group_id: "all",
      is_published: true,
      publish_date: "2026-11-01",
      created_by: "Admin",
      created_at: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
      id: "ann-003",
      title: "Physical Cash Collection Counter Timings",
      description: "Cash collection counter at 41/5E, Madathattuvillai, Villukuri is open Monday to Saturday from 9:30 AM to 6:30 PM. Official signed physical receipts are issued immediately upon cash payment.",
      category: "Payment Notice",
      target_group_id: "all",
      is_published: true,
      publish_date: "2026-10-25",
      created_by: "Admin",
      created_at: new Date(Date.now() - 86400000 * 17).toISOString()
    }
  ];
  saveLocalAnnouncements(initialAnnouncements);
}

// 6. Audit Logs Storage
function getLocalAuditLogs(): any[] {
  try {
    if (!fs.existsSync(AUDIT_LOGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(AUDIT_LOGS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLocalAuditLogs(logs: any[]): void {
  fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(logs, null, 2));
}

function recordAuditLog(action: string, details: string, performed_by: string = 'Admin', target_id?: string): void {
  const all = getLocalAuditLogs();
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    details,
    performed_by,
    target_id,
    timestamp: new Date().toISOString()
  };
  all.unshift(entry);
  // Keep latest 500 logs
  if (all.length > 500) all.length = 500;
  saveLocalAuditLogs(all);
  void syncTableUpsert('audit_logs', [auditLogToDbRow(entry)], 'id');
}

if (!fs.existsSync(AUDIT_LOGS_FILE)) {
  recordAuditLog("SYSTEM_BOOT", "Chit Fund Management System Initialized with 3 Active Batches", "System");
}


// Helper: Automatic Announcement Engine (triggered ONLY after confirmed DB/file save, with deduplication)
function createAutoAnnouncement(params: {
  title: string;
  description: string;
  category: 'Scheme Update' | 'Group Update' | 'Payment Notice' | 'Important' | 'General';
  target_type: 'all' | 'group' | 'scheme';
  target_group_id?: string;
  target_group_name?: string;
  target_scheme_id?: string;
  target_scheme_name?: string;
  source_event_key: string;
}) {
  const announcements = getLocalAnnouncements();
  const cutoff = Date.now() - 5 * 60 * 1000;
  const duplicate = announcements.find(
    (a: any) =>
      !a.is_archived &&
      a.source_event_key === params.source_event_key &&
      new Date(a.created_at).getTime() >= cutoff
  );
  if (duplicate) return null;

  const newAnn = {
    id: `ann-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: params.title,
    description: params.description,
    category: params.category,
    target_type: params.target_type,
    target_group_id: params.target_group_id || (params.target_type === 'all' ? 'all' : undefined),
    target_group_name: params.target_group_name,
    target_scheme_id: params.target_scheme_id,
    target_scheme_name: params.target_scheme_name,
    is_auto_generated: true,
    source_event_key: params.source_event_key,
    is_published: true,
    is_archived: false,
    publish_date: new Date().toISOString().split('T')[0],
    created_by: 'System Automation',
    created_at: new Date().toISOString()
  };

  announcements.unshift(newAnn);
  saveLocalAnnouncements(announcements);
  void syncTableUpsert('announcements', [announcementToDbRow(newAnn)], 'id');
  return newAnn;
}

// Supabase Startup Hydration & Idempotent First-Run Seeding
async function bootstrapSupabaseData(): Promise<void> {
  if (!supabase) return;
  try {
    const sb = supabase as any;
    const { data: remoteSchemes, error: schErr } = await sb.from('chit_schemes').select('*');
    if (schErr) {
      supabaseTablesReady = false;
      console.warn('[Supabase] Database tables not ready yet:', schErr.message);
      return;
    }

    supabaseTablesReady = true;

    // 1. chit_schemes
    if (remoteSchemes && remoteSchemes.length > 0) {
      saveLocalSchemes(remoteSchemes.map(dbRowToScheme));
    } else {
      const localSchemes = getLocalSchemes();
      if (localSchemes.length > 0) {
        await syncTableUpsert('chit_schemes', localSchemes.map(schemeToDbRow), 'id');
      }
    }

    // 2. scheme_versions
    const { data: remoteVersions, error: verErr } = await sb
      .from('scheme_versions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!verErr && remoteVersions) {
      if (remoteVersions.length > 0) {
        saveLocalSchemeVersions(remoteVersions);
      } else {
        const localVersions = getLocalSchemeVersions();
        if (localVersions.length > 0) {
          await syncTableUpsert('scheme_versions', localVersions.map(schemeVersionToDbRow), 'id');
        }
      }
    }

    // 3. chit_groups
    const { data: remoteGroups, error: grpErr } = await sb.from('chit_groups').select('*');
    if (!grpErr && remoteGroups) {
      if (remoteGroups.length > 0) {
        saveLocalGroups(remoteGroups.map(dbRowToGroup));
      } else {
        const localGroups = getLocalGroups();
        if (localGroups.length > 0) {
          await syncTableUpsert('chit_groups', localGroups.map(groupToDbRow), 'id');
        }
      }
    }

    // 4. chit_users
    const { data: remoteUsers, error: usrErr } = await sb.from('chit_users').select('*');
    if (!usrErr && remoteUsers) {
      if (remoteUsers.length > 0) {
        saveLocalUsers(remoteUsers);
      } else {
        const localUsers = getLocalUsers();
        if (localUsers.length > 0) {
          await syncTableUpsert('chit_users', localUsers.map(userToDbRow), 'id');
        }
      }
    }

    // 5. monthly_payment_configs
    const { data: remoteConfigs, error: cfgErr } = await sb
      .from('monthly_payment_configs')
      .select('*')
      .order('created_at', { ascending: false });
    if (!cfgErr && remoteConfigs) {
      if (remoteConfigs.length > 0) {
        saveLocalPaymentConfigs(remoteConfigs.map((c: any) => ({ ...c, month: Number(c.month), year: Number(c.year), payment_amount: Number(c.payment_amount) })));
      } else {
        const localConfigs = getLocalPaymentConfigs();
        if (localConfigs.length > 0) {
          await syncTableUpsert('monthly_payment_configs', localConfigs.map(paymentConfigToDbRow), 'id');
        }
      }
    }

    // 6. payment_records
    const { data: remotePayments, error: payErr } = await sb.from('payment_records').select('*');
    if (!payErr && remotePayments) {
      if (remotePayments.length > 0) {
        saveLocalPayments(remotePayments.map(dbRowToPayment));
      } else {
        const localPayments = getLocalPayments();
        if (localPayments.length > 0) {
          await syncTableUpsert('payment_records', localPayments.map(paymentToDbRow), 'id');
        }
      }
    }

    // 7. announcements
    const { data: remoteAnnouncements, error: annErr } = await sb
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (!annErr && remoteAnnouncements) {
      if (remoteAnnouncements.length > 0) {
        saveLocalAnnouncements(remoteAnnouncements);
      } else {
        const localAnnouncements = getLocalAnnouncements();
        if (localAnnouncements.length > 0) {
          await syncTableUpsert('announcements', localAnnouncements.map(announcementToDbRow), 'id');
        }
      }
    }

    // 8. enquiries
    const { data: remoteEnquiries, error: enqErr } = await sb
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (!enqErr && remoteEnquiries) {
      if (remoteEnquiries.length > 0) {
        fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(remoteEnquiries, null, 2));
      } else {
        const localEnquiries = getLocalEnquiries();
        if (localEnquiries.length > 0) {
          await syncTableUpsert('enquiries', localEnquiries, 'id');
        }
      }
    }

    // 9. audit_logs
    const { data: remoteLogs, error: logErr } = await sb
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);
    if (!logErr && remoteLogs) {
      if (remoteLogs.length > 0) {
        saveLocalAuditLogs(remoteLogs);
      } else {
        const localLogs = getLocalAuditLogs().slice(0, 100);
        if (localLogs.length > 0) {
          await syncTableUpsert('audit_logs', localLogs.map(auditLogToDbRow), 'id');
        }
      }
    }

    console.log('[Supabase] Database tables verified, hydrated, and auto-seeded where empty.');
  } catch (err) {
    console.warn('[Supabase] Bootstrap error:', err);
  }
}

// Resend Email Client initialization
const resendApiKey = process.env.RESEND_API_KEY;
const isResendConfigured = Boolean(resendApiKey && !resendApiKey.includes('123456789'));
const resend = isResendConfigured ? new Resend(resendApiKey) : null;
const NOTIFICATION_EMAIL = 'ajesh321km2@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Team Stars Chits <onboarding@resend.dev>';

// Admin authentication token secret
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProd ? '' : 'teamstars2025');
const ADMIN_TOKEN_SECRET = process.env.ADMIN_SECRET_KEY || (isProd ? '' : 'teamstars-secret-token-key-2025');

function isValidAdminAuth(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === ADMIN_TOKEN_SECRET;
}

// ======================== API ROUTES ========================

// Public: Active Chit Schemes
app.get('/healthz', async (_req: Request, res: Response) => {
  if (!supabase) return res.status(503).send('Supabase is not configured.');

  const { error } = await supabase.from('chit_schemes').select('id', { head: true, count: 'exact' });
  if (error) return res.status(503).send('Supabase is unavailable.');

  return res.status(200).send('ok');
});

app.get('/api/public-events', (req: Request, res: Response) => {
  if (!supabase) return res.status(204).end();

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.flushHeaders();
  res.write(': connected\n\n');
  publicRealtimeClients.add(res);
  startPublicRealtime();

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    publicRealtimeClients.delete(res);
  });
});

app.get('/api/schemes', async (_req: Request, res: Response) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('chit_schemes')
      .select('*')
      .eq('status', 'active')
      .order('chit_value', { ascending: true });

    if (!error && data) return res.json({ schemes: data.map(dbRowToScheme) });
    console.error('[API] Failed to load public schemes from Supabase:', error?.message);
    if (isProd) return res.status(503).json({ error: 'Public schemes are temporarily unavailable.' });
  } else if (isProd) {
    return res.status(503).json({ error: 'Public schemes are temporarily unavailable.' });
  }

  const schemes = getLocalSchemes()
    .filter((s: any) => (s.status || 'active') === 'active')
    .sort((a: any, b: any) => Number(a.chitValue) - Number(b.chitValue));
  return res.json({ schemes });
});

app.get('/api/public-announcements', async (_req: Request, res: Response) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, description, category, publish_date, created_at')
      .eq('target_type', 'all')
      .eq('is_published', true)
      .eq('is_archived', false)
      .lte('publish_date', new Date().toISOString().slice(0, 10))
      .order('publish_date', { ascending: false });

    if (!error && data) return res.json({ announcements: data });
    console.error('[API] Failed to load public announcements from Supabase:', error?.message);
    if (isProd) return res.status(503).json({ error: 'Public announcements are temporarily unavailable.' });
  } else if (isProd) {
    return res.status(503).json({ error: 'Public announcements are temporarily unavailable.' });
  }

  const announcements = getLocalAnnouncements()
    .filter((item: any) =>
      item.is_published !== false &&
      !item.is_archived &&
      (item.target_type === 'all' || item.target_group_id === 'all' || !item.target_group_id) &&
      String(item.publish_date || '').slice(0, 10) <= new Date().toISOString().slice(0, 10)
    )
    .sort((a: any, b: any) =>
      new Date(b.publish_date || b.created_at).getTime() - new Date(a.publish_date || a.created_at).getTime()
    )
    .map(({ id, title, description, category, publish_date, created_at }: any) => ({
      id,
      title,
      description,
      category,
      publish_date,
      created_at
    }));

  return res.json({ announcements });
});

// Health & System status endpoint
app.get('/api/system/status', async (_req: Request, res: Response) => {
  const localEnquiries = getLocalEnquiries();
  let supabaseConnected = false;
  let tablesReady = supabaseTablesReady;
  if (supabase) {
    try {
      const { error: pingErr } = await supabase.from('enquiries').select('id', { count: 'exact', head: true });
      const { error: schemeErr } = await supabase.from('chit_schemes').select('id', { count: 'exact', head: true });
      if (!pingErr && !schemeErr) {
        supabaseConnected = true;
        tablesReady = true;
        if (!supabaseTablesReady) {
          supabaseTablesReady = true;
          void bootstrapSupabaseData();
        }
      } else {
        supabaseConnected = !pingErr;
        tablesReady = !schemeErr;
      }
    } catch {
      supabaseConnected = false;
      tablesReady = false;
    }
  }
  res.json({
    company: "TEAM STARS CHITS PRIVATE LIMITED",
    cin: "U64990TN2025PTC181717",
    supabaseConfigured: isSupabaseConfigured,
    supabaseConnected,
    supabaseTablesReady: tablesReady,
    supabaseKeyMode,
    resendConfigured: isResendConfigured,
    notificationEmail: NOTIFICATION_EMAIL,
    totalEnquiries: localEnquiries.length,
    timestamp: new Date().toISOString()
  });
});

// Submit Customer Enquiry
app.post('/api/enquiries', async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      mobile_number,
      email,
      city,
      preferred_scheme,
      preferred_language = 'en',
      message = '',
      consent
    } = req.body;

    // Strict validation
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name (minimum 2 characters).' });
    }

    // Indian mobile number validation (10 digits starting with 6, 7, 8, 9)
    const cleanMobile = (mobile_number || '').replace(/[\s\-+]/g, '');
    const mobileRegex = /^[6-9]\d{9}$/;
    const strippedMobile = cleanMobile.length === 12 && cleanMobile.startsWith('91') ? cleanMobile.slice(2) : cleanMobile;
    if (!mobileRegex.test(strippedMobile)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!city || city.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide your City or District.' });
    }

    if (!preferred_scheme) {
      return res.status(400).json({ error: 'Please select a preferred chit fund scheme.' });
    }

    if (!consent) {
      return res.status(400).json({ error: 'You must agree to the privacy policy to submit your enquiry.' });
    }

    const newEnquiry = {
      id: 'enq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      full_name: full_name.trim(),
      mobile_number: strippedMobile,
      email: email.trim().toLowerCase(),
      city: city.trim(),
      preferred_scheme: preferred_scheme.trim(),
      preferred_language,
      message: (message || '').trim(),
      consent: Boolean(consent),
      enquiry_status: 'New',
      created_at: new Date().toISOString()
    };

    // 1. Save to Supabase if configured
    let savedInSupabase = false;
    if (supabase) {
      try {
        const { error: sbError } = await (supabase as any).from('enquiries').upsert([
          {
            id: newEnquiry.id,
            full_name: newEnquiry.full_name,
            mobile_number: newEnquiry.mobile_number,
            email: newEnquiry.email,
            city: newEnquiry.city,
            preferred_scheme: newEnquiry.preferred_scheme,
            preferred_language: newEnquiry.preferred_language,
            message: newEnquiry.message,
            consent: newEnquiry.consent,
            enquiry_status: newEnquiry.enquiry_status,
            created_at: newEnquiry.created_at
          }
        ], { onConflict: 'id' });
        if (!sbError) {
          savedInSupabase = true;
          console.log('[Supabase] Enquiry saved to remote database.');
        } else {
          console.warn('[Supabase] Insert error:', sbError.message);
        }
      } catch (sbErr) {
        console.warn('[Supabase] Error executing insert:', sbErr);
      }
    }

    // 2. Always persist to local cache/store as reliable fail-safe
    if (isProd && !savedInSupabase) {
      return res.status(503).json({ error: 'We could not securely save your enquiry. Please try again later.' });
    }
    saveLocalEnquiry(newEnquiry);

    // 3. Send Notification Email to ajesh321km2@gmail.com and Customer Acknowledgement
    let emailSentToCompany = false;
    let emailSentToCustomer = false;
    let emailDetails = 'Resend not configured in env (simulated successfully)';

    if (resend) {
      try {
        // Notification Email to Company Administrator
        const companyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #075C32; padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">TEAM STARS CHITS PRIVATE LIMITED</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #C9A64A; font-weight: bold;">NEW CUSTOMER ENQUIRY RECEIVED</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff;">
              <p style="font-size: 14px; color: #334155;">A new customer has submitted an enquiry through the official website. Please review the customer details below:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: bold; color: #475569; width: 40%;">Customer Name:</td>
                  <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${newEnquiry.full_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: bold; color: #475569;">Mobile Number:</td>
                  <td style="padding: 10px 0; color: #075C32; font-weight: bold;"><a href="tel:${newEnquiry.mobile_number}" style="color: #075C32; text-decoration: none;">+91 ${newEnquiry.mobile_number}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: bold; color: #475569;">Email Address:</td>
                  <td style="padding: 10px 0; color: #0f172a;"><a href="mailto:${newEnquiry.email}" style="color: #12834B;">${newEnquiry.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: bold; color: #475569;">City / District:</td>
                  <td style="padding: 10px 0; color: #0f172a;">${newEnquiry.city}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: bold; color: #475569;">Preferred Scheme:</td>
                  <td style="padding: 10px 0; color: #075C32; font-weight: bold;">${newEnquiry.preferred_scheme}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: bold; color: #475569;">Preferred Language:</td>
                  <td style="padding: 10px 0; color: #0f172a;">${newEnquiry.preferred_language === 'ta' ? 'Tamil (தமிழ்)' : 'English'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: bold; color: #475569;">Submission Date:</td>
                  <td style="padding: 10px 0; color: #0f172a;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #475569; vertical-align: top;">Customer Message:</td>
                  <td style="padding: 10px 0; color: #334155; line-height: 1.5;">${newEnquiry.message || 'No additional message provided.'}</td>
                </tr>
              </table>

              <div style="margin-top: 24px; padding: 16px; background-color: #E5F2E8; border-radius: 6px; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #075C32; font-weight: 500;">
                  Prompt customer follow-up ensures high conversion. Reach out to the customer via call or WhatsApp.
                </p>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              TEAM STARS CHITS PRIVATE LIMITED | CIN: U64990TN2025PTC181717<br />
              41/5E, Madathattuvillai, Villukuri, Kanyakumari District - 629180, Tamil Nadu
            </div>
          </div>
        `;

        await resend.emails.send({
          from: FROM_EMAIL,
          to: NOTIFICATION_EMAIL,
          subject: `🔔 New Chit Enquiry: ${newEnquiry.full_name} (${newEnquiry.preferred_scheme})`,
          html: companyHtml
        });
        emailSentToCompany = true;

        // Customer Acknowledgement Email
        const isTamil = newEnquiry.preferred_language === 'ta';
        const customerSubject = isTamil
          ? `வணக்கம் ${newEnquiry.full_name} – டீம் ஸ்டார்ஸ் சிட்ஸ் நிறுவனத்திலிருந்து உங்கள் விண்ணப்பம் பெறப்பட்டது`
          : `Thank You for Your Enquiry – Team Stars Chits Private Limited`;

        const customerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #075C32; padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 20px;">TEAM STARS CHITS PRIVATE LIMITED</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #C9A64A;">Official Chit Fund Company · Kanyakumari</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff; color: #334155; line-height: 1.6;">
              <p style="font-size: 15px; font-weight: bold; color: #0f172a;">
                ${isTamil ? `அன்புடைய ${newEnquiry.full_name}, வணக்கம்!` : `Dear ${newEnquiry.full_name},`}
              </p>
              <p style="font-size: 14px;">
                ${isTamil
                  ? `டீம் ஸ்டார்ஸ் சிட்ஸ் பிரைவேட் லிமிடெட் நிறுவனத்தின் மீது நீங்கள் வைத்துள்ள நம்பிக்கைக்கு மனமார்ந்த நன்றிகள். தாங்கள் தேர்வு செய்துள்ள <strong>${newEnquiry.preferred_scheme}</strong> தொடர்பான உங்களின் விண்ணப்பம் வெற்றிகரமாக பெறப்பட்டுள்ளது.`
                  : `Thank you for reaching out to <strong>TEAM STARS CHITS PRIVATE LIMITED</strong>. We have received your enquiry regarding the <strong>${newEnquiry.preferred_scheme}</strong>.`
                }
              </p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #075C32;">
                  ${isTamil ? 'அடுத்த கட்ட நடவடிக்கைகள்:' : 'What Happens Next?'}
                </p>
                <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
                  <li style="margin-bottom: 6px;">${isTamil ? 'எங்கள் நிறுவன பிரதிநிதி உங்களை தொலைபேசியில் தொடர்பு கொள்வார்.' : 'Our official representative will contact you via phone.'}</li>
                  <li style="margin-bottom: 6px;">${isTamil ? 'சீட்டு தவணை அட்டவணை மற்றும் ஏல விதிமுறைகள் விளக்கப்படும்.' : 'Instalment schedule and draw/auction dates will be explained in detail.'}</li>
                  <li>${isTamil ? 'அடிப்படை KYC ஆவண சரிபார்ப்பு மற்றும் ஒப்பந்த நடைமுறைகள் நிறைவு செய்யப்படும்.' : 'KYC verification and formal chit agreement will be completed.'}</li>
                </ol>
              </div>

              <p style="font-size: 13px; color: #64748b;">
                ${isTamil 
                  ? 'ஏதேனும் கேள்விகள் இருப்பின், எங்களை நேரடியாக <strong>+91 9789825684</strong> என்ற எண்ணில் தொடர்பு கொள்ளலாம்.'
                  : 'If you have any urgent queries, feel free to call our direct office line at <strong>+91 9789825684</strong>.'}
              </p>

              <p style="margin-top: 24px; font-size: 14px; font-weight: bold; color: #075C32;">
                Warm Regards,<br />
                <span style="font-size: 13px; font-weight: normal; color: #334155;">Customer Relationship Team<br />TEAM STARS CHITS PRIVATE LIMITED</span>
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              CIN: U64990TN2025PTC181717 | Registered Office: 41/5E, Madathattuvillai, Villukuri, Kanyakumari - 629180, TN.
            </div>
          </div>
        `;

        await resend.emails.send({
          from: FROM_EMAIL,
          to: newEnquiry.email,
          subject: customerSubject,
          html: customerHtml
        });
        emailSentToCustomer = true;
        emailDetails = 'Notification and acknowledgement emails sent successfully via Resend.';
      } catch (emailErr: any) {
        console.warn('[Resend] Email dispatch error:', emailErr.message);
        emailDetails = `Email service error: ${emailErr.message}`;
      }
    } else {
      console.log(`[Email Simulation] New enquiry from ${newEnquiry.full_name} (${newEnquiry.mobile_number}) -> Notification forwarded to ${NOTIFICATION_EMAIL}`);
    }

    return res.status(201).json({
      success: true,
      enquiryId: newEnquiry.id,
      message: 'Enquiry submitted successfully! A company representative will contact you soon.',
      savedInSupabase,
      emailSentToCompany,
      emailSentToCustomer,
      emailDetails
    });
  } catch (err: any) {
    console.error('[API Error] Enquiries POST failed:', err);
    return res.status(500).json({ error: 'Server error processing enquiry. Please try again or call 9789825684.' });
  }
});

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }
  return res.json({
    success: true,
    token: ADMIN_TOKEN_SECRET,
    role: 'admin',
    message: 'Authenticated successfully.'
  });
});

// Admin Get All Enquiries
app.get('/api/admin/enquiries', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized access. Please login as administrator.' });
  }

  try {
    // If Supabase is connected, fetch remote
    if (supabase) {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return res.json({ enquiries: data, source: 'supabase' });
      }
    }

    // Fallback to local persistent store
    const local = getLocalEnquiries();
    return res.json({ enquiries: local, source: 'local' });
  } catch (err: any) {
    console.error('[Admin API] Error fetching enquiries:', err);
    return res.status(500).json({ error: 'Failed to retrieve enquiries.' });
  }
});

// Admin Update Status
app.patch('/api/admin/enquiries/:id/status', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['New', 'Contacted', 'In Progress', 'Completed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    if (supabase) {
      await (supabase as any)
        .from('enquiries')
        .update({ enquiry_status: status })
        .eq('id', id);
    }

    updateLocalEnquiryStatus(id, status);
    return res.json({ success: true, id, status });
  } catch (err: any) {
    console.error('[Admin API] Error updating status:', err);
    return res.status(500).json({ error: 'Failed to update enquiry status.' });
  }
});

// ======================== USER / MEMBER PORTAL ROUTES ========================

// Member Login
app.post('/api/user/login', (req: Request, res: Response) => {
  try {
    const { user_id, password } = req.body;
    if (!user_id || !password) {
      return res.status(400).json({ error: 'Please enter both User ID and password.' });
    }

    const cleanUserId = user_id.trim();
    const users = getLocalUsers();
    const user = users.find((u: any) => u.user_id.toLowerCase() === cleanUserId.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid User ID or password.' });
    }

    if (user.is_deleted || user.status !== 'active') {
      return res.status(403).json({ error: 'This account has been deactivated or removed. Please contact the administrator.' });
    }

    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid User ID or password.' });
    }

    const token = generateUserToken(user.user_id);
    recordAuditLog('USER_LOGIN', `Member logged in: ${user.user_id} (${user.full_name})`, user.user_id, user.id);

    const groups = getLocalGroups();
    const group = groups.find((g: any) => g.id === user.group_id);

    // Return sanitized user profile (without password_hash)
    const { password_hash, ...safeUser } = user;
    return res.json({
      success: true,
      token,
      user: {
        ...safeUser,
        group_name: group?.name || user.group_name || 'Assigned Group',
        scheme_name: group?.scheme_name || 'Chit Scheme',
        chit_value: group?.chit_value || 0,
        duration_months: group?.duration_months || 20
      },
      message: `Welcome, ${user.full_name}!`
    });
  } catch (err) {
    console.error('[User Login Error]:', err);
    return res.status(500).json({ error: 'Authentication service error.' });
  }
});

// Member Profile
app.get('/api/user/profile', (req: Request, res: Response) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized. Please log in as a member.' });
  }

  const groups = getLocalGroups();
  const group = groups.find((g: any) => g.id === authUser.group_id);

  const { password_hash, ...safeUser } = authUser;
  return res.json({
    user: {
      ...safeUser,
      group_name: group?.name || authUser.group_name || 'Assigned Group',
      scheme_name: group?.scheme_name || 'Chit Scheme',
      chit_value: group?.chit_value || 0,
      duration_months: group?.duration_months || 20
    }
  });
});

// Member Payments (Strictly filtered to the logged-in user only!)
app.get('/api/user/payments', (req: Request, res: Response) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized. Please log in as a member.' });
  }

  const allPayments = getLocalPayments();
  const userPayments = allPayments.filter((p: any) => p.user_id === authUser.user_id);

  // Sort: highest year, then highest month desc
  userPayments.sort((a: any, b: any) => {
    if (b.payment_year !== a.payment_year) return b.payment_year - a.payment_year;
    return Number(b.payment_month) - Number(a.payment_month);
  });

  const totalPaid = userPayments
    .filter((p: any) => p.payment_status === 'PAID')
    .reduce((sum: number, p: any) => sum + Number(p.payment_amount || 0), 0);

  const totalUnpaid = userPayments
    .filter((p: any) => p.payment_status === 'UNPAID')
    .reduce((sum: number, p: any) => sum + Number(p.payment_amount || 0), 0);

  const currentMonthPayment = userPayments[0] || null;

  return res.json({
    payments: userPayments,
    totalPaid,
    totalUnpaid,
    totalPaidCount: userPayments.filter((p: any) => p.payment_status === 'PAID').length,
    totalUnpaidCount: userPayments.filter((p: any) => p.payment_status === 'UNPAID').length,
    currentMonthPayment
  });
});

// Member Announcements (Read-only, filtered strictly by non-archived, published, and audience targeting)
app.get('/api/user/announcements', (req: Request, res: Response) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const groups = getLocalGroups();
  const userGroup = groups.find((g: any) => g.id === authUser.group_id);
  const announcements = getLocalAnnouncements();

  const published = announcements.filter((a: any) => {
    if (!a.is_published || a.is_archived) return false;
    const tType = a.target_type || (a.target_group_id === 'all' || !a.target_group_id ? 'all' : 'group');
    if (tType === 'all' || a.target_group_id === 'all') return true;
    if (tType === 'group' && a.target_group_id === authUser.group_id) return true;
    if (tType === 'scheme' && userGroup) {
      if (a.target_scheme_id && userGroup.scheme_id && a.target_scheme_id === userGroup.scheme_id) return true;
      if (a.target_scheme_name && userGroup.scheme_name && a.target_scheme_name === userGroup.scheme_name) return true;
    }
    return false;
  });

  published.sort((a: any, b: any) => new Date(b.created_at || b.publish_date).getTime() - new Date(a.created_at || a.publish_date).getTime());
  return res.json({ announcements: published });
});

// Member Logout
app.post('/api/user/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    userSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ======================== ADMIN DASHBOARD OVERVIEW & REPORTS ========================

app.get('/api/admin/overview', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const users = getLocalUsers().filter((u: any) => !u.is_deleted);
  const groups = getLocalGroups();
  const schemes = getLocalSchemes();
  const payments = getLocalPayments();
  const auditLogs = getLocalAuditLogs();

  const totalUsers = users.length;
  const totalGroups = groups.filter((g: any) => g.status !== 'archived').length;
  const totalSchemes = schemes.filter((s: any) => (s.status || 'active') === 'active').length;

  const paidPayments = payments.filter((p: any) => p.payment_status === 'PAID');
  const unpaidPayments = payments.filter((p: any) => p.payment_status === 'UNPAID');

  const totalCashCollected = paidPayments.reduce((sum: number, p: any) => sum + Number(p.payment_amount || 0), 0);
  const totalOutstanding = unpaidPayments.reduce((sum: number, p: any) => sum + Number(p.payment_amount || 0), 0);

  // Group-wise summary
  const groupsSummary = groups.map((g: any) => {
    const groupUsers = users.filter((u: any) => u.group_id === g.id);
    const groupPayments = payments.filter((p: any) => p.group_id === g.id);
    const groupPaid = groupPayments.filter((p: any) => p.payment_status === 'PAID');
    const groupUnpaid = groupPayments.filter((p: any) => p.payment_status === 'UNPAID');

    return {
      groupId: g.id,
      groupName: g.name,
      schemeName: g.scheme_name,
      chitValue: g.chit_value,
      durationMonths: g.duration_months || 20,
      memberCount: groupUsers.length,
      maxMembers: g.max_members || 99,
      paidCount: groupPaid.length,
      unpaidCount: groupUnpaid.length,
      totalCollected: groupPaid.reduce((sum: number, p: any) => sum + Number(p.payment_amount || 0), 0),
      totalPending: groupUnpaid.reduce((sum: number, p: any) => sum + Number(p.payment_amount || 0), 0),
      status: g.status
    };
  });

  return res.json({
    totalUsers,
    totalGroups,
    totalSchemes,
    totalPaidCount: paidPayments.length,
    totalUnpaidCount: unpaidPayments.length,
    totalCashCollected,
    totalOutstanding,
    groupsSummary,
    recentPayments: payments.slice(0, 10),
    recentLogs: auditLogs.slice(0, 10)
  });
});

app.get('/api/admin/reports', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const users = getLocalUsers();
  const groups = getLocalGroups();
  const payments = getLocalPayments();

  // Monthly breakdown
  const monthlyStats: Record<string, { monthName: string; totalPaid: number; totalUnpaid: number; countPaid: number; countUnpaid: number }> = {};

  payments.forEach((p: any) => {
    const key = `${p.payment_year}-${String(p.payment_month).padStart(2, '0')}`;
    if (!monthlyStats[key]) {
      monthlyStats[key] = {
        monthName: p.month_name || `Month ${p.payment_month} (${p.payment_year})`,
        totalPaid: 0,
        totalUnpaid: 0,
        countPaid: 0,
        countUnpaid: 0
      };
    }
    if (p.payment_status === 'PAID') {
      monthlyStats[key].totalPaid += Number(p.payment_amount || 0);
      monthlyStats[key].countPaid += 1;
    } else {
      monthlyStats[key].totalUnpaid += Number(p.payment_amount || 0);
      monthlyStats[key].countUnpaid += 1;
    }
  });

  // Pending Cash Defaulters List
  const pendingMembers = payments
    .filter((p: any) => p.payment_status === 'UNPAID')
    .map((p: any) => {
      const u = users.find((user: any) => user.user_id === p.user_id);
      return {
        paymentId: p.id,
        userId: p.user_id,
        userName: p.user_name,
        mobileNumber: u?.mobile_number || 'N/A',
        groupId: p.group_id,
        groupName: p.group_name,
        monthName: p.month_name,
        amount: p.payment_amount
      };
    });

  return res.json({
    monthlySummary: Object.values(monthlyStats),
    pendingDefaulters: pendingMembers,
    totalUsers: users.length,
    totalGroups: groups.length
  });
});

app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  return res.json({ logs: getLocalAuditLogs() });
});

// ======================== ADMIN SCHEME MANAGEMENT & VERSIONING ========================

app.get('/api/admin/schemes', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const schemes = getLocalSchemes();
  const groups = getLocalGroups();
  const versions = getLocalSchemeVersions();

  const enriched = schemes.map((s: any) => {
    const refGroups = groups.filter((g: any) => g.scheme_id === s.id || Number(g.chit_value) === Number(s.chitValue));
    const runningGroups = refGroups.filter((g: any) => g.status === 'active');
    return {
      ...s,
      runningGroupsCount: runningGroups.length,
      isReferenced: refGroups.length > 0
    };
  });

  return res.json({ schemes: enriched, versions });
});

app.get('/api/admin/schemes/:id/versions', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const { id } = req.params;
  const versions = getLocalSchemeVersions().filter((v: any) => v.scheme_id === id);
  return res.json({ versions });
});

app.post('/api/admin/schemes', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const {
    schemeCode,
    nameEn,
    nameTa,
    chitValue,
    durationMonths = 20,
    availableDurations,
    promptBonus,
    lastMonthBonus,
    taglineEn,
    taglineTa,
    status = 'active',
    startDate,
    autoAnnounce = true
  } = req.body;

  const numValue = Number(chitValue);
  const numDuration = Number(durationMonths);
  if (!nameEn || !numValue || numValue < 10000) {
    return res.status(400).json({ error: 'Please provide Scheme Name and a valid Chit Value (min ₹10,000).' });
  }
  if (!numDuration || numDuration < 2 || numDuration > 60) {
    return res.status(400).json({ error: 'Duration must be between 2 and 60 months.' });
  }

  const schemes = getLocalSchemes();
  const normalizedName = nameEn.trim().toLowerCase();
  const cleanCode = (schemeCode || `TSC-${Math.round(numValue / 1000)}K-${numDuration}M`).trim().toUpperCase();

  const duplicateScheme = schemes.find(
    (s: any) =>
      (s.status || 'active') !== 'archived' &&
      (String(s.nameEn || '').trim().toLowerCase() === normalizedName ||
        String(s.schemeCode || '').trim().toUpperCase() === cleanCode)
  );
  if (duplicateScheme) {
    return res.status(409).json({
      error: `A scheme named "${duplicateScheme.nameEn}" (${duplicateScheme.schemeCode}) already exists. Please use a different scheme name/code or switch to Edit Existing Scheme.`
    });
  }

  const slugId = `scheme-${Date.now()}-${Math.round(numValue / 1000)}k`;

  const calc = buildProportionalSchedule(numValue, numDuration);
  const pBonus = promptBonus !== undefined ? Number(promptBonus) : Math.round(numValue * 0.02);
  const lBonus = lastMonthBonus !== undefined ? Number(lastMonthBonus) : Math.round(numValue * 0.004);
  const durationsArr = Array.isArray(availableDurations) && availableDurations.length > 0
    ? availableDurations.map((d: any) => Number(d)).filter((d: number) => d >= 2 && d <= 60)
    : [numDuration];
  if (!durationsArr.includes(numDuration)) durationsArr.unshift(numDuration);

  const now = new Date().toISOString();
  const newScheme = {
    id: slugId,
    schemeCode: cleanCode,
    nameEn: nameEn.trim(),
    nameTa: (nameTa || `${formatInr(numValue)} சீட்டு திட்டம்`).trim(),
    chitValue: numValue,
    chitValueFormatted: formatInr(numValue),
    chitValueFormattedTa: formatInr(numValue),
    durationMonths: numDuration,
    availableDurations: durationsArr,
    firstMonthInstalment: calc.firstMonthInstalment,
    minInstalment: calc.minInstalment,
    maxInstalment: calc.maxInstalment,
    totalInstalmentsPaid: calc.totalInstalmentsPaid,
    dividendBenefit: calc.dividendBenefit,
    promptBonus: pBonus,
    lastMonthBonus: lBonus,
    totalBonus: pBonus + lBonus,
    taglineEn: (taglineEn || `Structured ${numDuration}-month ${formatInr(numValue)} chit scheme with transparent monthly auctions and timely bonus.`).trim(),
    taglineTa: (taglineTa || `${numDuration} மாத கால ${formatInr(numValue)} சீட்டு திட்டம் — வெளிப்படையான குலுக்கல் மற்றும் சிறப்பு போனஸ்.`).trim(),
    documentImage: '/images/5-lakh-scheme.jpeg',
    status: ['active', 'inactive', 'archived'].includes(status) ? status : 'active',
    startDate: startDate || now.split('T')[0],
    version: 1,
    rulesEn: getDefaultRulesEn(pBonus, lBonus, numDuration),
    rulesTa: getDefaultRulesTa(pBonus, lBonus),
    schedule: calc.schedule,
    createdAt: now,
    updatedAt: now
  };

  schemes.push(newScheme);
  saveLocalSchemes(schemes);
  await syncTableUpsert('chit_schemes', [schemeToDbRow(newScheme)], 'id');
  recordSchemeVersion(newScheme, 'Created new chit scheme', 'Admin');
  recordAuditLog('SCHEME_CREATE', `Created Scheme: ${newScheme.nameEn} (${newScheme.durationMonths} Months, ${newScheme.chitValueFormatted})`, 'Admin', newScheme.id);

  if (autoAnnounce && newScheme.status === 'active') {
    createAutoAnnouncement({
      title: `New Chit Scheme Launched: ${newScheme.nameEn} (${newScheme.durationMonths} Months)`,
      description: `We have introduced the ${newScheme.nameEn} for a ${newScheme.durationMonths}-month cycle with monthly instalments starting at ${formatInr(newScheme.firstMonthInstalment)} and prompt payment bonus up to ${formatInr(newScheme.totalBonus)}. Contact our Villukuri office to join.`,
      category: 'Scheme Update',
      target_type: 'all',
      target_scheme_id: newScheme.id,
      target_scheme_name: newScheme.nameEn,
      source_event_key: `scheme:create:${newScheme.id}:v1`
    });
  }

  return res.status(201).json({ success: true, scheme: newScheme, message: `Scheme "${newScheme.nameEn}" created successfully.` });
});

app.put('/api/admin/schemes/:id', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const { id } = req.params;
  const schemes = getLocalSchemes();
  const target = schemes.find((s: any) => s.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Scheme not found.' });
  }

  const {
    nameEn,
    nameTa,
    chitValue,
    durationMonths,
    availableDurations,
    promptBonus,
    lastMonthBonus,
    taglineEn,
    taglineTa,
    status,
    confirm_running_impact,
    autoAnnounce = true
  } = req.body;

  const groups = getLocalGroups();
  const runningGroupsCount = groups.filter(
    (g: any) => g.status === 'active' && (g.scheme_id === target.id || Number(g.chit_value) === Number(target.chitValue))
  ).length;

  const nextValue = chitValue !== undefined ? Number(chitValue) : target.chitValue;
  const nextDuration = durationMonths !== undefined ? Number(durationMonths) : target.durationMonths;
  const coreTermsChanged = nextValue !== target.chitValue || nextDuration !== target.durationMonths;

  if (runningGroupsCount > 0 && coreTermsChanged && !confirm_running_impact) {
    return res.status(409).json({
      requiresConfirmation: true,
      runningGroupsCount,
      error: `${runningGroupsCount} active group(s) are currently running under this scheme. Existing running groups will retain their historical snapshot terms, while new batches will adopt v${(target.version || 1) + 1}. Confirm to save.`
    });
  }

  if (nextValue < 10000 || nextDuration < 2 || nextDuration > 60) {
    return res.status(400).json({ error: 'Chit value must be at least ₹10,000 and duration between 2 and 60 months.' });
  }

  if (coreTermsChanged) {
    const calc = buildProportionalSchedule(nextValue, nextDuration);
    target.chitValue = nextValue;
    target.chitValueFormatted = formatInr(nextValue);
    target.chitValueFormattedTa = formatInr(nextValue);
    target.durationMonths = nextDuration;
    target.schedule = calc.schedule;
    target.firstMonthInstalment = calc.firstMonthInstalment;
    target.minInstalment = calc.minInstalment;
    target.maxInstalment = calc.maxInstalment;
    target.totalInstalmentsPaid = calc.totalInstalmentsPaid;
    target.dividendBenefit = calc.dividendBenefit;
  }

  if (nameEn) target.nameEn = nameEn.trim();
  if (nameTa) target.nameTa = nameTa.trim();
  if (taglineEn) target.taglineEn = taglineEn.trim();
  if (taglineTa) target.taglineTa = taglineTa.trim();
  if (Array.isArray(availableDurations) && availableDurations.length > 0) {
    const cleanDurs = availableDurations.map((d: any) => Number(d)).filter((d: number) => d >= 2 && d <= 60);
    if (!cleanDurs.includes(target.durationMonths)) cleanDurs.unshift(target.durationMonths);
    target.availableDurations = cleanDurs;
  }
  if (promptBonus !== undefined) target.promptBonus = Number(promptBonus);
  if (lastMonthBonus !== undefined) target.lastMonthBonus = Number(lastMonthBonus);
  target.totalBonus = Number(target.promptBonus || 0) + Number(target.lastMonthBonus || 0);
  target.rulesEn = getDefaultRulesEn(target.promptBonus, target.lastMonthBonus, target.durationMonths);
  target.rulesTa = getDefaultRulesTa(target.promptBonus, target.lastMonthBonus);
  if (status && ['active', 'inactive', 'archived'].includes(status)) target.status = status;

  target.version = (target.version || 1) + 1;
  target.updatedAt = new Date().toISOString();
  saveLocalSchemes(schemes);
  await syncTableUpsert('chit_schemes', [schemeToDbRow(target)], 'id');
  recordSchemeVersion(target, coreTermsChanged ? 'Modified chit amount/duration terms' : 'Updated scheme details', 'Admin');
  recordAuditLog('SCHEME_UPDATE', `Updated Scheme ${target.id} to v${target.version} (${target.nameEn}, ${target.durationMonths}M)`, 'Admin', target.id);

  if (autoAnnounce) {
    createAutoAnnouncement({
      title: `Scheme Updated (v${target.version}): ${target.nameEn}`,
      description: `Scheme "${target.nameEn}" (${target.chitValueFormatted}, ${target.durationMonths} Months) has been updated by Administration. Ongoing batches retain their original enrolled terms unless notified otherwise.`,
      category: 'Scheme Update',
      target_type: runningGroupsCount > 0 ? 'scheme' : 'all',
      target_scheme_id: target.id,
      target_scheme_name: target.nameEn,
      source_event_key: `scheme:update:${target.id}:v${target.version}`
    });
  }

  return res.json({ success: true, scheme: target, message: `Scheme updated (v${target.version}).` });
});

app.patch('/api/admin/schemes/:id/status', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const { id } = req.params;
  const { status } = req.body;
  if (!['active', 'inactive', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid scheme status.' });
  }
  const schemes = getLocalSchemes();
  const target = schemes.find((s: any) => s.id === id);
  if (!target) return res.status(404).json({ error: 'Scheme not found.' });

  const prevStatus = target.status || 'active';
  target.status = status;
  target.updatedAt = new Date().toISOString();
  saveLocalSchemes(schemes);
  await syncTableUpsert('chit_schemes', [schemeToDbRow(target)], 'id');
  recordAuditLog('SCHEME_STATUS_CHANGE', `Changed Scheme ${target.nameEn} status from ${prevStatus} to ${status}`, 'Admin', target.id);

  if (prevStatus !== status && (status === 'active' || status === 'inactive')) {
    createAutoAnnouncement({
      title: `Scheme ${status === 'active' ? 'Activated' : 'Deactivated'}: ${target.nameEn}`,
      description:
        status === 'active'
          ? `The ${target.nameEn} (${target.chitValueFormatted}, ${target.durationMonths} Months) is now active and open for enquiries and batch creation.`
          : `New enrolments for ${target.nameEn} have been paused by Administration. Existing active groups under this scheme continue normally.`,
      category: 'Scheme Update',
      target_type: 'all',
      target_scheme_id: target.id,
      target_scheme_name: target.nameEn,
      source_event_key: `scheme:status:${target.id}:${status}`
    });
  }

  return res.json({ success: true, scheme: target, message: `Scheme status changed to ${status}.` });
});

app.delete('/api/admin/schemes/:id', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const { id } = req.params;
  const schemes = getLocalSchemes();
  const idx = schemes.findIndex((s: any) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Scheme not found.' });

  const target = schemes[idx];
  const groups = getLocalGroups();
  let referenced = groups.some((g: any) => g.scheme_id === target.id || Number(g.chit_value) === Number(target.chitValue));

  if (!referenced && supabase) {
    try {
      const { count } = await (supabase as any)
        .from('chit_groups')
        .select('id', { count: 'exact', head: true })
        .eq('scheme_id', id);
      if (Number(count || 0) > 0) referenced = true;
    } catch (e) {
      console.warn('[Supabase] Scheme group reference check warning:', e);
    }
  }

  if (!referenced) {
    await syncTableDelete('scheme_versions', 'scheme_id', id);
    const delRes = await syncTableDelete('chit_schemes', 'id', id);
    if (delRes.ok) {
      const remainingVersions = getLocalSchemeVersions().filter((v: any) => v.scheme_id !== id);
      saveLocalSchemeVersions(remainingVersions);
      schemes.splice(idx, 1);
      saveLocalSchemes(schemes);
      recordAuditLog('SCHEME_DELETE', `Deleted unused scheme: ${target.nameEn}`, 'Admin', target.id);
      return res.json({ success: true, archived: false, message: `Scheme "${target.nameEn}" deleted.` });
    }
  }

  target.status = 'archived';
  target.updatedAt = new Date().toISOString();
  saveLocalSchemes(schemes);
  await syncTableUpsert('chit_schemes', [schemeToDbRow(target)], 'id');
  recordAuditLog('SCHEME_ARCHIVE', `Archived Scheme ${target.nameEn} (referenced by existing chit groups)`, 'Admin', target.id);
  return res.json({
    success: true,
    archived: true,
    message: `Scheme "${target.nameEn}" is linked to existing chit groups, so it has been safely archived instead of permanently deleted.`
  });
});

// ======================== ADMIN GROUP MANAGEMENT ========================

// Get all groups with member counts & financial safeguard metadata
app.get('/api/admin/groups', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const groups = getLocalGroups();
  const allUsers = getLocalUsers();
  const activeUsers = allUsers.filter((u: any) => !u.is_deleted);
  const payments = getLocalPayments();
  const configs = getLocalPaymentConfigs();

  const groupsWithCount = groups.map((g: any) => {
    const member_count = activeUsers.filter((u: any) => u.group_id === g.id).length;
    const total_user_count = allUsers.filter((u: any) => u.group_id === g.id).length;
    const payment_count = payments.filter((p: any) => p.group_id === g.id).length;
    const config_count = configs.filter((c: any) => c.group_id === g.id).length;
    return {
      ...g,
      member_count,
      total_user_count,
      payment_count,
      config_count,
      has_financial_records: total_user_count > 0 || payment_count > 0 || config_count > 0
    };
  });

  return res.json({ groups: groupsWithCount });
});

// Create new group (Enforces Max 99 members & snapshots scheme version)
app.post('/api/admin/groups', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id, name, scheme_id, scheme_name, chit_value, duration_months = 20, start_date } = req.body;

  if (!id || !name || (!scheme_name && !scheme_id) || !chit_value) {
    return res.status(400).json({ error: 'Please provide Group ID, Group Name, Scheme, and Chit Value.' });
  }

  const cleanId = id.trim().toUpperCase();
  const groups = getLocalGroups();

  if (groups.some((g: any) => g.id === cleanId)) {
    return res.status(400).json({ error: `Group ID "${cleanId}" already exists. Please choose a unique ID.` });
  }

  const schemes = getLocalSchemes();
  const linkedScheme = scheme_id
    ? schemes.find((s: any) => s.id === scheme_id)
    : schemes.find((s: any) => Number(s.chitValue) === Number(chit_value));

  const newGroup = {
    id: cleanId,
    name: name.trim(),
    scheme_id: linkedScheme?.id || scheme_id,
    scheme_version: linkedScheme?.version || 1,
    scheme_name: (scheme_name || linkedScheme?.nameEn || `${formatInr(Number(chit_value))} Scheme`).trim(),
    chit_value: Number(chit_value),
    duration_months: Number(duration_months) || linkedScheme?.durationMonths || 20,
    start_date: start_date || new Date().toISOString().split('T')[0],
    status: 'active',
    max_members: 99,
    created_at: new Date().toISOString()
  };

  groups.push(newGroup);
  saveLocalGroups(groups);
  await syncTableUpsert('chit_groups', [groupToDbRow(newGroup)], 'id');
  recordAuditLog('GROUP_CREATE', `Created Group: ${newGroup.id} (${newGroup.name}, ${newGroup.duration_months}M)`, 'Admin', newGroup.id);

  createAutoAnnouncement({
    title: `New Chit Group Opened: ${newGroup.name}`,
    description: `Batch ${newGroup.id} (${newGroup.scheme_name} · ${newGroup.duration_months} Months) is now active starting ${newGroup.start_date}.`,
    category: 'Group Update',
    target_type: 'all',
    target_group_id: newGroup.id,
    target_group_name: newGroup.name,
    source_event_key: `group:create:${newGroup.id}`
  });

  return res.status(201).json({
    success: true,
    group: {
      ...newGroup,
      member_count: 0,
      total_user_count: 0,
      payment_count: 0,
      config_count: 0,
      has_financial_records: false
    },
    message: 'Chit Group created successfully.'
  });
});

// Update group
app.put('/api/admin/groups/:id', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { name, scheme_id, scheme_name, chit_value, duration_months, start_date, status } = req.body;
  const groups = getLocalGroups();
  const target = groups.find((g: any) => g.id === id);

  if (!target) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  if (name) target.name = name.trim();
  if (scheme_id) target.scheme_id = scheme_id;
  if (scheme_name) target.scheme_name = scheme_name.trim();
  if (chit_value) target.chit_value = Number(chit_value);
  if (duration_months) target.duration_months = Number(duration_months);
  if (start_date) target.start_date = start_date;
  if (status && ['active', 'inactive', 'archived'].includes(status)) {
    target.status = status;
    if (status === 'archived') {
      target.archived_at = target.archived_at || new Date().toISOString();
    } else {
      delete target.archived_at;
    }
  }
  target.updated_at = new Date().toISOString();

  saveLocalGroups(groups);
  const syncRes = await syncTableUpsert('chit_groups', [groupToDbRow(target)], 'id');
  if (!syncRes.ok && target.status === 'archived') {
    await syncTableUpsert('chit_groups', [groupToDbRow({ ...target, status: 'inactive', archived_at: undefined })], 'id');
  }
  recordAuditLog('GROUP_UPDATE', `Updated Group: ${target.id} (${target.name})`, 'Admin', target.id);

  if (target.status !== 'archived') {
    createAutoAnnouncement({
      title: `Group Details Updated: ${target.name}`,
      description: `Administration updated details for ${target.name} (${target.id} · ${target.scheme_name}, ${target.duration_months || 20} Months).`,
      category: 'Group Update',
      target_type: 'group',
      target_group_id: target.id,
      target_group_name: target.name,
      source_event_key: `group:update:${target.id}:${target.updated_at.slice(0, 16)}`
    });
  }

  return res.json({ success: true, group: target, message: 'Group updated successfully.' });
});

// Toggle group active/inactive status
app.patch('/api/admin/groups/:id/status', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Invalid group status.' });
  }

  const groups = getLocalGroups();
  const target = groups.find((g: any) => g.id === id);
  if (!target) return res.status(404).json({ error: 'Group not found.' });
  if (target.status === 'archived') {
    return res.status(400).json({ error: `Group "${target.name}" is archived. Use Edit Group to restore it if needed.` });
  }

  const prevStatus = target.status;
  target.status = status;
  target.updated_at = new Date().toISOString();
  saveLocalGroups(groups);
  await syncTableUpsert('chit_groups', [groupToDbRow(target)], 'id');

  recordAuditLog('GROUP_STATUS_CHANGE', `Set Group ${target.id} status to ${status}`, 'Admin', target.id);

  if (prevStatus !== status) {
    createAutoAnnouncement({
      title: `Group ${status === 'active' ? 'Activated' : 'Paused'}: ${target.name}`,
      description: `Group ${target.name} (${target.id}) status has been set to ${status.toUpperCase()}.`,
      category: 'Group Update',
      target_type: 'group',
      target_group_id: target.id,
      target_group_name: target.name,
      source_event_key: `group:status:${target.id}:${status}`
    });
  }

  return res.json({ success: true, group: target });
});

// Delete or Safely Archive Group (Preserves all members & financial history)
app.delete('/api/admin/groups/:id', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const groups = getLocalGroups();
  const groupIdx = groups.findIndex((g: any) => g.id === id);

  if (groupIdx === -1) {
    return res.status(404).json({ error: 'Group not found or already deleted.' });
  }

  const target = groups[groupIdx];
  const allUsers = getLocalUsers();
  const payments = getLocalPayments();
  const configs = getLocalPaymentConfigs();

  let linkedUsersCount = allUsers.filter((u: any) => u.group_id === id).length;
  let linkedPaymentsCount = payments.filter((p: any) => p.group_id === id).length;
  let linkedConfigsCount = configs.filter((c: any) => c.group_id === id).length;
  let linkedMembershipsCount = 0;

  // Also verify directly against Supabase tables so remote FK links are never missed
  if (supabase) {
    try {
      const sb = supabase as any;
      const [uRes, pRes, cRes, mRes] = await Promise.all([
        sb.from('chit_users').select('id', { count: 'exact', head: true }).eq('group_id', id),
        sb.from('payment_records').select('id', { count: 'exact', head: true }).eq('group_id', id),
        sb.from('monthly_payment_configs').select('id', { count: 'exact', head: true }).eq('group_id', id),
        sb.from('group_memberships').select('id', { count: 'exact', head: true }).eq('group_id', id)
      ]);
      linkedUsersCount = Math.max(linkedUsersCount, Number(uRes.count || 0));
      linkedPaymentsCount = Math.max(linkedPaymentsCount, Number(pRes.count || 0));
      linkedConfigsCount = Math.max(linkedConfigsCount, Number(cRes.count || 0));
      linkedMembershipsCount = Number(mRes.count || 0);
    } catch (sbCheckErr) {
      console.warn('[Supabase] Pre-delete dependency check warning:', sbCheckErr);
    }
  }

  const hasDependencies =
    linkedUsersCount > 0 || linkedPaymentsCount > 0 || linkedConfigsCount > 0 || linkedMembershipsCount > 0;

  if (!hasDependencies) {
    const deleteRes = await syncTableDelete('chit_groups', 'id', id);
    if (deleteRes.ok) {
      groups.splice(groupIdx, 1);
      saveLocalGroups(groups);
      recordAuditLog(
        'GROUP_DELETE',
        `Permanently deleted unused Chit Group ${target.id} (${target.name})`,
        'Admin',
        target.id
      );
      return res.json({
        success: true,
        archived: false,
        deleted: true,
        message: `Chit Group "${target.name}" (${target.id}) permanently deleted.`
      });
    }
    // If Supabase blocked hard delete due to FK reference, fall through to safe archive
  }

  if (target.status === 'archived') {
    return res.json({
      success: true,
      archived: true,
      deleted: false,
      group: target,
      message: `Group "${target.name}" (${target.id}) is already archived with all financial records preserved.`
    });
  }

  const now = new Date().toISOString();
  target.status = 'archived';
  target.archived_at = now;
  target.updated_at = now;
  saveLocalGroups(groups);

  let migrationNotice: string | undefined;
  const archiveSync = await syncTableUpsert('chit_groups', [groupToDbRow(target)], 'id');
  if (!archiveSync.ok) {
    // Fallback if Supabase migration_v3.sql has not been executed yet (constraint or missing archived_at)
    await syncTableUpsert(
      'chit_groups',
      [groupToDbRow({ ...target, status: 'inactive', archived_at: undefined })],
      'id'
    );
    migrationNotice = 'Run supabase/migration_v3.sql in Supabase SQL Editor to persist native archived status in PostgreSQL.';
  }

  recordAuditLog(
    'GROUP_ARCHIVE',
    `Archived Chit Group ${target.id} (${target.name}) — preserved ${linkedUsersCount} member(s) and ${linkedPaymentsCount} payment record(s)`,
    'Admin',
    target.id
  );

  return res.json({
    success: true,
    archived: true,
    deleted: false,
    group: target,
    migrationNotice,
    message: `Group "${target.name}" (${target.id}) has existing members/payment history, so it was safely archived instead of deleted. All financial records remain intact.`
  });
});

// Get members of specific group
app.get('/api/admin/groups/:id/members', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const users = getLocalUsers().filter((u: any) => !u.is_deleted);
  const members = users.filter((u: any) => u.group_id === id);

  const safeMembers = members.map((m: any) => {
    const { password_hash, ...safe } = m;
    return safe;
  });

  return res.json({ members: safeMembers, count: safeMembers.length, max_members: 99 });
});

// ======================== ADMIN USER MANAGEMENT ========================

// Get all users
app.get('/api/admin/users', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const includeDeleted = req.query.include_deleted === 'true';
  const users = getLocalUsers().filter((u: any) => includeDeleted || !u.is_deleted);
  const groups = getLocalGroups();
  const payments = getLocalPayments();

  const safeUsers = users.map((u: any) => {
    const { password_hash, ...safe } = u;
    const group = groups.find((g: any) => g.id === u.group_id);
    const userPayments = payments.filter((p: any) => p.user_id === u.user_id);
    const unpaidCount = userPayments.filter((p: any) => p.payment_status === 'UNPAID').length;
    const paidCount = userPayments.filter((p: any) => p.payment_status === 'PAID').length;

    return {
      ...safe,
      group_name: group?.name || u.group_name || 'N/A',
      scheme_name: group?.scheme_name || 'Chit Scheme',
      chit_value: group?.chit_value || 0,
      duration_months: group?.duration_months || 20,
      has_payments: userPayments.length > 0,
      unpaid_instalments: unpaidCount,
      paid_instalments: paidCount
    };
  });

  return res.json({ users: safeUsers });
});

// Create new user (Enforces unique User ID and Max 99 members per group)
app.post('/api/admin/users', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { user_id, full_name, mobile_number, address, city, email, group_id, password } = req.body;

  if (!user_id || !full_name || !mobile_number || !address || !group_id) {
    return res.status(400).json({ error: 'Please fill all required fields (User ID, Full Name, Mobile, Address, Group).' });
  }

  const cleanUserId = user_id.trim().toUpperCase();
  const users = getLocalUsers();

  // 1. Validate unique User ID
  if (users.some((u: any) => u.user_id.toLowerCase() === cleanUserId.toLowerCase())) {
    return res.status(400).json({ error: `User ID "${cleanUserId}" is already in use. Please generate or use a different ID.` });
  }

  // 2. Validate group existence, active state, and Max 99 members constraint
  const groups = getLocalGroups();
  const group = groups.find((g: any) => g.id === group_id);
  if (!group) {
    return res.status(400).json({ error: 'Selected group does not exist.' });
  }
  if (group.status === 'archived') {
    return res.status(400).json({ error: `Cannot assign member. Group "${group.name}" has been archived.` });
  }

  const currentMembersInGroup = users.filter((u: any) => !u.is_deleted && u.group_id === group_id).length;
  if (currentMembersInGroup >= 99) {
    return res.status(400).json({ error: `Cannot add member. Group "${group.name}" has reached the maximum capacity of 99 members.` });
  }

  const initialPassword = password || 'user123';
  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id: cleanUserId,
    full_name: full_name.trim(),
    mobile_number: mobile_number.trim(),
    address: address.trim(),
    city: (city || 'Villukuri').trim(),
    email: email ? email.trim() : undefined,
    group_id: group.id,
    group_name: group.name,
    password_hash: hashPassword(initialPassword),
    status: 'active',
    is_deleted: false,
    role: 'user',
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveLocalUsers(users);
  await syncTableUpsert('chit_users', [userToDbRow(newUser)], 'id');

  recordAuditLog('USER_CREATE', `Created User: ${newUser.user_id} (${newUser.full_name}) in Group ${group.name}`, 'Admin', newUser.user_id);

  const { password_hash, ...safeUser } = newUser;
  return res.status(201).json({
    success: true,
    user: safeUser,
    message: `User account created successfully with User ID ${cleanUserId}.`
  });
});

// Update user details
app.put('/api/admin/users/:id', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { full_name, mobile_number, address, city, email, group_id } = req.body;

  const users = getLocalUsers();
  const target = users.find((u: any) => u.id === id || u.user_id === id);

  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // If changing group, check not archived and max 99 members
  if (group_id && group_id !== target.group_id) {
    const groups = getLocalGroups();
    const newGroup = groups.find((g: any) => g.id === group_id);
    if (!newGroup) return res.status(400).json({ error: 'Target group does not exist.' });
    if (newGroup.status === 'archived') {
      return res.status(400).json({ error: `Cannot move member to archived group "${newGroup.name}".` });
    }

    const memberCount = users.filter((u: any) => !u.is_deleted && u.group_id === group_id).length;
    if (memberCount >= 99) {
      return res.status(400).json({ error: `Cannot reassign. Group "${newGroup.name}" is already at full capacity (99 members).` });
    }
    target.group_id = newGroup.id;
    target.group_name = newGroup.name;
  }

  if (full_name) target.full_name = full_name.trim();
  if (mobile_number) target.mobile_number = mobile_number.trim();
  if (address) target.address = address.trim();
  if (city) target.city = city.trim();
  if (email !== undefined) target.email = email.trim();
  target.updated_at = new Date().toISOString();

  saveLocalUsers(users);
  await syncTableUpsert('chit_users', [userToDbRow(target)], 'id');
  recordAuditLog('USER_UPDATE', `Updated User details for ${target.user_id} (${target.full_name})`, 'Admin', target.user_id);

  const { password_hash, ...safeUser } = target;
  return res.json({ success: true, user: safeUser, message: 'User updated successfully.' });
});

// Reset user password (salted scrypt + session invalidation + optional Supabase Auth Admin update)
app.patch('/api/admin/users/:id/password', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { new_password } = req.body;

  const pwError = validateStrongPassword(new_password);
  if (pwError) {
    return res.status(400).json({ error: pwError });
  }

  const users = getLocalUsers();
  const target = users.find((u: any) => u.id === id || u.user_id === id);

  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const newHash = hashPassword(new_password);
  target.password_hash = newHash;
  target.updated_at = new Date().toISOString();
  saveLocalUsers(users);

  // Sync to Supabase DB / Auth Admin API if configured
  if (supabase) {
    try {
      await (supabase as any)
        .from('chit_users')
        .update({ password_hash: newHash, updated_at: target.updated_at })
        .eq('user_id', target.user_id);
      if ((target as any).auth_uid) {
        await (supabase as any).auth.admin.updateUserById((target as any).auth_uid, { password: new_password });
      }
    } catch (sbErr) {
      console.warn('[Supabase] Password sync warning:', sbErr);
    }
  }

  // Force logout of existing sessions for this user
  const revokedCount = revokeUserSessions(target.user_id);

  recordAuditLog('PASSWORD_RESET', `Admin reset login password for ${target.user_id} (${target.full_name}); invalidated ${revokedCount} active session(s)`, 'Admin', target.user_id);
  return res.json({
    success: true,
    revokedSessions: revokedCount,
    message: `Password for ${target.full_name} (${target.user_id}) updated securely. Active sessions invalidated.`
  });
});

// Toggle user status (Active / Inactive)
app.patch('/api/admin/users/:id/status', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Invalid user status.' });
  }

  const users = getLocalUsers();
  const target = users.find((u: any) => u.id === id || u.user_id === id);

  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }

  target.status = status;
  if (status === 'active') {
    target.is_deleted = false;
    delete target.deleted_at;
  } else {
    revokeUserSessions(target.user_id);
  }
  target.updated_at = new Date().toISOString();
  saveLocalUsers(users);
  await syncTableUpsert('chit_users', [userToDbRow(target)], 'id');

  recordAuditLog('USER_STATUS_CHANGE', `Changed User ${target.user_id} status to ${status}`, 'Admin', target.user_id);
  return res.json({ success: true, user_id: target.user_id, status });
});

// Delete user (Safe soft-delete when financial payment records exist; hard delete only when clean)
app.delete('/api/admin/users/:id', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const users = getLocalUsers();
  const userIndex = users.findIndex((u: any) => u.id === id || u.user_id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const user = users[userIndex];
  const payments = getLocalPayments();
  const hasPayments = payments.some((p: any) => p.user_id === user.user_id);

  // Immediately revoke any open member sessions
  revokeUserSessions(user.user_id);

  if (hasPayments) {
    const now = new Date().toISOString();
    user.status = 'inactive';
    user.is_deleted = true;
    user.deleted_at = now;
    user.updated_at = now;
    saveLocalUsers(users);

    if (supabase) {
      try {
        await (supabase as any)
          .from('chit_users')
          .update({ status: 'inactive', is_deleted: true, deleted_at: now, updated_at: now })
          .eq('user_id', user.user_id);
      } catch (sbErr) {
        console.warn('[Supabase] Soft-delete sync warning:', sbErr);
      }
    }

    recordAuditLog(
      'USER_SOFT_DELETE',
      `Soft-deleted & deactivated User ${user.user_id} (${user.full_name}); financial payment history preserved`,
      'Admin',
      user.user_id
    );

    return res.json({
      success: true,
      softDeleted: true,
      message: `${user.full_name} (${user.user_id}) removed from active list and deactivated. Historical payment records preserved for audit.`
    });
  }

  users.splice(userIndex, 1);
  saveLocalUsers(users);

  if (supabase) {
    try {
      await (supabase as any).from('chit_users').delete().eq('user_id', user.user_id);
    } catch (sbErr) {
      console.warn('[Supabase] User delete sync warning:', sbErr);
    }
  }

  recordAuditLog('USER_DELETE', `Permanently deleted User: ${user.user_id} (${user.full_name}) (no financial records)`, 'Admin', user.user_id);

  return res.json({
    success: true,
    softDeleted: false,
    message: `User ${user.full_name} (${user.user_id}) permanently deleted.`
  });
});

// ======================== ADMIN MONTHLY PAYMENT MANAGEMENT ========================

// Get payments with filters
app.get('/api/admin/payments', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { group_id, month, year, user_id, status, search } = req.query;
  const allPayments = getLocalPayments();

  let filtered = allPayments;

  if (group_id && group_id !== 'all') {
    filtered = filtered.filter((p: any) => p.group_id === group_id);
  }

  if (month && month !== 'all') {
    filtered = filtered.filter((p: any) => String(p.payment_month) === String(month));
  }

  if (year && year !== 'all') {
    filtered = filtered.filter((p: any) => String(p.payment_year) === String(year));
  }

  if (user_id) {
    filtered = filtered.filter((p: any) => p.user_id.toLowerCase().includes(String(user_id).toLowerCase()));
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((p: any) => p.payment_status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter((p: any) =>
      p.user_name.toLowerCase().includes(q) ||
      p.user_id.toLowerCase().includes(q) ||
      (p.receipt_number && p.receipt_number.toLowerCase().includes(q))
    );
  }

  // Sort: highest year, then highest month, then user name
  filtered.sort((a: any, b: any) => {
    if (b.payment_year !== a.payment_year) return b.payment_year - a.payment_year;
    if (b.payment_month !== a.payment_month) return Number(b.payment_month) - Number(a.payment_month);
    return a.user_name.localeCompare(b.user_name);
  });

  return res.json({ payments: filtered, total: filtered.length });
});

// Configure Variable Monthly Payment & Apply to Group Members (Default status: UNPAID)
app.post('/api/admin/payments/configure', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { group_id, month, year, month_label, payment_amount, due_date } = req.body;

  if (!group_id || !month || !year || !payment_amount) {
    return res.status(400).json({ error: 'Please provide Group, Month, Year, and Payment Amount.' });
  }

  const numAmount = Number(payment_amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Payment amount must be a positive number.' });
  }

  const groups = getLocalGroups();
  const group = groups.find((g: any) => g.id === group_id);
  if (!group) return res.status(404).json({ error: 'Selected group does not exist.' });
  if (group.status === 'archived') {
    return res.status(400).json({ error: `Cannot publish monthly payments for archived group "${group.name}".` });
  }

  const users = getLocalUsers();
  const groupMembers = users.filter((u: any) => !u.is_deleted && u.group_id === group_id && u.status === 'active');

  if (groupMembers.length === 0) {
    return res.status(400).json({ error: `Group "${group.name}" has no active members to apply payments to.` });
  }

  const maxMonths = Number(group.duration_months) || 60;
  if (Number(month) < 1 || Number(month) > maxMonths) {
    return res.status(400).json({ error: `Month cycle must be between 1 and ${maxMonths} for group "${group.name}".` });
  }

  const payments = getLocalPayments();
  const newlyCreatedPayments: any[] = [];
  let createdCount = 0;
  let existingCount = 0;

  const monthLabelText = month_label || `Month ${month} - ${year}`;

  groupMembers.forEach((member: any) => {
    // Prevent duplicate records for the same user and month+year
    const alreadyExists = payments.some((p: any) =>
      p.user_id === member.user_id &&
      String(p.payment_month) === String(month) &&
      String(p.payment_year) === String(year)
    );

    if (alreadyExists) {
      existingCount++;
    } else {
      createdCount++;
      const newPay = {
        id: `pay-${member.user_id}-m${month}-${year}`,
        user_id: member.user_id,
        user_name: member.full_name,
        group_id: group.id,
        group_name: group.name,
        payment_month: Number(month),
        month_name: monthLabelText,
        payment_year: Number(year),
        payment_amount: numAmount,
        payment_status: 'UNPAID',
        payment_date: null,
        updated_by: 'Admin (Batch Amount Set)',
        receipt_number: undefined,
        notes: `Variable monthly instalment set for ${monthLabelText}. Awaiting physical cash collection.`,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      payments.push(newPay);
      newlyCreatedPayments.push(newPay);
    }
  });

  saveLocalPayments(payments);
  if (newlyCreatedPayments.length > 0) {
    await syncTableUpsert('payment_records', newlyCreatedPayments.map(paymentToDbRow), 'id');
  }

  // Save payment config
  const configs = getLocalPaymentConfigs();
  const newConfig = {
    id: `cfg-${group_id}-m${month}-${year}`,
    group_id: group.id,
    group_name: group.name,
    month: Number(month),
    month_label: monthLabelText,
    year: Number(year),
    payment_amount: numAmount,
    due_date: due_date || `${year}-${String(Math.min(12, Number(month))).padStart(2, '0')}-10`,
    created_by: 'Admin',
    created_at: new Date().toISOString()
  };
  configs.unshift(newConfig);
  saveLocalPaymentConfigs(configs);
  await syncTableUpsert('monthly_payment_configs', [paymentConfigToDbRow(newConfig)], 'id');

  recordAuditLog(
    'MONTHLY_PAYMENT_CONFIGURED',
    `Set ${monthLabelText} payment to ₹${numAmount.toLocaleString('en-IN')} for Group ${group.name}. Created ${createdCount} new UNPAID records (${existingCount} existed).`,
    'Admin',
    group.id
  );

  if (createdCount > 0) {
    createAutoAnnouncement({
      title: `Monthly Instalment Published: ${monthLabelText} (${group.name})`,
      description: `The monthly instalment for ${group.name} (${monthLabelText}) has been set to ${formatInr(numAmount)}. Please pay on or before the 10th at our Villukuri office counter to maintain eligibility for the prompt payment bonus.`,
      category: 'Payment Notice',
      target_type: 'group',
      target_group_id: group.id,
      target_group_name: group.name,
      source_event_key: `payment:cfg:${group.id}:m${month}:${year}:${numAmount}`
    });
  }

  return res.status(201).json({
    success: true,
    createdCount,
    existingCount,
    message: `Applied ₹${numAmount.toLocaleString('en-IN')} payment to ${groupMembers.length} members of ${group.name} (${createdCount} records created with UNPAID status).`
  });
});

// Update individual payment status (Physical cash collection workflow)
app.patch('/api/admin/payments/:id/status', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { status, notes, receipt_number, payment_date } = req.body;

  if (!['PAID', 'UNPAID'].includes(status)) {
    return res.status(400).json({ error: 'Status must be PAID or UNPAID.' });
  }

  const payments = getLocalPayments();
  const target = payments.find((p: any) => p.id === id);

  if (!target) {
    return res.status(404).json({ error: 'Payment record not found.' });
  }

  target.payment_status = status;
  target.updated_by = 'Admin (Cash Desk)';
  target.last_updated = new Date().toISOString();

  if (status === 'PAID') {
    target.payment_date = payment_date || new Date().toISOString();
    target.receipt_number = receipt_number || `REC-${Date.now().toString().slice(-6)}`;
    if (notes) target.notes = notes;
    recordAuditLog(
      'PAYMENT_STATUS_PAID',
      `Cash payment of ₹${target.payment_amount} received for ${target.user_name} (${target.user_id}) - ${target.month_name}. Receipt: ${target.receipt_number}`,
      'Admin',
      target.id
    );
  } else {
    // Changed back to UNPAID
    target.payment_date = null;
    if (notes) target.notes = notes;
    recordAuditLog(
      'PAYMENT_STATUS_UNPAID',
      `Payment status reversed to UNPAID for ${target.user_name} (${target.user_id}) - ${target.month_name}`,
      'Admin',
      target.id
    );
  }

  saveLocalPayments(payments);
  await syncTableUpsert('payment_records', [paymentToDbRow(target)], 'id');

  return res.json({
    success: true,
    payment: target,
    message: `Payment status for ${target.user_name} successfully updated to ${status}.`
  });
});

// Batch Update multiple payment statuses (e.g. marking multiple cash receipts)
app.post('/api/admin/payments/batch-status', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { payment_ids, status } = req.body;

  if (!Array.isArray(payment_ids) || payment_ids.length === 0 || !['PAID', 'UNPAID'].includes(status)) {
    return res.status(400).json({ error: 'Invalid batch payment parameters.' });
  }

  const payments = getLocalPayments();
  const updatedRows: any[] = [];
  let updatedCount = 0;
  const now = new Date().toISOString();

  payments.forEach((p: any) => {
    if (payment_ids.includes(p.id)) {
      p.payment_status = status;
      p.updated_by = 'Admin (Batch Cash Desk)';
      p.last_updated = now;
      if (status === 'PAID') {
        p.payment_date = p.payment_date || now;
        p.receipt_number = p.receipt_number || `REC-${Date.now().toString().slice(-6)}`;
      } else {
        p.payment_date = null;
      }
      updatedRows.push(p);
      updatedCount++;
    }
  });

  saveLocalPayments(payments);
  if (updatedRows.length > 0) {
    await syncTableUpsert('payment_records', updatedRows.map(paymentToDbRow), 'id');
  }
  recordAuditLog('BATCH_PAYMENT_UPDATE', `Batch updated ${updatedCount} payment records to ${status}`, 'Admin');

  return res.json({
    success: true,
    updatedCount,
    message: `Successfully marked ${updatedCount} records as ${status}.`
  });
});

// Get payment configs list
app.get('/api/admin/payments/configs', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  return res.json({ configs: getLocalPaymentConfigs() });
});

// ======================== ADMIN NEWS & ANNOUNCEMENTS ========================

app.get('/api/admin/announcements', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const includeArchived = req.query.include_archived === 'true';
  const announcements = getLocalAnnouncements().filter((a: any) => includeArchived || !a.is_archived);
  announcements.sort((a: any, b: any) => new Date(b.created_at || b.publish_date).getTime() - new Date(a.created_at || a.publish_date).getTime());
  return res.json({ announcements });
});

app.post('/api/admin/announcements', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const {
    title,
    description,
    category = 'General',
    target_type = 'all',
    target_group_id = 'all',
    target_scheme_id,
    publish_date,
    is_published = true
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Please provide both title and description.' });
  }

  const groups = getLocalGroups();
  const schemes = getLocalSchemes();
  const resolvedGroup = target_group_id && target_group_id !== 'all' ? groups.find((g: any) => g.id === target_group_id) : null;
  const resolvedScheme = target_scheme_id ? schemes.find((s: any) => s.id === target_scheme_id) : null;

  const normalizedTargetType =
    target_type === 'scheme' && resolvedScheme
      ? 'scheme'
      : target_type === 'group' || (target_group_id && target_group_id !== 'all')
      ? 'group'
      : 'all';

  const announcements = getLocalAnnouncements();
  const newAnnouncement = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    description: description.trim(),
    category,
    target_type: normalizedTargetType,
    target_group_id: normalizedTargetType === 'group' ? target_group_id : normalizedTargetType === 'all' ? 'all' : undefined,
    target_group_name: resolvedGroup?.name,
    target_scheme_id: normalizedTargetType === 'scheme' ? resolvedScheme?.id : undefined,
    target_scheme_name: resolvedScheme?.nameEn,
    is_auto_generated: false,
    publish_date: publish_date || new Date().toISOString().split('T')[0],
    is_published: Boolean(is_published),
    is_archived: false,
    created_by: 'Admin',
    created_at: new Date().toISOString()
  };

  announcements.unshift(newAnnouncement);
  saveLocalAnnouncements(announcements);
  await syncTableUpsert('announcements', [announcementToDbRow(newAnnouncement)], 'id');

  recordAuditLog('ANNOUNCEMENT_CREATE', `Published announcement: "${newAnnouncement.title}"`, 'Admin', newAnnouncement.id);
  return res.status(201).json({ success: true, announcement: newAnnouncement, message: 'Announcement published successfully.' });
});

app.put('/api/admin/announcements/:id', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { title, description, category, target_group_id, publish_date, is_published } = req.body;

  const announcements = getLocalAnnouncements();
  const target = announcements.find((a: any) => a.id === id);

  if (!target) return res.status(404).json({ error: 'Announcement not found.' });

  if (title) target.title = title.trim();
  if (description) target.description = description.trim();
  if (category) target.category = category;
  if (target_group_id) target.target_group_id = target_group_id;
  if (publish_date) target.publish_date = publish_date;
  if (is_published !== undefined) target.is_published = Boolean(is_published);
  target.updated_at = new Date().toISOString();

  saveLocalAnnouncements(announcements);
  await syncTableUpsert('announcements', [announcementToDbRow(target)], 'id');
  recordAuditLog('ANNOUNCEMENT_UPDATE', `Updated announcement: "${target.title}"`, 'Admin', target.id);

  return res.json({ success: true, announcement: target, message: 'Announcement updated.' });
});

app.delete('/api/admin/announcements/:id', async (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const mode = req.query.mode as string | undefined;
  const announcements = getLocalAnnouncements();
  const index = announcements.findIndex((a: any) => a.id === id);

  if (index === -1) return res.status(404).json({ error: 'Announcement not found or already deleted.' });

  const target = announcements[index];
  const ageDays = (Date.now() - new Date(target.created_at || target.publish_date).getTime()) / 86400000;
  const shouldSoftArchive = mode === 'archive' || target.is_auto_generated || ageDays > 7;

  if (shouldSoftArchive) {
    const now = new Date().toISOString();
    target.is_archived = true;
    target.is_published = false;
    target.archived_at = now;
    target.updated_at = now;
    saveLocalAnnouncements(announcements);

    if (supabase) {
      try {
        await (supabase as any)
          .from('announcements')
          .update({ is_archived: true, is_published: false, archived_at: now, updated_at: now })
          .eq('id', id);
      } catch (sbErr) {
        console.warn('[Supabase] Announcement archive sync warning:', sbErr);
      }
    }

    recordAuditLog('ANNOUNCEMENT_ARCHIVE', `Archived historical/auto announcement: "${target.title}"`, 'Admin', target.id);
    return res.json({ success: true, archived: true, message: `Announcement "${target.title}" archived and hidden from member dashboards.` });
  }

  const deleted = announcements.splice(index, 1)[0];
  saveLocalAnnouncements(announcements);

  if (supabase) {
    try {
      await (supabase as any).from('announcements').delete().eq('id', id);
    } catch (sbErr) {
      console.warn('[Supabase] Announcement delete sync warning:', sbErr);
    }
  }

  recordAuditLog('ANNOUNCEMENT_DELETE', `Deleted announcement: "${deleted.title}"`, 'Admin', deleted.id);
  return res.json({ success: true, archived: false, message: `Announcement "${deleted.title}" deleted successfully.` });
});

// ======================== SERVING FRONTEND ========================

async function startServer() {
  if (isProd) {
    const missing: string[] = [];
    if (!supabaseUrl) missing.push('SUPABASE_URL');
    if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      missing.push('SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY');
    }
    if (!process.env.ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');
    if (!process.env.ADMIN_SECRET_KEY) missing.push('ADMIN_SECRET_KEY');
    if (missing.length > 0) {
      throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
    }
  }

  const httpServer = createHttpServer(app);

  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: { server: httpServer },
        allowedHosts: true,
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] TEAM STARS CHITS portal running at http://0.0.0.0:${PORT}`);
    console.log(`[Mode] ${isProd ? 'Production' : 'Development'}`);
    startPublicRealtime();
    void bootstrapSupabaseData();
  });
}

export default app;

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startServer().catch(err => {
    console.error('[Fatal Server Startup Error]:', err);
    process.exitCode = 1;
  });
}
