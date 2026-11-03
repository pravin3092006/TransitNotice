import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bus, Search, Route as RouteIcon, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RoutesPageProps {
  onSelectRouteFilter: (routeId: string) => void;
}

export const RoutesPage: React.FC<RoutesPageProps> = ({ onSelectRouteFilter }) => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('ALL');

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const data = await api.getRoutes();
      setRoutes(data.routes);
    } catch (err) {
      console.error('Failed to load routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = routes.filter((r) => {
    const matchesSearch =
      r.route_id.toLowerCase().includes(search.toLowerCase()) ||
      (r.route_name && r.route_name.toLowerCase().includes(search.toLowerCase())) ||
      (r.area && r.area.toLowerCase().includes(search.toLowerCase()));
    const matchesAgency = agencyFilter === 'ALL' || r.agency === agencyFilter;
    return matchesSearch && matchesAgency;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071B2D] tracking-tight">
            Routes Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse all public transport lines extracted from monitored official notices.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
          {filtered.length} route line{filtered.length !== 1 ? 's' : ''} monitored
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search routes by ID, line name, or area (e.g. 21G, 570, Blue-Line, Kilambakkam)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#13BCEB] focus:outline-none focus:ring-1 focus:ring-[#13BCEB]"
          />
        </div>

        <select
          value={agencyFilter}
          onChange={(e) => setAgencyFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#13BCEB] focus:outline-none"
        >
          <option value="ALL">All Transport Agencies</option>
          <option value="MTC">MTC Chennai</option>
          <option value="CMRL">CMRL Metro</option>
          <option value="TNSTC">TNSTC State Express</option>
          <option value="CUMTA">CUMTA Authority</option>
          <option value="TNTD">TN Transport Dept</option>
          <option value="SR">Southern Railway (SR)</option>
          <option value="SETC">SETC Long-Distance</option>
          <option value="GCTP">Traffic Police (GCTP)</option>
          <option value="CMDA">CMDA Terminals</option>
        </select>
      </div>

      {/* Route Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading routes directory...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          No routes match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((route) => {
            const hasDisruption = route.active_notices > 0;
            return (
              <div
                key={`${route.agency}-${route.route_id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#13BCEB] hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-[#071B2D] px-2 py-0.5 text-xs font-bold text-white">
                      {route.agency}
                    </span>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      hasDisruption
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {hasDisruption ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                      <span>{hasDisruption ? `${route.active_notices} Active Notice${route.active_notices > 1 ? 's' : ''}` : 'Good Service'}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {route.route_name || `Route ${route.route_id}`}
                  </h3>
                  <div className="font-mono text-xs text-slate-500 mt-0.5">
                    Identifier: {route.route_id} • Mode: {route.route_mode || 'Transit'}
                  </div>

                  <div className="mt-3 text-xs text-slate-600">
                    <span className="text-slate-400">Area: </span>
                    <span className="font-medium">{route.area || 'Metro Area Corridor'}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Total Lifetime Notices: {route.total_notices}
                  </span>
                  <button
                    onClick={() => onSelectRouteFilter(route.route_id)}
                    className="flex items-center gap-1 text-xs font-bold text-[#13BCEB] hover:underline"
                  >
                    <span>View Advisories</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
