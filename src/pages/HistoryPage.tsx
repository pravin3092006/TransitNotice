import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NoticeRevision } from '../types';
import { History, Filter, Clock, RefreshCw, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

interface HistoryItem extends NoticeRevision {
  agency: string;
  area: string;
  notice_primary_routes: string;
}

interface HistoryPageProps {
  onSelectNoticeId: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectNoticeId }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [changeTypeFilter, setChangeTypeFilter] = useState('ALL');

  useEffect(() => {
    loadHistory();
  }, [changeTypeFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getGlobalHistory({
        change_type: changeTypeFilter !== 'ALL' ? changeTypeFilter : undefined,
        limit: 50
      });
      setHistory(data.history as any);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EXTENDED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REVISED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'WITHDRAWN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'EXPIRED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071B2D] tracking-tight">
            Notice Revision & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable historical record of all advisory changes, extensions, cancellations, and status transitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Filter Event:</label>
          <select
            value={changeTypeFilter}
            onChange={(e) => setChangeTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-[#13BCEB] focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="NEW">New (Initial announcement)</option>
            <option value="EXTENDED">Extended (Validity prolonged)</option>
            <option value="REVISED">Revised (Content modified)</option>
            <option value="CANCELLED">Cancelled (Formal cancellation)</option>
            <option value="WITHDRAWN">Withdrawn (Service resumed)</option>
            <option value="EXPIRED">Expired (Elapsed validity)</option>
          </select>
        </div>
      </div>

      {/* Audit Trail List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading audit trail...</div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          No revision events found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#13BCEB] transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${getBadgeColor(rev.change_type)}`}>
                    {rev.change_type}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {rev.notice_id}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    Revision {rev.revision_id}
                  </span>
                  <span className="rounded bg-slate-800 text-white font-bold px-1.5 py-0.5 text-[10px]">
                    {rev.agency}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-[#13BCEB]" />
                  <span>Detected: {new Date(rev.detected_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {rev.title}
                </h3>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  <strong className="text-slate-900">Change Log: </strong>
                  {rev.change_summary}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span><strong>Area:</strong> {rev.area}</span>
                    <span><strong>Status:</strong> {rev.status}</span>
                    <span>
                      <strong>Window:</strong> {new Date(rev.valid_from).toLocaleDateString()} to {rev.valid_to ? new Date(rev.valid_to).toLocaleDateString() : 'Indefinite'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectNoticeId(rev.notice_id)}
                    className="flex items-center gap-1 text-xs font-bold text-[#13BCEB] hover:underline"
                  >
                    <span>Inspect Notice</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
