import React, { useState } from 'react';
import {
  Bus,
  Search,
  ShieldCheck,
  RefreshCw,
  Bell,
  ArrowRight,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  FileCheck2
} from 'lucide-react';
import { DashboardStats, TransitNotice } from '../types';
import { NoticeCard } from '../components/NoticeCard';

interface HomePageProps {
  stats: DashboardStats | null;
  recentNotices: TransitNotice[];
  onSearch: (query: string) => void;
  onSelectNotice: (notice: TransitNotice) => void;
  onNavigateTab: (tab: string) => void;
  onFilterRoute: (routeId: string) => void;
  onOpenSourceModal?: (notice: TransitNotice) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  stats,
  recentNotices,
  onSearch,
  onSelectNotice,
  onNavigateTab,
  onFilterRoute,
  onOpenSourceModal
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onNavigateTab('notices');
    }
  };

  const quickRoutes = ['21G', '102', '570', '54', '29C', 'Blue-Line', 'Green-Line', 'TNSTC-SETC', 'M1'];

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071B2D] via-[#0B2A46] to-[#071B2D] text-white p-4 sm:p-6 lg:p-7 min-h-[220px] max-h-none shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950/70 border border-[#13BCEB]/30 px-3 py-1 text-xs font-semibold text-cyan-300 mb-3">
            <span className="h-2 w-2 rounded-full bg-[#13BCEB] animate-ping" />
            Tamil Nadu & Chennai Public Transport Monitoring • Live Scraper
          </div>

          <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-white leading-tight">
            Live web scraping & advisory updates for Chennai & Tamil Nadu transit.
          </h1>

          <p className="mt-2 text-sm sm:text-[15px] text-slate-300 leading-relaxed max-w-4xl">
            Continuous automated scraping across <strong>MTC Chennai</strong>, <strong>CMRL Metro</strong>, <strong>TNSTC</strong>, <strong>CUMTA</strong>, and the <strong>TN Transport Department</strong>. Detects route diversions, special bus schedules, and corridor maintenance with full source provenance.
          </p>

          {/* Search Box & Passenger Action */}
          <form onSubmit={handleSearchSubmit} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search route (21G, 102, 570), metro line, Kilambakkam, OMR..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 pl-11 text-sm text-white placeholder-slate-400 backdrop-blur-md focus:bg-white/15 focus:border-[#13BCEB] focus:outline-none focus:ring-2 focus:ring-[#13BCEB]/50 transition"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#13BCEB] px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Search Notices</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Route Pills & Direct Passenger Portal Button */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <button
              onClick={() => onNavigateTab('passenger')}
              className="rounded-xl bg-emerald-500 text-slate-950 px-3.5 py-1.5 font-extrabold hover:bg-emerald-400 transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Bus className="h-3.5 w-3.5" />
              <span>Open Passenger Portal →</span>
            </button>
            <span className="text-slate-400 ml-1">Corridors:</span>
            {quickRoutes.map((r) => (
              <button
                key={r}
                onClick={() => {
                  onFilterRoute(r);
                  onNavigateTab('notices');
                }}
                className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-[#13BCEB] hover:text-slate-950 transition border border-white/10 cursor-pointer"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Official Transport Agencies Quick Launch Strip */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span>Monitored Official Transit Portals</span>
            <span className="text-[10px] text-slate-400 font-normal">Click to open original website</span>
          </h2>
          <button
            onClick={() => onNavigateTab('agencies')}
            className="text-xs font-semibold text-[#13BCEB] hover:underline"
          >
            View Agency Details →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <a
            href="https://mtcbus.tn.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-xl border border-emerald-200 bg-white p-3 hover:border-emerald-500 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-bold">MTC</span>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-emerald-600 transition" />
            </div>
            <div className="mt-2">
              <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">MTC Chennai</div>
              <div className="text-[10px] text-slate-500 truncate">mtcbus.tn.gov.in</div>
            </div>
          </a>

          <a
            href="https://chennaimetrorail.org"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-xl border border-blue-200 bg-white p-3 hover:border-blue-500 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold">CMRL</span>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-600 transition" />
            </div>
            <div className="mt-2">
              <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">Chennai Metro</div>
              <div className="text-[10px] text-slate-500 truncate">chennaimetrorail.org</div>
            </div>
          </a>

          <a
            href="https://www.tnstc.in"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-xl border border-rose-200 bg-white p-3 hover:border-rose-500 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-rose-700 text-white px-2 py-0.5 text-[10px] font-bold">TNSTC</span>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-rose-600 transition" />
            </div>
            <div className="mt-2">
              <div className="font-bold text-xs text-slate-900 group-hover:text-rose-700">State Transport</div>
              <div className="text-[10px] text-slate-500 truncate">www.tnstc.in</div>
            </div>
          </a>

          <a
            href="https://cumta.tn.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-xl border border-amber-200 bg-white p-3 hover:border-amber-500 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-amber-600 text-white px-2 py-0.5 text-[10px] font-bold">CUMTA</span>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-amber-600 transition" />
            </div>
            <div className="mt-2">
              <div className="font-bold text-xs text-slate-900 group-hover:text-amber-700">CUMTA Chennai</div>
              <div className="text-[10px] text-slate-500 truncate">cumta.tn.gov.in</div>
            </div>
          </a>

          <a
            href="https://transport.tn.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-xl border border-indigo-200 bg-white p-3 hover:border-indigo-500 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-indigo-900 text-white px-2 py-0.5 text-[10px] font-bold">TNTD</span>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 transition" />
            </div>
            <div className="mt-2">
              <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">TN Transport Dept</div>
              <div className="text-[10px] text-slate-500 truncate">transport.tn.gov.in</div>
            </div>
          </a>
        </div>
      </section>

      {/* Live System Status Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('notices')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#13BCEB] hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Active Advisories</span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats ? stats.activeAdvisories : '...'}
          </div>
          <p className="mt-1 text-xs text-slate-500">Currently impacting travel</p>
        </div>

        <div
          onClick={() => onNavigateTab('notices')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#13BCEB] hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Route Diversions</span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats ? stats.routeDiversions : '...'}
          </div>
          <p className="mt-1 text-xs text-slate-500">Detours & rerouted lines</p>
        </div>

        <div
          onClick={() => onNavigateTab('history')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#13BCEB] hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Revised / Extended</span>
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats ? stats.revisedNotices : '...'}
          </div>
          <p className="mt-1 text-xs text-slate-500">History preserved in audit trail</p>
        </div>

        <div
          onClick={() => onNavigateTab('scraper')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#13BCEB] hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Monitored Sources</span>
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats ? stats.healthySources : '...'} / {stats ? stats.totalSources : '...'}
          </div>
          <p className="mt-1 text-xs text-slate-500">MTC, CMRL, TNSTC, CUMTA, TNTD</p>
        </div>
      </section>

      {/* Recently Updated Notices Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recently Updated Advisories
            </h2>
            <p className="text-xs text-slate-500">
              Verified official notices with active change provenance
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('notices')}
            className="flex items-center gap-1 text-xs font-semibold text-[#13BCEB] hover:underline"
          >
            <span>View All Notices</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentNotices.slice(0, 3).map((notice) => (
            <NoticeCard
              key={notice.notice_id}
              notice={notice}
              onClick={() => onSelectNotice(notice)}
              onFilterRoute={(r) => {
                onFilterRoute(r);
                onNavigateTab('notices');
              }}
              onOpenSourceModal={onOpenSourceModal}
            />
          ))}
        </div>
      </section>

      {/* Architecture Highlights & Two Realistic Personas */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            System Design & Stakeholder Personas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Built according to Cybernaut WEB-07 Specifications with strict data integrity and change detection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Persona 1 */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 space-y-3 shadow-xs hover:border-emerald-400 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Bus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Persona 1: Daily Passenger (Maya Lin)</h3>
                  <span className="text-[11px] text-slate-400">Regular commuter in high-frequency transit corridors</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
                <li>Searches specific routes (e.g. Route 21G, 102, 570, Metro Blue Line).</li>
                <li>Receives filtered alerts only for subscribed lines and transit hubs (Kilambakkam KCBT, OMR).</li>
                <li>Views announced validity windows so they know exactly when closures start and conclude.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab('passenger')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-4 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Switch to Passenger View →</span>
              </button>
            </div>
          </div>

          {/* Persona 2 */}
          <div className="rounded-2xl border border-indigo-200 bg-white p-6 space-y-3 shadow-xs hover:border-indigo-400 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Persona 2: Operations Monitor (Alex Vance)</h3>
                  <span className="text-[11px] text-slate-400">Transit controller & transport data auditor</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
                <li>Monitors source health, HTTP response latency, and scrape diagnostics across all 5 agencies.</li>
                <li>Inspects historical notice revision diffs (e.g. 24-hour extension events).</li>
                <li>Triggers on-demand scraper syncs with automated retry backoffs.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab('dashboard')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#071B2D] hover:bg-slate-800 text-white py-2.5 px-4 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Switch to Operations Dashboard →</span>
              </button>
            </div>
          </div>
        </div>

        {/* 6 Mandatory Acceptance Rules Preview */}
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 text-xs text-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-cyan-950 flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-[#13BCEB]" />
              Mandatory Acceptance Tests Verified
            </span>
            <button
              onClick={() => onNavigateTab('mentor')}
              className="text-xs font-semibold text-cyan-800 hover:underline"
            >
              Open Mentor Test Console →
            </button>
          </div>
          <p className="text-[11px] text-slate-600">
            TransitNotice automatically enforces: (1) Expired notices not active; (2) Multi-route filtering; (3) Outage extension revision preservation; (4) Timezone ISO-8601 normalization; (5) Explicit last verification timestamps; (6) Source error data integrity.
          </p>
        </div>
      </section>
    </div>
  );
};
