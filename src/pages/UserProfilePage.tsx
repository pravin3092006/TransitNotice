import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Bus,
  Train,
  Mail,
  Phone,
  MapPin,
  Bell,
  Building2,
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  RotateCw,
  X,
  Smartphone,
  Save,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface UserProfilePageProps {
  onSelectUser?: (user: UserProfile) => void;
  onNavigateTab?: (tab: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onSelectUser, onNavigateTab }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonaFilter, setSelectedPersonaFilter] = useState<string>('ALL');
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    persona: 'PASSENGER' as 'PASSENGER' | 'OPERATIONS_MONITOR' | 'STUDENT_COMMUTER' | 'FIELD_INSPECTOR',
    role_title: 'Chennai Commuter',
    home_station: 'Kilambakkam (KCBT)',
    work_station: 'Chennai Central',
    preferred_agencies: ['MTC', 'CMRL'] as string[],
    preferred_routes: ['21G', 'Blue-Line'] as string[],
    alert_channels: ['IN_APP', 'EMAIL'] as string[],
    notification_frequency: 'REALTIME' as 'REALTIME' | 'DAILY_DIGEST' | 'CRITICAL_ONLY',
    bio: '',
    customRouteInput: ''
  });

  const availableAgencies = [
    { id: 'MTC', name: 'MTC Chennai', desc: 'Metropolitan City Buses' },
    { id: 'CMRL', name: 'CMRL Metro', desc: 'Chennai Metro Rail' },
    { id: 'TNSTC', name: 'TNSTC Bus', desc: 'Inter-district Mofussil Fleets' },
    { id: 'CUMTA', name: 'CUMTA', desc: 'Unified Mobility Authority' },
    { id: 'TNTD', name: 'TN Transport Dept', desc: 'State Regulatory Commission' },
    { id: 'SR', name: 'Southern Railway', desc: 'Suburban EMU & MRTS Trains' },
    { id: 'SETC', name: 'SETC Express', desc: 'Interstate AC Sleeper & Luxury' },
    { id: 'GCTP', name: 'Traffic Police', desc: 'City Traffic Advisories & Road Works' },
    { id: 'CMDA', name: 'CMDA Terminals', desc: 'KCBT Kilambakkam & MMBS Hubs' }
  ];

  const suggestedRoutes = [
    { id: '21G', label: '21G (Broadway - KCBT)' },
    { id: '70V', label: '70V (Koyambedu - KCBT)' },
    { id: 'M1', label: 'M1 (Thiruvanmiyur - KCBT)' },
    { id: '570', label: '570 (Koyambedu - Siruseri OMR)' },
    { id: '102', label: '102 (Broadway - Kelambakkam)' },
    { id: 'Blue-Line', label: 'CMRL Blue Line (Airport - Central)' },
    { id: 'Green-Line', label: 'CMRL Green Line (Central - St. Thomas Mount)' },
    { id: 'SR-SUBURBAN', label: 'SR Suburban EMU (Beach - Tambaram - Chengalpattu)' },
    { id: 'SR-MRTS', label: 'SR MRTS Line (Beach - Chintadripet - Velachery)' },
    { id: 'SETC-SOUTH', label: 'SETC Interstate Sleeper (KCBT to South)' },
    { id: '54', label: '54 (Broadway - Poonamallee)' },
    { id: '29C', label: '29C (Besant Nagar - Perambur)' }
  ];

  const hubOptions = [
    'Kilambakkam (KCBT)',
    'Tambaram Sanatorium',
    'Chennai Central',
    'Koyambedu (CMBT)',
    'Airport Metro',
    'Guindy Industrial Estate',
    'Tidel Park, OMR',
    'Sholinganallur Junction',
    'Broadway Terminus',
    'IIT Madras / Adyar'
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(res.users);
      const active = res.users.find((u) => u.is_active === 1) || res.users[0] || null;
      setActiveUser(active);
    } catch (err) {
      console.error('Failed to load user profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      phone: '+91 ',
      persona: 'PASSENGER',
      role_title: 'Chennai Commuter',
      home_station: 'Kilambakkam (KCBT)',
      work_station: 'Tidel Park, OMR',
      preferred_agencies: ['MTC', 'CMRL'],
      preferred_routes: ['21G', 'Blue-Line'],
      alert_channels: ['IN_APP', 'EMAIL'],
      notification_frequency: 'REALTIME',
      bio: '',
      customRouteInput: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setModalMode('edit');
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      persona: user.persona,
      role_title: user.role_title || 'Chennai Commuter',
      home_station: user.home_station || 'Kilambakkam (KCBT)',
      work_station: user.work_station || 'Chennai Central',
      preferred_agencies: user.preferred_agencies || ['MTC', 'CMRL'],
      preferred_routes: user.preferred_routes || ['21G'],
      alert_channels: user.alert_channels || ['IN_APP', 'EMAIL'],
      notification_frequency: user.notification_frequency || 'REALTIME',
      bio: user.bio || '',
      customRouteInput: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleAgency = (agencyId: string) => {
    setFormData((prev) => {
      const exists = prev.preferred_agencies.includes(agencyId);
      const updated = exists
        ? prev.preferred_agencies.filter((a) => a !== agencyId)
        : [...prev.preferred_agencies, agencyId];
      return { ...prev, preferred_agencies: updated };
    });
  };

  const handleToggleRoute = (routeId: string) => {
    setFormData((prev) => {
      const exists = prev.preferred_routes.includes(routeId);
      const updated = exists
        ? prev.preferred_routes.filter((r) => r !== routeId)
        : [...prev.preferred_routes, routeId];
      return { ...prev, preferred_routes: updated };
    });
  };

  const handleAddCustomRoute = () => {
    const route = formData.customRouteInput.trim().toUpperCase();
    if (route && !formData.preferred_routes.includes(route)) {
      setFormData((prev) => ({
        ...prev,
        preferred_routes: [...prev.preferred_routes, route],
        customRouteInput: ''
      }));
    }
  };

  const handleToggleAlertChannel = (channel: string) => {
    setFormData((prev) => {
      const exists = prev.alert_channels.includes(channel);
      const updated = exists
        ? prev.alert_channels.filter((c) => c !== channel)
        : [...prev.alert_channels, channel];
      return { ...prev, alert_channels: updated };
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Please provide both Full Name and a valid Email Address.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (modalMode === 'create') {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          persona: formData.persona,
          role_title: formData.role_title.trim(),
          home_station: formData.home_station.trim(),
          work_station: formData.work_station.trim(),
          preferred_agencies: formData.preferred_agencies,
          preferred_routes: formData.preferred_routes,
          alert_channels: formData.alert_channels,
          notification_frequency: formData.notification_frequency,
          bio: formData.bio.trim() || undefined
        };
        const res = await api.createUser(payload);
        showToast(`Profile "${res.user.name}" created and stored in SQLite database!`);
      } else if (modalMode === 'edit' && editingUserId) {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          persona: formData.persona,
          role_title: formData.role_title.trim(),
          home_station: formData.home_station.trim(),
          work_station: formData.work_station.trim(),
          preferred_agencies: formData.preferred_agencies,
          preferred_routes: formData.preferred_routes,
          alert_channels: formData.alert_channels,
          notification_frequency: formData.notification_frequency,
          bio: formData.bio.trim() || undefined
        };
        const res = await api.updateUser(editingUserId, payload);
        showToast(`Profile "${res.user.name}" updated successfully in database!`);
      }

      setIsModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Operation failed.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateUser = async (user: UserProfile) => {
    try {
      await api.activateUser(user.id);
      setActiveUser(user);
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          is_active: u.id === user.id ? 1 : 0
        }))
      );
      showToast(`Active commuter profile switched to ${user.name}`);
      if (onSelectUser) onSelectUser(user);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to switch active profile.');
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (users.length <= 1) {
      showToast('Cannot delete the last remaining user profile in the database.');
      return;
    }
    const confirmed = confirm(`Are you sure you want to delete profile "${user.name}" (${user.email}) from transitnotice.db?`);
    if (!confirmed) return;

    try {
      await api.deleteUser(user.id);
      showToast(`Profile "${user.name}" removed from database.`);
      await loadUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete profile.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery)) ||
      (u.home_station && u.home_station.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.work_station && u.work_station.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.preferred_routes && u.preferred_routes.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesPersona =
      selectedPersonaFilter === 'ALL' || u.persona === selectedPersonaFilter;

    return matchesSearch && matchesPersona;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-cyan-500/40 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071B2D] via-[#0A2642] to-[#04121F] text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              <Users className="h-3.5 w-3.5" />
              <span>COMMUTER & OPERATOR PROFILES • SQLITE DATABASE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              User Profiles & Commute Preferences
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              All commuter profiles, monitored transit routes, home/work interchanges, and alert preferences are stored persistently in the local SQLite database (<code className="font-mono text-cyan-300">transitnotice.db</code>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 rounded-xl bg-[#13BCEB] hover:bg-[#0ea5d1] text-slate-950 font-bold px-5 py-3 text-sm shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add New Profile</span>
            </button>
            <button
              onClick={loadUsers}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-3 text-sm border border-slate-700 transition-all cursor-pointer"
              title="Refresh database records"
            >
              <RotateCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </section>

      {/* Currently Active Profile Showcase */}
      {activeUser && (
        <section className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-slate-900/30 p-6 shadow-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#13BCEB] to-blue-700 text-white text-2xl font-black shadow-lg shadow-cyan-950/40">
                {activeUser.name.charAt(0)}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeUser.name}</h2>
                  <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/40">
                    CURRENTLY ACTIVE COMMUTER
                  </span>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
                    ID: {activeUser.id}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {activeUser.role_title || 'Chennai Transit Commuter'} • <span className="text-cyan-400 font-semibold">{activeUser.persona}</span>
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {activeUser.email}
                  </span>
                  {activeUser.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {activeUser.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    <strong>Route:</strong> {activeUser.home_station || 'Home'} <ArrowRight className="h-3 w-3 inline" /> {activeUser.work_station || 'Work'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenEditModal(activeUser)}
                className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Edit Details</span>
              </button>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('passenger')}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-semibold shadow cursor-pointer"
                >
                  <Bus className="h-3.5 w-3.5" />
                  <span>View My Commute Notices</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick tags for active user */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-1.5 font-semibold uppercase tracking-wider text-[10px]">
                Monitored Agencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeUser.preferred_agencies?.map((ag) => (
                  <span key={ag} className="rounded-md bg-blue-950/60 px-2 py-0.5 font-bold text-blue-300 border border-blue-800">
                    {ag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1.5 font-semibold uppercase tracking-wider text-[10px]">
                Monitored Routes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeUser.preferred_routes?.map((rt) => (
                  <span key={rt} className="rounded-md bg-emerald-950/60 px-2 py-0.5 font-bold text-emerald-300 border border-emerald-800">
                    {rt}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1.5 font-semibold uppercase tracking-wider text-[10px]">
                Alert Delivery Channels
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeUser.alert_channels?.map((ch) => (
                  <span key={ch} className="rounded-md bg-purple-950/60 px-2 py-0.5 font-bold text-purple-300 border border-purple-800">
                    {ch}
                  </span>
                ))}
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">
                  {activeUser.notification_frequency || 'REALTIME'}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search profiles by name, email, phone, route, or transit hub..."
            className="w-full rounded-xl bg-slate-50 pl-10 pr-4 py-2.5 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PASSENGER', 'OPERATIONS_MONITOR', 'STUDENT_COMMUTER'].map((persona) => (
            <button
              key={persona}
              onClick={() => setSelectedPersonaFilter(persona)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedPersonaFilter === persona
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {persona === 'ALL' ? 'All Personas' : persona.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Database Stored Users Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <RotateCw className="h-8 w-8 animate-spin mx-auto text-cyan-500 mb-3" />
          <p className="text-sm font-medium">Loading user profiles from SQLite database...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching user profiles found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or add a new commuter profile.</p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#13BCEB] text-slate-950 font-bold px-4 py-2 text-xs shadow"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Profile</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUsers.map((user) => {
            const isActive = user.is_active === 1;
            return (
              <div
                key={user.id}
                className={`flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border transition-all ${
                  isActive
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Bar with Name & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{user.name}</h3>
                          {isActive && (
                            <span className="rounded-full bg-cyan-100 text-cyan-800 px-2 py-0.5 text-[10px] font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {user.role_title || 'Commuter'} • <span className="font-semibold text-slate-700">{user.persona}</span>
                        </p>
                      </div>
                    </div>

                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                      {user.id}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      <span>
                        <strong>From:</strong> {user.home_station || 'Kilambakkam'} <strong>To:</strong> {user.work_station || 'Central'}
                      </span>
                    </div>
                  </div>

                  {/* Preferred Agencies & Routes */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">Agencies:</span>
                      {user.preferred_agencies?.map((ag) => (
                        <span key={ag} className="rounded bg-blue-50 text-blue-700 font-bold px-2 py-0.5 text-[10px] border border-blue-200">
                          {ag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">Routes:</span>
                      {user.preferred_routes?.map((rt) => (
                        <span key={rt} className="rounded bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 text-[10px] border border-emerald-200">
                          {rt}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">Alerts:</span>
                      {user.alert_channels?.map((ch) => (
                        <span key={ch} className="rounded bg-purple-50 text-purple-700 font-medium px-2 py-0.5 text-[10px] border border-purple-200">
                          {ch}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({user.notification_frequency || 'REALTIME'})
                      </span>
                    </div>

                    {user.bio && (
                      <p className="text-xs text-slate-500 italic pt-1 line-clamp-2">
                        "{user.bio}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    Updated: {new Date(user.updated_at).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        onClick={() => handleActivateUser(user)}
                        className="rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 px-3 py-1.5 text-xs font-bold border border-cyan-200 transition-colors cursor-pointer"
                        title="Set this profile as active"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                      title="Delete profile from database"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col my-8 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#13BCEB] to-blue-600 text-white font-bold">
                  {modalMode === 'create' ? <UserPlus className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {modalMode === 'create' ? 'Add New User Profile' : 'Edit User Profile'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Directly synchronized with SQLite database (<code className="text-cyan-700">transitnotice.db</code>)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  1. Identity & Account Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Maya Lin"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. maya.chennai@example.com"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98401 23456"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Persona / Role
                    </label>
                    <select
                      value={formData.persona}
                      onChange={(e: any) => setFormData({ ...formData, persona: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
                    >
                      <option value="PASSENGER">Daily Passenger (Commuter)</option>
                      <option value="OPERATIONS_MONITOR">Operations Monitor / Staff</option>
                      <option value="STUDENT_COMMUTER">Student Commuter</option>
                      <option value="FIELD_INSPECTOR">Field Inspector</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role Title / Commuter Headline
                  </label>
                  <input
                    type="text"
                    value={formData.role_title}
                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                    placeholder="e.g. Daily IT & Metro Commuter"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
                  />
                </div>
              </div>

              {/* Commute Corridor */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Daily Commute Route (Interchange Hubs)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Home Transit Hub / Boarding Station
                    </label>
                    <input
                      type="text"
                      list="hub-options"
                      value={formData.home_station}
                      onChange={(e) => setFormData({ ...formData, home_station: e.target.value })}
                      placeholder="e.g. Kilambakkam (KCBT)"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Work / Destination Interchange
                    </label>
                    <input
                      type="text"
                      list="hub-options"
                      value={formData.work_station}
                      onChange={(e) => setFormData({ ...formData, work_station: e.target.value })}
                      placeholder="e.g. Tidel Park, OMR / Chennai Central"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
                    />
                  </div>
                </div>

                <datalist id="hub-options">
                  {hubOptions.map((h) => (
                    <option key={h} value={h} />
                  ))}
                </datalist>
              </div>

              {/* Monitored Agencies */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  3. Preferred Transit Agencies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableAgencies.map((agency) => {
                    const checked = formData.preferred_agencies.includes(agency.id);
                    return (
                      <div
                        key={agency.id}
                        onClick={() => handleToggleAgency(agency.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          checked
                            ? 'bg-cyan-50/60 border-cyan-400 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-[#13BCEB] focus:ring-[#13BCEB]"
                        />
                        <div>
                          <div className="font-bold text-xs">{agency.name}</div>
                          <div className="text-[11px] text-slate-500">{agency.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monitored Routes */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  4. Monitored Bus & Metro Routes
                </h3>

                <div className="flex flex-wrap gap-2">
                  {suggestedRoutes.map((rt) => {
                    const isSelected = formData.preferred_routes.includes(rt.id);
                    return (
                      <button
                        type="button"
                        key={rt.id}
                        onClick={() => handleToggleRoute(rt.id)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {rt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom route input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={formData.customRouteInput}
                    onChange={(e) => setFormData({ ...formData, customRouteInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomRoute();
                      }
                    }}
                    placeholder="Add custom route (e.g. 54, 29C, 114)..."
                    className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRoute}
                    className="rounded-xl bg-slate-800 text-white px-4 py-2 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    Add Route
                  </button>
                </div>
              </div>

              {/* Notification & Alerts */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  5. Alert Channels & Delivery
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'IN_APP', label: 'In-App Notifications' },
                    { id: 'EMAIL', label: 'Email Digest' },
                    { id: 'SMS', label: 'SMS Dispatch' },
                    { id: 'WHATSAPP', label: 'WhatsApp Alerts' }
                  ].map((ch) => {
                    const checked = formData.alert_channels.includes(ch.id);
                    return (
                      <div
                        key={ch.id}
                        onClick={() => handleToggleAlertChannel(ch.id)}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                          checked
                            ? 'bg-purple-50/70 border-purple-400 text-purple-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <div className="text-xs">{ch.label}</div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notification Frequency
                  </label>
                  <select
                    value={formData.notification_frequency}
                    onChange={(e: any) => setFormData({ ...formData, notification_frequency: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
                  >
                    <option value="REALTIME">Instant Real-time Alerts (Recommended)</option>
                    <option value="DAILY_DIGEST">Daily Morning Commute Digest</option>
                    <option value="CRITICAL_ONLY">Critical Route Closures & Cancellations Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Commuter Notes & Travel Preferences
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="e.g. Daily commuter on GST Road and OMR tech corridor. Prefers express feeder shuttles and Blue Line metro."
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#13BCEB]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#13BCEB] hover:bg-[#0ea5d1] text-slate-950 font-bold px-6 py-2.5 text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RotateCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{modalMode === 'create' ? 'Save Profile to Database' : 'Update Profile in Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
