export type Language = 'en' | 'ta';

export interface MonthScheduleItem {
  month: number;
  instalment: number;
  chitAmount: number;
}

export interface ChitScheme {
  id: string;
  nameEn: string;
  nameTa: string;
  chitValue: number;
  chitValueFormatted: string;
  chitValueFormattedTa: string;
  durationMonths: number;
  firstMonthInstalment: number;
  minInstalment: number;
  maxInstalment: number;
  totalInstalmentsPaid: number;
  dividendBenefit: number;
  promptBonus: number;
  lastMonthBonus: number;
  totalBonus: number;
  schedule: MonthScheduleItem[];
  rulesEn: string[];
  rulesTa: string[];
  documentImage: string;
  taglineEn: string;
  taglineTa: string;
}

export interface CustomerEnquiry {
  id?: string;
  full_name: string;
  mobile_number: string;
  email: string;
  city: string;
  preferred_scheme: string;
  preferred_language: 'en' | 'ta';
  message: string;
  consent: boolean;
  enquiry_status?: 'New' | 'Contacted' | 'In Progress' | 'Completed';
  created_at?: string;
}

export interface SystemStatus {
  company: string;
  cin: string;
  supabaseConfigured: boolean;
  resendConfigured: boolean;
  notificationEmail: string;
  totalEnquiries: number;
  timestamp: string;
}
