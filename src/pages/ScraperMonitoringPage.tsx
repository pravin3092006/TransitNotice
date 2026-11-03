import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Source, ScrapeLog } from '../types';
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Terminal,
  Shield,
  Layers,
  ArrowRight,
  Database,
  ExternalLink
} from 'lucide-react';

export const ScraperMonitoringPage: React.FC = () => {
  const [statusData, setStatusData] = useState<any>(null);
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [logLevel, setLogLevel] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFeedback, setRefreshFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, [logLevel]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [statusRes, logsRes] = await Promise.all([
        api.getScraperStatus(),
        api.getScraperLogs({ level: logLevel !== 'ALL' ? logLevel : undefined, limit: 100 })
      ]);
      setStatusData(statusRes);
      setLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load scraper status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async (sourceId?: string) => {
    setRefreshing(true);
    setRefreshFeedback(null);
    try {
      const res = await api.triggerScraperRefresh(sourceId);
      setRefreshFeedback(`Scrape sync complete: ${res.results.map((r: any) => `${r.source_name}: ${r.observed} observed`).join(', ')}`);
      await loadStatus();
    } catch (err: any) {
      setRefreshFeedback(`Error during refresh: ${err.message}`);
    } finally {
      setRefreshing(false);
      setTimeout(() => setRefreshFeedback(null), 8000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071B2D] tracking-tight">
            Scraper Engine Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated refresh scheduler, health diagnostics, exponential backoff tracking, and execution logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleManualRefresh()}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl bg-[#071B2D] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 text-[#13BCEB] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Polling Official Sources...' : 'Trigger Manual Sync'}</span>
          </button>
        </div>
      </div>

      {/* Manual refresh feedback alert */}
      {refreshFeedback && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{refreshFeedback}</span>
        </div>
      )}

      {/* Scraper System Status Metrics */}
      {statusData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Automated Schedule
            </span>
            <div className="text-xl font-bold text-slate-900">
              Every {statusData.intervalMinutes} min
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">APScheduler background daemon</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Last Successful Sync
            </span>
            <div className="text-sm font-bold text-slate-900 truncate">
              {statusData.lastRefresh ? new Date(statusData.lastRefresh).toLocaleTimeString() : 'In Progress'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {statusData.lastRefresh ? new Date(statusData.lastRefresh).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Next Scheduled Sync
            </span>
            <div className="text-sm font-bold text-slate-900 truncate">
              {new Date(statusData.nextScheduledRefresh).toLocaleTimeString()}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Automated queue ready</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Sources Health
            </span>
            <div className="text-xl font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>{statusData.totalConfiguredSources - statusData.failedSourcesCount} / {statusData.totalConfiguredSources} Healthy</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">0 degraded feeds</p>
          </div>
        </div>
      )}

      {/* Official Tamil Nadu Government Transport Portals Verification Strip */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#13BCEB]" />
              Official Tamil Nadu Transport Portals & Direct Links
            </h3>
            <p className="text-xs text-slate-500">
              Direct provenance URLs monitored by TransitNotice. Click "Open Website" to view the original agency portal.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            5 Portals Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. MTC Chennai */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col justify-between hover:border-emerald-500 transition">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="rounded bg-emerald-700 text-white font-bold px-2 py-0.5 text-xs">MTC</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feeder
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">Metropolitan Transport Corporation</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Scrapes citizen charter, bus route diversions, Kilambakkam (KCBT) shuttles, and special fleet notices.
              </p>
              <div className="font-mono text-[10px] text-slate-400 mt-2 truncate">
                https://mtcbus.tn.gov.in
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
              <button
                onClick={() => handleManualRefresh('SRC-MTC-CHENNAI')}
                disabled={refreshing}
                className="text-[11px] font-semibold text-[#13BCEB] hover:underline"
              >
                Sync MTC
              </button>
              <a
                href="https://mtcbus.tn.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded bg-[#071B2D] text-white px-2.5 py-1 text-xs font-bold hover:bg-slate-800 transition"
              >
                <span>Open Website</span>
                <ExternalLink className="h-3 w-3 text-[#13BCEB]" />
              </a>
            </div>
          </div>

          {/* 2. CMRL */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col justify-between hover:border-blue-500 transition">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="rounded bg-blue-600 text-white font-bold px-2 py-0.5 text-xs">CMRL</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feeder
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">Chennai Metro Rail Limited</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Scrapes official press releases, Blue & Green Line service changes, and Phase-2 viaduct construction detours.
              </p>
              <div className="font-mono text-[10px] text-slate-400 mt-2 truncate">
                https://chennaimetrorail.org
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
              <button
                onClick={() => handleManualRefresh('SRC-CMRL-METRO')}
                disabled={refreshing}
                className="text-[11px] font-semibold text-[#13BCEB] hover:underline"
              >
                Sync CMRL
              </button>
              <a
                href="https://chennaimetrorail.org/press-release/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded bg-[#071B2D] text-white px-2.5 py-1 text-xs font-bold hover:bg-slate-800 transition"
              >
                <span>Open Website</span>
                <ExternalLink className="h-3 w-3 text-[#13BCEB]" />
              </a>
            </div>
          </div>

          {/* 3. TNSTC */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col justify-between hover:border-rose-500 transition">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="rounded bg-rose-700 text-white font-bold px-2 py-0.5 text-xs">TNSTC</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feeder
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">Tamil Nadu State Transport Corporation</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Scrapes festive long-distance bus armadas, SETC ultra-deluxe timetables, and regional division updates.
              </p>
              <div className="font-mono text-[10px] text-slate-400 mt-2 truncate">
                https://www.tnstc.in
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
              <button
                onClick={() => handleManualRefresh('SRC-TNSTC-PORTAL')}
                disabled={refreshing}
                className="text-[11px] font-semibold text-[#13BCEB] hover:underline"
              >
                Sync TNSTC
              </button>
              <a
                href="https://www.tnstc.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded bg-[#071B2D] text-white px-2.5 py-1 text-xs font-bold hover:bg-slate-800 transition"
              >
                <span>Open Website</span>
                <ExternalLink className="h-3 w-3 text-[#13BCEB]" />
              </a>
            </div>
          </div>

          {/* 4. CUMTA */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col justify-between hover:border-amber-500 transition">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="rounded bg-amber-600 text-white font-bold px-2 py-0.5 text-xs">CUMTA</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feeder
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">Chennai Unified Metropolitan Transport</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Scrapes Comprehensive Mobility Plan (CMP), unified multimodal QR ticketing directives, and priority lanes.
              </p>
              <div className="font-mono text-[10px] text-slate-400 mt-2 truncate">
                https://cumta.tn.gov.in
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
              <button
                onClick={() => handleManualRefresh('SRC-CUMTA-PORTAL')}
                disabled={refreshing}
                className="text-[11px] font-semibold text-[#13BCEB] hover:underline"
              >
                Sync CUMTA
              </button>
              <a
                href="https://cumta.tn.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded bg-[#071B2D] text-white px-2.5 py-1 text-xs font-bold hover:bg-slate-800 transition"
              >
                <span>Open Website</span>
                <ExternalLink className="h-3 w-3 text-[#13BCEB]" />
              </a>
            </div>
          </div>

          {/* 5. TN Transport Department */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col justify-between hover:border-indigo-500 transition md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="rounded bg-indigo-900 text-white font-bold px-2 py-0.5 text-xs">TNTD</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feeder
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">Tamil Nadu Transport Department</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Scrapes Transport Commissionerate statutory orders, omnibus fare caps, and road safety regulations.
              </p>
              <div className="font-mono text-[10px] text-slate-400 mt-2 truncate">
                https://transport.tn.gov.in
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
              <button
                onClick={() => handleManualRefresh('SRC-TNSTA-PORTAL')}
                disabled={refreshing}
                className="text-[11px] font-semibold text-[#13BCEB] hover:underline"
              >
                Sync TNTD
              </button>
              <a
                href="https://transport.tn.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded bg-[#071B2D] text-white px-2.5 py-1 text-xs font-bold hover:bg-slate-800 transition"
              >
                <span>Open Website</span>
                <ExternalLink className="h-3 w-3 text-[#13BCEB]" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Configured Sources Status Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Source Adapters & Real-Time Diagnostics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statusData?.sources.map((s: Source) => (
            <div key={s.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900 block">{s.name}</span>
                  <span className="text-xs text-slate-500 font-mono">{s.id} • {s.source_type}</span>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  s.health_status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {s.health_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Last Attempted:</span>
                  <span>{s.last_attempted_at ? new Date(s.last_attempted_at).toLocaleTimeString() : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Last Success:</span>
                  <span className="text-emerald-700 font-medium">{s.last_successful_fetch_at ? new Date(s.last_successful_fetch_at).toLocaleTimeString() : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Retry Ceiling:</span>
                  <span>300s backoff</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Consecutive Errors:</span>
                  <span>{s.consecutive_failures}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Permission: {s.permission_status} ({s.robots_txt_status})
                </span>
                <button
                  onClick={() => handleManualRefresh(s.id)}
                  disabled={refreshing}
                  className="text-xs font-bold text-[#13BCEB] hover:underline"
                >
                  Refresh Source
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Logs Section */}
      <div className="rounded-2xl border border-slate-200 bg-[#071B2D] p-5 shadow-xs text-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-[#13BCEB]" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Scraper Execution & Diagnostic Console Logs
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Log Level:</span>
            <select
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              className="rounded bg-slate-800 border border-slate-700 px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO Only</option>
              <option value="WARN">WARN Only</option>
              <option value="ERROR">ERROR Only</option>
            </select>
          </div>
        </div>

        <div className="h-72 overflow-y-auto space-y-1 font-mono text-xs p-2 bg-[#051524] rounded-lg border border-slate-800">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No logs for this filter.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-1 hover:bg-slate-800/40 px-2 rounded">
                <span className="text-slate-500 text-[11px] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                  log.level === 'INFO' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                  log.level === 'WARN' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {log.level}
                </span>
                {log.source_id && (
                  <span className="text-slate-400 text-[11px] shrink-0">[{log.source_id}]</span>
                )}
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
