export type Language = 'en' | 'ta';

export interface MonthScheduleItem {
  month: number;
  instalment: number;
  chitAmount: number;
}

export interface ChitScheme {
  id: string;
  schemeCode?: string;
  nameEn: string;
  nameTa: string;
  chitValue: number;
  chitValueFormatted: string;
  chitValueFormattedTa: string;
  durationMonths: number;
  availableDurations?: number[];
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
  documentImage?: string;
  taglineEn: string;
  taglineTa: string;
  status?: 'active' | 'inactive' | 'archived';
  startDate?: string;
  version?: number;
  runningGroupsCount?: number;
  isReferenced?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchemeVersion {
  id: string;
  scheme_id: string;
  version: number;
  name_en: string;
  chit_value: number;
  duration_months: number;
  available_durations: number[];
  snapshot_data: Partial<ChitScheme>;
  change_reason?: string;
  created_by: string;
  created_at: string;
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
  supabaseConnected?: boolean;
  supabaseKeyMode?: string;
  resendConfigured: boolean;
  notificationEmail: string;
  totalEnquiries: number;
  timestamp: string;
}

export interface ChitGroup {
  id: string;
  name: string;
  scheme_id?: string;
  scheme_version?: number;
  scheme_name: string;
  chit_value: number;
  duration_months: number;
  start_date: string;
  status: 'active' | 'inactive' | 'archived';
  max_members: number; // Max 99 enforced
  member_count?: number;
  total_user_count?: number;
  payment_count?: number;
  config_count?: number;
  has_financial_records?: boolean;
  archived_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface ChitUser {
  id: string;
  user_id: string; // Unique User ID (e.g. TS-2026-001)
  full_name: string;
  mobile_number: string;
  address: string;
  city: string;
  email?: string;
  group_id: string;
  group_name?: string;
  scheme_name?: string;
  chit_value?: number;
  duration_months?: number;
  status: 'active' | 'inactive';
  is_deleted?: boolean;
  deleted_at?: string;
  has_payments?: boolean;
  role: 'user';
  paid_instalments?: number;
  unpaid_instalments?: number;
  created_at: string;
  updated_at?: string;
}

export interface MonthlyPaymentConfig {
  id: string;
  group_id: string;
  group_name: string;
  month: number;
  month_label: string;
  year: number;
  payment_amount: number;
  due_date: string;
  created_by: string;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string; // Unique User ID
  user_name: string;
  group_id: string;
  group_name: string;
  payment_month: number | string;
  month_name: string;
  payment_year: number;
  payment_amount: number;
  payment_status: 'PAID' | 'UNPAID';
  payment_date: string | null;
  updated_by: string;
  receipt_number?: string;
  notes?: string;
  last_updated: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  category: 'General' | 'Auction Date' | 'Payment Notice' | 'Bonus Update' | 'Important' | 'Scheme Update' | 'Group Update';
  target_type?: 'all' | 'group' | 'scheme';
  target_group_id?: string;
  target_group_name?: string;
  target_scheme_id?: string;
  target_scheme_name?: string;
  is_auto_generated?: boolean;
  source_event_key?: string;
  is_published: boolean;
  is_archived?: boolean;
  archived_at?: string;
  publish_date: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performed_by: string;
  target_id?: string;
  timestamp: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalGroups: number;
  totalSchemes?: number;
  totalPaidCount: number;
  totalUnpaidCount: number;
  totalCashCollected: number;
  totalOutstanding: number;
  groupsSummary: {
    groupId: string;
    groupName: string;
    schemeName?: string;
    chitValue?: number;
    durationMonths?: number;
    memberCount: number;
    maxMembers?: number;
    paidCount: number;
    unpaidCount: number;
    totalCollected: number;
    totalPending: number;
    status?: string;
  }[];
  recentPayments: PaymentRecord[];
  recentLogs: AuditLog[];
}


