import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
