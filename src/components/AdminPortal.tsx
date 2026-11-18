import React, { useState, useEffect } from 'react';
import { CustomerEnquiry, Language, SystemStatus, ChitUser, ChitGroup, ChitScheme, SchemeVersion, PaymentRecord, Announcement, AdminOverviewStats } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { HorizontalScrollArea } from './HorizontalScrollArea';
import { 
  ShieldCheck, Lock, LogOut, Search, Filter, Download, 
  Eye, EyeOff, RefreshCw, CheckCircle2, Clock, CheckCircle, Database, Mail, X,
  Users, Layers, CreditCard, Bell, BarChart3, Plus, Edit, Trash2, Key,
  Check, AlertCircle, Phone, Calendar, ArrowRight, UserCheck, UserX, AlertTriangle,
  FileText, UserPlus, History, Archive, Power, Settings
} from 'lucide-react';

interface AdminPortalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'overview' | 'users' | 'groups' | 'schemes' | 'payments' | 'history' | 'announcements' | 'reports' | 'enquiries';

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
  const [newPasswordValue, setNewPasswordValue] = useState<string>('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState<string>('');
  const [showResetPasswordText, setShowResetPasswordText] = useState<boolean>(false);
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState<boolean>(false);
  const [userPendingDelete, setUserPendingDelete] = useState<ChitUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<boolean>(false);
  const [userActionMsg, setUserActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Schemes Management
  const [schemes, setSchemes] = useState<ChitScheme[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState<boolean>(false);
  const [showCreateSchemeModal, setShowCreateSchemeModal] = useState<boolean>(false);
  const [showEditSchemeModal, setShowEditSchemeModal] = useState<boolean>(false);
  const [showSchemeVersionsModal, setShowSchemeVersionsModal] = useState<boolean>(false);
  const [schemeVersions, setSchemeVersions] = useState<SchemeVersion[]>([]);
  const [selectedSchemeVersionsTitle, setSelectedSchemeVersionsTitle] = useState<string>('');
  const [schemePendingDelete, setSchemePendingDelete] = useState<ChitScheme | null>(null);
  const [schemeActionMsg, setSchemeActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [schemeModalError, setSchemeModalError] = useState<string | null>(null);
  const [schemeImpactWarning, setSchemeImpactWarning] = useState<string | null>(null);
  const [newSchemeForm, setNewSchemeForm] = useState({
    schemeCode: '',
    nameEn: '',
    nameTa: '',
    chitValue: '1000000',
    durationMonths: 20,
    customDuration: '',
    promptBonus: '20000',
    lastMonthBonus: '4000',
    taglineEn: '',
    taglineTa: '',
    status: 'active' as 'active' | 'inactive' | 'archived',
    autoAnnounce: true
  });
  const [editSchemeForm, setEditSchemeForm] = useState({
    id: '',
    schemeCode: '',
    nameEn: '',
    nameTa: '',
    chitValue: '',
    durationMonths: 20,
    customDuration: '',
    promptBonus: '',
    lastMonthBonus: '',
    taglineEn: '',
    taglineTa: '',
    status: 'active' as 'active' | 'inactive' | 'archived',
    autoAnnounce: true,
    confirm_running_impact: false
  });

  // Groups Management
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState<boolean>(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState<boolean>(false);
  const [showGroupMembersModal, setShowGroupMembersModal] = useState<boolean>(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<ChitGroup | null>(null);
  const [groupMembersList, setGroupMembersList] = useState<ChitUser[]>([]);
  const [showArchivedGroups, setShowArchivedGroups] = useState<boolean>(false);
  const [groupPendingDelete, setGroupPendingDelete] = useState<ChitGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<boolean>(false);
  const [newGroupForm, setNewGroupForm] = useState({
    id: '',
    name: '',
    scheme_id: 'scheme-2-lakh',
    scheme_name: '₹2,00,000 Scheme',
    chit_value: 200000,
    duration_months: 20,
    start_date: new Date().toISOString().split('T')[0]
  });
  const [editGroupForm, setEditGroupForm] = useState({
    id: '',
    name: '',
    scheme_id: '',
    scheme_name: '',
    chit_value: 200000,
    duration_months: 20,
    start_date: '',
    status: 'active' as 'active' | 'inactive' | 'archived'
  });
  const [groupActionMsg, setGroupActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Unified Custom / Edit Scheme Modal (Triggered from "Select Chit Scheme" dropdown)
  const [showCustomEditSchemeModal, setShowCustomEditSchemeModal] = useState<boolean>(false);
  const [customSchemeOrigin, setCustomSchemeOrigin] = useState<'create-group' | 'edit-group' | null>(null);
  const [customSchemeMode, setCustomSchemeMode] = useState<'create' | 'edit'>('create');
  const [customSchemeError, setCustomSchemeError] = useState<string | null>(null);
  const [customSchemeImpactWarning, setCustomSchemeImpactWarning] = useState<string | null>(null);
  const [savingCustomScheme, setSavingCustomScheme] = useState<boolean>(false);
  const [groupSchemeFeedback, setGroupSchemeFeedback] = useState<string | null>(null);
  const [customSchemeForm, setCustomSchemeForm] = useState({
    id: '',
    schemeCode: '',
    nameEn: '',
    nameTa: '',
    chitValue: '300000',
    durationMonths: 20,
    customDuration: '',
    promptBonus: '6000',
    lastMonthBonus: '1200',
    taglineEn: '',
    taglineTa: '',
    status: 'active' as 'active' | 'inactive' | 'archived',
    autoAnnounce: true,
    confirm_running_impact: false
  });

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
  const [showArchivedAnnouncements, setShowArchivedAnnouncements] = useState<boolean>(false);
  const [annPendingDelete, setAnnPendingDelete] = useState<Announcement | null>(null);
  const [deletingAnn, setDeletingAnn] = useState<boolean>(false);
  const [newAnnForm, setNewAnnForm] = useState({
    title: '',
    description: '',
    category: 'General' as Announcement['category'],
    target_type: 'all' as 'all' | 'group' | 'scheme',
    target_group_id: 'all',
    target_scheme_id: '',
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

  // Lock outer document scrolling when Admin Console modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Fetch initial data when authenticated and opened
  useEffect(() => {
    if (isAuthenticated && isOpen && adminToken) {
      fetchSystemStatus();
      fetchOverview();
      fetchUsers();
      fetchGroups();
      fetchSchemes();
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
        const activeGrps = grps.filter((g: ChitGroup) => g.status !== 'archived');
        if (activeGrps.length > 0 && (!configGroup || !activeGrps.some((g: ChitGroup) => g.id === configGroup))) {
          setConfigGroup(activeGrps[0].id);
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

  const fetchSchemes = async () => {
    setLoadingSchemes(true);
    try {
      const res = await fetch('/api/admin/schemes', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setSchemes(data.schemes || []);
      }
    } catch (e) {
      console.error('Fetch schemes error:', e);
    } finally {
      setLoadingSchemes(false);
    }
  };

  const fetchAnnouncements = async (includeArchived = showArchivedAnnouncements) => {
    setLoadingAnnouncements(true);
    try {
      const url = `/api/admin/announcements${includeArchived ? '?include_archived=true' : ''}`;
      const res = await fetch(url, { headers: authHeaders });
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
    setPasswordModalError(null);
    setUserActionMsg(null);

    if (newPasswordValue.length < 6) {
      setPasswordModalError('Password must be at least 6 characters long.');
      return;
    }
    if (/\s/.test(newPasswordValue)) {
      setPasswordModalError('Password must not contain spaces.');
      return;
    }
    if (!/[a-zA-Z]/.test(newPasswordValue) || !/[0-9]/.test(newPasswordValue)) {
      setPasswordModalError('Password must contain at least one letter and one number (e.g. Member2026).');
      return;
    }
    if (newPasswordValue !== confirmPasswordValue) {
      setPasswordModalError('New password and confirmation do not match.');
      return;
    }

    setResettingPassword(true);
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
        setNewPasswordValue('');
        setConfirmPasswordValue('');
        setPasswordModalError(null);
        fetchOverview();
      } else {
        setPasswordModalError(data.error || 'Failed to reset password.');
      }
    } catch {
      setPasswordModalError('Error connecting to server while resetting password.');
    } finally {
      setResettingPassword(false);
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
        fetchGroups();
      }
    } catch (e) {
      console.error('Toggle status error:', e);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userPendingDelete) return;
    setUserActionMsg(null);
    setDeletingUser(true);

    try {
      const res = await fetch(`/api/admin/users/${userPendingDelete.user_id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();

      if (res.ok) {
        setUserActionMsg({ type: 'success', text: data.message });
        setUserPendingDelete(null);
        fetchUsers();
        fetchGroups();
        fetchOverview();
      } else {
        setUserActionMsg({ type: 'error', text: data.error || 'Failed to delete user.' });
        setUserPendingDelete(null);
      }
    } catch {
      setUserActionMsg({ type: 'error', text: 'Failed to connect to server while deleting user.' });
      setUserPendingDelete(null);
    } finally {
      setDeletingUser(false);
    }
  };

  // Scheme Management Actions
  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchemeModalError(null);
    setSchemeActionMsg(null);

    const finalDuration = newSchemeForm.customDuration ? Number(newSchemeForm.customDuration) : Number(newSchemeForm.durationMonths);
    const finalValue = Number(newSchemeForm.chitValue);
    if (!newSchemeForm.nameEn.trim() || !finalValue || finalValue < 10000) {
      setSchemeModalError('Please enter a Scheme Name and valid Chit Value (min ₹10,000).');
      return;
    }
    if (!finalDuration || finalDuration < 2 || finalDuration > 60) {
      setSchemeModalError('Duration must be between 2 and 60 months.');
      return;
    }

    try {
      const res = await fetch('/api/admin/schemes', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          schemeCode: newSchemeForm.schemeCode,
          nameEn: newSchemeForm.nameEn,
          nameTa: newSchemeForm.nameTa,
          chitValue: finalValue,
          durationMonths: finalDuration,
          availableDurations: Array.from(new Set([10, 12, 15, 20, 24, finalDuration])).sort((a, b) => a - b),
          promptBonus: newSchemeForm.promptBonus ? Number(newSchemeForm.promptBonus) : undefined,
          lastMonthBonus: newSchemeForm.lastMonthBonus ? Number(newSchemeForm.lastMonthBonus) : undefined,
          taglineEn: newSchemeForm.taglineEn,
          taglineTa: newSchemeForm.taglineTa,
          status: newSchemeForm.status,
          autoAnnounce: newSchemeForm.autoAnnounce
        })
      });
      const data = await res.json();

      if (res.ok) {
        setSchemeActionMsg({ type: 'success', text: data.message });
        setShowCreateSchemeModal(false);
        setNewSchemeForm({
          schemeCode: '',
          nameEn: '',
          nameTa: '',
          chitValue: '1000000',
          durationMonths: 20,
          customDuration: '',
          promptBonus: '20000',
          lastMonthBonus: '4000',
          taglineEn: '',
          taglineTa: '',
          status: 'active',
          autoAnnounce: true
        });
        fetchSchemes();
        fetchAnnouncements();
        fetchOverview();
        window.dispatchEvent(new Event('teamstars:schemes-updated'));
      } else {
        setSchemeModalError(data.error || 'Failed to create scheme.');
      }
    } catch {
      setSchemeModalError('Network error while creating scheme.');
    }
  };

  const handleEditScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchemeModalError(null);
    setSchemeImpactWarning(null);
    setSchemeActionMsg(null);

    const finalDuration = editSchemeForm.customDuration ? Number(editSchemeForm.customDuration) : Number(editSchemeForm.durationMonths);
    const finalValue = Number(editSchemeForm.chitValue);

    try {
      const res = await fetch(`/api/admin/schemes/${editSchemeForm.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          nameEn: editSchemeForm.nameEn,
          nameTa: editSchemeForm.nameTa,
          chitValue: finalValue,
          durationMonths: finalDuration,
          promptBonus: editSchemeForm.promptBonus !== '' ? Number(editSchemeForm.promptBonus) : undefined,
          lastMonthBonus: editSchemeForm.lastMonthBonus !== '' ? Number(editSchemeForm.lastMonthBonus) : undefined,
          taglineEn: editSchemeForm.taglineEn,
          taglineTa: editSchemeForm.taglineTa,
          status: editSchemeForm.status,
          autoAnnounce: editSchemeForm.autoAnnounce,
          confirm_running_impact: editSchemeForm.confirm_running_impact
        })
      });
      const data = await res.json();

      if (res.status === 409 && data.requiresConfirmation) {
        setSchemeImpactWarning(data.error);
        return;
      }

      if (res.ok) {
        setSchemeActionMsg({ type: 'success', text: data.message });
        setShowEditSchemeModal(false);
        setSchemeImpactWarning(null);
        fetchSchemes();
        fetchAnnouncements();
        fetchOverview();
        window.dispatchEvent(new Event('teamstars:schemes-updated'));
      } else {
        setSchemeModalError(data.error || 'Failed to update scheme.');
      }
    } catch {
      setSchemeModalError('Network error while updating scheme.');
    }
  };

  const handleToggleSchemeStatus = async (scheme: ChitScheme) => {
    const nextStatus = scheme.status === 'active' ? 'inactive' : 'active';
    setSchemeActionMsg(null);
    try {
      const res = await fetch(`/api/admin/schemes/${scheme.id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setSchemeActionMsg({ type: 'success', text: data.message });
        fetchSchemes();
        fetchAnnouncements();
        fetchOverview();
        window.dispatchEvent(new Event('teamstars:schemes-updated'));
      } else {
        setSchemeActionMsg({ type: 'error', text: data.error || 'Failed to update scheme status.' });
      }
    } catch {
      setSchemeActionMsg({ type: 'error', text: 'Failed to update scheme status.' });
    }
  };

  const handleViewSchemeVersions = async (scheme: ChitScheme) => {
    setSelectedSchemeVersionsTitle(`${scheme.nameEn} (${scheme.schemeCode || scheme.id})`);
    setShowSchemeVersionsModal(true);
    try {
      const res = await fetch(`/api/admin/schemes/${scheme.id}/versions`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setSchemeVersions(data.versions || []);
      }
    } catch (e) {
      console.error('Failed to fetch scheme versions:', e);
    }
  };

  const handleConfirmDeleteScheme = async () => {
    if (!schemePendingDelete) return;
    setSchemeActionMsg(null);
    try {
      const res = await fetch(`/api/admin/schemes/${schemePendingDelete.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) {
        setSchemeActionMsg({ type: 'success', text: data.message });
        fetchSchemes();
        fetchOverview();
        window.dispatchEvent(new Event('teamstars:schemes-updated'));
      } else {
        setSchemeActionMsg({ type: 'error', text: data.error || 'Failed to delete/archive scheme.' });
      }
    } catch {
      setSchemeActionMsg({ type: 'error', text: 'Error deleting scheme.' });
    } finally {
      setSchemePendingDelete(null);
    }
  };

  const populateCustomEditFromScheme = (scheme: ChitScheme) => {
    const isPreset = [10, 12, 15, 20, 24].includes(scheme.durationMonths);
    setCustomSchemeForm({
      id: scheme.id,
      schemeCode: scheme.schemeCode || '',
      nameEn: scheme.nameEn,
      nameTa: scheme.nameTa || '',
      chitValue: String(scheme.chitValue),
      durationMonths: isPreset ? scheme.durationMonths : 20,
      customDuration: isPreset ? '' : String(scheme.durationMonths),
      promptBonus: String(scheme.promptBonus ?? Math.round(scheme.chitValue * 0.02)),
      lastMonthBonus: String(scheme.lastMonthBonus ?? Math.round(scheme.chitValue * 0.004)),
      taglineEn: scheme.taglineEn || '',
      taglineTa: scheme.taglineTa || '',
      status: (scheme.status || 'active') as 'active' | 'inactive' | 'archived',
      autoAnnounce: true,
      confirm_running_impact: false
    });
  };

  const openCustomEditSchemeModal = (origin: 'create-group' | 'edit-group', preselectedSchemeId?: string) => {
    setCustomSchemeOrigin(origin);
    setCustomSchemeError(null);
    setCustomSchemeImpactWarning(null);
    const fallbackScheme = schemes.find((s) => s.id === preselectedSchemeId) || schemes[0];
    setCustomSchemeMode('create');
    setCustomSchemeForm({
      id: fallbackScheme?.id || '',
      schemeCode: '',
      nameEn: '',
      nameTa: '',
      chitValue: '300000',
      durationMonths: 20,
      customDuration: '',
      promptBonus: '6000',
      lastMonthBonus: '1200',
      taglineEn: '',
      taglineTa: '',
      status: 'active',
      autoAnnounce: true,
      confirm_running_impact: false
    });
    setShowCustomEditSchemeModal(true);
  };

  const handleSaveCustomOrEditScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomSchemeError(null);
    setCustomSchemeImpactWarning(null);

    const finalDuration = customSchemeForm.customDuration
      ? Number(customSchemeForm.customDuration)
      : Number(customSchemeForm.durationMonths);
    const finalValue = Number(customSchemeForm.chitValue);

    if (!customSchemeForm.nameEn.trim() || !finalValue || finalValue < 10000) {
      setCustomSchemeError('Please enter a Scheme Name and valid Scheme Amount (minimum ₹10,000).');
      return;
    }
    if (!finalDuration || finalDuration < 2 || finalDuration > 60) {
      setCustomSchemeError('Number of Months must be between 2 and 60.');
      return;
    }
    if (customSchemeMode === 'edit' && !customSchemeForm.id) {
      setCustomSchemeError('Please choose an existing scheme to edit.');
      return;
    }

    setSavingCustomScheme(true);
    try {
      const endpoint = customSchemeMode === 'create'
        ? '/api/admin/schemes'
        : `/api/admin/schemes/${customSchemeForm.id}`;
      const method = customSchemeMode === 'create' ? 'POST' : 'PUT';

      const payload: any = {
        schemeCode: customSchemeForm.schemeCode,
        nameEn: customSchemeForm.nameEn.trim(),
        nameTa: customSchemeForm.nameTa.trim(),
        chitValue: finalValue,
        durationMonths: finalDuration,
        availableDurations: Array.from(new Set([10, 12, 15, 20, 24, finalDuration])).sort((a, b) => a - b),
        promptBonus: customSchemeForm.promptBonus !== '' ? Number(customSchemeForm.promptBonus) : undefined,
        lastMonthBonus: customSchemeForm.lastMonthBonus !== '' ? Number(customSchemeForm.lastMonthBonus) : undefined,
        taglineEn: customSchemeForm.taglineEn.trim(),
        taglineTa: customSchemeForm.taglineTa.trim(),
        status: customSchemeForm.status,
        autoAnnounce: customSchemeForm.autoAnnounce
      };
      if (customSchemeMode === 'edit') {
        payload.confirm_running_impact = customSchemeForm.confirm_running_impact;
      }

      const res = await fetch(endpoint, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.status === 409 && data.requiresConfirmation) {
        setCustomSchemeImpactWarning(data.error);
        return;
      }

      if (!res.ok) {
        setCustomSchemeError(data.error || 'Failed to save scheme.');
        return;
      }

      const savedScheme: ChitScheme | undefined = data.scheme;
      await fetchSchemes();
      fetchAnnouncements();
      fetchOverview();
      window.dispatchEvent(new Event('teamstars:schemes-updated'));

      if (savedScheme && savedScheme.status !== 'archived' && savedScheme.status !== 'inactive') {
        if (customSchemeOrigin === 'create-group') {
          setNewGroupForm((prev) => ({
            ...prev,
            scheme_id: savedScheme.id,
            scheme_name: savedScheme.nameEn || `${savedScheme.chitValueFormatted} Scheme`,
            chit_value: savedScheme.chitValue,
            duration_months: savedScheme.durationMonths
          }));
        } else if (customSchemeOrigin === 'edit-group') {
          setEditGroupForm((prev) => ({
            ...prev,
            scheme_id: savedScheme.id,
            scheme_name: savedScheme.nameEn || `${savedScheme.chitValueFormatted} Scheme`,
            chit_value: savedScheme.chitValue,
            duration_months: savedScheme.durationMonths
          }));
        }
      }

      const successText = data.message || 'Scheme saved successfully.';
      setSchemeActionMsg({ type: 'success', text: successText });
      setGroupSchemeFeedback(successText);
      setGroupActionMsg({ type: 'success', text: successText });
      setShowCustomEditSchemeModal(false);
    } catch {
      setCustomSchemeError('Network error while saving scheme.');
    } finally {
      setSavingCustomScheme(false);
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
        const defaultScheme = schemes.find((s) => s.status === 'active') || schemes[0];
        setNewGroupForm({
          id: '',
          name: '',
          scheme_id: defaultScheme?.id || 'scheme-2-lakh',
          scheme_name: defaultScheme ? `${defaultScheme.chitValueFormatted} Scheme` : '₹2,00,000 Scheme',
          chit_value: defaultScheme?.chitValue || 200000,
          duration_months: defaultScheme?.durationMonths || 20,
          start_date: new Date().toISOString().split('T')[0]
        });
        fetchGroups();
        fetchSchemes();
        fetchAnnouncements();
        fetchOverview();
      } else {
        setGroupActionMsg({ type: 'error', text: data.error || 'Failed to create group.' });
      }
    } catch {
      setGroupActionMsg({ type: 'error', text: 'Error connecting to server.' });
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupActionMsg(null);
    try {
      const res = await fetch(`/api/admin/groups/${editGroupForm.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(editGroupForm)
      });
      const data = await res.json();
      if (res.ok) {
        setGroupActionMsg({ type: 'success', text: data.message });
        setShowEditGroupModal(false);
        fetchGroups();
        fetchAnnouncements();
        fetchOverview();
      } else {
        setGroupActionMsg({ type: 'error', text: data.error || 'Failed to update group.' });
      }
    } catch {
      setGroupActionMsg({ type: 'error', text: 'Error updating group.' });
    }
  };

  const handleToggleGroupStatus = async (group: ChitGroup) => {
    const nextStatus = group.status === 'active' ? 'inactive' : 'active';
    setGroupActionMsg(null);
    try {
      const res = await fetch(`/api/admin/groups/${group.id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setGroupActionMsg({ type: 'success', text: `Group "${group.name}" status updated to ${nextStatus.toUpperCase()}.` });
        fetchGroups();
        fetchAnnouncements();
        fetchOverview();
      } else {
        const data = await res.json();
        setGroupActionMsg({ type: 'error', text: data.error || 'Failed to toggle group status.' });
      }
    } catch {
      setGroupActionMsg({ type: 'error', text: 'Error updating group status.' });
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

  const handleConfirmDeleteGroup = async () => {
    if (!groupPendingDelete) return;
    setGroupActionMsg(null);
    setDeletingGroup(true);
    try {
      const res = await fetch(`/api/admin/groups/${groupPendingDelete.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) {
        const fullMessage = data.migrationNotice
          ? `${data.message} (${data.migrationNotice})`
          : data.message;
        setGroupActionMsg({ type: 'success', text: fullMessage });
        setGroupPendingDelete(null);
        fetchGroups();
        fetchOverview();
        fetchSchemes();
      } else {
        setGroupActionMsg({ type: 'error', text: data.error || 'Failed to delete/archive group.' });
        setGroupPendingDelete(null);
      }
    } catch {
      setGroupActionMsg({ type: 'error', text: 'Failed to connect to server while removing group.' });
      setGroupPendingDelete(null);
    } finally {
      setDeletingGroup(false);
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
          target_type: 'all',
          target_group_id: 'all',
          target_scheme_id: '',
          publish_date: new Date().toISOString().split('T')[0],
          is_published: true
        });
        fetchAnnouncements();
      } else {
        setAnnActionMsg({ type: 'error', text: data.error || 'Failed to publish announcement.' });
      }
    } catch {
      setAnnActionMsg({ type: 'error', text: 'Failed to create announcement.' });
    }
  };

  const handleConfirmDeleteAnnouncement = async () => {
    if (!annPendingDelete) return;
    setAnnActionMsg(null);
    setDeletingAnn(true);

    try {
      const res = await fetch(`/api/admin/announcements/${annPendingDelete.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();

      if (res.ok) {
        setAnnActionMsg({ type: 'success', text: data.message });
        setAnnPendingDelete(null);
        fetchAnnouncements();
        fetchOverview();
      } else {
        setAnnActionMsg({ type: 'error', text: data.error || 'Failed to delete announcement.' });
        setAnnPendingDelete(null);
      }
    } catch (e) {
      console.error('Delete announcement error:', e);
      setAnnActionMsg({ type: 'error', text: 'Server connection error while deleting announcement.' });
      setAnnPendingDelete(null);
    } finally {
      setDeletingAnn(false);
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-1 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-7xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[96vh] sm:max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#075C32] text-white px-3.5 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#C9A64A]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-sm sm:text-lg font-black tracking-tight truncate">
                  {isTa ? 'நிர்வாக மேலாண்மை தளம்' : 'Chit Fund Administration Console'}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A64A] text-slate-900 shrink-0">
                  ADMIN MASTER
                </span>
              </div>
              <span className="hidden sm:block text-[11px] text-white/70 truncate">
                TEAM STARS CHITS PRIVATE LIMITED · CIN: U64990TN2025PTC181717 · Villukuri, Kanyakumari
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 sm:px-3 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] sm:text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isTa ? 'வெளியேறு' : 'Log Out'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Admin Console"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto overscroll-contain flex-1 bg-slate-50 flex flex-col">
          {!isAuthenticated ? (
            /* Admin Sign In Form */
            <div className="max-w-md w-auto sm:w-full mx-3 sm:mx-auto my-4 sm:my-14 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-sm">
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
              <HorizontalScrollArea
                className="bg-white border-b border-slate-200 shrink-0 shadow-2xs"
                innerClassName="px-3 sm:px-6 py-2 flex items-center gap-1.5"
                ariaLabel="Admin Navigation Tabs"
              >
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
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{groups.filter((g) => g.status !== 'archived').length}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('schemes'); fetchSchemes(); }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'schemes' ? 'bg-[#075C32] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{isTa ? 'சீட்டு திட்ட மேலாண்மை' : 'Scheme Management'}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{schemes.length}</span>
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
              </HorizontalScrollArea>

              {/* Main Tab Content */}
              <div className="p-3 sm:p-6 flex-1 space-y-4 sm:space-y-6">

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Primary Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5 sm:gap-3">
                      <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs min-w-0">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Members</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{overview?.totalUsers || users.length}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Unique User Accounts</span>
                      </div>

                      <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs min-w-0">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Chit Groups</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{overview?.totalGroups || groups.length}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Max 99 members/group</span>
                      </div>

                      <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs min-w-0">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Paid Receipts</span>
                        <span className="text-xl sm:text-2xl font-black text-[#12834B] font-mono">{overview?.totalPaidCount || 0}</span>
                        <span className="text-[10px] text-emerald-600 block mt-1">Cash received</span>
                      </div>

                      <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs min-w-0">
                        <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Unpaid Records</span>
                        <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono">{overview?.totalUnpaidCount || 0}</span>
                        <span className="text-[10px] text-rose-600 block mt-1">Pending collection</span>
                      </div>

                      <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs min-w-0">
                        <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">Cash Collected</span>
                        <span className="text-base sm:text-xl font-black text-[#075C32] font-mono break-words">₹{(overview?.totalCashCollected || 0).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-emerald-700 block mt-1">Direct physical cash</span>
                      </div>

                      <div className="p-3 sm:p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-2xs min-w-0">
                        <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block">Total Outstanding</span>
                        <span className="text-base sm:text-xl font-black text-rose-700 font-mono break-words">₹{(overview?.totalOutstanding || 0).toLocaleString('en-IN')}</span>
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
                          onClick={() => { setActiveTab('groups'); setGroupSchemeFeedback(null); setShowCreateGroupModal(true); }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Create Group</span>
                        </button>
                        <button
                          onClick={() => { setActiveTab('schemes'); setSchemeModalError(null); setShowCreateSchemeModal(true); }}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-[#075C32]" />
                          <span>Manage Schemes</span>
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
                      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
                        <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                          Group-Wise Financial & Membership Breakdown
                        </h5>
                        <span className="text-[11px] sm:text-xs text-slate-500">Enforcing maximum 99 members per group</span>
                      </div>

                      <HorizontalScrollArea ariaLabel="Group-Wise Financial Breakdown">
                        <table className="w-full min-w-[780px] text-left text-xs border-collapse">
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
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    grp.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : grp.status === 'archived'
                                      ? 'bg-slate-200 text-slate-700'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {grp.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </HorizontalScrollArea>
                    </div>

                    {/* Audit Trail Log Preview */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                          Recent Security & Financial Audit Logs
                        </h5>
                        <span className="text-[11px] text-slate-400">Maintained for regulatory compliance</span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto overscroll-contain font-mono text-[11px]">
                        {(overview?.recentLogs || []).map((log) => (
                          <div key={log.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                {log.action}
                              </span>
                              <span className="text-slate-800 break-words">{log.details}</span>
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
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                        <div className="relative flex-1 sm:max-w-md">
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
                      <HorizontalScrollArea ariaLabel="User Management Table">
                        <table className="w-full min-w-[780px] text-left text-xs border-collapse">
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
                                          setNewPasswordValue('');
                                          setConfirmPasswordValue('');
                                          setPasswordModalError(null);
                                          setShowResetPasswordText(false);
                                          setShowPasswordModal(true);
                                        }}
                                        className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-colors"
                                        title="Reset Password"
                                      >
                                        <Key className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setUserPendingDelete(u)}
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
                      </HorizontalScrollArea>
                    </div>
                  </div>
                )}

                {/* TAB 3: GROUP MANAGEMENT */}
                {activeTab === 'groups' && (() => {
                  const archivedCount = groups.filter((g) => g.status === 'archived').length;
                  const visibleGroups = groups.filter((g) => showArchivedGroups || g.status !== 'archived');
                  return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Chit Groups (Max 99 Members Per Group)</h4>
                        <p className="text-xs text-slate-500">Each chit fund cycle operates as an independent group containing up to 99 members.</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {archivedCount > 0 && (
                          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showArchivedGroups}
                              onChange={(e) => setShowArchivedGroups(e.target.checked)}
                              className="accent-[#075C32]"
                            />
                            <span>Show Archived ({archivedCount})</span>
                          </label>
                        )}
                        <button
                          onClick={() => {
                            setGroupSchemeFeedback(null);
                            setShowCreateGroupModal(true);
                          }}
                          className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create New Group</span>
                        </button>
                      </div>
                    </div>

                    {groupActionMsg && (
                      <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        groupActionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {groupActionMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{groupActionMsg.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {visibleGroups.map((grp) => {
                        const isArchived = grp.status === 'archived';
                        const hasFinancialRefs = Boolean(
                          grp.has_financial_records ||
                          (grp.member_count || 0) > 0 ||
                          (grp.payment_count || 0) > 0
                        );
                        return (
                        <div
                          key={grp.id}
                          className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 ${
                            isArchived ? 'bg-slate-50 border-slate-300 opacity-85' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#E5F2E8] text-[#075C32] border border-[#12834B]/30">
                                {grp.id}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {grp.scheme_version && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                                    v{grp.scheme_version}
                                  </span>
                                )}
                                {isArchived ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-slate-200 text-slate-700 border-slate-300">
                                    ARCHIVED
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleToggleGroupStatus(grp)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer border ${
                                      grp.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}
                                    title="Click to toggle group status"
                                  >
                                    {grp.status}
                                  </button>
                                )}
                              </div>
                            </div>
                            <h5 className="font-bold text-base text-slate-900">{grp.name}</h5>
                            <span className="text-xs font-semibold text-[#075C32] block">{grp.scheme_name}</span>
                            {isArchived && (
                              <span className="text-[10px] text-slate-500 italic block mt-1">
                                Archived — new member assignments &amp; payment generation locked; historical records preserved.
                              </span>
                            )}
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

                          <div className="flex items-center justify-between pt-2 gap-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleViewGroupMembers(grp)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                              >
                                <Users className="w-3.5 h-3.5 text-[#075C32]" />
                                <span>Members ({grp.member_count || 0})</span>
                              </button>
                              <button
                                onClick={() => {
                                  setGroupSchemeFeedback(null);
                                  setEditGroupForm({
                                    id: grp.id,
                                    name: grp.name,
                                    scheme_id: grp.scheme_id || '',
                                    scheme_name: grp.scheme_name,
                                    chit_value: grp.chit_value,
                                    duration_months: grp.duration_months || 20,
                                    start_date: grp.start_date,
                                    status: grp.status
                                  });
                                  setShowEditGroupModal(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer"
                                title="Edit Group"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {!isArchived && (
                                <button
                                  onClick={() => setGroupPendingDelete(grp)}
                                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title={hasFinancialRefs ? 'Safely Archive Group (preserves records)' : 'Delete Group'}
                                  aria-label={`Delete or archive group ${grp.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Started: {grp.start_date}
                            </span>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })()}

                {/* TAB 3B: SCHEME MANAGEMENT */}
                {activeTab === 'schemes' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {isTa ? 'சீட்டு திட்ட மேலாண்மை & கால அளவு கட்டுப்பாடு' : 'Chit Fund Scheme Management & Custom Durations'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Create, modify, or toggle schemes (e.g. ₹1L, ₹2L, ₹5L, ₹10L or custom values & durations). Running batches retain snapshot terms safely.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSchemeModalError(null);
                          setShowCreateSchemeModal(true);
                        }}
                        className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create New Scheme</span>
                      </button>
                    </div>

                    {schemeActionMsg && (
                      <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        schemeActionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {schemeActionMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{schemeActionMsg.text}</span>
                      </div>
                    )}

                    {loadingSchemes && schemes.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                        Loading schemes...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {schemes.map((scheme) => (
                          <div key={scheme.id} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#E5F2E8] text-[#075C32] border border-[#12834B]/30">
                                    {scheme.schemeCode || scheme.id}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                                    v{scheme.version || 1}
                                  </span>
                                </div>

                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                  (scheme.status || 'active') === 'active'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : scheme.status === 'archived'
                                    ? 'bg-slate-200 text-slate-700 border-slate-300'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {scheme.status || 'active'}
                                </span>
                              </div>

                              <h5 className="font-bold text-base text-slate-900">{scheme.nameEn}</h5>
                              <span className="text-xs text-slate-500 block">{scheme.nameTa}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div>
                                <span className="text-[10px] text-slate-500 block">Chit Value</span>
                                <span className="font-mono font-black text-slate-900">{scheme.chitValueFormatted}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">Duration Cycle</span>
                                <span className="font-bold text-[#075C32]">{scheme.durationMonths} Months</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">Instalment Range</span>
                                <span className="font-mono font-semibold text-slate-800">
                                  ₹{scheme.minInstalment.toLocaleString('en-IN')} – ₹{scheme.maxInstalment.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">Prompt + Last Bonus</span>
                                <span className="font-mono font-semibold text-amber-700">
                                  ₹{scheme.totalBonus.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="col-span-2 pt-1 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Active Running Batches:</span>
                                <span className="font-bold text-slate-800">{scheme.runningGroupsCount || 0} Groups</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSchemeModalError(null);
                                    setSchemeImpactWarning(null);
                                    setEditSchemeForm({
                                      id: scheme.id,
                                      schemeCode: scheme.schemeCode || '',
                                      nameEn: scheme.nameEn,
                                      nameTa: scheme.nameTa,
                                      chitValue: String(scheme.chitValue),
                                      durationMonths: scheme.durationMonths,
                                      customDuration: ![10, 12, 15, 20, 24].includes(scheme.durationMonths) ? String(scheme.durationMonths) : '',
                                      promptBonus: String(scheme.promptBonus),
                                      lastMonthBonus: String(scheme.lastMonthBonus),
                                      taglineEn: scheme.taglineEn,
                                      taglineTa: scheme.taglineTa,
                                      status: (scheme.status || 'active') as any,
                                      autoAnnounce: true,
                                      confirm_running_impact: false
                                    });
                                    setShowEditSchemeModal(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  onClick={() => handleToggleSchemeStatus(scheme)}
                                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                                    (scheme.status || 'active') === 'active'
                                      ? 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
                                      : 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                                  }`}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                  <span>{(scheme.status || 'active') === 'active' ? 'Deactivate' : 'Activate'}</span>
                                </button>

                                <button
                                  onClick={() => handleViewSchemeVersions(scheme)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                                  title="View Version History"
                                >
                                  <History className="w-3.5 h-3.5 text-[#075C32]" />
                                  <span>Versions</span>
                                </button>
                              </div>

                              <button
                                onClick={() => setSchemePendingDelete(scheme)}
                                className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                title={scheme.isReferenced ? 'Safely archive referenced scheme' : 'Delete unused scheme'}
                              >
                                {scheme.isReferenced ? <Archive className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                                <span>{scheme.isReferenced ? 'Archive' : 'Delete'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: MONTHLY PAYMENT MANAGEMENT */}
                {activeTab === 'payments' && (() => {
                  const selectedConfigGroupObj = groups.find((g) => g.id === configGroup);
                  const selectedConfigMaxMonths = Number(selectedConfigGroupObj?.duration_months) || 20;
                  return (
                  <div className="space-y-6">
                    {/* Variable Monthly Payment Configuration Form */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#075C32]/30 shadow-xs space-y-4">
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
                            onChange={(e) => {
                              const nextGroupId = e.target.value;
                              setConfigGroup(nextGroupId);
                              const grpObj = groups.find((g) => g.id === nextGroupId);
                              const grpMax = Number(grpObj?.duration_months) || 20;
                              if (configMonth > grpMax) {
                                setConfigMonth(grpMax);
                                setConfigMonthLabel(`Month ${grpMax} - ${configYear}`);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                            required
                          >
                            {groups.filter((g) => g.status !== 'archived').map((g) => (
                              <option key={g.id} value={g.id}>{g.name} ({g.id} · {g.duration_months || 20}M)</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Month Cycle (1-{selectedConfigMaxMonths}) *</label>
                          <select
                            value={Math.min(configMonth, selectedConfigMaxMonths)}
                            onChange={(e) => {
                              const m = Number(e.target.value);
                              setConfigMonth(m);
                              setConfigMonthLabel(`Month ${m} - ${configYear}`);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                          >
                            {Array.from({ length: selectedConfigMaxMonths }, (_, i) => i + 1).map((m) => (
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
                        <div className="relative flex-1 min-w-[160px]">
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
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {selectedPaymentIds.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
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
                      <HorizontalScrollArea ariaLabel="Monthly Payments Table">
                        <table className="w-full min-w-[920px] text-left text-xs border-collapse">
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
                      </HorizontalScrollArea>
                    </div>
                  </div>
                  );
                })()}

                {/* TAB 5: PAYMENT HISTORY */}
                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                      <HorizontalScrollArea ariaLabel="Comprehensive Payment History">
                        <table className="w-full min-w-[920px] text-left text-xs border-collapse">
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
                      </HorizontalScrollArea>
                    </div>
                  </div>
                )}

                {/* TAB 6: NEWS & ANNOUNCEMENTS */}
                {activeTab === 'announcements' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Company News & Notices Management</h4>
                        <p className="text-xs text-slate-500">Publish monthly auction dates, bonus reminders, and office announcements directly to member dashboards.</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showArchivedAnnouncements}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setShowArchivedAnnouncements(checked);
                              fetchAnnouncements(checked);
                            }}
                            className="accent-[#075C32]"
                          />
                          <span>Show Archived</span>
                        </label>

                        <button
                          onClick={() => setShowCreateAnnModal(true)}
                          className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Publish New Announcement</span>
                        </button>
                      </div>
                    </div>

                    {annActionMsg && (
                      <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        annActionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {annActionMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{annActionMsg.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {announcements.map((ann) => {
                        const targetDisplay =
                          ann.target_type === 'group' || (ann.target_group_id && ann.target_group_id !== 'all')
                            ? `Group: ${ann.target_group_name || ann.target_group_id}`
                            : ann.target_type === 'scheme'
                            ? `Scheme: ${ann.target_scheme_name || ann.target_scheme_id}`
                            : 'All Members';
                        return (
                          <div key={ann.id} className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-3 flex flex-col justify-between ${
                            ann.is_archived ? 'bg-slate-50 border-slate-300 opacity-80' : 'bg-white border-slate-200'
                          }`}>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                    {ann.category}
                                  </span>
                                  {ann.is_auto_generated && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E5F2E8] text-[#075C32] border border-[#12834B]/20">
                                      Auto Notice
                                    </span>
                                  )}
                                  {ann.is_archived && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                                      Archived
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {new Date(ann.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <h5 className="font-bold text-base text-slate-900">{ann.title}</h5>
                              <p className="text-xs text-slate-600 leading-relaxed">{ann.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                              <span className="text-slate-500 text-[11px]">Target: {targetDisplay}</span>
                              {!ann.is_archived && (
                                <button
                                  onClick={() => setAnnPendingDelete(ann)}
                                  className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
                      <div className="p-3.5 sm:p-4 bg-rose-50/70 border-b border-rose-200 flex flex-wrap items-center justify-between gap-2">
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

                      <HorizontalScrollArea ariaLabel="Pending Cash Follow-up List">
                        <table className="w-full min-w-[740px] text-left text-xs border-collapse">
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
                      </HorizontalScrollArea>
                    </div>

                    {/* Monthly Collection Summary */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                          Monthly Collection Totals (Paid vs Pending)
                        </h5>
                      </div>

                      <HorizontalScrollArea ariaLabel="Monthly Collection Totals">
                        <table className="w-full min-w-[640px] text-left text-xs border-collapse">
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
                      </HorizontalScrollArea>
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

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={filterScheme}
                          onChange={(e) => setFilterScheme(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        >
                          <option value="all">{t.admin.allSchemes}</option>
                          <option value="1,00,000">₹1,00,000 Scheme</option>
                          <option value="2,00,000">₹2,00,000 Scheme</option>
                          <option value="5,00,000">₹5,00,000 Scheme</option>
                          <option value="10,00,000">₹10,00,000 Scheme</option>
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
                      <HorizontalScrollArea ariaLabel="Customer Enquiries Table">
                        <table className="w-full min-w-[740px] text-left text-xs border-collapse">
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
                      </HorizontalScrollArea>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* MODAL: CREATE USER */}
        {showCreateUserModal && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    {groups.filter((g) => g.status !== 'archived').map((g) => {
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
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
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
                      <option
                        key={g.id}
                        value={g.id}
                        disabled={g.status === 'archived' && editUserForm.group_id !== g.id}
                      >
                        {g.name} ({g.id}){g.status === 'archived' ? ' — ARCHIVED' : ''}
                      </option>
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
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-sm w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">Reset Member Password</h4>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordModalError(null);
                    setNewPasswordValue('');
                    setConfirmPasswordValue('');
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Member Account:</span>
                  <span className="font-bold text-slate-900 block text-sm">{selectedUser.full_name} ({selectedUser.user_id})</span>
                </div>

                {passwordModalError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{passwordModalError}</span>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={showResetPasswordText ? 'text' : 'password'}
                      value={newPasswordValue}
                      onChange={(e) => {
                        setNewPasswordValue(e.target.value);
                        if (passwordModalError) setPasswordModalError(null);
                      }}
                      placeholder="Min 6 chars (letters + numbers)"
                      className="w-full px-3 py-2 pr-9 rounded-lg border border-slate-300 font-mono text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPasswordText((v) => !v)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                      title={showResetPasswordText ? 'Hide password' : 'Show password'}
                    >
                      {showResetPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Confirm New Password *</label>
                  <input
                    type={showResetPasswordText ? 'text' : 'password'}
                    value={confirmPasswordValue}
                    onChange={(e) => {
                      setConfirmPasswordValue(e.target.value);
                      if (passwordModalError) setPasswordModalError(null);
                    }}
                    placeholder="Re-enter new password..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Min 6 characters, at least 1 letter & 1 number, no spaces. Existing member sessions will be revoked immediately.
                  </span>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordModalError(null);
                      setNewPasswordValue('');
                      setConfirmPasswordValue('');
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resettingPassword}
                    className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white font-bold disabled:opacity-60"
                  >
                    {resettingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CONFIRM USER DELETION */}
        {userPendingDelete && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Confirm Member Removal</span>
                </h4>
                <button onClick={() => setUserPendingDelete(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <p>
                  You are removing <strong className="text-slate-900">{userPendingDelete.full_name}</strong>{' '}
                  (<span className="font-mono font-bold text-[#075C32]">{userPendingDelete.user_id}</span>) from active rosters.
                </p>

                {userPendingDelete.has_payments || (userPendingDelete.paid_instalments || 0) + (userPendingDelete.unpaid_instalments || 0) > 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                    <strong>Financial Safeguard Active:</strong> This member has{' '}
                    {(userPendingDelete.paid_instalments || 0) + (userPendingDelete.unpaid_instalments || 0)} recorded instalment(s).
                    The account will be <strong>soft-deleted &amp; deactivated</strong> immediately while preserving all payment receipts and audit history.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 leading-relaxed">
                    This member has no financial payment records. Confirming will permanently delete this user account and revoke any active login sessions.
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setUserPendingDelete(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingUser}
                  onClick={handleConfirmDeleteUser}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-60"
                >
                  {deletingUser
                    ? 'Removing...'
                    : userPendingDelete.has_payments || (userPendingDelete.paid_instalments || 0) + (userPendingDelete.unpaid_instalments || 0) > 0
                    ? 'Deactivate & Preserve Records'
                    : 'Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE GROUP */}
        {showCreateGroupModal && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">Create New Chit Group</h4>
                <button onClick={() => setShowCreateGroupModal(false)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {groupSchemeFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{groupSchemeFeedback}</span>
                </div>
              )}

              <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unique Group ID *</label>
                  <input
                    type="text"
                    value={newGroupForm.id}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, id: e.target.value.toUpperCase() })}
                    placeholder="e.g. GRP-10L-01"
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
                    placeholder="e.g. ₹10 Lakh Scheme - Batch 2026"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <label className="font-bold text-slate-700">Select Chit Scheme *</label>
                    <button
                      type="button"
                      onClick={() => openCustomEditSchemeModal('create-group', newGroupForm.scheme_id)}
                      className="text-[11px] font-bold text-[#075C32] hover:underline cursor-pointer"
                    >
                      Custom Scheme / Edit Scheme
                    </button>
                  </div>
                  <select
                    value={newGroupForm.scheme_id}
                    onChange={(e) => {
                      const pickedId = e.target.value;
                      if (pickedId === '__custom_edit__') {
                        openCustomEditSchemeModal('create-group', newGroupForm.scheme_id);
                        return;
                      }
                      const found = schemes.find((s) => s.id === pickedId);
                      if (found) {
                        setNewGroupForm({
                          ...newGroupForm,
                          scheme_id: found.id,
                          scheme_name: found.nameEn || `${found.chitValueFormatted} Scheme`,
                          chit_value: found.chitValue,
                          duration_months: found.durationMonths
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {schemes.filter((s) => (s.status || 'active') === 'active').length === 0 ? (
                      <>
                        <option value="scheme-1-lakh">₹1,00,000 Scheme (20 Months)</option>
                        <option value="scheme-2-lakh">₹2,00,000 Scheme (20 Months)</option>
                        <option value="scheme-5-lakh">₹5,00,000 Scheme (20 Months)</option>
                        <option value="scheme-10-lakh">₹10,00,000 Scheme (20 Months)</option>
                      </>
                    ) : (
                      schemes
                        .filter((s) => (s.status || 'active') === 'active')
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.chitValueFormatted} — {s.nameEn} ({s.durationMonths}M)
                          </option>
                        ))
                    )}
                    <option value="__custom_edit__">+ Custom Scheme / Edit Scheme...</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Chit Value (₹)</label>
                    <input
                      type="number"
                      value={newGroupForm.chit_value}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, chit_value: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Duration (Months) *</label>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={newGroupForm.duration_months}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, duration_months: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Capacity</label>
                    <input
                      type="text"
                      value="99 Members"
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

        {/* MODAL: EDIT GROUP */}
        {showEditGroupModal && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">Edit Chit Group ({editGroupForm.id})</h4>
                <button onClick={() => setShowEditGroupModal(false)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {groupSchemeFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{groupSchemeFeedback}</span>
                </div>
              )}

              <form onSubmit={handleEditGroup} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Group Name *</label>
                  <input
                    type="text"
                    value={editGroupForm.name}
                    onChange={(e) => setEditGroupForm({ ...editGroupForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <label className="font-bold text-slate-700">Select Chit Scheme</label>
                    <button
                      type="button"
                      onClick={() => openCustomEditSchemeModal('edit-group', editGroupForm.scheme_id)}
                      className="text-[11px] font-bold text-[#075C32] hover:underline cursor-pointer"
                    >
                      Custom Scheme / Edit Scheme
                    </button>
                  </div>
                  <select
                    value={editGroupForm.scheme_id}
                    onChange={(e) => {
                      const pickedId = e.target.value;
                      if (pickedId === '__custom_edit__') {
                        openCustomEditSchemeModal('edit-group', editGroupForm.scheme_id);
                        return;
                      }
                      const found = schemes.find((s) => s.id === pickedId);
                      if (found) {
                        setEditGroupForm({
                          ...editGroupForm,
                          scheme_id: found.id,
                          scheme_name: found.nameEn || `${found.chitValueFormatted} Scheme`,
                          chit_value: found.chitValue,
                          duration_months: found.durationMonths
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {!editGroupForm.scheme_id && (
                      <option value="">{editGroupForm.scheme_name} (Current)</option>
                    )}
                    {schemes
                      .filter((s) => (s.status || 'active') === 'active' || s.id === editGroupForm.scheme_id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.chitValueFormatted} — {s.nameEn} ({s.durationMonths}M)
                        </option>
                      ))}
                    <option value="__custom_edit__">+ Custom Scheme / Edit Scheme...</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Duration (Months)</label>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={editGroupForm.duration_months}
                      onChange={(e) => setEditGroupForm({ ...editGroupForm, duration_months: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status</label>
                    <select
                      value={editGroupForm.status}
                      onChange={(e) => setEditGroupForm({ ...editGroupForm, status: e.target.value as 'active' | 'inactive' | 'archived' })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      {editGroupForm.status === 'archived' && <option value="archived">Archived</option>}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editGroupForm.start_date}
                    onChange={(e) => setEditGroupForm({ ...editGroupForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditGroupModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white font-bold"
                  >
                    Save Group Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE SCHEME */}
        {showCreateSchemeModal && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">Create New Chit Scheme</h4>
                <button onClick={() => setShowCreateSchemeModal(false)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateScheme} className="space-y-3 text-xs">
                {schemeModalError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{schemeModalError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Scheme Name (English) *</label>
                    <input
                      type="text"
                      value={newSchemeForm.nameEn}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, nameEn: e.target.value })}
                      placeholder="e.g. ₹3,00,000 Chit Scheme"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Scheme Name (Tamil)</label>
                    <input
                      type="text"
                      value={newSchemeForm.nameTa}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, nameTa: e.target.value })}
                      placeholder="e.g. ₹3,00,000 சீட்டு திட்டம்"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Chit Value (₹) *</label>
                    <input
                      type="number"
                      min={10000}
                      value={newSchemeForm.chitValue}
                      onChange={(e) => {
                        const v = Number(e.target.value) || 0;
                        setNewSchemeForm({
                          ...newSchemeForm,
                          chitValue: e.target.value,
                          promptBonus: String(Math.round(v * 0.02)),
                          lastMonthBonus: String(Math.round(v * 0.004))
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Scheme Code (Optional)</label>
                    <input
                      type="text"
                      value={newSchemeForm.schemeCode}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, schemeCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. TSC-3L-15M"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Months) — Preset or Custom (2–60)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[10, 12, 15, 20, 24].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setNewSchemeForm({ ...newSchemeForm, durationMonths: d, customDuration: '' })}
                        className={`px-2.5 py-1 rounded border text-xs font-bold cursor-pointer ${
                          !newSchemeForm.customDuration && newSchemeForm.durationMonths === d
                            ? 'bg-[#075C32] text-white border-[#075C32]'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        {d} Months
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={2}
                    max={60}
                    value={newSchemeForm.customDuration}
                    onChange={(e) => setNewSchemeForm({ ...newSchemeForm, customDuration: e.target.value })}
                    placeholder="Or enter custom months (e.g. 18, 30, 36)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Prompt Bonus (₹)</label>
                    <input
                      type="number"
                      value={newSchemeForm.promptBonus}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, promptBonus: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Last Month Bonus (₹)</label>
                    <input
                      type="number"
                      value={newSchemeForm.lastMonthBonus}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, lastMonthBonus: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status</label>
                    <select
                      value={newSchemeForm.status}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Scheme Description (English)</label>
                    <textarea
                      rows={2}
                      value={newSchemeForm.taglineEn}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, taglineEn: e.target.value })}
                      placeholder="Short overview of benefits & target savers..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Scheme Description (Tamil)</label>
                    <textarea
                      rows={2}
                      value={newSchemeForm.taglineTa}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, taglineTa: e.target.value })}
                      placeholder="திட்ட விவரம் (தமிழில்)..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSchemeForm.autoAnnounce}
                    onChange={(e) => setNewSchemeForm({ ...newSchemeForm, autoAnnounce: e.target.checked })}
                    className="accent-[#075C32]"
                  />
                  <span className="text-slate-700 font-semibold">
                    Auto-publish member announcement when scheme is saved active
                  </span>
                </label>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateSchemeModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white font-bold"
                  >
                    Create Scheme
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT SCHEME */}
        {showEditSchemeModal && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">Edit Scheme ({editSchemeForm.schemeCode || editSchemeForm.id})</h4>
                <button onClick={() => setShowEditSchemeModal(false)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditScheme} className="space-y-3 text-xs">
                {schemeModalError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{schemeModalError}</span>
                  </div>
                )}

                {schemeImpactWarning && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{schemeImpactWarning}</span>
                    </div>
                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editSchemeForm.confirm_running_impact}
                        onChange={(e) => setEditSchemeForm({ ...editSchemeForm, confirm_running_impact: e.target.checked })}
                        className="accent-[#075C32]"
                      />
                      <span>Confirm versioning &amp; preserve historical snapshots for running groups</span>
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Scheme Name (English) *</label>
                    <input
                      type="text"
                      value={editSchemeForm.nameEn}
                      onChange={(e) => setEditSchemeForm({ ...editSchemeForm, nameEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Scheme Name (Tamil)</label>
                    <input
                      type="text"
                      value={editSchemeForm.nameTa}
                      onChange={(e) => setEditSchemeForm({ ...editSchemeForm, nameTa: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Chit Value (₹) *</label>
                    <input
                      type="number"
                      min={10000}
                      value={editSchemeForm.chitValue}
                      onChange={(e) => setEditSchemeForm({ ...editSchemeForm, chitValue: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status</label>
                    <select
                      value={editSchemeForm.status}
                      onChange={(e) => setEditSchemeForm({ ...editSchemeForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Months) — Preset or Custom (2–60)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[10, 12, 15, 20, 24].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setEditSchemeForm({ ...editSchemeForm, durationMonths: d, customDuration: '' })}
                        className={`px-2.5 py-1 rounded border text-xs font-bold cursor-pointer ${
                          !editSchemeForm.customDuration && editSchemeForm.durationMonths === d
                            ? 'bg-[#075C32] text-white border-[#075C32]'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        {d} Months
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={2}
                    max={60}
                    value={editSchemeForm.customDuration}
                    onChange={(e) => setEditSchemeForm({ ...editSchemeForm, customDuration: e.target.value })}
                    placeholder="Or custom months (2–60)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Prompt Bonus (₹)</label>
                    <input
                      type="number"
                      value={editSchemeForm.promptBonus}
                      onChange={(e) => setEditSchemeForm({ ...editSchemeForm, promptBonus: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Last Month Bonus (₹)</label>
                    <input
                      type="number"
                      value={editSchemeForm.lastMonthBonus}
                      onChange={(e) => setEditSchemeForm({ ...editSchemeForm, lastMonthBonus: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Scheme Description (English)</label>
                    <textarea
                      rows={2}
                      value={editSchemeForm.taglineEn}
                      onChange={(e) => setEditSchemeForm({ ...editSchemeForm, taglineEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Scheme Description (Tamil)</label>
                    <textarea
                      rows={2}
                      value={editSchemeForm.taglineTa}
                      onChange={(e) => setEditSchemeForm({ ...editSchemeForm, taglineTa: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditSchemeModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white font-bold"
                  >
                    {schemeImpactWarning ? 'Confirm & Save New Version' : 'Save Scheme Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SCHEME VERSION HISTORY */}
        {showSchemeVersionsModal && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-xl w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] sm:max-h-[82vh] flex flex-col">
              <div className="flex items-center justify-between border-b pb-3 gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-base text-slate-900">Scheme Version History</h4>
                  <span className="text-xs text-slate-500 block truncate">{selectedSchemeVersionsTitle}</span>
                </div>
                <button onClick={() => setShowSchemeVersionsModal(false)} className="p-1 rounded text-slate-400 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto overscroll-contain flex-1 space-y-2.5 text-xs">
                {schemeVersions.length === 0 ? (
                  <p className="text-center py-8 text-slate-400">No historical version snapshots recorded yet.</p>
                ) : (
                  schemeVersions.map((ver) => (
                    <div key={ver.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-[#E5F2E8] text-[#075C32] font-mono font-bold">
                          v{ver.version}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(ver.created_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900">
                        {ver.name_en} — ₹{Number(ver.chit_value).toLocaleString('en-IN')} ({ver.duration_months} Months)
                      </div>
                      <div className="text-slate-600">{ver.change_reason || 'Snapshot saved'} · By {ver.created_by}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 flex justify-end border-t">
                <button
                  onClick={() => setShowSchemeVersionsModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CONFIRM SCHEME DELETE / ARCHIVE */}
        {schemePendingDelete && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>{schemePendingDelete.isReferenced ? 'Confirm Scheme Archival' : 'Confirm Scheme Deletion'}</span>
                </h4>
                <button onClick={() => setSchemePendingDelete(null)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <p>
                  Selected scheme: <strong className="text-slate-900">{schemePendingDelete.nameEn}</strong>
                </p>
                {schemePendingDelete.isReferenced ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    This scheme is referenced by existing chit groups. To protect financial records, it will be safely <strong>archived</strong> instead of permanently deleted.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                    This scheme has no linked groups and will be permanently deleted.
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSchemePendingDelete(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteScheme}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {schemePendingDelete.isReferenced ? 'Archive Scheme' : 'Delete Scheme'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW GROUP MEMBERS */}
        {showGroupMembersModal && selectedGroupForMembers && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-2xl w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] sm:max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b pb-3 gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-base text-slate-900 truncate">{selectedGroupForMembers.name}</h4>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-mono block truncate">
                    Group ID: {selectedGroupForMembers.id} · Enrolled: {groupMembersList.length} / 99 Members
                  </span>
                </div>
                <button onClick={() => setShowGroupMembersModal(false)} className="p-1 rounded text-slate-400 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto overscroll-contain flex-1">
                {groupMembersList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No members enrolled in this group yet. Go to User Management to add members.
                  </div>
                ) : (
                  <HorizontalScrollArea ariaLabel="Group Enrolled Members">
                    <table className="w-full min-w-[540px] text-left text-xs border-collapse">
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
                  </HorizontalScrollArea>
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
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      <option value="Scheme Update">Scheme Update</option>
                      <option value="Group Update">Group Update</option>
                      <option value="Important">Important</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                    <select
                      value={newAnnForm.target_type}
                      onChange={(e) => {
                        const tt = e.target.value as 'all' | 'group' | 'scheme';
                        setNewAnnForm({
                          ...newAnnForm,
                          target_type: tt,
                          target_group_id: tt === 'group' ? (groups[0]?.id || 'all') : 'all',
                          target_scheme_id: tt === 'scheme' ? (schemes[0]?.id || '') : ''
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="all">All Members</option>
                      <option value="group">Specific Group</option>
                      <option value="scheme">Specific Scheme</option>
                    </select>
                  </div>
                </div>

                {newAnnForm.target_type === 'group' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Select Target Group</label>
                    <select
                      value={newAnnForm.target_group_id}
                      onChange={(e) => setNewAnnForm({ ...newAnnForm, target_group_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name} ({g.id})</option>
                      ))}
                    </select>
                  </div>
                )}

                {newAnnForm.target_type === 'scheme' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Select Target Scheme</label>
                    <select
                      value={newAnnForm.target_scheme_id}
                      onChange={(e) => setNewAnnForm({ ...newAnnForm, target_scheme_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {schemes.map((s) => (
                        <option key={s.id} value={s.id}>{s.nameEn}</option>
                      ))}
                    </select>
                  </div>
                )}

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

        {/* MODAL: CONFIRM ANNOUNCEMENT DELETE / ARCHIVE */}
        {annPendingDelete && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Confirm Notice Removal</span>
                </h4>
                <button onClick={() => setAnnPendingDelete(null)} className="p-1 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <p>
                  Remove announcement: <strong className="text-slate-900">&ldquo;{annPendingDelete.title}&rdquo;</strong>
                </p>
                <p className="text-slate-500">
                  Historical (&gt;7 days) or auto-generated notices are archived safely and immediately hidden from all member portals; recent manual notices are deleted cleanly.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAnnPendingDelete(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingAnn}
                  onClick={handleConfirmDeleteAnnouncement}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-60"
                >
                  {deletingAnn ? 'Removing...' : 'Confirm Remove'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CUSTOMER ENQUIRY DETAILS (PRESERVED) */}
        {selectedEnquiry && (
          <div className="fixed inset-0 z-60 overflow-hidden bg-black/40 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-base text-slate-900">{t.admin.detailsModalTitle}</h4>
                <button onClick={() => setSelectedEnquiry(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex flex-wrap justify-between gap-2 py-1 border-b">
                  <span className="font-semibold text-slate-500">Name:</span>
                  <span className="font-bold text-slate-900">{selectedEnquiry.full_name}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-1 border-b">
                  <span className="font-semibold text-slate-500">Mobile:</span>
                  <a href={`tel:${selectedEnquiry.mobile_number}`} className="font-mono font-bold text-[#075C32]">
                    +91 {selectedEnquiry.mobile_number}
                  </a>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-1 border-b">
                  <span className="font-semibold text-slate-500">Email:</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="text-slate-900 break-all">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-1 border-b">
                  <span className="font-semibold text-slate-500">{t.admin.cityDistrict}:</span>
                  <span>{selectedEnquiry.city}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-1 border-b">
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

        {/* MODAL: CUSTOM SCHEME / EDIT SCHEME (Opened from Group "Select Chit Scheme") */}
        {showCustomEditSchemeModal && (
          <div className="fixed inset-0 z-70 overflow-hidden bg-black/55 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col">
              <div className="bg-[#075C32] text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2 shrink-0">
                <div className="min-w-0">
                  <h4 className="font-bold text-sm sm:text-base truncate">Custom Scheme / Edit Scheme</h4>
                  <span className="text-[11px] text-white/80 block">
                    Create a new custom chit scheme or modify an existing scheme without affecting historical groups.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomEditSchemeModal(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4 text-xs">
                {/* Create vs Edit Switcher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSchemeMode('create');
                      setCustomSchemeError(null);
                      setCustomSchemeImpactWarning(null);
                      setCustomSchemeForm({
                        id: '',
                        schemeCode: '',
                        nameEn: '',
                        nameTa: '',
                        chitValue: '300000',
                        durationMonths: 20,
                        customDuration: '',
                        promptBonus: '6000',
                        lastMonthBonus: '1200',
                        taglineEn: '',
                        taglineTa: '',
                        status: 'active',
                        autoAnnounce: true,
                        confirm_running_impact: false
                      });
                    }}
                    className={`py-2 px-3 rounded-lg font-bold transition-colors cursor-pointer ${
                      customSchemeMode === 'create'
                        ? 'bg-[#075C32] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    + Create New Custom Scheme
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSchemeMode('edit');
                      setCustomSchemeError(null);
                      setCustomSchemeImpactWarning(null);
                      const preselectedId =
                        customSchemeOrigin === 'edit-group' ? editGroupForm.scheme_id : newGroupForm.scheme_id;
                      const match = schemes.find((s) => s.id === preselectedId) || schemes[0];
                      if (match) populateCustomEditFromScheme(match);
                    }}
                    className={`py-2 px-3 rounded-lg font-bold transition-colors cursor-pointer ${
                      customSchemeMode === 'edit'
                        ? 'bg-[#075C32] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    Edit Existing Scheme
                  </button>
                </div>

                <form onSubmit={handleSaveCustomOrEditScheme} className="space-y-3">
                  {customSchemeError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{customSchemeError}</span>
                    </div>
                  )}

                  {customSchemeImpactWarning && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{customSchemeImpactWarning}</span>
                      </div>
                      <label className="flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customSchemeForm.confirm_running_impact}
                          onChange={(e) =>
                            setCustomSchemeForm({ ...customSchemeForm, confirm_running_impact: e.target.checked })
                          }
                          className="accent-[#075C32]"
                        />
                        <span>Confirm changes — preserve historical terms for existing running groups</span>
                      </label>
                    </div>
                  )}

                  {customSchemeMode === 'edit' && (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Select Existing Scheme to Edit *</label>
                      <select
                        value={customSchemeForm.id}
                        onChange={(e) => {
                          const target = schemes.find((s) => s.id === e.target.value);
                          if (target) {
                            setCustomSchemeImpactWarning(null);
                            setCustomSchemeError(null);
                            populateCustomEditFromScheme(target);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                      >
                        {schemes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.chitValueFormatted} — {s.nameEn} ({s.durationMonths}M · {s.status || 'active'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Scheme Name *</label>
                      <input
                        type="text"
                        value={customSchemeForm.nameEn}
                        onChange={(e) => setCustomSchemeForm({ ...customSchemeForm, nameEn: e.target.value })}
                        placeholder="e.g. ₹3,00,000 Chit Scheme"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Scheme Name (Tamil)</label>
                      <input
                        type="text"
                        value={customSchemeForm.nameTa}
                        onChange={(e) => setCustomSchemeForm({ ...customSchemeForm, nameTa: e.target.value })}
                        placeholder="e.g. ₹3,00,000 சீட்டு திட்டம்"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Scheme Amount (₹) *</label>
                      <input
                        type="number"
                        min={10000}
                        step={1000}
                        value={customSchemeForm.chitValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = Number(val) || 0;
                          setCustomSchemeForm({
                            ...customSchemeForm,
                            chitValue: val,
                            ...(customSchemeMode === 'create'
                              ? {
                                  promptBonus: String(Math.round(num * 0.02)),
                                  lastMonthBonus: String(Math.round(num * 0.004))
                                }
                              : {})
                          });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Scheme Code</label>
                      <input
                        type="text"
                        value={customSchemeForm.schemeCode}
                        onChange={(e) =>
                          setCustomSchemeForm({ ...customSchemeForm, schemeCode: e.target.value.toUpperCase() })
                        }
                        placeholder="Auto if empty"
                        disabled={customSchemeMode === 'edit'}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Scheme Status *</label>
                      <select
                        value={customSchemeForm.status}
                        onChange={(e) => setCustomSchemeForm({ ...customSchemeForm, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive (Deactivated)</option>
                        {customSchemeMode === 'edit' && <option value="archived">Archived</option>}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Scheme Duration / Number of Months * (Select preset or enter 2–60)
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[10, 12, 15, 20, 24].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() =>
                            setCustomSchemeForm({ ...customSchemeForm, durationMonths: d, customDuration: '' })
                          }
                          className={`px-2.5 py-1 rounded border text-xs font-bold cursor-pointer ${
                            !customSchemeForm.customDuration && customSchemeForm.durationMonths === d
                              ? 'bg-[#075C32] text-white border-[#075C32]'
                              : 'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          {d} Months
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={customSchemeForm.customDuration}
                      onChange={(e) => setCustomSchemeForm({ ...customSchemeForm, customDuration: e.target.value })}
                      placeholder={`Custom number of months (currently ${customSchemeForm.customDuration || customSchemeForm.durationMonths}M)`}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Scheme Description (English)</label>
                      <textarea
                        rows={2}
                        value={customSchemeForm.taglineEn}
                        onChange={(e) => setCustomSchemeForm({ ...customSchemeForm, taglineEn: e.target.value })}
                        placeholder="Describe who this chit fund plan is designed for..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Scheme Description (Tamil)</label>
                      <textarea
                        rows={2}
                        value={customSchemeForm.taglineTa}
                        onChange={(e) => setCustomSchemeForm({ ...customSchemeForm, taglineTa: e.target.value })}
                        placeholder="திட்ட விளக்கம் (தமிழில்)..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Prompt Payment Bonus (₹)</label>
                      <input
                        type="number"
                        value={customSchemeForm.promptBonus}
                        onChange={(e) => setCustomSchemeForm({ ...customSchemeForm, promptBonus: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Last Month Bonus (₹)</label>
                      <input
                        type="number"
                        value={customSchemeForm.lastMonthBonus}
                        onChange={(e) => setCustomSchemeForm({ ...customSchemeForm, lastMonthBonus: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customSchemeForm.autoAnnounce}
                      onChange={(e) => setCustomSchemeForm({ ...customSchemeForm, autoAnnounce: e.target.checked })}
                      className="accent-[#075C32]"
                    />
                    <span className="text-slate-700 font-semibold">
                      Auto-publish scheme announcement when saved
                    </span>
                  </label>

                  <div className="pt-3 border-t flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomEditSchemeModal(false)}
                      className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingCustomScheme}
                      className="px-4 py-2 rounded-lg bg-[#075C32] hover:bg-[#12834B] text-white font-bold disabled:opacity-60"
                    >
                      {savingCustomScheme
                        ? 'Saving...'
                        : customSchemeImpactWarning
                        ? 'Confirm & Save New Version'
                        : customSchemeMode === 'create'
                        ? 'Create & Use Scheme'
                        : 'Save Scheme Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CONFIRM GROUP DELETE / ARCHIVE */}
        {groupPendingDelete && (
          <div className="fixed inset-0 z-70 overflow-hidden bg-black/55 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between border-b pb-3 gap-2">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 ${
                      groupPendingDelete.has_financial_records ||
                      (groupPendingDelete.member_count || 0) > 0 ||
                      (groupPendingDelete.payment_count || 0) > 0
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  />
                  <span>
                    {groupPendingDelete.has_financial_records ||
                    (groupPendingDelete.member_count || 0) > 0 ||
                    (groupPendingDelete.payment_count || 0) > 0
                      ? 'Confirm Group Archival'
                      : 'Confirm Group Deletion'}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setGroupPendingDelete(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-700 space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-500 font-semibold">Group ID:</span>
                    <span className="font-mono font-bold text-[#075C32]">{groupPendingDelete.id}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-500 font-semibold">Group Name:</span>
                    <span className="font-bold text-slate-900 text-right">{groupPendingDelete.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-500 font-semibold">Members / Payments:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {groupPendingDelete.total_user_count ?? groupPendingDelete.member_count ?? 0} member(s) ·{' '}
                      {groupPendingDelete.payment_count ?? 0} payment(s)
                    </span>
                  </div>
                </div>

                {groupPendingDelete.has_financial_records ||
                (groupPendingDelete.member_count || 0) > 0 ||
                (groupPendingDelete.payment_count || 0) > 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 leading-relaxed">
                    <strong>Financial Data Protection:</strong> This group contains existing members or payment/instalment records.
                    Confirming will <strong>safely archive</strong> the group instead of permanently deleting it—all member accounts and financial history remain preserved, while preventing new assignments.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 leading-relaxed">
                    This group has zero assigned members and no financial payment records. Confirming will permanently remove this group.
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-wrap justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setGroupPendingDelete(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingGroup}
                  onClick={handleConfirmDeleteGroup}
                  className={`px-4 py-2 rounded-lg text-white font-bold disabled:opacity-60 ${
                    groupPendingDelete.has_financial_records ||
                    (groupPendingDelete.member_count || 0) > 0 ||
                    (groupPendingDelete.payment_count || 0) > 0
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {deletingGroup
                    ? 'Processing...'
                    : groupPendingDelete.has_financial_records ||
                      (groupPendingDelete.member_count || 0) > 0 ||
                      (groupPendingDelete.payment_count || 0) > 0
                    ? 'Safely Archive Group'
                    : 'Permanently Delete Group'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
