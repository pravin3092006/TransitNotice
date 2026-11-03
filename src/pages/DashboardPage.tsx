import React from 'react';
import { DashboardStats, TransitNotice } from '../types';
import {
  FileText,
  AlertCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Building2,
  Calendar,
  Route,
  CheckCircle2,
  XCircle,
  Sliders,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from 'recharts';

interface DashboardPageProps {
  stats: DashboardStats | null;
  recentNotices: TransitNotice[];
  onSelectNotice: (notice: TransitNotice) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  recentNotices,
  onSelectNotice,
  onNavigateTab
}) => {
  if (!stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#13BCEB] mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500">Loading live database metrics...</p>
        </div>
      </div>
    );
  }

  const TYPE_COLORS: Record<string, string> = {
    'Route Diversion': '#F59E0B',
    'Service Interruption': '#EF4444',
    'Planned Maintenance': '#6366F1',
    'Delay': '#F97316',
    'Route Closure': '#8B5CF6',
    'Cancelled': '#64748B'
  };

  const AGENCY_COLORS: Record<string, string> = {
    'MTC': '#047857',
    'CMRL': '#2563EB',
    'TNSTC': '#DC2626',
    'CUMTA': '#D97706',
    'TNTD': '#4338CA',
    'SR': '#0D9488',
    'SETC': '#C2410C',
    'GCTP': '#334155',
    'CMDA': '#7E22CE',
    'TFL': '#1E3A8A',
    'BART': '#0284C7',
    'MBTA': '#047857',
    'CTA': '#2563EB'
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071B2D] tracking-tight">
            Transit Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time analytics computed directly from SQLite relational records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="h-4 w-4 text-[#13BCEB]" />
          <span>Last Feed Refresh: </span>
          <span className="font-semibold text-slate-800">
            {new Date(stats.lastSuccessfulRefresh).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* 8 Primary Relational Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* Total Notices */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Notices</span>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalNotices}</div>
          <p className="mt-1 text-[11px] text-slate-400">All recorded announcements</p>
        </div>

        {/* Active Advisories */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Active Advisories</span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950">{stats.activeAdvisories}</div>
          <p className="mt-1 text-[11px] text-emerald-700">Effective validity window</p>
        </div>

        {/* Planned Interruptions */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Planned Works</span>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950">{stats.plannedInterruptions}</div>
          <p className="mt-1 text-[11px] text-indigo-700">Track & signal renewals</p>
        </div>

        {/* Route Diversions */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Route Diversions</span>
            <Route className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-950">{stats.routeDiversions}</div>
          <p className="mt-1 text-[11px] text-amber-700">Bypassing regular routes</p>
        </div>

        {/* Cancelled Notices */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Cancelled</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-950">{stats.cancelledNotices}</div>
          <p className="mt-1 text-[11px] text-rose-700">Cancelled before execution</p>
        </div>

        {/* Expired Notices */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expired Notices</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-600">{stats.expiredNotices}</div>
          <p className="mt-1 text-[11px] text-slate-400">Validity window completed</p>
        </div>

        {/* Revised Notices */}
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-cyan-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">Revised / Extended</span>
            <RefreshCw className="h-4 w-4 text-[#13BCEB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-950">{stats.revisedNotices}</div>
          <p className="mt-1 text-[11px] text-cyan-800">Audit revisions tracked</p>
        </div>

        {/* Monitored Agencies */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Monitored Agencies</span>
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalAgencies}</div>
          <p className="mt-1 text-[11px] text-slate-400">{stats.healthySources} active feeds</p>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Notices by Advisory Type */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
            Notices by Advisory Classification
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.byType}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ name, percent }: any) => `${name} (${(((percent as number) || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {stats.charts.byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || '#13BCEB'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val ?? 0} notices`, 'Count']}
                  contentStyle={{ backgroundColor: '#071B2D', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Notices by Transport Agency */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
            Notices by Transport Authority
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.byAgency}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val ?? 0} notices`, 'Notices']}
                  contentStyle={{ backgroundColor: '#071B2D', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.charts.byAgency.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={AGENCY_COLORS[entry.name] || '#13BCEB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Route-wise Disruption Statistics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
            Top Affected Transit Lines & Routes
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.byRoute} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis dataKey="route" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={80} />
                <Tooltip
                  formatter={(val: any) => [`${val ?? 0} notices`, 'Advisories']}
                  contentStyle={{ backgroundColor: '#071B2D', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="count" fill="#13BCEB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Active vs Expired Status Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
            Advisories by Lifecycle Status
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.byStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val ?? 0} notices`, 'Count']}
                  contentStyle={{ backgroundColor: '#071B2D', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="count" fill="#071B2D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Disruptions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Live Disruptions & Active Advisory Register
            </h3>
            <p className="text-xs text-slate-500">
              Direct feed from database sorted by latest verification
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('notices')}
            className="text-xs font-semibold text-[#13BCEB] hover:underline"
          >
            View Full Register →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Notice ID</th>
                <th className="py-2.5 px-3">Agency</th>
                <th className="py-2.5 px-3">Routes</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Area</th>
                <th className="py-2.5 px-3">Validity Window</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentNotices.slice(0, 5).map((n) => (
                <tr key={n.notice_id} className="hover:bg-slate-50/80 transition cursor-pointer" onClick={() => onSelectNotice(n)}>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{n.notice_id}</td>
                  <td className="py-2.5 px-3">
                    <span className="rounded bg-slate-800 text-white font-bold px-1.5 py-0.5 text-[10px]">{n.agency}</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{n.route_id}</td>
                  <td className="py-2.5 px-3">
                    <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700">{n.type}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">{n.area}</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(n.valid_from).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    {n.valid_to ? ` - ${new Date(n.valid_to).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : ' (Open)'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      n.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                      n.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      n.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNotice(n);
                      }}
                      className="text-[#13BCEB] font-semibold hover:underline"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
