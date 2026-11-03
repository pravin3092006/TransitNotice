import React, { useState } from 'react';
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
  ShieldAlert,
  UserCheck,
  Users,
  Menu,
  X
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
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const selectTab = (id: string) => {
    onSelectTab(id);
    setMobileOpen(false);
  };

  const renderNavigation = () => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Core Operations
      </div>

      {navItems.slice(0, 5).map((item) => {
        const Icon = item.icon;
        const active = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => selectTab(item.id)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-xs font-medium transition-all ${
              active
                ? 'bg-gradient-to-r from-[#13BCEB]/20 to-transparent text-white border-l-4 border-[#13BCEB]'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon className={`h-4 w-4 ${active ? 'text-[#13BCEB]' : 'text-slate-400'}`} />
              {item.label}
            </span>

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
        const active = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => selectTab(item.id)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-xs font-medium transition-all ${
              active
                ? 'bg-gradient-to-r from-[#13BCEB]/20 to-transparent text-white border-l-4 border-[#13BCEB]'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon className={`h-4 w-4 ${active ? 'text-[#13BCEB]' : 'text-slate-400'}`} />
              {item.label}
            </span>

            {item.badge && (
              <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-300">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800/80 bg-[#051524] shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#13BCEB] to-cyan-700">
        <Bus className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-base text-white">TransitNotice</span>
          <span className="rounded bg-cyan-900/60 px-1.5 py-0.5 text-[10px] text-cyan-300">
            WEB-07
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Chennai & TN Transit Tracker
        </p>
      </div>
    </div>
  );

  const footer = (
    <div className="p-4 border-t border-slate-800/80 bg-[#051524]/60 shrink-0">
      <div className="rounded-lg bg-slate-800/60 p-3 text-xs border border-slate-700/50">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
          <ShieldAlert className="h-3.5 w-3.5" />
          Cybernaut SRS 2026
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Public Transport Service Update Tracker. Real-world web scraping,
          change detection & audit trail.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-w-64 border-r border-slate-800 bg-[#071B2D] text-slate-300 h-screen sticky top-0 shrink-0">
        {brand}
        {renderNavigation()}
        {footer}
      </aside>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        className="md:hidden fixed top-3 left-3 z-[70] flex h-11 w-11 items-center justify-center rounded-xl bg-[#071B2D] text-white shadow-lg border border-slate-700"
      >
        {mobileOpen ? <X size={23} /> : <Menu size={23} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 w-full h-full bg-black/60"
          />

          <aside className="absolute left-0 top-0 flex flex-col w-[min(290px,85vw)] h-full bg-[#071B2D] text-slate-300 shadow-2xl">
            <div className="flex items-center justify-between pr-3">
              {brand}
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-white p-2"
              >
                <X size={22} />
              </button>
            </div>

            {renderNavigation()}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
};
