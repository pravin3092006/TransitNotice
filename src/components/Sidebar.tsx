import React from 'react';
import {
  LayoutDashboard,
  BellRing,
  Bus,
  FileText,
  History,
  Building2,
  Activity,
  Award,
  Settings,
  Compass,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  Users
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadAlertsCount
}) => {
  const navItems = [
    { id: 'home', label: 'Public Home', icon: Compass, badge: null },
    { id: 'passenger', label: 'Passenger Portal', icon: UserCheck, badge: 'COMMUTE' },
    { id: 'users', label: 'User Profiles & DB', icon: Users, badge: 'SQLITE' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'notices', label: 'Live Service Notices', icon: FileText, badge: null },
    { id: 'routes', label: 'Routes Directory', icon: Bus, badge: null },
    { id: 'agencies', label: 'Agencies & Sources', icon: Building2, badge: null },
    { id: 'history', label: 'Notice History', icon: History, badge: null },
    { id: 'notifications', label: 'Alerts & Delivery', icon: BellRing, badge: unreadAlertsCount > 0 ? unreadAlertsCount : null },
    { id: 'scraper', label: 'Scraper Monitoring', icon: Activity, badge: null },
    { id: 'mentor', label: 'Mentor Challenges', icon: Award, badge: 'TESTS' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <aside className="flex flex-col w-64 border-r border-slate-800 bg-[#071B2D] text-slate-300 h-screen select-none sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80 bg-[#051524] shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#13BCEB] to-cyan-700 shadow-md shadow-cyan-950/40">
          <Bus className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">TransitNotice</span>
            <span className="rounded bg-cyan-900/60 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300 border border-cyan-700/50">WEB-07</span>
          </div>
          <p className="text-[11px] text-slate-400">Chennai & TN Transit Tracker</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>

        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#13BCEB]/20 to-transparent text-white border-l-3 border-[#13BCEB] font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#13BCEB]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Provenance & Diagnostics
        </div>

        {navItems.slice(5).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#13BCEB]/20 to-transparent text-white border-l-3 border-[#13BCEB] font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#13BCEB]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  item.badge === 'TESTS'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Cybernaut Internship Project Details Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#051524]/60">
        <div className="rounded-lg bg-slate-800/60 p-3 text-xs border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Cybernaut SRS 2026</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Public Transport Service Update Tracker. Real-world web scraping, change detection & audit trail.
          </p>
        </div>
      </div>
    </aside>
  );
};
