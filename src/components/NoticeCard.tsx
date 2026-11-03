import React from 'react';
import { TransitNotice } from '../types';
import { Calendar, Clock, MapPin, ExternalLink, Route, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { normalizeOfficialUrl, openOfficialUrl } from '../utils/urlHelper';

interface NoticeCardProps {
  notice: TransitNotice;
  onClick: () => void;
  onFilterRoute?: (routeId: string) => void;
  onOpenSourceModal?: (notice: TransitNotice) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onClick, onFilterRoute, onOpenSourceModal }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Expired':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Withdrawn':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Route Diversion':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Planned Maintenance':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      case 'Service Interruption':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'Delay':
        return 'bg-orange-50 text-orange-800 border-orange-300';
      case 'Route Closure':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-cyan-50 text-cyan-800 border-cyan-300';
    }
  };

  const agencyColor = (agency: string) => {
    switch (agency) {
      case 'MTC':
        return 'bg-emerald-700 text-white border border-emerald-800 shadow-2xs';
      case 'CMRL':
        return 'bg-blue-600 text-white border border-blue-700 shadow-2xs';
      case 'TNSTC':
        return 'bg-rose-700 text-white border border-rose-800 shadow-2xs';
      case 'CUMTA':
        return 'bg-amber-600 text-white border border-amber-700 shadow-2xs';
      case 'TNTD':
        return 'bg-indigo-900 text-white border border-indigo-950 shadow-2xs';
      case 'SR':
        return 'bg-teal-700 text-white border border-teal-800 shadow-2xs';
      case 'SETC':
        return 'bg-orange-700 text-white border border-orange-800 shadow-2xs';
      case 'GCTP':
        return 'bg-slate-700 text-white border border-slate-800 shadow-2xs';
      case 'CMDA':
        return 'bg-purple-700 text-white border border-purple-800 shadow-2xs';
      default:
        return 'bg-slate-800 text-white';
    }
  };

  const agencyLabel = (agency: string) => {
    switch (agency) {
      case 'MTC': return 'MTC Chennai';
      case 'CMRL': return 'Chennai Metro';
      case 'TNSTC': return 'TNSTC Bus';
      case 'CUMTA': return 'CUMTA Unified';
      case 'TNTD': return 'TN Transport';
      case 'SR': return 'Southern Railway';
      case 'SETC': return 'SETC Express';
      case 'GCTP': return 'Chennai Traffic Police';
      case 'CMDA': return 'CMDA Terminals';
      default: return agency;
    }
  };

  const routes = notice.affected_routes && notice.affected_routes.length > 0
    ? notice.affected_routes
    : (notice.route_id || '').split(',')
        .map(r => ({ route_id: r.trim(), route_name: r.trim(), route_mode: 'BUS' }))
        .filter(r => r.route_id.length > 0);

  const cleanSourceUrl = normalizeOfficialUrl(notice.source_url, notice.agency);

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#13BCEB] hover:shadow-md cursor-pointer"
    >
      <div>
        {/* Header Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs font-bold ${agencyColor(notice.agency)}`}>
              {notice.agency}
            </span>
            <span className="font-mono text-xs font-medium text-slate-500">
              {notice.notice_id}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {notice.revision_id > 1 && (
              <span className="flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                <RefreshCw className="h-2.5 w-2.5" />
                Rev {notice.revision_id}
              </span>
            )}
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(notice.status)}`}>
              {notice.status}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-2">
          {notice.title}
        </h3>

        {/* Type & Area */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-md border px-2 py-0.5 font-medium ${getTypeColor(notice.type)}`}>
            {notice.type}
            {notice.is_type_inferred === 1 && ' (Inferred)'}
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <MapPin className="h-3 w-3 text-slate-400" />
            <span className="truncate max-w-[200px]">{notice.area}</span>
          </span>
        </div>

        {/* Summary text */}
        <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {notice.summary}
        </p>

        {/* Affected Routes (Multi-route display) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Route className="h-3 w-3" />
            Routes:
          </span>
          {routes.map((r, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                if (onFilterRoute) onFilterRoute(r.route_id);
              }}
              className="rounded bg-slate-100 hover:bg-cyan-100 hover:text-cyan-900 px-2 py-0.5 text-[11px] font-semibold text-slate-700 transition"
              title={`Click to filter by ${r.route_id}`}
            >
              {r.route_id}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Provenance and Dates */}
      <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1" title={`Valid From: ${new Date(notice.valid_from).toLocaleString()}`}>
            <Calendar className="h-3 w-3 text-slate-400" />
            <span>
              {new Date(notice.valid_from).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              {notice.valid_to ? ` - ${new Date(notice.valid_to).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : ' (Until further notice)'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-500 font-medium" title={`Last verified with official agency source: ${new Date(notice.last_verified_at).toLocaleString()}`}>
            <Clock className="h-3 w-3 text-[#13BCEB]" />
            <span>Verified {new Date(notice.last_verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 truncate max-w-[170px]" title={notice.change_summary || notice.title}>
            {notice.change_summary || 'Official State Transit Bulletin'}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenSourceModal) {
                onOpenSourceModal(notice);
              } else {
                openOfficialUrl(cleanSourceUrl, notice.agency);
              }
            }}
            className="flex items-center gap-1 font-semibold text-[#13BCEB] hover:text-cyan-700 hover:underline shrink-0 px-2 py-0.5 rounded bg-cyan-50/80 hover:bg-cyan-100 transition"
            title={`Inspect official ${notice.agency} bulletin & verified source archive`}
          >
            <span>Open Source</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
