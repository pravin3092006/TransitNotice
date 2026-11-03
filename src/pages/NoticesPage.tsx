import React, { useState, useEffect } from 'react';
import { TransitNotice } from '../types';
import { api } from '../services/api';
import { NoticeCard } from '../components/NoticeCard';
import {
  Search,
  Filter,
  RotateCcw,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Route,
  Shield,
  RefreshCw,
  Building2
} from 'lucide-react';

interface NoticesPageProps {
  initialSearch?: string;
  initialRouteFilter?: string;
  onSelectNotice: (notice: TransitNotice) => void;
  onClearInitialRouteFilter?: () => void;
  onOpenSourceModal?: (notice: TransitNotice) => void;
}

export const NoticesPage: React.FC<NoticesPageProps> = ({
  initialSearch = '',
  initialRouteFilter = '',
  onSelectNotice,
  onClearInitialRouteFilter,
  onOpenSourceModal
}) => {
  const [notices, setNotices] = useState<TransitNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [agency, setAgency] = useState('ALL');
  const [area, setArea] = useState('');
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [routeId, setRouteId] = useState(initialRouteFilter);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('published_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (initialRouteFilter) {
      setRouteId(initialRouteFilter);
    }
  }, [initialRouteFilter]);

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await api.getNotices({
        search: search.trim() || undefined,
        agency: agency !== 'ALL' ? agency : undefined,
        area: area.trim() || undefined,
        type: type !== 'ALL' ? type : undefined,
        status: status !== 'ALL' ? status : undefined,
        route_id: routeId.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 9
      });
      setNotices(data.notices);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [search, agency, area, type, status, routeId, startDate, endDate, sortBy, sortOrder, page]);

  const handleResetFilters = () => {
    setSearch('');
    setAgency('ALL');
    setArea('');
    setType('ALL');
    setStatus('ALL');
    setRouteId('');
    setStartDate('');
    setEndDate('');
    setSortBy('published_at');
    setSortOrder('desc');
    setPage(1);
    if (onClearInitialRouteFilter) onClearInitialRouteFilter();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071B2D] tracking-tight">
            Live Service Notices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Searchable registry of official transit advisories with multi-route support and revision tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Card / Table View Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`rounded p-1.5 transition ${viewMode === 'cards' ? 'bg-white text-[#13BCEB] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded p-1.5 transition ${viewMode === 'table' ? 'bg-white text-[#13BCEB] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
            {totalCount} notice{totalCount !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        {/* Search row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keywords, notice title, ID, or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#13BCEB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#13BCEB]"
            />
          </div>

          <div className="relative">
            <Route className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Route ID (e.g. Route-73, Central, Yellow)..."
              value={routeId}
              onChange={(e) => {
                setRouteId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#13BCEB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#13BCEB]"
            />
          </div>
        </div>

        {/* Faceted Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Agency */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Agency
            </label>
            <select
              value={agency}
              onChange={(e) => {
                setAgency(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#13BCEB] focus:outline-none"
            >
              <option value="ALL">All Agencies</option>
              <option value="MTC">MTC (Chennai Buses)</option>
              <option value="CMRL">CMRL (Chennai Metro)</option>
              <option value="TNSTC">TNSTC (State Transport)</option>
              <option value="CUMTA">CUMTA (Unified Transit)</option>
              <option value="TNTD">TNTD (Transport Dept)</option>
              <option value="SR">SR (Southern Railway Suburban)</option>
              <option value="SETC">SETC (State Express)</option>
              <option value="GCTP">GCTP (Traffic Police)</option>
              <option value="CMDA">CMDA (Mobility Terminals)</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Advisory Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#13BCEB] focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="Route Diversion">Route Diversion</option>
              <option value="Service Interruption">Service Interruption</option>
              <option value="Planned Maintenance">Planned Maintenance</option>
              <option value="Delay">Delay</option>
              <option value="Route Closure">Route Closure</option>
              <option value="Service Cancellation">Cancellation</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#13BCEB] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Area */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Area
            </label>
            <input
              type="text"
              placeholder="e.g. Oxford Circus, Downtown"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#13BCEB] focus:outline-none"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#13BCEB] focus:outline-none"
            >
              <option value="published_at">Published Date</option>
              <option value="valid_from">Start Date</option>
              <option value="valid_to">End Date</option>
              <option value="last_verified_at">Verification Time</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 py-1.5 text-xs font-semibold text-slate-700 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Multi-Route filter active banner */}
        {routeId && (
          <div className="flex items-center justify-between rounded-lg bg-cyan-50 border border-cyan-200 px-3 py-2 text-xs text-cyan-900">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-[#13BCEB]" />
              <span>
                Filtering by affected route: <strong>{routeId}</strong> (Advisories affecting this route, even across multi-line notices, are shown).
              </span>
            </div>
            <button
              onClick={() => {
                setRouteId('');
                if (onClearInitialRouteFilter) onClearInitialRouteFilter();
              }}
              className="text-cyan-700 font-bold hover:underline"
            >
              Clear Route Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Cards or Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-7 w-7 animate-spin text-[#13BCEB]" />
        </div>
      ) : notices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
          <Filter className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No notices match your filter criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the filters or modifying the route identifier.</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 rounded-lg bg-[#071B2D] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.notice_id}
              notice={notice}
              onClick={() => onSelectNotice(notice)}
              onFilterRoute={(r) => {
                setRouteId(r);
                setPage(1);
              }}
              onOpenSourceModal={onOpenSourceModal}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Notice ID</th>
                  <th className="py-3 px-4">Agency</th>
                  <th className="py-3 px-4">Affected Routes</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Area</th>
                  <th className="py-3 px-4">Validity Range</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Revision</th>
                  <th className="py-3 px-4">Last Verified</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notices.map((n) => (
                  <tr
                    key={n.notice_id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => onSelectNotice(n)}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{n.notice_id}</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-800 text-white font-bold px-1.5 py-0.5 text-[10px]">{n.agency}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {n.affected_routes && n.affected_routes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {n.affected_routes.map((r, i) => (
                            <span key={i} className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-700">
                              {r.route_id}
                            </span>
                          ))}
                        </div>
                      ) : (
                        n.route_id
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700">{n.type}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">{n.area}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(n.valid_from).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      {n.valid_to ? ` - ${new Date(n.valid_to).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : ' (Open)'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        n.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        n.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        n.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {n.revision_id > 1 ? (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                          v{n.revision_id}
                        </span>
                      ) : (
                        'v1'
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(n.last_verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
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
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages} ({totalCount} total advisories)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
