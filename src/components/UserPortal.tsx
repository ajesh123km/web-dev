import React, { useState, useEffect } from 'react';
import { ChitUser, Language, PaymentRecord, Announcement } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { HorizontalScrollArea } from './HorizontalScrollArea';
import { RupeeEmblem3D } from './3d/MotionSection';
import { FintechCard3D } from './3d/FintechCard3D';
import {
  Lock,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Bell,
  CreditCard,
  FileText,
  X,
  RefreshCw,
  MapPin,
  Phone
} from 'lucide-react';

interface UserPortalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const UserPortal: React.FC<UserPortalProps> = ({ lang, isOpen, onClose }) => {
  const t = TRANSLATIONS[lang];
  const isTa = lang === 'ta';
  const [durationMonths, setDurationMonths] = useState<number>(20);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [userIdInput, setUserIdInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  const [profile, setProfile] = useState<ChitUser | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [totalUnpaid, setTotalUnpaid] = useState<number>(0);
  const [totalPaidCount, setTotalPaidCount] = useState<number>(0);
  const [totalUnpaidCount, setTotalUnpaidCount] = useState<number>(0);
  const [currentMonthPayment, setCurrentMonthPayment] = useState<PaymentRecord | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'announcements'>('overview');

  useEffect(() => {
    const savedToken = localStorage.getItem('teamstars_user_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated && isOpen && token) {
      fetchMemberData();
    }
  }, [isAuthenticated, isOpen, token]);

  const fetchMemberData = async () => {
    setLoadingData(true);
    try {
      const profRes = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData.user);
        setDurationMonths(Number(profData.user?.duration_months) || 20);
      } else if (profRes.status === 401) {
        handleLogout();
        return;
      }

      const payRes = await fetch('/api/user/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (payRes.ok) {
        const payData = await payRes.json();
        setPayments(payData.payments || []);
        setTotalPaid(payData.totalPaid || 0);
        setTotalUnpaid(payData.totalUnpaid || 0);
        setTotalPaidCount(payData.totalPaidCount || 0);
        setTotalUnpaidCount(payData.totalUnpaidCount || 0);
        setCurrentMonthPayment(payData.currentMonthPayment || null);
      }

      const annRes = await fetch('/api/user/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncements(annData.announcements || []);
      }
    } catch (err) {
      console.error('Failed to load member dashboard:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userIdInput.trim(),
          password: passwordInput
        })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('teamstars_user_token', data.token);
        setProfile(data.user);
        setDurationMonths(Number(data.user?.duration_months) || 20);
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        setLoginError(
          data.error || (isTa ? 'தவறான பயனர் எண் அல்லது கடவுச்சொல்.' : 'Invalid User ID or password.')
        );
      }
    } catch {
      setLoginError(isTa ? 'சேவையகத்துடன் இணைக்க முடியவில்லை.' : 'Could not connect to server.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await fetch('/api/user/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('teamstars_user_token');
    setToken('');
    setIsAuthenticated(false);
    setProfile(null);
    setPayments([]);
  };

  if (!isOpen) return null;

  const progressRatio = Math.min(100, Math.round((totalPaidCount / Math.max(durationMonths, 1)) * 100));
  const isCurrentPaid = currentMonthPayment?.payment_status === 'PAID';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#052E22]/60 backdrop-blur-xs flex items-center justify-center p-1.5 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white border border-[#064E3B]/20 shadow-2xl w-full max-w-5xl rounded-xl sm:rounded-2xl overflow-hidden max-h-[95vh] sm:max-h-[92vh] flex flex-col text-[#052E22]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Deep Emerald Forest Header Bar */}
        <div className="bg-gradient-to-r from-[#064E3B] to-[#0B5D46] border-b border-[#65E83A]/35 text-white px-3.5 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <RupeeEmblem3D size="sm" tone="light" />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-extrabold tracking-tight truncate">
                {isTa ? 'உறுப்பினர் சீட்டு தளம்' : 'Member Chit Portal'}
              </h3>
              <span className="hidden sm:block text-[11px] text-[#65E83A] font-medium truncate">
                TEAM STARS CHITS PRIVATE LIMITED · CIN: U64990TN2025PTC181717
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 sm:px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] sm:text-xs font-semibold text-white flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isTa ? 'வெளியேறு' : 'Log Out'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#D1FAE5] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mint-White Modal Body */}
        <div className="p-3 sm:p-6 overflow-y-auto overscroll-contain flex-1 bg-[#F4FBF7]">
          {!isAuthenticated ? (
            /* Crisp White Member Sign In Card */
            <div className="max-w-md mx-auto my-3 sm:my-8 fintech-card rounded-2xl p-5 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#064E3B] via-[#65E83A] to-[#064E3B]" />
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <RupeeEmblem3D size="lg" tone="forest" />
                </div>
                <h4 className="text-xl font-extrabold text-[#052E22]">
                  {isTa ? 'உறுப்பினர் உள்நுழைவு' : 'Member Sign In'}
                </h4>
                <p className="text-xs text-[#264D40] mt-1">
                  {isTa
                    ? 'உங்கள் பயனர் எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்'
                    : 'Enter your assigned User ID and password to access your chit records.'}
                </p>
              </div>

              {loginError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#052E22] mb-1">
                    {isTa ? 'பயனர் அடையாள எண் (User ID) *' : 'Unique User ID *'}
                  </label>
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="e.g. TS-2026-001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#064E3B]/20 bg-[#F9FDFB] text-sm text-[#052E22] placeholder:text-[#5C8274] focus:outline-hidden focus:ring-2 focus:ring-[#65E83A]/50 focus:border-[#064E3B]"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#052E22] mb-1">
                    {isTa ? 'கடவுச்சொல் (Password) *' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#064E3B]/20 bg-[#F9FDFB] text-sm text-[#052E22] placeholder:text-[#5C8274] focus:outline-hidden focus:ring-2 focus:ring-[#65E83A]/50 focus:border-[#064E3B]"
                    required
                  />
                </div>

                {/* Quick Demo Credentials Assistant */}
                <div className="p-3 rounded-xl bg-[#EAF7F0] border border-[#064E3B]/20 text-[11px] text-[#052E22] space-y-1">
                  <span className="font-bold block">
                    {isTa ? 'மாதிரி பயனர் உள்நுழைவு விவரங்கள் (Demo Accounts):' : 'Demo Test Accounts:'}
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setUserIdInput('TS-2026-001');
                        setPasswordInput('user123');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#064E3B] hover:text-white font-semibold text-[#052E22] border border-[#064E3B]/25 transition-colors cursor-pointer"
                    >
                      TS-2026-001 (Murugan - ₹2L)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserIdInput('TS-2026-002');
                        setPasswordInput('user123');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#064E3B] hover:text-white font-semibold text-[#052E22] border border-[#064E3B]/25 transition-colors cursor-pointer"
                    >
                      TS-2026-002 (Anitha - ₹1L)
                    </button>
                  </div>
                  <span className="text-[10px] text-[#264D40] block">
                    {isTa ? 'கடவுச்சொல்: user123' : 'Password for demo accounts: user123'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loggingIn || !userIdInput || !passwordInput}
                  className="w-full py-2.5 px-4 text-xs font-extrabold text-white bg-[#064E3B] hover:bg-[#052E22] rounded-xl shadow-md transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-[#65E83A]" />
                  <span>
                    {loggingIn
                      ? isTa
                        ? 'சரிபார்க்கிறது...'
                        : 'Authenticating...'
                      : isTa
                      ? 'உள்நுழையவும்'
                      : 'Sign In to Portal'}
                  </span>
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#064E3B]/12 text-center text-xs text-[#476D60]">
                <span>
                  {isTa ? 'புதிய உறுப்பினரா? நிர்வாகியை தொடர்பு கொள்ளவும்:' : 'Need your User ID? Contact our office:'}{' '}
                </span>
                <a href="tel:9789825684" className="text-[#064E3B] font-bold hover:underline tabular-nums">
                  9789825684
                </a>
              </div>
            </div>
          ) : (
            /* Authenticated Member Dashboard */
            <div className="space-y-6">

              {/* Featured Deep Emerald Forest Member Passbook Card */}
              <div className="fintech-card-forest text-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                  <RupeeEmblem3D size="md" tone="light" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-xl font-black text-white">{profile?.full_name}</h4>
                      <span className="text-[11px] font-bold text-[#65E83A] font-mono tabular-nums">
                        · {profile?.user_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#65E83A] text-[#052E22] uppercase">
                        {profile?.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-x-3 gap-y-1 text-xs text-[#D1FAE5] mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#65E83A] shrink-0" />
                        <span>
                          {profile?.address}, {profile?.city}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-[#65E83A] shrink-0" />
                        +91 {profile?.mobile_number}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                  <button
                    onClick={fetchMemberData}
                    className="p-2 rounded-lg border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
                    title="Refresh status"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                  </button>
                  <div className="px-3 sm:px-4 py-2 rounded-xl bg-[#052E22]/90 border border-[#65E83A]/40 text-left sm:text-right flex-1 sm:flex-initial">
                    <span className="text-[10px] text-[#A7F3D0] uppercase tracking-wider block font-bold">
                      {isTa ? 'குழு & திட்டம்' : 'Assigned Group & Scheme'}
                    </span>
                    <span className="text-xs font-bold text-white block">
                      {profile?.group_name || 'Active Chit Group'}
                    </span>
                    <span className="text-[11px] font-semibold text-[#65E83A] block tabular-nums">
                      {profile?.scheme_name || 'Chit Scheme'}
                      {profile?.chit_value ? ` · ₹${Number(profile.chit_value).toLocaleString('en-IN')}` : ''}
                      {` · ${durationMonths} ${isTa ? 'மாதங்கள்' : 'Months'}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <HorizontalScrollArea
                className="border-b border-[#064E3B]/15"
                innerClassName="flex items-center gap-1.5 sm:gap-2 pb-2"
                ariaLabel="Member Portal Navigation Tabs"
              >
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'bg-[#064E3B] text-white shadow-xs'
                      : 'text-[#264D40] hover:bg-[#EAF7F0] hover:text-[#052E22]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isTa ? 'தவணை & கண்ணோட்டம்' : 'Monthly Payment & Overview'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'payments'
                      ? 'bg-[#064E3B] text-white shadow-xs'
                      : 'text-[#264D40] hover:bg-[#EAF7F0] hover:text-[#052E22]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {isTa ? 'தவணை வரலாறு' : 'Payment History'} ({payments.length})
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'announcements'
                      ? 'bg-[#064E3B] text-white shadow-xs'
                      : 'text-[#264D40] hover:bg-[#EAF7F0] hover:text-[#052E22]'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>
                    {isTa ? 'அறிவிப்புகள்' : 'Announcements'} ({announcements.length})
                  </span>
                </button>
              </HorizontalScrollArea>

              {activeTab === 'overview' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* CURRENT MONTH PROMINENT PAYMENT STATUS CARD */}
                  <div
                    className={`p-4 sm:p-6 rounded-2xl border transition-all shadow-xs ${
                      isCurrentPaid
                        ? 'fintech-card-mint'
                        : 'bg-white border-rose-400'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[11px] font-bold tracking-wider uppercase ${isCurrentPaid ? 'text-[#064E3B]' : 'text-[#476D60]'}`}>
                            {isTa ? 'நடப்பு மாத தவணை' : 'CURRENT MONTH INSTALMENT'}
                          </span>
                          <span className="text-[11px] font-bold text-[#052E22]">
                            · {currentMonthPayment?.month_name || 'Active Month'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-2xl sm:text-4xl font-black text-[#052E22] font-mono tabular-nums">
                            ₹{(currentMonthPayment?.payment_amount || 0).toLocaleString('en-IN')}
                          </span>
                          <span className={`text-xs ${isCurrentPaid ? 'text-[#264D40]' : 'text-[#476D60]'}`}>
                            {isTa ? '(ஏல தள்ளுபடிக்கு பின் நிர்ணயிக்கப்பட்டது)' : '(Variable monthly auction rate)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isCurrentPaid ? (
                          <div className="px-5 py-3 rounded-xl bg-[#064E3B] text-[#65E83A] flex items-center gap-2.5 shadow-md">
                            <CheckCircle2 className="w-6 h-6 text-[#65E83A]" />
                            <div>
                              <span className="text-sm font-black tracking-wide block">
                                {isTa ? 'செலுத்தப்பட்டது (PAID)' : 'PAID – VERIFIED'}
                              </span>
                              <span className="text-[11px] text-[#D1FAE5] font-semibold block">
                                {currentMonthPayment?.payment_date
                                  ? `${isTa ? 'ரசீது' : 'Paid on'}: ${new Date(
                                      currentMonthPayment.payment_date
                                    ).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}`
                                  : 'Cash received & verified by Admin'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="px-5 py-3 rounded-xl bg-rose-700 text-white flex items-center gap-2.5 shadow-md">
                            <Clock className="w-6 h-6 text-white" />
                            <div>
                              <span className="text-sm font-black tracking-wide block">
                                {isTa ? 'செலுத்தப்படவில்லை (UNPAID)' : 'UNPAID – DUE ON 10th'}
                              </span>
                              <span className="text-[11px] text-rose-100 block">
                                {isTa ? 'அலுவலகத்தில் ரொக்கமாக செலுத்தவும்' : 'Pay direct cash at office counter'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Physical Cash Workflow Notice */}
                    <div className="mt-4 pt-4 border-t border-[#064E3B]/15 flex items-start gap-2.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#052E22]">
                          {isTa ? 'நேரடி ரொக்க செலுத்தல் நடைமுறை:' : 'Physical Cash Payment Workflow:'}
                        </span>
                        <p className={`mt-0.5 leading-relaxed ${isCurrentPaid ? 'text-[#264D40]' : 'text-[#264D40]'}`}>
                          {isTa
                            ? 'தவணை தொகையை எங்கள் விள்ளுக்குறி அலுவலகத்தில் நேரடியாக ரொக்கமாக செலுத்த வேண்டும். நிர்வாகி தொகையை பெற்று கணினியில் சரிபார்த்தவுடன் உங்கள் நிலை உடனே சரிபார்க்கப்பட்டதாக மாறும்.'
                            : 'All monthly instalments are accepted strictly in physical cash at our registered office counter in Madathattuvillai, Villukuri. No online gateway. Once verified by the Admin in cash, your payment status will immediately update as verified and an official receipt is issued.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FintechCard3D accent="mint" className="p-5 rounded-2xl fintech-card-mint">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-[#064E3B]">
                          {isTa ? 'மொத்தம் செலுத்தியது' : 'Total Amount Paid'}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-[#064E3B]" />
                      </div>
                      <div className="text-2xl font-black text-[#052E22] font-mono tabular-nums">
                        ₹{totalPaid.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-[#264D40] font-medium mt-1 block">
                        {totalPaidCount} {isTa ? 'தவணைகள் நிறைவு' : 'Instalments cleared'}
                      </span>
                    </FintechCard3D>

                    <FintechCard3D accent="neutral" className="p-5 rounded-2xl fintech-card border-rose-300">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-rose-800">
                          {isTa ? 'நிலுவை தொகை' : 'Total Outstanding'}
                        </span>
                        <Clock className="w-4 h-4 text-rose-700" />
                      </div>
                      <div className="text-2xl font-black text-rose-700 font-mono tabular-nums">
                        ₹{totalUnpaid.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-[#476D60] mt-1 block">
                        {totalUnpaidCount} {isTa ? 'தவணைகள் நிலுவை' : 'Pending cash payment'}
                      </span>
                    </FintechCard3D>

                    <FintechCard3D accent="emerald" className="p-5 rounded-2xl fintech-card">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-[#264D40]">
                          {isTa ? 'சீட்டு திட்ட கால அளவு' : 'Chit Scheme Duration'}
                        </span>
                        <Calendar className="w-4 h-4 text-[#064E3B]" />
                      </div>
                      <div className="text-2xl font-black text-[#052E22] font-mono tabular-nums">
                        {totalPaidCount} / {durationMonths}
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#DCFCE7] overflow-hidden mt-2 mb-1">
                        <div
                          className="h-full bg-gradient-to-r from-[#064E3B] to-[#65E83A]"
                          style={{ width: `${progressRatio}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-[#476D60] block">
                        {durationMonths - totalPaidCount > 0
                          ? `${durationMonths - totalPaidCount} ${isTa ? 'மாதங்கள் மீதம்' : 'months remaining'}`
                          : 'Chit Completed'}
                      </span>
                    </FintechCard3D>
                  </div>

                  {/* Recent 5 Payments Preview Table */}
                  <div className="fintech-card rounded-2xl overflow-hidden">
                    <div className="p-3.5 sm:p-4 border-b border-[#064E3B]/12 bg-[#EAF7F0] flex flex-wrap items-center justify-between gap-2">
                      <h5 className="font-bold text-xs text-[#052E22] uppercase tracking-wider">
                        {isTa ? 'சமீபத்திய தவணை வரலாறு' : 'Recent Payment Records'}
                      </h5>
                      <button
                        onClick={() => setActiveTab('payments')}
                        className="text-xs font-bold text-[#064E3B] hover:underline cursor-pointer"
                      >
                        {isTa ? 'அனைத்தையும் காண்க →' : 'View Full History →'}
                      </button>
                    </div>

                    <HorizontalScrollArea ariaLabel="Recent Payment Records">
                      <table className="w-full min-w-[600px] text-left text-xs border-collapse">
                        <thead className="bg-[#EAF7F0] text-[#052E22] font-bold border-b border-[#064E3B]/15">
                          <tr>
                            <th className="py-2.5 px-4">{isTa ? 'மாதம்' : 'Month / Cycle'}</th>
                            <th className="py-2.5 px-4">{isTa ? 'தொகை (₹)' : 'Instalment (₹)'}</th>
                            <th className="py-2.5 px-4">{isTa ? 'நிலை' : 'Status'}</th>
                            <th className="py-2.5 px-4">{isTa ? 'செலுத்திய தேதி' : 'Payment Date'}</th>
                            <th className="py-2.5 px-4">{isTa ? 'ரசீது எண்' : 'Receipt #'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#064E3B]/10 bg-white">
                          {payments.slice(0, 5).map((pay) => (
                            <tr key={pay.id} className="hover:bg-[#F4FBF7]">
                              <td className="py-2.5 px-4 font-semibold text-[#052E22]">
                                {pay.month_name}
                              </td>
                              <td className="py-2.5 px-4 font-mono font-bold text-[#052E22] tabular-nums">
                                ₹{pay.payment_amount.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-4">
                                {pay.payment_status === 'PAID' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                    <span>PAID</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                                    <Clock className="w-3 h-3 text-rose-700" />
                                    <span>UNPAID</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-[#264D40]">
                                {pay.payment_date
                                  ? new Date(pay.payment_date).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : <span className="text-[#5C8274] italic">Pending Cash Receipt</span>}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-[#052E22] font-semibold tabular-nums">
                                {pay.receipt_number || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </HorizontalScrollArea>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="fintech-card rounded-2xl overflow-hidden">
                  <div className="p-3.5 sm:p-4 border-b border-[#064E3B]/12 bg-[#EAF7F0] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-sm text-[#052E22]">
                        {isTa
                          ? `முழுமையான ${durationMonths}-மாத தவணை வரலாறு`
                          : `Complete ${durationMonths}-Month Payment History`}
                      </h5>
                      <p className="text-xs text-[#476D60]">
                        {isTa
                          ? 'உங்கள் கணக்கின் அனைத்து மாத தவணைகள் மற்றும் ரொக்க ரசீது விவரங்கள்.'
                          : 'Detailed record of all monthly instalments and cash receipts for your account.'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-[#DCFCE7] border border-[#064E3B]/20 text-[#052E22] text-xs font-bold shrink-0 tabular-nums">
                      {payments.length} {isTa ? 'பதிவுகள்' : 'Records'}
                    </span>
                  </div>

                  <HorizontalScrollArea ariaLabel="Complete Payment History">
                    <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                      <thead className="bg-[#EAF7F0] text-[#052E22] font-bold border-b border-[#064E3B]/15">
                        <tr>
                          <th className="py-3 px-4">{isTa ? 'மாதம்' : 'Month / Cycle'}</th>
                          <th className="py-3 px-4">{isTa ? 'தவணை தொகை' : 'Instalment'}</th>
                          <th className="py-3 px-4">{isTa ? 'நிலை' : 'Status'}</th>
                          <th className="py-3 px-4">{isTa ? 'ரொக்கம் செலுத்திய தேதி' : 'Cash Payment Date'}</th>
                          <th className="py-3 px-4">{isTa ? 'ரசீது எண்' : 'Receipt Number'}</th>
                          <th className="py-3 px-4">{isTa ? 'சரிபார்த்தவர்' : 'Verified By'}</th>
                          <th className="py-3 px-4">{isTa ? 'குறிப்பு' : 'Notes'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#064E3B]/10 bg-white">
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-[#476D60]">
                              {isTa ? 'தவணை பதிவுகள் எதுவும் கிடைக்கவில்லை.' : 'No payment records available.'}
                            </td>
                          </tr>
                        ) : (
                          payments.map((pay) => (
                            <tr key={pay.id} className="hover:bg-[#F4FBF7]">
                              <td className="py-3 px-4 font-bold text-[#052E22]">
                                {pay.month_name}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-[#052E22] tabular-nums">
                                ₹{pay.payment_amount.toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-4">
                                {pay.payment_status === 'PAID' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                    <span>PAID</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                                    <Clock className="w-3 h-3 text-rose-700" />
                                    <span>UNPAID</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-[#264D40] font-mono tabular-nums">
                                {pay.payment_date
                                  ? new Date(pay.payment_date).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : <span className="text-[#5C8274] italic font-sans">{isTa ? 'நிலுவையில்' : 'Pending Cash'}</span>}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-[#052E22] tabular-nums">
                                {pay.receipt_number || '—'}
                              </td>
                              <td className="py-3 px-4 text-[#264D40] text-[11px]">
                                {pay.updated_by}
                              </td>
                              <td className="py-3 px-4 text-[#476D60] text-[11px] max-w-xs truncate">
                                {pay.notes || '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </HorizontalScrollArea>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl fintech-card">
                    <h5 className="font-bold text-sm text-[#052E22]">
                      {isTa ? 'நிறுவன செய்திகள் & அதிகாரப்பூர்வ அறிவிப்புகள்' : 'Company News & Official Announcements'}
                    </h5>
                    <p className="text-xs text-[#476D60] mt-0.5">
                      {isTa
                        ? 'குலுக்கல் தேதிகள், போனஸ் விதிமுறைகள் மற்றும் முக்கிய தகவல்கள்.'
                        : 'Auction dates, completion bonus updates, and official company notices.'}
                    </p>
                  </div>

                  {announcements.length === 0 ? (
                    <div className="p-12 text-center fintech-card rounded-2xl text-[#476D60] text-xs">
                      {isTa ? 'தற்போது புதிய அறிவிப்புகள் எதுவும் இல்லை.' : 'No announcements published at this time.'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map((ann) => {
                        const audienceLabel =
                          ann.target_type === 'group' ||
                          (ann.target_group_id && ann.target_group_id !== 'all')
                            ? `${isTa ? 'குழு' : 'Group'}: ${ann.target_group_name || ann.target_group_id}`
                            : ann.target_type === 'scheme'
                            ? `${isTa ? 'திட்டம்' : 'Scheme'}: ${ann.target_scheme_name || ann.target_scheme_id}`
                            : isTa
                            ? 'அனைத்து உறுப்பினர்கள்'
                            : 'All Members';
                        return (
                          <div key={ann.id} className="p-5 rounded-2xl fintech-card space-y-2">
                            <div className="flex items-center justify-between gap-3 flex-wrap text-[11px]">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold uppercase text-[#052E22] bg-[#DCFCE7] border border-[#22C55E]/30 px-2 py-0.5 rounded">{ann.category}</span>
                                <span className="text-[#5C8274]">·</span>
                                <span className="font-semibold text-[#264D40]">{audienceLabel}</span>
                                {ann.is_auto_generated && (
                                  <>
                                    <span className="text-[#5C8274]">·</span>
                                    <span className="font-bold text-[#064E3B]">
                                      {isTa ? 'தானியங்கி அறிவிப்பு' : 'System Update'}
                                    </span>
                                  </>
                                )}
                              </div>
                              <span className="text-[11px] text-[#476D60] font-mono tabular-nums">
                                {new Date(ann.publish_date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <h6 className="text-sm font-bold text-[#052E22]">{ann.title}</h6>
                            <p className="text-xs text-[#264D40] leading-relaxed">{ann.description}</p>
                            <div className="pt-2 border-t border-[#064E3B]/12 text-[10px] text-[#476D60] flex items-center justify-between">
                              <span>Published by: {ann.created_by}</span>
                              <span className="italic">Read-only notice</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
