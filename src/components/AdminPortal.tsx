import React, { useState, useEffect } from 'react';
import { CustomerEnquiry, Language, SystemStatus } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  ShieldCheck, Lock, LogOut, Search, Filter, Download, 
  Eye, RefreshCw, CheckCircle2, Clock, CheckCircle, Database, Mail, X
} from 'lucide-react';

interface AdminPortalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ lang, isOpen, onClose }) => {
  const t = TRANSLATIONS[lang];

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterScheme, setFilterScheme] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const [selectedEnquiry, setSelectedEnquiry] = useState<CustomerEnquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Check saved session
  useEffect(() => {
    const savedToken = localStorage.getItem('teamstars_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch status & enquiries when authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchSystemStatus();
      fetchEnquiries();
    }
  }, [isAuthenticated, isOpen]);

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (e) {
      console.warn('Status fetch failed:', e);
    }
  };

  const fetchEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const res = await fetch('/api/admin/enquiries', {
        headers: {
          Authorization: `Bearer ${adminToken || localStorage.getItem('teamstars_admin_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (e) {
      console.error('Fetch enquiries error:', e);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setAdminToken(data.token);
        localStorage.setItem('teamstars_admin_token', data.token);
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setLoginError(data.error || 'Invalid administrator password.');
      }
    } catch {
      setLoginError('Could not connect to server.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teamstars_admin_token');
    setAdminToken('');
    setIsAuthenticated(false);
    setEnquiries([]);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, enquiry_status: newStatus as any } : item))
        );
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry((prev) => (prev ? { ...prev, enquiry_status: newStatus as any } : null));
        }
      }
    } catch (e) {
      console.error('Update status error:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCsv = () => {
    if (enquiries.length === 0) return;

    const headers = ['ID', 'Name', 'Mobile', 'Email', 'City', 'Preferred Scheme', 'Language', 'Status', 'Submitted At', 'Message'];
    const rows = filteredEnquiries.map((enq) => [
      enq.id || '',
      `"${enq.full_name.replace(/"/g, '""')}"`,
      enq.mobile_number,
      enq.email,
      `"${enq.city.replace(/"/g, '""')}"`,
      `"${enq.preferred_scheme}"`,
      enq.preferred_language,
      enq.enquiry_status || 'New',
      enq.created_at || '',
      `"${(enq.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `team_stars_enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enq.mobile_number.includes(searchQuery) ||
      enq.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enq.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScheme =
      filterScheme === 'all' || enq.preferred_scheme.toLowerCase().includes(filterScheme.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || enq.enquiry_status === filterStatus;

    return matchesSearch && matchesScheme && matchesStatus;
  });

  const countByStatus = {
    total: enquiries.length,
    new: enquiries.filter((e) => e.enquiry_status === 'New').length,
    contacted: enquiries.filter((e) => e.enquiry_status === 'Contacted').length,
    inProgress: enquiries.filter((e) => e.enquiry_status === 'In Progress').length,
    completed: enquiries.filter((e) => e.enquiry_status === 'Completed').length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#075C32] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#C9A64A]" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                {t.admin.title}
              </h3>
              <span className="text-[11px] text-white/70 block">
                TEAM STARS CHITS PRIVATE LIMITED · CIN: U64990TN2025PTC181717
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.admin.logout}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {!isAuthenticated ? (
            /* Admin Sign In Form */
            <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#E5F2E8] text-[#075C32] flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-[#12834B]" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">{t.admin.loginTitle}</h4>
                <p className="text-xs text-slate-500 mt-1">{t.admin.loginSubtitle}</p>
              </div>

              {loginError && (
                <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.admin.passwordLabel}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Default: teamstars2025"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#075C32]/20 focus:border-[#075C32]"
                    autoFocus
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Configured via ADMIN_PASSWORD environment variable.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loggingIn || !password}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#075C32] hover:bg-[#12834B] rounded-lg shadow-xs transition-all disabled:opacity-60"
                >
                  {loggingIn ? t.admin.loggingIn : t.admin.signInButton}
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Management Dashboard */
            <div className="space-y-6">
              
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">{t.admin.totalEnquiries}</span>
                  <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">{countByStatus.total}</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-emerald-700 block">{t.admin.statusNew}</span>
                  <span className="text-2xl font-black text-[#075C32] font-mono tabular-nums">{countByStatus.new}</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-blue-700 block">{t.admin.statusContacted}</span>
                  <span className="text-2xl font-black text-blue-700 font-mono tabular-nums">{countByStatus.contacted}</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-amber-700 block">{t.admin.statusInProgress}</span>
                  <span className="text-2xl font-black text-amber-700 font-mono tabular-nums">{countByStatus.inProgress}</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-semibold text-slate-600 block">{t.admin.statusCompleted}</span>
                  <span className="text-2xl font-black text-slate-600 font-mono tabular-nums">{countByStatus.completed}</span>
                </div>
              </div>

              {/* System & Integrations Status Banner */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#12834B]" />
                    <span className="font-semibold text-slate-700">{t.admin.supabaseStatus}:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      systemStatus?.supabaseConfigured 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {systemStatus?.supabaseConfigured ? t.admin.connected : t.admin.fallbackMode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#12834B]" />
                    <span className="font-semibold text-slate-700">{t.admin.resendStatus}:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      systemStatus?.resendConfigured 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {systemStatus?.resendConfigured ? t.admin.connected : t.admin.readyForApiKey}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-500">
                  <span className="text-[11px]">Forwarding recipient:</span>
                  <span className="font-mono font-bold text-slate-700">ajesh321km2@gmail.com</span>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.admin.searchPlaceholder}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#075C32]/20"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={filterScheme}
                    onChange={(e) => setFilterScheme(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                  >
                    <option value="all">{t.admin.allSchemes}</option>
                    <option value="1,00,000">₹1,00,000 Scheme</option>
                    <option value="2,00,000">₹2,00,000 Scheme</option>
                    <option value="5,00,000">₹5,00,000 Scheme</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                  >
                    <option value="all">{t.admin.allStatuses}</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    onClick={fetchEnquiries}
                    className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-slate-900 transition-colors"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingEnquiries ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="px-3 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.admin.exportCsv}</span>
                  </button>
                </div>
              </div>

              {/* Table of Enquiries */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">{t.admin.customerName}</th>
                        <th className="py-3 px-4">{t.admin.contact}</th>
                        <th className="py-3 px-4">{t.admin.schemeRequested}</th>
                        <th className="py-3 px-4">{t.admin.status}</th>
                        <th className="py-3 px-4">{t.admin.submittedOn}</th>
                        <th className="py-3 px-4 text-right">{t.admin.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEnquiries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            {t.admin.noEnquiriesFound}
                          </td>
                        </tr>
                      ) : (
                        filteredEnquiries.map((enq) => (
                          <tr key={enq.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{enq.full_name}</span>
                              <span className="text-[11px] text-slate-500">{enq.city}</span>
                            </td>
                            <td className="py-3 px-4">
                              <a href={`tel:${enq.mobile_number}`} className="font-mono text-[#075C32] font-semibold hover:underline block">
                                +91 {enq.mobile_number}
                              </a>
                              <span className="text-[11px] text-slate-500 truncate block max-w-xs">{enq.email}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800">{enq.preferred_scheme}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Lang: {enq.preferred_language?.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={enq.enquiry_status || 'New'}
                                onChange={(e) => handleStatusChange(enq.id!, e.target.value)}
                                disabled={updatingId === enq.id}
                                className={`px-2 py-1 rounded-md text-[11px] font-bold border ${
                                  enq.enquiry_status === 'New'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : enq.enquiry_status === 'Contacted'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : enq.enquiry_status === 'In Progress'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-800 border-slate-200'
                                }`}
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                              {enq.created_at ? new Date(enq.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }) : 'Recent'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedEnquiry(enq)}
                                className="px-2.5 py-1 text-xs font-semibold text-[#075C32] hover:bg-[#E5F2E8] rounded-md transition-colors"
                              >
                                {t.admin.viewDetails}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Customer Details Modal */}
        {selectedEnquiry && (
          <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">{t.admin.detailsModalTitle}</h4>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b">
                  <span className="font-semibold text-slate-500">Name:</span>
                  <span className="font-bold text-slate-900">{selectedEnquiry.full_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-semibold text-slate-500">Mobile:</span>
                  <a href={`tel:${selectedEnquiry.mobile_number}`} className="font-mono font-bold text-[#075C32]">
                    +91 {selectedEnquiry.mobile_number}
                  </a>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-semibold text-slate-500">Email:</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="text-slate-900">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-semibold text-slate-500">{t.admin.cityDistrict}:</span>
                  <span>{selectedEnquiry.city}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-semibold text-slate-500">Preferred Scheme:</span>
                  <span className="font-bold text-[#075C32]">{selectedEnquiry.preferred_scheme}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-semibold text-slate-500">Language:</span>
                  <span>{selectedEnquiry.preferred_language === 'ta' ? 'Tamil' : 'English'}</span>
                </div>
                <div className="py-1">
                  <span className="font-semibold text-slate-500 block mb-1">{t.admin.customerMessage}:</span>
                  <p className="p-3 rounded-lg bg-slate-50 border text-slate-800 leading-relaxed font-normal">
                    {selectedEnquiry.message || 'No additional message provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  {t.admin.closeModal}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
