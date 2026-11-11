import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

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

// Additional Persistent JSON Storage Files
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PAYMENT_CONFIGS_FILE = path.join(DATA_DIR, 'payment_configs.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit_logs.json');

// Security & Password Hashing
function hashPassword(password: string): string {
  const salt = 'teamstars_chit_salt_2025';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
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
  return users.find((u: any) => u.user_id === session.userId && u.status === 'active') || null;
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
  all.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    details,
    performed_by,
    target_id,
    timestamp: new Date().toISOString()
  });
  // Keep latest 500 logs
  if (all.length > 500) all.length = 500;
  saveLocalAuditLogs(all);
}

if (!fs.existsSync(AUDIT_LOGS_FILE)) {
  recordAuditLog("SYSTEM_BOOT", "Chit Fund Management System Initialized with 3 Active Batches", "System");
}


// Supabase Client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project'));

let supabase: ReturnType<typeof createClient> | null = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl!, supabaseKey!);
    console.log('[Supabase] Client initialized successfully.');
  } catch (err) {
    console.warn('[Supabase] Initialization failed:', err);
  }
} else {
  console.log('[Supabase] Credentials not set in env. Using persistent local storage.');
}

// Resend Email Client initialization
const resendApiKey = process.env.RESEND_API_KEY;
const isResendConfigured = Boolean(resendApiKey && !resendApiKey.includes('123456789'));
const resend = isResendConfigured ? new Resend(resendApiKey) : null;
const NOTIFICATION_EMAIL = 'ajesh321km2@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Team Stars Chits <onboarding@resend.dev>';

// Admin authentication token secret
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'teamstars2025';
const ADMIN_TOKEN_SECRET = process.env.ADMIN_SECRET_KEY || 'teamstars-secret-token-key-2025';

function isValidAdminAuth(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === ADMIN_TOKEN_SECRET;
}

// ======================== API ROUTES ========================

// Health & System status endpoint
app.get('/api/system/status', (_req: Request, res: Response) => {
  const localEnquiries = getLocalEnquiries();
  res.json({
    company: "TEAM STARS CHITS PRIVATE LIMITED",
    cin: "U64990TN2025PTC181717",
    supabaseConfigured: isSupabaseConfigured,
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
        const { error: sbError } = await (supabase as any).from('enquiries').insert([
          {
            full_name: newEnquiry.full_name,
            mobile_number: newEnquiry.mobile_number,
            email: newEnquiry.email,
            city: newEnquiry.city,
            preferred_scheme: newEnquiry.preferred_scheme,
            preferred_language: newEnquiry.preferred_language,
            message: newEnquiry.message,
            consent: newEnquiry.consent,
            enquiry_status: newEnquiry.enquiry_status
          }
        ]);
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

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact the administrator.' });
    }

    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid User ID or password.' });
    }

    const token = generateUserToken(user.user_id);
    recordAuditLog('USER_LOGIN', `Member logged in: ${user.user_id} (${user.full_name})`, user.user_id, user.id);

    // Return sanitized user profile (without password_hash)
    const { password_hash, ...safeUser } = user;
    return res.json({
      success: true,
      token,
      user: safeUser,
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
      chit_value: group?.chit_value || 0
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

// Member Announcements (Read-only)
app.get('/api/user/announcements', (req: Request, res: Response) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const announcements = getLocalAnnouncements();
  const published = announcements.filter((a: any) => 
    a.is_published && (a.target_group_id === 'all' || a.target_group_id === authUser.group_id)
  );

  published.sort((a: any, b: any) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
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

  const users = getLocalUsers();
  const groups = getLocalGroups();
  const payments = getLocalPayments();
  const auditLogs = getLocalAuditLogs();

  const totalUsers = users.length;
  const totalGroups = groups.length;

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

// ======================== ADMIN GROUP MANAGEMENT ========================

// Get all groups with member counts
app.get('/api/admin/groups', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const groups = getLocalGroups();
  const users = getLocalUsers();

  const groupsWithCount = groups.map((g: any) => ({
    ...g,
    member_count: users.filter((u: any) => u.group_id === g.id).length
  }));

  return res.json({ groups: groupsWithCount });
});

// Create new group (Enforces Max 99 members)
app.post('/api/admin/groups', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id, name, scheme_name, chit_value, duration_months = 20, start_date } = req.body;

  if (!id || !name || !scheme_name || !chit_value) {
    return res.status(400).json({ error: 'Please provide Group ID, Group Name, Scheme Name, and Chit Value.' });
  }

  const cleanId = id.trim().toUpperCase();
  const groups = getLocalGroups();

  if (groups.some((g: any) => g.id === cleanId)) {
    return res.status(400).json({ error: `Group ID "${cleanId}" already exists. Please choose a unique ID.` });
  }

  const newGroup = {
    id: cleanId,
    name: name.trim(),
    scheme_name: scheme_name.trim(),
    chit_value: Number(chit_value),
    duration_months: Number(duration_months) || 20,
    start_date: start_date || new Date().toISOString().split('T')[0],
    status: 'active',
    max_members: 99, // Max 99 members strictly enforced
    created_at: new Date().toISOString()
  };

  groups.push(newGroup);
  saveLocalGroups(groups);
  recordAuditLog('GROUP_CREATE', `Created Group: ${newGroup.id} (${newGroup.name})`, 'Admin', newGroup.id);

  return res.status(201).json({
    success: true,
    group: { ...newGroup, member_count: 0 },
    message: 'Chit Group created successfully.'
  });
});

// Update group
app.put('/api/admin/groups/:id', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { name, scheme_name, chit_value, status } = req.body;
  const groups = getLocalGroups();
  const target = groups.find((g: any) => g.id === id);

  if (!target) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  if (name) target.name = name.trim();
  if (scheme_name) target.scheme_name = scheme_name.trim();
  if (chit_value) target.chit_value = Number(chit_value);
  if (status && ['active', 'inactive'].includes(status)) target.status = status;
  target.updated_at = new Date().toISOString();

  saveLocalGroups(groups);
  recordAuditLog('GROUP_UPDATE', `Updated Group: ${target.id} (${target.name})`, 'Admin', target.id);

  return res.json({ success: true, group: target, message: 'Group updated successfully.' });
});

// Toggle group active/inactive status
app.patch('/api/admin/groups/:id/status', (req: Request, res: Response) => {
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

  target.status = status;
  target.updated_at = new Date().toISOString();
  saveLocalGroups(groups);

  recordAuditLog('GROUP_STATUS_CHANGE', `Set Group ${target.id} status to ${status}`, 'Admin', target.id);
  return res.json({ success: true, group: target });
});

// Get members of specific group
app.get('/api/admin/groups/:id/members', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const users = getLocalUsers();
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

  const users = getLocalUsers();
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
      unpaid_instalments: unpaidCount,
      paid_instalments: paidCount
    };
  });

  return res.json({ users: safeUsers });
});

// Create new user (Enforces unique User ID and Max 99 members per group)
app.post('/api/admin/users', (req: Request, res: Response) => {
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

  // 2. Validate group existence and Max 99 members constraint
  const groups = getLocalGroups();
  const group = groups.find((g: any) => g.id === group_id);
  if (!group) {
    return res.status(400).json({ error: 'Selected group does not exist.' });
  }

  const currentMembersInGroup = users.filter((u: any) => u.group_id === group_id).length;
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
    role: 'user',
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveLocalUsers(users);

  recordAuditLog('USER_CREATE', `Created User: ${newUser.user_id} (${newUser.full_name}) in Group ${group.name}`, 'Admin', newUser.user_id);

  const { password_hash, ...safeUser } = newUser;
  return res.status(201).json({
    success: true,
    user: safeUser,
    message: `User account created successfully with User ID ${cleanUserId}.`
  });
});

// Update user details
app.put('/api/admin/users/:id', (req: Request, res: Response) => {
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

  // If changing group, check max 99 members
  if (group_id && group_id !== target.group_id) {
    const groups = getLocalGroups();
    const newGroup = groups.find((g: any) => g.id === group_id);
    if (!newGroup) return res.status(400).json({ error: 'Target group does not exist.' });

    const memberCount = users.filter((u: any) => u.group_id === group_id).length;
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
  recordAuditLog('USER_UPDATE', `Updated User details for ${target.user_id} (${target.full_name})`, 'Admin', target.user_id);

  const { password_hash, ...safeUser } = target;
  return res.json({ success: true, user: safeUser, message: 'User updated successfully.' });
});

// Reset user password
app.patch('/api/admin/users/:id/password', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { new_password } = req.body;

  if (!new_password || new_password.trim().length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  const users = getLocalUsers();
  const target = users.find((u: any) => u.id === id || u.user_id === id);

  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }

  target.password_hash = hashPassword(new_password.trim());
  target.updated_at = new Date().toISOString();
  saveLocalUsers(users);

  recordAuditLog('PASSWORD_RESET', `Reset login password for ${target.user_id} (${target.full_name})`, 'Admin', target.user_id);
  return res.json({ success: true, message: `Password for ${target.full_name} (${target.user_id}) reset successfully.` });
});

// Toggle user status (Active / Inactive)
app.patch('/api/admin/users/:id/status', (req: Request, res: Response) => {
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
  target.updated_at = new Date().toISOString();
  saveLocalUsers(users);

  recordAuditLog('USER_STATUS_CHANGE', `Changed User ${target.user_id} status to ${status}`, 'Admin', target.user_id);
  return res.json({ success: true, user_id: target.user_id, status });
});

// Delete user with safeguard
app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
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

  if (hasPayments) {
    return res.status(400).json({
      error: `Cannot delete ${user.full_name} (${user.user_id}) because active financial payment records exist. Please deactivate the user instead to preserve the financial audit history.`
    });
  }

  users.splice(userIndex, 1);
  saveLocalUsers(users);
  recordAuditLog('USER_DELETE', `Deleted User: ${user.user_id} (${user.full_name})`, 'Admin', user.user_id);

  return res.json({ success: true, message: `User ${user.user_id} deleted successfully.` });
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
app.post('/api/admin/payments/configure', (req: Request, res: Response) => {
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

  const users = getLocalUsers();
  const groupMembers = users.filter((u: any) => u.group_id === group_id && u.status === 'active');

  if (groupMembers.length === 0) {
    return res.status(400).json({ error: `Group "${group.name}" has no active members to apply payments to.` });
  }

  const payments = getLocalPayments();
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
      payments.push({
        id: `pay-${member.user_id}-m${month}-${year}`,
        user_id: member.user_id,
        user_name: member.full_name,
        group_id: group.id,
        group_name: group.name,
        payment_month: Number(month),
        month_name: monthLabelText,
        payment_year: Number(year),
        payment_amount: numAmount,
        payment_status: 'UNPAID', // Default status for newly created monthly payment record is UNPAID
        payment_date: null,
        updated_by: 'Admin (Batch Amount Set)',
        receipt_number: undefined,
        notes: `Variable monthly instalment set for ${monthLabelText}. Awaiting physical cash collection.`,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }
  });

  saveLocalPayments(payments);

  // Save payment config
  const configs = getLocalPaymentConfigs();
  configs.unshift({
    id: `cfg-${group_id}-m${month}-${year}`,
    group_id: group.id,
    group_name: group.name,
    month: Number(month),
    month_label: monthLabelText,
    year: Number(year),
    payment_amount: numAmount,
    due_date: due_date || `${year}-${String(month).padStart(2, '0')}-10`,
    created_by: 'Admin',
    created_at: new Date().toISOString()
  });
  saveLocalPaymentConfigs(configs);

  recordAuditLog(
    'MONTHLY_PAYMENT_CONFIGURED',
    `Set ${monthLabelText} payment to ₹${numAmount.toLocaleString('en-IN')} for Group ${group.name}. Created ${createdCount} new UNPAID records (${existingCount} existed).`,
    'Admin',
    group.id
  );

  return res.status(201).json({
    success: true,
    createdCount,
    existingCount,
    message: `Applied ₹${numAmount.toLocaleString('en-IN')} payment to ${groupMembers.length} members of ${group.name} (${createdCount} records created with UNPAID status).`
  });
});

// Update individual payment status (Physical cash collection workflow)
app.patch('/api/admin/payments/:id/status', (req: Request, res: Response) => {
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

  const prevStatus = target.payment_status;
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

  return res.json({
    success: true,
    payment: target,
    message: `Payment status for ${target.user_name} successfully updated to ${status}.`
  });
});

// Batch Update multiple payment statuses (e.g. marking multiple cash receipts)
app.post('/api/admin/payments/batch-status', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { payment_ids, status } = req.body;

  if (!Array.isArray(payment_ids) || payment_ids.length === 0 || !['PAID', 'UNPAID'].includes(status)) {
    return res.status(400).json({ error: 'Invalid batch payment parameters.' });
  }

  const payments = getLocalPayments();
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
      updatedCount++;
    }
  });

  saveLocalPayments(payments);
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
  const announcements = getLocalAnnouncements();
  announcements.sort((a: any, b: any) => new Date(b.created_at || b.publish_date).getTime() - new Date(a.created_at || a.publish_date).getTime());
  return res.json({ announcements });
});

app.post('/api/admin/announcements', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { title, description, category = 'General', target_group_id = 'all', publish_date, is_published = true } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Please provide both title and description.' });
  }

  const announcements = getLocalAnnouncements();
  const newAnnouncement = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    description: description.trim(),
    category,
    target_group_id: target_group_id || 'all',
    publish_date: publish_date || new Date().toISOString().split('T')[0],
    is_published: Boolean(is_published),
    created_by: 'Admin',
    created_at: new Date().toISOString()
  };

  announcements.unshift(newAnnouncement);
  saveLocalAnnouncements(announcements);

  recordAuditLog('ANNOUNCEMENT_CREATE', `Published announcement: "${newAnnouncement.title}"`, 'Admin', newAnnouncement.id);
  return res.status(201).json({ success: true, announcement: newAnnouncement, message: 'Announcement created successfully.' });
});

app.put('/api/admin/announcements/:id', (req: Request, res: Response) => {
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
  recordAuditLog('ANNOUNCEMENT_UPDATE', `Updated announcement: "${target.title}"`, 'Admin', target.id);

  return res.json({ success: true, announcement: target, message: 'Announcement updated.' });
});

app.delete('/api/admin/announcements/:id', (req: Request, res: Response) => {
  if (!isValidAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const announcements = getLocalAnnouncements();
  const index = announcements.findIndex((a: any) => a.id === id);

  if (index === -1) return res.status(404).json({ error: 'Announcement not found.' });

  const deleted = announcements.splice(index, 1)[0];
  saveLocalAnnouncements(announcements);

  recordAuditLog('ANNOUNCEMENT_DELETE', `Deleted announcement: "${deleted.title}"`, 'Admin', deleted.id);
  return res.json({ success: true, message: 'Announcement deleted.' });
});

// ======================== SERVING FRONTEND ========================

async function startServer() {
  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] TEAM STARS CHITS portal running at http://0.0.0.0:${PORT}`);
    console.log(`[Mode] ${isProd ? 'Production' : 'Development'}`);
  });
}

startServer().catch(err => {
  console.error('[Fatal Server Startup Error]:', err);
});
