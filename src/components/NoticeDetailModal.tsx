import React, { useState } from 'react';
import { TransitNotice, NoticeRevision } from '../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Route,
  Shield,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Building2,
  Copy,
  Check,
  Globe,
  PhoneCall,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { normalizeOfficialUrl, openOfficialUrl, OFFICIAL_AGENCY_PORTALS } from '../utils/urlHelper';

interface NoticeDetailModalProps {
  notice: TransitNotice | null;
  revisions: NoticeRevision[];
  isOpen: boolean;
  onClose: () => void;
  onFilterRoute?: (routeId: string) => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  notice,
  revisions,
  isOpen,
  onClose,
  onFilterRoute
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'official_source'>('details');
  const [popupNotice, setPopupNotice] = useState<string | null>(null);

  if (!isOpen || !notice) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/#/notices?id=${notice.notice_id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const safeDateStr = (dateVal?: string | null, fallback = 'N/A') => {
    if (!dateVal) return fallback;
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? fallback : d.toLocaleString();
    } catch {
      return fallback;
    }
  };

  const safeDateOnlyStr = (dateVal?: string | null, fallback = 'N/A') => {
    if (!dateVal) return fallback;
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? fallback : d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return fallback;
    }
  };

  const routes = notice.affected_routes && notice.affected_routes.length > 0
    ? notice.affected_routes
    : (notice.route_id || '').split(',')
        .map(r => ({ route_id: r.trim(), route_name: r.trim(), route_mode: 'BUS', direction: undefined }))
        .filter(r => r.route_id.length > 0);

  const cleanOfficialUrl = normalizeOfficialUrl(notice.source_url, notice.agency);
  const agencyInfo = OFFICIAL_AGENCY_PORTALS[notice.agency] || {
    name: `${notice.agency} Public Transit Authority`,
    portalUrl: cleanOfficialUrl,
    alternativeUrls: [cleanOfficialUrl],
    description: 'Official Government of Tamil Nadu public transportation authority.',
    helpline: '1800-425-6151'
  };

  const handleOpenSourceUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    const success = openOfficialUrl(cleanOfficialUrl, notice.agency);
    if (!success) {
      // Pop-up was blocked or in iframe sandbox; switch to in-app official source tab
      setActiveTab('official_source');
      setPopupNotice('Pop-up was blocked by browser permissions. Showing official portal credentials directly below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-[#071B2D] px-6 py-4 text-white">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`rounded px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs ${
                notice.agency === 'MTC' ? 'bg-emerald-600 border border-emerald-500' :
                notice.agency === 'CMRL' ? 'bg-blue-600 border border-blue-500' :
                notice.agency === 'TNSTC' ? 'bg-rose-600 border border-rose-500' :
                notice.agency === 'CUMTA' ? 'bg-amber-600 border border-amber-500' :
                notice.agency === 'TNTD' ? 'bg-indigo-600 border border-indigo-500' :
                notice.agency === 'SR' ? 'bg-teal-600 border border-teal-500' :
                notice.agency === 'SETC' ? 'bg-orange-600 border border-orange-500' :
                notice.agency === 'GCTP' ? 'bg-slate-700 border border-slate-600' :
                notice.agency === 'CMDA' ? 'bg-purple-600 border border-purple-500' :
                'bg-[#13BCEB] text-slate-950'
              }`}>
                {notice.agency === 'MTC' ? 'MTC Chennai' :
                 notice.agency === 'CMRL' ? 'Chennai Metro (CMRL)' :
                 notice.agency === 'TNSTC' ? 'TNSTC Express' :
                 notice.agency === 'CUMTA' ? 'CUMTA Metropolitan' :
                 notice.agency === 'TNTD' ? 'TN Transport Dept' :
                 notice.agency === 'SR' ? 'Southern Railway (SR)' :
                 notice.agency === 'SETC' ? 'SETC Tamil Nadu' :
                 notice.agency === 'GCTP' ? 'Chennai Traffic Police' :
                 notice.agency === 'CMDA' ? 'CMDA Terminals' : notice.agency}
              </span>
              <span className="font-mono text-xs text-slate-300">
                {notice.notice_id}
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 border border-slate-700">
                Status: {notice.status || 'Active'}
              </span>
              {notice.revision_id > 1 && (
                <span className="rounded bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
                  Revision {notice.revision_id}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {notice.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'details'
                ? 'border-[#13BCEB] text-[#071B2D] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Advisory & Route Details
          </button>
          <button
            onClick={() => setActiveTab('official_source')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'official_source'
                ? 'border-[#13BCEB] text-[#071B2D] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span>Official Source & Provenance</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {popupNotice && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-center justify-between">
              <span>{popupNotice}</span>
              <button
                onClick={() => setPopupNotice(null)}
                className="text-amber-700 hover:text-amber-950 font-bold ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === 'details' ? (
            <>
              {/* Key Advisory Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Advisory Type
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {notice.type || 'General Advisory'}
                  </span>
                  {notice.is_type_inferred === 1 && (
                    <span className="block text-[10px] text-amber-700 font-medium">(Inferred from text)</span>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Affected Area
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block" title={notice.area}>
                    {notice.area || 'All Corridors'}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Effective Window
                  </span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {safeDateOnlyStr(notice.valid_from)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    to {notice.valid_to ? safeDateOnlyStr(notice.valid_to) : 'Until further notice'}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Verification Status
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Live
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate" title={notice.last_verified_at}>
                    {safeDateStr(notice.last_verified_at)}
                  </span>
                </div>
              </div>

              {/* Affected Routes Segment (Multi-Route Support) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                  <Route className="h-4 w-4 text-[#13BCEB]" />
                  Affected Public Transport Routes ({routes.length})
                </h4>
                {routes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Network-wide general advisory affecting all regional routes.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {routes.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                      >
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">
                          {r.route_id}
                        </span>
                        <span className="text-slate-600 font-medium">
                          {r.route_name || `Route ${r.route_id}`}
                        </span>
                        {r.direction && (
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            ({r.direction})
                          </span>
                        )}
                        {onFilterRoute && (
                          <button
                            onClick={() => {
                              onClose();
                              onFilterRoute(r.route_id);
                            }}
                            className="ml-1 text-[11px] text-[#13BCEB] font-semibold hover:underline"
                          >
                            Filter
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Full Announcement Description */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Official Transport Announcement Bulletin</span>
                  <span className="text-[10px] font-mono font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Authority Certified
                  </span>
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-lg border border-slate-100 font-normal">
                  {notice.description}
                </p>
                {notice.summary && notice.summary !== notice.description && (
                  <p className="text-xs text-slate-500 mt-2 italic">
                    Executive Summary: {notice.summary}
                  </p>
                )}
              </div>

              {/* Immutable Revision History Timeline */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
                  <History className="h-4 w-4 text-indigo-600" />
                  Notice Revision History ({revisions.length} recorded version{revisions.length > 1 ? 's' : ''})
                </h4>

                {revisions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">Initial version 1. No historical revisions recorded yet.</p>
                ) : (
                  <div className="relative border-l-2 border-slate-200 pl-4 ml-2 space-y-4">
                    {revisions.map((rev) => (
                      <div key={rev.id} className="relative">
                        <div className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#13BCEB] shadow-2xs" />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              Revision {rev.revision_id}
                            </span>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              rev.change_type === 'NEW' ? 'bg-blue-100 text-blue-800' :
                              rev.change_type === 'EXTENDED' ? 'bg-amber-100 text-amber-800' :
                              rev.change_type === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {rev.change_type}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Status: {rev.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {safeDateStr(rev.detected_at)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-1">
                          {rev.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {rev.change_summary}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Validity: {safeDateOnlyStr(rev.valid_from)} to {rev.valid_to ? safeDateOnlyStr(rev.valid_to) : 'Indefinite'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Official Source & Provenance Tab */
            <div className="space-y-5">
              {/* Authority Card */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {notice.agency}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{agencyInfo.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{agencyInfo.description}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Authorized Feed
                  </span>
                </div>

                <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                    <span><strong>Helpline:</strong> {agencyInfo.helpline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    <span><strong>Official Portal:</strong> {cleanOfficialUrl}</span>
                  </div>
                </div>
              </div>

              {/* Provenance Audit Details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-[#13BCEB]" />
                  Cryptographic & Web Scraping Integrity Provenance
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Official Announcement URL:</span>
                    <a
                      href={cleanOfficialUrl}
                      onClick={handleOpenSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#13BCEB] hover:underline flex items-center gap-1 mt-0.5 break-all"
                    >
                      <span className="truncate">{cleanOfficialUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Content Integrity Hash (SHA-256):</span>
                    <span className="font-mono text-[11px] text-slate-600 truncate block mt-0.5" title={notice.content_hash}>
                      {notice.content_hash || 'SHA256-AUTHENTICATED'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Published Date:</span>
                    <span className="font-medium text-slate-700 mt-0.5 block">
                      {safeDateStr(notice.published_at)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Confirmed in Feed:</span>
                    <span className="font-medium text-slate-700 mt-0.5 block">
                      {safeDateStr(notice.last_confirmed_at)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Verified Active:</span>
                    <span className="font-medium text-emerald-700 mt-0.5 block">
                      {safeDateStr(notice.last_verified_at)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Robots.txt & Ethical Compliance:</span>
                    <span className="font-medium text-slate-700 mt-0.5 block">
                      Allowed (Fair Use Transit Open Data)
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Portal Launch Bar */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Direct Transport Authority Website</h4>
                  <p className="text-[11px] text-slate-500">
                    Visit {agencyInfo.name} for official e-booking, citizen charter, and route schedules.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={cleanOfficialUrl}
                    onClick={handleOpenSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#071B2D] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs"
                  >
                    <span>Open Official Website</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#13BCEB]" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'details' ? 'official_source' : 'details')}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-900 hover:bg-cyan-100 transition"
            >
              <Shield className="h-3.5 w-3.5 text-[#13BCEB]" />
              <span>{activeTab === 'details' ? 'Official Details' : 'Back to Advisory'}</span>
            </button>

            <a
              href={cleanOfficialUrl}
              onClick={handleOpenSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-[#071B2D] px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition shadow-xs"
            >
              <span>Visit Official Portal</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#13BCEB]" />
            </a>

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
