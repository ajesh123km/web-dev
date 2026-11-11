import React, { useState, useEffect } from 'react';
import { CustomerEnquiry, Language, SystemStatus, ChitUser, ChitGroup, PaymentRecord, Announcement, AdminOverviewStats } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  ShieldCheck, Lock, LogOut, Search, Filter, Download, 
  Eye, RefreshCw, CheckCircle2, Clock, CheckCircle, Database, Mail, X,
  Users, Layers, CreditCard, Bell, BarChart3, Plus, Edit, Trash2, Key,
  Check, AlertCircle, Phone, Calendar, ArrowRight, UserCheck, UserX, AlertTriangle,
  FileText, UserPlus
} from 'lucide-react';

interface AdminPortalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'overview' | 'users' | 'groups' | 'payments' | 'history' | 'announcements' | 'reports' | 'enquiries';

export const AdminPortal: React.FC<AdminPortalProps> = ({ lang, isOpen, onClose }) => {
  const t = TRANSLATIONS[lang];
  const isTa = lang === 'ta';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Overview Stats
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [loadingOverview, setLoadingOverview] = useState<boolean>(false);

  // Users Management
  const [users, setUsers] = useState<ChitUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userGroupFilter, setUserGroupFilter] = useState<string>('all');
  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [showEditUserModal, setShowEditUserModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<ChitUser | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    user_id: '',
    full_name: '',
    mobile_number: '',
    address: '',
    city: 'Villukuri',
    email: '',
    group_id: '',
    password: 'user123'
  });
  const [editUserForm, setEditUserForm] = useState({
    id: '',
    user_id: '',
    full_name: '',
    mobile_number: '',
    address: '',
    city: '',
    email: '',
    group_id: ''
  });
  const [newPasswordValue, setNewPasswordValue] = useState<string>('user123');
  const [userActionMsg, setUserActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Groups Management
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState<boolean>(false);
  const [showGroupMembersModal, setShowGroupMembersModal] = useState<boolean>(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<ChitGroup | null>(null);
  const [groupMembersList, setGroupMembersList] = useState<ChitUser[]>([]);
  const [newGroupForm, setNewGroupForm] = useState({
    id: '',
    name: '',
    scheme_name: '₹2,00,000 Scheme',
    chit_value: 200000,
    duration_months: 20,
    start_date: new Date().toISOString().split('T')[0]
  });
  const [groupActionMsg, setGroupActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Monthly Payments Management
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState<boolean>(false);
  const [paymentGroupFilter, setPaymentGroupFilter] = useState<string>('all');
  const [paymentMonthFilter, setPaymentMonthFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentSearch, setPaymentSearch] = useState<string>('');
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [paymentActionMsg, setPaymentActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Configure Monthly Payment Amount for Group
  const [configGroup, setConfigGroup] = useState<string>('');
  const [configMonth, setConfigMonth] = useState<number>(11);
  const [configYear, setConfigYear] = useState<number>(2026);
  const [configAmount, setConfigAmount] = useState<string>('9400');
  const [configMonthLabel, setConfigMonthLabel] = useState<string>('Month 11 - Nov 2026');

  // Announcements Management
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(false);
  const [showCreateAnnModal, setShowCreateAnnModal] = useState<boolean>(false);
  const [newAnnForm, setNewAnnForm] = useState({
    title: '',
    description: '',
    category: 'General' as const,
    target_group_id: 'all',
    publish_date: new Date().toISOString().split('T')[0],
    is_published: true
  });
  const [annActionMsg, setAnnActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reports
  const [reportsData, setReportsData] = useState<any | null>(null);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);

  // Enquiries (Existing preserved functionality)
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState<boolean>(false);
  const [enquirySearchQuery, setEnquirySearchQuery] = useState<string>('');
  const [filterScheme, setFilterScheme] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<CustomerEnquiry | null>(null);
  const [updatingEnquiryId, setUpdatingEnquiryId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Check saved session
  useEffect(() => {
    const savedToken = localStorage.getItem('teamstars_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch initial data when authenticated and opened
  useEffect(() => {
    if (isAuthenticated && isOpen && adminToken) {
      fetchSystemStatus();
      fetchOverview();
      fetchUsers();
      fetchGroups();
      fetchPayments();
      fetchAnnouncements();
      fetchReports();
      fetchEnquiries();
    }
  }, [isAuthenticated, isOpen, adminToken]);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken || localStorage.getItem('teamstars_admin_token')}`
  };

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) setSystemStatus(await res.json());
    } catch (e) {
      console.warn('Status fetch failed:', e);
    }
  };

  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/admin/overview', { headers: authHeaders });
      if (res.ok) setOverview(await res.json());
    } catch (e) {
      console.error('Fetch overview error:', e);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error('Fetch users error:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await fetch('/api/admin/groups', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        const grps = data.groups || [];
        setGroups(grps);
        if (grps.length > 0 && !configGroup) {
          setConfigGroup(grps[0].id);
        }
      }
    } catch (e) {
      console.error('Fetch groups error:', e);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      let url = '/api/admin/payments?';
      if (paymentGroupFilter !== 'all') url += `group_id=${paymentGroupFilter}&`;
      if (paymentMonthFilter !== 'all') url += `month=${paymentMonthFilter}&`;
      if (paymentStatusFilter !== 'all') url += `status=${paymentStatusFilter}&`;
      if (paymentSearch) url += `search=${encodeURIComponent(paymentSearch)}&`;

      const res = await fetch(url, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (e) {
      console.error('Fetch payments error:', e);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await fetch('/api/admin/announcements', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (e) {
      console.error('Fetch announcements error:', e);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('/api/admin/reports', { headers: authHeaders });
      if (res.ok) setReportsData(await res.json());
    } catch (e) {
      console.error('Fetch reports error:', e);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const res = await fetch('/api/admin/enquiries', { headers: authHeaders });
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
  };

  // User Actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newUserForm)
      });
      const data = await res.json();

      if (res.ok) {
        setUserActionMsg({ type: 'success', text: data.message });
        setShowCreateUserModal(false);
        setNewUserForm({
          user_id: '',
          full_name: '',
          mobile_number: '',
          address: '',
          city: 'Villukuri',
          email: '',
          group_id: groups[0]?.id || '',
          password: 'user123'
        });
        fetchUsers();
        fetchOverview();
      } else {
        setUserActionMsg({ type: 'error', text: data.error || 'Failed to create user.' });
      }
    } catch {
      setUserActionMsg({ type: 'error', text: 'Error connecting to server.' });
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${editUserForm.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(editUserForm)
      });
      const data = await res.json();

      if (res.ok) {
        setUserActionMsg({ type: 'success', text: data.message });
        setShowEditUserModal(false);
        fetchUsers();
      } else {
        setUserActionMsg({ type: 'error', text: data.error || 'Failed to update user.' });
      }
    } catch {
      setUserActionMsg({ type: 'error', text: 'Error updating user.' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setUserActionMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.user_id}/password`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ new_password: newPasswordValue })
      });
      const data = await res.json();

      if (res.ok) {
        setUserActionMsg({ type: 'success', text: data.message });
        setShowPasswordModal(false);
        setNewPasswordValue('user123');
      } else {
        setUserActionMsg({ type: 'error', text: data.error || 'Failed to reset password.' });
      }
    } catch {
      setUserActionMsg({ type: 'error', text: 'Error resetting password.' });
    }
  };

  const handleToggleUserStatus = async (user: ChitUser) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${user.user_id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error('Toggle status error:', e);
    }
  };

  const handleDeleteUser = async (user: ChitUser) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.full_name} (${user.user_id})?`)) return;
    setUserActionMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${user.user_id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();

      if (res.ok) {
        setUserActionMsg({ type: 'success', text: data.message });
        fetchUsers();
        fetchOverview();
      } else {
        setUserActionMsg({ type: 'error', text: data.error });
      }
    } catch {
      setUserActionMsg({ type: 'error', text: 'Failed to delete user.' });
    }
  };

  // Group Actions
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupActionMsg(null);

    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newGroupForm)
      });
      const data = await res.json();

      if (res.ok) {
        setGroupActionMsg({ type: 'success', text: data.message });
        setShowCreateGroupModal(false);
        setNewGroupForm({
          id: '',
          name: '',
          scheme_name: '₹2,00,000 Scheme',
          chit_value: 200000,
          duration_months: 20,
          start_date: new Date().toISOString().split('T')[0]
        });
        fetchGroups();
        fetchOverview();
      } else {
        setGroupActionMsg({ type: 'error', text: data.error || 'Failed to create group.' });
      }
    } catch {
      setGroupActionMsg({ type: 'error', text: 'Error connecting to server.' });
    }
  };

  const handleViewGroupMembers = async (group: ChitGroup) => {
    setSelectedGroupForMembers(group);
    setShowGroupMembersModal(true);
    try {
      const res = await fetch(`/api/admin/groups/${group.id}/members`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setGroupMembersList(data.members || []);
      }
    } catch (e) {
      console.error('Fetch group members error:', e);
    }
  };

  // Monthly Payment Actions (Physical Cash Collection Workflow)
  const handleConfigureMonthlyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentActionMsg(null);

    try {
      const res = await fetch('/api/admin/payments/configure', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          group_id: configGroup,
          month: Number(configMonth),
          year: Number(configYear),
          month_label: configMonthLabel,
          payment_amount: Number(configAmount)
        })
      });
      const data = await res.json();

      if (res.ok) {
        setPaymentActionMsg({ type: 'success', text: data.message });
        fetchPayments();
        fetchOverview();
        fetchReports();
      } else {
        setPaymentActionMsg({ type: 'error', text: data.error || 'Failed to configure payment.' });
      }
    } catch {
      setPaymentActionMsg({ type: 'error', text: 'Error configuring monthly payment.' });
    }
  };

  const handleUpdatePaymentStatus = async (paymentId: string, currentStatus: string, userName: string) => {
    const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    setPaymentActionMsg(null);

    const receiptNum = newStatus === 'PAID' ? `REC-${Date.now().toString().slice(-6)}` : undefined;
    const notes = newStatus === 'PAID' ? 'Physical cash payment verified and received by Admin at Villukuri counter.' : 'Payment reversed to UNPAID.';

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          status: newStatus,
          receipt_number: receiptNum,
          notes
        })
      });
      const data = await res.json();

      if (res.ok) {
        setPaymentActionMsg({
          type: 'success',
          text: `Payment for ${userName} updated to ${newStatus}. ${newStatus === 'PAID' ? `Receipt issued: ${receiptNum}` : ''}`
        });
        fetchPayments();
        fetchOverview();
        fetchReports();
      } else {
        setPaymentActionMsg({ type: 'error', text: data.error || 'Failed to update payment status.' });
      }
    } catch {
      setPaymentActionMsg({ type: 'error', text: 'Failed to update payment status.' });
    }
  };

  const handleBatchStatusUpdate = async (status: 'PAID' | 'UNPAID') => {
    if (selectedPaymentIds.length === 0) return;
    setPaymentActionMsg(null);

    try {
      const res = await fetch('/api/admin/payments/batch-status', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          payment_ids: selectedPaymentIds,
          status
        })
      });
      const data = await res.json();

      if (res.ok) {
        setPaymentActionMsg({ type: 'success', text: data.message });
        setSelectedPaymentIds([]);
        fetchPayments();
        fetchOverview();
        fetchReports();
      } else {
        setPaymentActionMsg({ type: 'error', text: data.error });
      }
    } catch {
      setPaymentActionMsg({ type: 'error', text: 'Batch update error.' });
    }
  };

  // Announcement Actions
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnActionMsg(null);

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newAnnForm)
      });
      const data = await res.json();

      if (res.ok) {
        setAnnActionMsg({ type: 'success', text: data.message });
        setShowCreateAnnModal(false);
        setNewAnnForm({
          title: '',
          description: '',
          category: 'General',
          target_group_id: 'all',
          publish_date: new Date().toISOString().split('T')[0],
          is_published: true
        });
        fetchAnnouncements();
      } else {
        setAnnActionMsg({ type: 'error', text: data.error });
      }
    } catch {
      setAnnActionMsg({ type: 'error', text: 'Failed to create announcement.' });
    }
  };

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!window.confirm(`Delete announcement: "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) fetchAnnouncements();
    } catch (e) {
      console.error('Delete announcement error:', e);
    }
  };

  // Enquiries Actions (Preserved)
  const handleEnquiryStatusChange = async (id: string, newStatus: string) => {
    setUpdatingEnquiryId(id);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
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
      setUpdatingEnquiryId(null);
    }
  };

  const handleExportPaymentsCsv = () => {
    if (payments.length === 0) return;
    const headers = ['Payment ID', 'User ID', 'Customer Name', 'Group ID', 'Group Name', 'Month', 'Year', 'Amount (INR)', 'Status', 'Payment Date', 'Receipt Number', 'Updated By'];
    const rows = payments.map((p) => [
      p.id,
      p.user_id,
      `"${p.user_name.replace(/"/g, '""')}"`,
      p.group_id,
      `"${p.group_name.replace(/"/g, '""')}"`,
      p.payment_month,
      p.payment_year,
      p.payment_amount,
      p.payment_status,
      p.payment_date || 'UNPAID',
      p.receipt_number || '',
      `"${p.updated_by || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `team_stars_payments_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.full_name.toLowerCase().includes(enquirySearchQuery.toLowerCase()) ||
      enq.mobile_number.includes(enquirySearchQuery) ||
      enq.city.toLowerCase().includes(enquirySearchQuery.toLowerCase());
    const matchesScheme = filterScheme === 'all' || enq.preferred_scheme.toLowerCase().includes(filterScheme.toLowerCase());
    const matchesStatus = filterStatus === 'all' || enq.enquiry_status === filterStatus;
    return matchesSearch && matchesScheme && matchesStatus;
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.user_id.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.mobile_number.includes(userSearch) ||
      u.city.toLowerCase().includes(userSearch.toLowerCase());
    const matchesGroup = userGroupFilter === 'all' || u.group_id === userGroupFilter;
    return matchesSearch && matchesGroup;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#075C32] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#C9A64A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  {isTa ? 'நிர்வாக மேலாண்மை தளம்' : 'Chit Fund Administration Console'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A64A] text-slate-900">
                  ADMIN MASTER
                </span>
              </div>
              <span className="text-[11px] text-white/70 block">
                TEAM STARS CHITS PRIVATE LIMITED · CIN: U64990TN2025PTC181717 · Villukuri, Kanyakumari
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isTa ? 'வெளியேறு' : 'Log Out'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 bg-slate-50 flex flex-col">
          {!isAuthenticated ? (
            /* Admin Sign In Form */
            <div className="max-w-md mx-auto my-14 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#E5F2E8] text-[#075C32] flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7 text-[#12834B]" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  {t.admin.loginTitle}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Enter master administrator credentials to access Chit Management, Users, Groups, and Cash Records.
                </p>
              </div>

              {loginError && (
                <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
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
                    Configured securely via ADMIN_PASSWORD environment variable.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loggingIn || !password}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#075C32] hover:bg-[#12834B] rounded-lg shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loggingIn ? t.admin.loggingIn : t.admin.signInButton}
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Management Console */
            <div className="flex-1 flex flex-col">
              {/* Navigation Tabs Bar */}
              <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 shadow-2xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'overview' ? 'bg-[#075C32] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{isTa ? 'கண்ணோட்டம்' : 'Overview'}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('users'); fetchUsers(); }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'users' ? 'bg-[#075C32] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isTa ? 'பயனர் மேலாண்மை' : 'User Management'}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{users.length}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('groups'); fetchGroups(); }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'groups' ? 'bg-[#075C32] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isTa ? 'குழு மேலாண்மை' : 'Group Management'}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{groups.length}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('payments'); fetchPayments(); }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'payments' ? 'bg-[#075C32] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isTa ? 'மாத தவணை மேலாண்மை' : 'Monthly Payments'}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('history'); fetchPayments(); }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'history' ? 'bg-[#075C32] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isTa ? 'தவணை வரலாறு' : 'Payment History'}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('announcements'); fetchAnnouncements(); }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'announcements' ? 'bg-[#075C32] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isTa ? 'அறிவிப்புகள்' : 'Announcements'}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('reports'); fetchReports(); }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'reports' ? 'bg-[#075C32] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isTa ? 'அறிக்கைகள்' : 'Reports'}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('enquiries'); fetchEnquiries(); }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'enquiries' ? 'bg-[#075C32] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isTa ? 'வாடிக்கையாளர் விண்ணப்பங்கள்' : 'Enquiries'}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{enquiries.length}</span>
                </button>
              </div>

              {/* Main Tab Content */}
              <div className="p-4 sm:p-6 flex-1 space-y-6">

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Primary Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Members</span>
                        <span className="text-2xl font-black text-slate-900 font-mono">{overview?.totalUsers || users.length}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Unique User Accounts</span>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Chit Groups</span>
                        <span className="text-2xl font-black text-slate-900 font-mono">{overview?.totalGroups || groups.length}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Max 99 members/group</span>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Paid Receipts</span>
                        <span className="text-2xl font-black text-[#12834B] font-mono">{overview?.totalPaidCount || 0}</span>
                        <span className="text-[10px] text-emerald-600 block mt-1">Cash received</span>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Unpaid Records</span>
                        <span className="text-2xl font-black text-rose-600 font-mono">{overview?.totalUnpaidCount || 0}</span>
                        <span className="text-[10px] text-rose-600 block mt-1">Pending collection</span>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">Cash Collected</span>
                        <span className="text-xl font-black text-[#075C32] font-mono">₹{(overview?.totalCashCollected || 0).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-emerald-700 block mt-1">Direct physical cash</span>
                      </div>

                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block">Total Outstanding</span>
                        <span className="text-xl font-black text-rose-700 font-mono">₹{(overview?.totalOutstanding || 0).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-rose-700 block mt-1">Pending dues</span>
                      </div>
                    </div>

                    {/* Quick Administrative Shortcuts */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Quick Actions</h5>
                        <p className="text-xs text-slate-500">Fast shortcuts for common chit administration workflows</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => { setActiveTab('users'); setShowCreateUserModal(true); }}
                          className="px-3 py-1.5 rounded-lg bg-[#075C32] text-white text-xs font-bold hover:bg-[#12834B] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add New User</span>
                        </button>
                        <button
                          onClick={() => { setActiveTab('groups'); setShowCreateGroupModal(true); }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Create Group</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('payments')}
                          className="px-3 py-1.5 rounded-lg border border-[#075C32] text-[#075C32] text-xs font-bold hover:bg-[#E5F2E8] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Set Monthly Payment</span>
                        </button>
                        <button
                          onClick={() => { setActiveTab('announcements'); setShowCreateAnnModal(true); }}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>Publish Notice</span>
                        </button>
                      </div>
                    </div>

                    {/* Group-Wise Collection Summary */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                          Group-Wise Financial & Membership Breakdown
                        </h5>
                        <span className="text-xs text-slate-500">Enforcing maximum 99 members per group</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4">Group Name & ID</th>
                              <th className="py-3 px-4">Chit Scheme</th>
                              <th className="py-3 px-4">Enrolled Members</th>
                              <th className="py-3 px-4">Paid Instalments</th>
                              <th className="py-3 px-4">Pending Instalments</th>
                              <th className="py-3 px-4">Total Collected (₹)</th>
                              <th className="py-3 px-4">Total Pending (₹)</th>
                              <th className="py-3 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(overview?.groupsSummary || []).map((grp) => (
                              <tr key={grp.groupId} className="hover:bg-slate-50/70">
                                <td className="py-3 px-4">
                                  <span className="font-bold text-slate-900 block">{grp.groupName}</span>
                                  <span className="text-[10px] font-mono text-slate-500">{grp.groupId}</span>
                                </td>
                                <td className="py-3 px-4 font-semibold text-[#075C32]">
                                  {grp.schemeName}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-bold text-slate-900">{grp.memberCount} / 99</span>
                                  <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                                    <div 
                                      className="bg-[#075C32] h-full rounded-full" 
                                      style={{ width: `${Math.min(100, (grp.memberCount / 99) * 100)}%` }} 
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-bold text-emerald-700">{grp.paidCount}</td>
                                <td className="py-3 px-4 font-bold text-rose-700">{grp.unpaidCount}</td>
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{grp.totalCollected.toLocaleString('en-IN')}</td>
                                <td className="py-3 px-4 font-mono font-bold text-rose-600">₹{grp.totalPending.toLocaleString('en-IN')}</td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                    {grp.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Audit Trail Log Preview */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                          Recent Security & Financial Audit Logs
                        </h5>
                        <span className="text-[11px] text-slate-400">Maintained for regulatory compliance</span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto font-mono text-[11px]">
                        {(overview?.recentLogs || []).map((log) => (
                          <div key={log.id} className="py-2 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                {log.action}
                              </span>
                              <span className="text-slate-800">{log.details}</span>
                            </div>
                            <span className="text-slate-400 text-[10px] shrink-0">
                              {new Date(log.timestamp).toLocaleTimeString('en-IN')} · {new Date(log.timestamp).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: USER MANAGEMENT */}
                {activeTab === 'users' && (
                  <div className="space-y-4">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-1 max-w-md">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Search by User ID, Name, Mobile, City..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#075C32]/20"
                          />
                        </div>

                        <select
                          value={userGroupFilter}
                          onChange={(e) => setUserGroupFilter(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                        >
                          <option value="all">All Groups</option>
                          {groups.map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowCreateUserModal(true)}
                          className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create New User</span>
                        </button>
                      </div>
                    </div>

                    {userActionMsg && (
                      <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        userActionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {userActionMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{userActionMsg.text}</span>
                      </div>
                    )}

                    {/* Users Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4">User ID</th>
                              <th className="py-3 px-4">Full Name</th>
                              <th className="py-3 px-4">Mobile & Address</th>
                              <th className="py-3 px-4">Assigned Group</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Instalments Summary</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-500">
                                  No members match your search criteria.
                                </td>
                              </tr>
                            ) : (
                              filteredUsers.map((u) => (
                                <tr key={u.user_id} className="hover:bg-slate-50/70">
                                  <td className="py-3 px-4 font-mono font-bold text-[#075C32]">
                                    {u.user_id}
                                  </td>
                                  <td className="py-3 px-4 font-bold text-slate-900">
                                    {u.full_name}
                                  </td>
                                  <td className="py-3 px-4">
                                    <a href={`tel:${u.mobile_number}`} className="font-mono text-slate-700 font-semibold block hover:underline">
                                      +91 {u.mobile_number}
                                    </a>
                                    <span className="text-[11px] text-slate-500">{u.address}, {u.city}</span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-semibold text-slate-800 block">{u.group_name}</span>
                                    <span className="text-[10px] font-mono text-slate-400">{u.group_id}</span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <button
                                      onClick={() => handleToggleUserStatus(u)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                                        u.status === 'active'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                          : 'bg-slate-100 text-slate-600 border-slate-300'
                                      }`}
                                      title="Click to toggle status"
                                    >
                                      {u.status?.toUpperCase()}
                                    </button>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-emerald-700 font-bold">{u.paid_instalments || 0} Paid</span>
                                      <span className="text-slate-300">/</span>
                                      <span className="text-rose-600 font-bold">{u.unpaid_instalments || 0} Due</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => {
                                          setSelectedUser(u);
                                          setEditUserForm({
                                            id: u.id,
                                            user_id: u.user_id,
                                            full_name: u.full_name,
                                            mobile_number: u.mobile_number,
                                            address: u.address,
                                            city: u.city,
                                            email: u.email || '',
                                            group_id: u.group_id
                                          });
                                          setShowEditUserModal(true);
                                        }}
                                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                        title="Edit Member Details"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedUser(u);
                                          setShowPasswordModal(true);
                                        }}
                                        className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-colors"
                                        title="Reset Password"
                                      >
                                        <Key className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteUser(u)}
                                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors"
                                        title="Delete User"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
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

                {/* TAB 3: GROUP MANAGEMENT */}
                {activeTab === 'groups' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Chit Groups (Max 99 Members Per Group)</h4>
                        <p className="text-xs text-slate-500">Each chit fund cycle operates as an independent group containing up to 99 members.</p>
                      </div>

                      <button
                        onClick={() => setShowCreateGroupModal(true)}
                        className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create New Group</span>
                      </button>
                    </div>

                    {groupActionMsg && (
                      <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        groupActionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {groupActionMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{groupActionMsg.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {groups.map((grp) => (
                        <div key={grp.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#E5F2E8] text-[#075C32] border border-[#12834B]/30">
                                {grp.id}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 uppercase">
                                {grp.status}
                              </span>
                            </div>
                            <h5 className="font-bold text-base text-slate-900">{grp.name}</h5>
                            <span className="text-xs font-semibold text-[#075C32] block">{grp.scheme_name}</span>
                          </div>

                          <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Chit Value:</span>
                              <span className="font-mono font-bold text-slate-900">₹{grp.chit_value.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Duration:</span>
                              <span className="font-bold text-slate-800">{grp.duration_months} Months</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                              <span className="text-slate-500 font-bold">Capacity:</span>
                              <span className="font-bold text-slate-900">
                                {grp.member_count || 0} / 99 Members
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#075C32] h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, ((grp.member_count || 0) / 99) * 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <button
                              onClick={() => handleViewGroupMembers(grp)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5 text-[#075C32]" />
                              <span>View Members ({grp.member_count || 0})</span>
                            </button>
                            <span className="text-[10px] text-slate-400">
                              Started: {grp.start_date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: MONTHLY PAYMENT MANAGEMENT */}
                {activeTab === 'payments' && (
                  <div className="space-y-6">
                    {/* Variable Monthly Payment Configuration Form */}
                    <div className="p-5 rounded-2xl bg-white border border-[#075C32]/30 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#12834B]" />
                            <span>Set Variable Monthly Payment for Group</span>
                          </h4>
                          <p className="text-xs text-slate-500">
                            Chit fund instalments vary month-to-month based on auction dividend. Apply variable monthly payment to all members of a group (default status: UNPAID).
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-[#E5F2E8] text-[#075C32] text-xs font-bold shrink-0">
                          Cash Collection Counter
                        </span>
                      </div>

                      <form onSubmit={handleConfigureMonthlyPayment} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Group *</label>
                          <select
                            value={configGroup}
                            onChange={(e) => setConfigGroup(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                            required
                          >
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>{g.name} ({g.id})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Month Cycle (1-20) *</label>
                          <select
                            value={configMonth}
                            onChange={(e) => {
                              const m = Number(e.target.value);
                              setConfigMonth(m);
                              setConfigMonthLabel(`Month ${m} - 2026`);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                          >
                            {Array.from({ length: 20 }, (_, i) => i + 1).map((m) => (
                              <option key={m} value={m}>Month {m} (Cycle #{m})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Year *</label>
                          <input
                            type="number"
                            value={configYear}
                            onChange={(e) => setConfigYear(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Amount (₹) *</label>
                          <input
                            type="number"
                            value={configAmount}
                            onChange={(e) => setConfigAmount(e.target.value)}
                            placeholder="e.g. 9400"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono font-bold"
                            required
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="submit"
                            className="w-full py-2 px-3 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            Apply to Group
                          </button>
                        </div>
                      </form>
                    </div>

                    {paymentActionMsg && (
                      <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        paymentActionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {paymentActionMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{paymentActionMsg.text}</span>
                      </div>
                    )}

                    {/* Filter & Batch Actions Toolbar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={paymentSearch}
                            onChange={(e) => setPaymentSearch(e.target.value)}
                            placeholder="Search member, User ID, receipt..."
                            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                          />
                        </div>

                        <select
                          value={paymentGroupFilter}
                          onChange={(e) => setPaymentGroupFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        >
                          <option value="all">All Groups</option>
                          {groups.map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>

                        <select
                          value={paymentStatusFilter}
                          onChange={(e) => setPaymentStatusFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        >
                          <option value="all">All Statuses</option>
                          <option value="PAID">PAID (Cash Received)</option>
                          <option value="UNPAID">UNPAID (Pending)</option>
                        </select>

                        <button
                          onClick={fetchPayments}
                          className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600"
                          title="Refresh"
                        >
                          <RefreshCw className={`w-4 h-4 ${loadingPayments ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {/* Batch Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {selectedPaymentIds.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">{selectedPaymentIds.length} selected</span>
                            <button
                              onClick={() => handleBatchStatusUpdate('PAID')}
                              className="px-3 py-1.5 rounded-lg bg-[#12834B] hover:bg-[#075C32] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Paid (Cash)</span>
                            </button>
                            <button
                              onClick={() => handleBatchStatusUpdate('UNPAID')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Mark Unpaid</span>
                            </button>
                          </div>
                        )}

                        <button
                          onClick={handleExportPaymentsCsv}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Member Payment Table with Physical Cash Update Toggles */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-3 w-10">
                                <input
                                  type="checkbox"
                                  checked={selectedPaymentIds.length > 0 && selectedPaymentIds.length === payments.length}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedPaymentIds(payments.map(p => p.id));
                                    else setSelectedPaymentIds([]);
                                  }}
                                  className="rounded border-slate-300"
                                />
                              </th>
                              <th className="py-3 px-4">User ID & Name</th>
                              <th className="py-3 px-4">Group</th>
                              <th className="py-3 px-4">Month Cycle</th>
                              <th className="py-3 px-4">Instalment (₹)</th>
                              <th className="py-3 px-4">Payment Status</th>
                              <th className="py-3 px-4">Cash Received Date</th>
                              <th className="py-3 px-4">Receipt #</th>
                              <th className="py-3 px-4 text-right">Cash Desk Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {payments.length === 0 ? (
                              <tr>
                                <td colSpan={9} className="py-8 text-center text-slate-500">
                                  No payment records found. Use the configuration form above to set variable payments for a group.
                                </td>
                              </tr>
                            ) : (
                              payments.map((p) => {
                                const isSelected = selectedPaymentIds.includes(p.id);
                                return (
                                  <tr key={p.id} className={`hover:bg-slate-50/70 ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                                    <td className="py-3 px-3">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) setSelectedPaymentIds([...selectedPaymentIds, p.id]);
                                          else setSelectedPaymentIds(selectedPaymentIds.filter(id => id !== p.id));
                                        }}
                                        className="rounded border-slate-300"
                                      />
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="font-bold text-slate-900 block">{p.user_name}</span>
                                      <span className="font-mono text-[10px] text-[#075C32]">{p.user_id}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="font-semibold text-slate-800 block truncate max-w-xs">{p.group_name}</span>
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-slate-700">
                                      {p.month_name}
                                    </td>
                                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                      ₹{p.payment_amount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-3 px-4">
                                      {p.payment_status === 'PAID' ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                          <CheckCircle2 className="w-3 h-3 text-[#12834B]" />
                                          <span>PAID</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                          <Clock className="w-3 h-3 text-rose-600" />
                                          <span>UNPAID</span>
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                                      {p.payment_date 
                                        ? new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : <span className="text-slate-400 italic">Pending Cash</span>}
                                    </td>
                                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-700">
                                      {p.receipt_number || '—'}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      {p.payment_status === 'UNPAID' ? (
                                        <button
                                          onClick={() => handleUpdatePaymentStatus(p.id, p.payment_status, p.user_name)}
                                          className="px-3 py-1 rounded-md bg-[#12834B] hover:bg-[#075C32] text-white text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                                          title="Verify cash received and mark PAID"
                                        >
                                          Mark Paid (Cash)
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleUpdatePaymentStatus(p.id, p.payment_status, p.user_name)}
                                          className="px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                                          title="Reverse back to UNPAID"
                                        >
                                          Reverse to Unpaid
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: PAYMENT HISTORY */}
                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Comprehensive Payment Audit History</h4>
                        <p className="text-xs text-slate-500">Permanent record of all cash collections, receipts, and admin updates across months and years.</p>
                      </div>

                      <button
                        onClick={handleExportPaymentsCsv}
                        className="px-3.5 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Full History CSV</span>
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4">User ID & Name</th>
                              <th className="py-3 px-4">Group</th>
                              <th className="py-3 px-4">Month Cycle</th>
                              <th className="py-3 px-4">Amount</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Payment Date</th>
                              <th className="py-3 px-4">Receipt #</th>
                              <th className="py-3 px-4">Updated By</th>
                              <th className="py-3 px-4">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {payments.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50/70">
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  {p.user_name} <span className="font-mono text-[10px] text-slate-400">({p.user_id})</span>
                                </td>
                                <td className="py-3 px-4 text-slate-700 truncate max-w-xs">{p.group_name}</td>
                                <td className="py-3 px-4 font-semibold text-slate-800">{p.month_name}</td>
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{p.payment_amount.toLocaleString('en-IN')}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    p.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {p.payment_status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                                  {p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-IN') : '—'}
                                </td>
                                <td className="py-3 px-4 font-mono text-[#075C32] font-bold">{p.receipt_number || '—'}</td>
                                <td className="py-3 px-4 text-slate-500 text-[11px]">{p.updated_by}</td>
                                <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">{p.notes || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: NEWS & ANNOUNCEMENTS */}
                {activeTab === 'announcements' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Company News & Notices Management</h4>
                        <p className="text-xs text-slate-500">Publish monthly auction dates, bonus reminders, and office announcements directly to member dashboards.</p>
                      </div>

                      <button
                        onClick={() => setShowCreateAnnModal(true)}
                        className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Publish New Announcement</span>
                      </button>
                    </div>

                    {annActionMsg && (
                      <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        annActionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {annActionMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{annActionMsg.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                {ann.category}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {new Date(ann.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <h5 className="font-bold text-base text-slate-900">{ann.title}</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">{ann.description}</p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                            <span className="text-slate-400 text-[11px]">Target: {ann.target_group_id === 'all' ? 'All Groups' : ann.target_group_id}</span>
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                              className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 7: REPORTS */}
                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Financial Reports & Outstanding Cash Ledger</h4>
                      <p className="text-xs text-slate-500">Summary reports on monthly collection trends, group reconciliation, and member follow-up.</p>
                    </div>

                    {/* Defaulter / Pending Cash Follow-up List */}
                    <div className="bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-xs">
                      <div className="p-4 bg-rose-50/70 border-b border-rose-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                          <div>
                            <h5 className="font-bold text-xs text-rose-950 uppercase tracking-wider">
                              Pending Cash Follow-up List ({reportsData?.pendingDefaulters?.length || 0} Members)
                            </h5>
                            <span className="text-[11px] text-rose-700">Members with unpaid instalments due for the active cycle</span>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-4">User ID</th>
                              <th className="py-2.5 px-4">Member Name</th>
                              <th className="py-2.5 px-4">Mobile Number</th>
                              <th className="py-2.5 px-4">Group Name</th>
                              <th className="py-2.5 px-4">Month Cycle</th>
                              <th className="py-2.5 px-4">Amount Due (₹)</th>
                              <th className="py-2.5 px-4 text-right">Quick Contact</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(reportsData?.pendingDefaulters || []).map((def: any) => (
                              <tr key={def.paymentId} className="hover:bg-rose-50/30">
                                <td className="py-2.5 px-4 font-mono font-bold text-[#075C32]">{def.userId}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-900">{def.userName}</td>
                                <td className="py-2.5 px-4 font-mono text-slate-700">+91 {def.mobileNumber}</td>
                                <td className="py-2.5 px-4 text-slate-600">{def.groupName}</td>
                                <td className="py-2.5 px-4 font-semibold text-slate-800">{def.monthName}</td>
                                <td className="py-2.5 px-4 font-mono font-bold text-rose-600">₹{Number(def.amount).toLocaleString('en-IN')}</td>
                                <td className="py-2.5 px-4 text-right">
                                  <a
                                    href={`tel:${def.mobileNumber}`}
                                    className="px-2.5 py-1 rounded bg-[#075C32] text-white text-[10px] font-bold inline-flex items-center gap-1 hover:bg-[#12834B]"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>Call</span>
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Monthly Collection Summary */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                          Monthly Collection Totals (Paid vs Pending)
                        </h5>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4">Month Cycle</th>
                              <th className="py-3 px-4">Paid Collections (₹)</th>
                              <th className="py-3 px-4">Paid Receipts Count</th>
                              <th className="py-3 px-4">Pending Collections (₹)</th>
                              <th className="py-3 px-4">Pending Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(reportsData?.monthlySummary || []).map((m: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/70">
                                <td className="py-3 px-4 font-bold text-slate-900">{m.monthName}</td>
                                <td className="py-3 px-4 font-mono font-bold text-[#075C32]">₹{m.totalPaid.toLocaleString('en-IN')}</td>
                                <td className="py-3 px-4 text-emerald-700 font-semibold">{m.countPaid} members</td>
                                <td className="py-3 px-4 font-mono font-bold text-rose-600">₹{m.totalUnpaid.toLocaleString('en-IN')}</td>
                                <td className="py-3 px-4 text-rose-600 font-semibold">{m.countUnpaid} members</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 8: CUSTOMER ENQUIRIES (PRESERVED FUNCTIONALITY) */}
                {activeTab === 'enquiries' && (
                  <div className="space-y-4">
                    {/* Metric Cards Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-semibold text-slate-500 block">{t.admin.totalEnquiries}</span>
                        <span className="text-xl font-black text-slate-900 font-mono">{enquiries.length}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-semibold text-emerald-700 block">{t.admin.statusNew}</span>
                        <span className="text-xl font-black text-[#075C32] font-mono">{enquiries.filter(e => e.enquiry_status === 'New').length}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-semibold text-blue-700 block">{t.admin.statusContacted}</span>
                        <span className="text-xl font-black text-blue-700 font-mono">{enquiries.filter(e => e.enquiry_status === 'Contacted').length}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-semibold text-amber-700 block">{t.admin.statusInProgress}</span>
                        <span className="text-xl font-black text-amber-700 font-mono">{enquiries.filter(e => e.enquiry_status === 'In Progress').length}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-semibold text-slate-600 block">{t.admin.statusCompleted}</span>
                        <span className="text-xl font-black text-slate-600 font-mono">{enquiries.filter(e => e.enquiry_status === 'Completed').length}</span>
                      </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={enquirySearchQuery}
                          onChange={(e) => setEnquirySearchQuery(e.target.value)}
                          placeholder={t.admin.searchPlaceholder}
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={filterScheme}
                          onChange={(e) => setFilterScheme(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        >
                          <option value="all">{t.admin.allSchemes}</option>
                          <option value="1,00,000">₹1,00,000 Scheme</option>
                          <option value="2,00,000">₹2,00,000 Scheme</option>
                          <option value="5,00,000">₹5,00,000 Scheme</option>
                        </select>

                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        >
                          <option value="all">{t.admin.allStatuses}</option>
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>

                        <button
                          onClick={fetchEnquiries}
                          className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-slate-900"
                        >
                          <RefreshCw className={`w-4 h-4 ${loadingEnquiries ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Enquiries Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
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
                            {filteredEnquiries.map((enq) => (
                              <tr key={enq.id} className="hover:bg-slate-50/70">
                                <td className="py-3 px-4">
                                  <span className="font-bold text-slate-900 block">{enq.full_name}</span>
                                  <span className="text-[11px] text-slate-500">{enq.city}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <a href={`tel:${enq.mobile_number}`} className="font-mono text-[#075C32] font-semibold hover:underline block">
                                    +91 {enq.mobile_number}
                                  </a>
                                  <span className="text-[11px] text-slate-500">{enq.email}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-semibold text-slate-800">{enq.preferred_scheme}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <select
                                    value={enq.enquiry_status || 'New'}
                                    onChange={(e) => handleEnquiryStatusChange(enq.id!, e.target.value)}
                                    disabled={updatingEnquiryId === enq.id}
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
                                <td className="py-3 px-4 text-slate-500 text-[11px]">
                                  {enq.created_at ? new Date(enq.created_at).toLocaleDateString('en-IN') : 'Recent'}
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* MODAL: CREATE USER */}
        {showCreateUserModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">Create New Member Account</h4>
                <button onClick={() => setShowCreateUserModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Unique User ID *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomId = `TS-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
                        setNewUserForm({ ...newUserForm, user_id: randomId });
                      }}
                      className="text-[10px] text-[#075C32] font-bold hover:underline"
                    >
                      Auto-Generate ID
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newUserForm.user_id}
                    onChange={(e) => setNewUserForm({ ...newUserForm, user_id: e.target.value.toUpperCase() })}
                    placeholder="e.g. TS-2026-005"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newUserForm.full_name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                    placeholder="e.g. M. Rajesh"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Number (10 Digits) *</label>
                  <input
                    type="tel"
                    value={newUserForm.mobile_number}
                    onChange={(e) => setNewUserForm({ ...newUserForm, mobile_number: e.target.value })}
                    placeholder="e.g. 9842100000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Address / Street *</label>
                  <input
                    type="text"
                    value={newUserForm.address}
                    onChange={(e) => setNewUserForm({ ...newUserForm, address: e.target.value })}
                    placeholder="e.g. 15 North Street, Madathattuvillai"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">City / District *</label>
                    <input
                      type="text"
                      value={newUserForm.city}
                      onChange={(e) => setNewUserForm({ ...newUserForm, city: e.target.value })}
                      placeholder="Villukuri"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Initial Password *</label>
                    <input
                      type="text"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign to Chit Group * (Max 99)</label>
                  <select
                    value={newUserForm.group_id}
                    onChange={(e) => setNewUserForm({ ...newUserForm, group_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    required
                  >
                    <option value="">Select Group...</option>
                    {groups.map((g) => {
                      const count = users.filter(u => u.group_id === g.id).length;
                      const isFull = count >= 99;
                      return (
                        <option key={g.id} value={g.id} disabled={isFull}>
                          {g.name} ({count}/99 members) {isFull ? '— FULL' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white font-bold"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT USER */}
        {showEditUserModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">Edit Member Details</h4>
                <button onClick={() => setShowEditUserModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">User ID (Permanent)</label>
                  <input
                    type="text"
                    value={editUserForm.user_id}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 font-mono text-slate-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={editUserForm.full_name}
                    onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={editUserForm.mobile_number}
                    onChange={(e) => setEditUserForm({ ...editUserForm, mobile_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Address *</label>
                  <input
                    type="text"
                    value={editUserForm.address}
                    onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / District *</label>
                  <input
                    type="text"
                    value={editUserForm.city}
                    onChange={(e) => setEditUserForm({ ...editUserForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Group</label>
                  <select
                    value={editUserForm.group_id}
                    onChange={(e) => setEditUserForm({ ...editUserForm, group_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} ({g.id})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditUserModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RESET PASSWORD */}
        {showPasswordModal && selectedUser && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">Reset Member Password</h4>
                <button onClick={() => setShowPasswordModal(false)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Member:</span>
                  <span className="font-bold text-slate-900 block text-sm">{selectedUser.full_name} ({selectedUser.user_id})</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Password (Min 4 chars) *</label>
                  <input
                    type="text"
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm"
                    required
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white font-bold"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE GROUP */}
        {showCreateGroupModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">Create New Chit Group</h4>
                <button onClick={() => setShowCreateGroupModal(false)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unique Group ID *</label>
                  <input
                    type="text"
                    value={newGroupForm.id}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, id: e.target.value.toUpperCase() })}
                    placeholder="e.g. GRP-2L-02"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Group Name *</label>
                  <input
                    type="text"
                    value={newGroupForm.name}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                    placeholder="e.g. ₹2 Lakh Scheme - Batch 2026C"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheme Category *</label>
                  <select
                    value={newGroupForm.scheme_name}
                    onChange={(e) => {
                      const scheme = e.target.value;
                      let val = 200000;
                      if (scheme.includes('1,00,000')) val = 100000;
                      if (scheme.includes('5,00,000')) val = 500000;
                      setNewGroupForm({ ...newGroupForm, scheme_name: scheme, chit_value: val });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="₹1,00,000 Scheme">₹1,00,000 Scheme (20 Months)</option>
                    <option value="₹2,00,000 Scheme">₹2,00,000 Scheme (20 Months)</option>
                    <option value="₹5,00,000 Scheme">₹5,00,000 Scheme (20 Months)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Chit Value (₹)</label>
                    <input
                      type="number"
                      value={newGroupForm.chit_value}
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Capacity</label>
                    <input
                      type="text"
                      value="99 Members (Fixed)"
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 font-bold text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={newGroupForm.start_date}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroupModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white font-bold"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: VIEW GROUP MEMBERS */}
        {showGroupMembersModal && selectedGroupForMembers && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{selectedGroupForMembers.name}</h4>
                  <span className="text-xs text-slate-500 font-mono">
                    Group ID: {selectedGroupForMembers.id} · Enrolled: {groupMembersList.length} / 99 Members
                  </span>
                </div>
                <button onClick={() => setShowGroupMembersModal(false)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {groupMembersList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No members enrolled in this group yet. Go to User Management to add members.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">User ID</th>
                        <th className="py-2.5 px-3">Member Name</th>
                        <th className="py-2.5 px-3">Mobile Number</th>
                        <th className="py-2.5 px-3">City</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupMembersList.map((m) => (
                        <tr key={m.user_id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#075C32]">{m.user_id}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{m.full_name}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">+91 {m.mobile_number}</td>
                          <td className="py-2.5 px-3 text-slate-500">{m.city}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="pt-2 flex justify-end border-t">
                <button
                  onClick={() => setShowGroupMembersModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE ANNOUNCEMENT */}
        {showCreateAnnModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">Publish Announcement</h4>
                <button onClick={() => setShowCreateAnnModal(false)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title *</label>
                  <input
                    type="text"
                    value={newAnnForm.title}
                    onChange={(e) => setNewAnnForm({ ...newAnnForm, title: e.target.value })}
                    placeholder="e.g. November Monthly Auction Notice"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description / Content *</label>
                  <textarea
                    rows={4}
                    value={newAnnForm.description}
                    onChange={(e) => setNewAnnForm({ ...newAnnForm, description: e.target.value })}
                    placeholder="Write announcement details..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category *</label>
                    <select
                      value={newAnnForm.category}
                      onChange={(e) => setNewAnnForm({ ...newAnnForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="General">General</option>
                      <option value="Auction Date">Auction Date</option>
                      <option value="Payment Notice">Payment Notice</option>
                      <option value="Bonus Update">Bonus Update</option>
                      <option value="Important">Important</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Group</label>
                    <select
                      value={newAnnForm.target_group_id}
                      onChange={(e) => setNewAnnForm({ ...newAnnForm, target_group_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="all">All Groups</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Publication Date *</label>
                  <input
                    type="date"
                    value={newAnnForm.publish_date}
                    onChange={(e) => setNewAnnForm({ ...newAnnForm, publish_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateAnnModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white font-bold"
                  >
                    Publish Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CUSTOMER ENQUIRY DETAILS (PRESERVED) */}
        {selectedEnquiry && (
          <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">{t.admin.detailsModalTitle}</h4>
                <button onClick={() => setSelectedEnquiry(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
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
