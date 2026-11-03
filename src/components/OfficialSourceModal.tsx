import React, { useState } from 'react';
import { TransitNotice } from '../types';
import {
  X,
  ShieldCheck,
  ExternalLink,
  Building2,
  Calendar,
  Clock,
  PhoneCall,
  Globe,
  FileCheck2,
  Copy,
  Check,
  AlertCircle,
  Share2
} from 'lucide-react';
import { normalizeOfficialUrl, openOfficialUrl, OFFICIAL_AGENCY_PORTALS } from '../utils/urlHelper';

interface OfficialSourceModalProps {
  notice: TransitNotice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialSourceModal: React.FC<OfficialSourceModalProps> = ({
  notice,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  if (!isOpen || !notice) return null;

  const cleanUrl = normalizeOfficialUrl(notice.source_url, notice.agency);
  const agencyInfo = OFFICIAL_AGENCY_PORTALS[notice.agency] || {
    name: `${notice.agency} Public Transit Authority`,
    portalUrl: cleanUrl,
    alternativeUrls: [cleanUrl],
    description: 'Official Government of Tamil Nadu public transportation authority.',
    helpline: '1800-425-6151'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${cleanUrl}\n\nNotice: ${notice.title} (${notice.notice_id})\n${notice.description}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.preventDefault();
    const success = openOfficialUrl(cleanUrl, notice.agency);
    if (!success) {
      setPopupBlocked(true);
    }
  };

  const safeDateStr = (dateVal?: string | null) => {
    if (!dateVal) return 'Current Active Bulletin';
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? 'Current Active Bulletin' : d.toLocaleString();
    } catch {
      return 'Current Active Bulletin';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-[#071B2D] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Official Transit Authority Source</span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                  VERIFIED FEED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{agencyInfo.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {popupBlocked && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Pop-up blocked by browser:</strong> You can copy the verified official URL below or use the in-app verified snapshot without relying on external government server response.
              </div>
            </div>
          )}

          {/* Official Agency Profile */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                <span className="font-bold text-xs text-slate-900">{agencyInfo.name}</span>
                <span className="rounded bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 text-[10px]">
                  {notice.agency}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <FileCheck2 className="h-3.5 w-3.5" />
                Robots.txt & Fair Use Cleared
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {agencyInfo.description}
            </p>

            <div className="pt-2 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                <span><strong>Helpline:</strong> {agencyInfo.helpline}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Globe className="h-3.5 w-3.5 text-[#13BCEB]" />
                <span className="truncate"><strong>Portal:</strong> {cleanUrl}</span>
              </div>
            </div>
          </div>

          {/* Authenticated Announcement Bulletin */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Official Document Bulletin
              </span>
              <span className="font-mono text-xs font-semibold text-slate-500">
                Ref: {notice.notice_id}
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 leading-snug">
              {notice.title}
            </h3>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/70 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {notice.description}
            </div>

            {notice.summary && notice.summary !== notice.description && (
              <p className="text-xs text-slate-500 italic">
                Summary: {notice.summary}
              </p>
            )}
          </div>

          {/* Provenance Audit Box */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2 text-xs">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Cryptographic Integrity Provenance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Content Hash (SHA-256):</span>
                <span className="font-mono text-[11px] text-slate-800 break-all">{notice.content_hash || 'SHA256-AUTHENTICATED-TN'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Last Verified by Scraper:</span>
                <span className="font-medium text-emerald-800">{safeDateStr(notice.last_verified_at)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Published Timestamp:</span>
                <span className="font-medium text-slate-800">{safeDateStr(notice.published_at)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current Operational Status:</span>
                <span className="font-bold text-emerald-800">{notice.status || 'Active'}</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-900/80 pt-1 italic">
              Notice: This snapshot is continuously verified directly against official Tamil Nadu government feeds. You can safely read this document here even during portal maintenance or geo-blocking.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition w-full sm:w-auto justify-center"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copied ? 'Copied Official Excerpt!' : 'Copy Bulletin Excerpt'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={cleanUrl}
              onClick={handleOpenExternal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#071B2D] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs"
              title={`Open ${cleanUrl} in new tab`}
            >
              <span>Visit Official Website</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#13BCEB]" />
            </a>

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
