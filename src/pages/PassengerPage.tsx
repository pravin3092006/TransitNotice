import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Bus,
  Search,
  Filter,
  Route,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Star,
  BookmarkCheck,
  ArrowRight,
  Train,
  Navigation
} from 'lucide-react';
import { TransitNotice, UserProfile } from '../types';
import { api } from '../services/api';
import { NoticeCard } from '../components/NoticeCard';

interface PassengerPageProps {
  onSelectNotice: (notice: TransitNotice) => void;
  onFilterRoute: (routeId: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenSourceModal?: (notice: TransitNotice) => void;
}

export const PassengerPage: React.FC<PassengerPageProps> = ({
  onSelectNotice,
  onFilterRoute,
  onNavigateTab,
  onOpenSourceModal
}) => {
  const [notices, setNotices] = useState<TransitNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string>('ALL');
  const [searchStop, setSearchStop] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string>('ALL');
  const [savedRoutes, setSavedRoutes] = useState<string[]>(['21G', 'Blue-Line', '570']);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  const popularCorridors = [
    { id: '21G', name: 'MTC 21G', desc: 'Broadway - Kilambakkam KCBT', agency: 'MTC', mode: 'BUS' },
    { id: 'Blue-Line', name: 'CMRL Blue Line', desc: 'Wimco Nagar - Central - Airport', agency: 'CMRL', mode: 'METRO' },
    { id: '570', name: 'MTC 570', desc: 'CMBT Koyambedu - Siruseri OMR', agency: 'MTC', mode: 'BUS' },
    { id: '102', name: 'MTC 102', desc: 'Broadway - Kelambakkam via Adyar', agency: 'MTC', mode: 'BUS' },
    { id: 'Green-Line', name: 'CMRL Green Line', desc: 'Central - Koyambedu - St. Thomas Mount', agency: 'CMRL', mode: 'METRO' },
    { id: 'TNSTC-SETC', name: 'TNSTC SETC', desc: 'Kilambakkam to Southern Districts', agency: 'TNSTC', mode: 'EXPRESS' },
    { id: '54', name: 'MTC 54', desc: 'Broadway - Poonamallee via Porur', agency: 'MTC', mode: 'BUS' },
    { id: '29C', name: 'MTC 29C', desc: 'Besant Nagar - Perambur via Mylapore', agency: 'MTC', mode: 'BUS' },
    { id: 'M1', name: 'MTC M1', desc: 'Thiruvanmiyur - Kilambakkam KCBT', agency: 'MTC', mode: 'BUS' },
    { id: 'SR-SUBURBAN', name: 'Southern Railway Suburban', desc: 'Beach - Tambaram - Chengalpattu EMU', agency: 'SR', mode: 'RAIL' },
    { id: 'SR-MRTS', name: 'Chennai MRTS Line', desc: 'Chennai Beach - Velachery Elevated', agency: 'SR', mode: 'RAIL' },
    { id: 'SETC-SOUTH', name: 'SETC Interstate Sleeper', desc: 'KCBT Kilambakkam to Southern Districts', agency: 'SETC', mode: 'EXPRESS' },
    { id: 'GCTP-DIV', name: 'Traffic Police Advisory', desc: 'Mount-Poonamallee & OMR Bus Lanes', agency: 'GCTP', mode: 'TRAFFIC' }
  ];

  const transitHubs = [
    'Kilambakkam (KCBT)',
    'Chennai Central',
    'Koyambedu (CMBT)',
    'Airport Metro',
    'Guindy',
    'Tambaram',
    'OMR IT Expressway',
    'Porur Junction'
  ];

  const fetchPassengerNotices = async () => {
    setLoading(true);
    try {
      const data = await api.getNotices({
        status: 'Active',
        agency: selectedAgency !== 'ALL' ? selectedAgency : undefined,
        route_id: selectedRoute !== 'ALL' ? selectedRoute : undefined,
        search: searchStop.trim() || undefined,
        limit: 12
      });
      setNotices(data.notices);
    } catch (err) {
      console.error('Failed to load passenger notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengerNotices();
  }, [selectedRoute, selectedAgency, searchStop]);

  useEffect(() => {
    api.getActiveUser()
      .then((res) => {
        if (res.user) {
          setActiveProfile(res.user);
          if (res.user.preferred_routes && res.user.preferred_routes.length > 0) {
            setSavedRoutes(res.user.preferred_routes);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch active profile:', err));
  }, []);

  const toggleSaveRoute = (routeId: string) => {
    setSavedRoutes((prev) =>
      prev.includes(routeId) ? prev.filter((r) => r !== routeId) : [...prev, routeId]
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Passenger Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#071B2D] to-[#071B2D] text-white p-6 sm:p-10 shadow-xl border border-emerald-900/60">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 border border-emerald-400/40 px-3.5 py-1 text-xs font-bold text-emerald-300 mb-4 shadow-xs">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            <span>Passenger Commuter Portal • Daily Transit Advisor</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Plan your daily Chennai & Tamil Nadu commute with live advisories.
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
            Real-time route diversions, special Kilambakkam (KCBT) shuttles, Metro catenary notices, and bus priority updates tailored for daily passengers and commuters.
          </p>

          {/* Search by bus stop / station / area */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300" />
              <input
                type="text"
                placeholder="Search by stop or hub (e.g., Kilambakkam, Central, Guindy, Porur, OMR)..."
                value={searchStop}
                onChange={(e) => setSearchStop(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 pl-10 text-xs sm:text-sm text-white placeholder-emerald-200/60 backdrop-blur-md focus:bg-white/20 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
              />
            </div>
            {searchStop && (
              <button
                onClick={() => setSearchStop('')}
                className="rounded-xl bg-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/30 transition text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Hub Filter Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-emerald-200 font-semibold mr-1 flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              Transit Hubs:
            </span>
            {transitHubs.map((hub) => (
              <button
                key={hub}
                onClick={() => setSearchStop(hub)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition border ${
                  searchStop === hub
                    ? 'bg-emerald-400 text-slate-950 border-emerald-400 font-bold shadow-xs'
                    : 'bg-white/10 text-emerald-100 hover:bg-white/20 border-white/10'
                }`}
              >
                {hub}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Commuter Persona Profile & My Subscribed Routes */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Passenger Persona Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-lg">
              {activeProfile?.name?.charAt(0) || <UserCheck className="h-6 w-6" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {activeProfile?.persona?.replace('_', ' ') || 'Daily Commuter'}
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-0.5">{activeProfile?.name || 'Maya Lin'}</h3>
              <p className="text-xs text-slate-500">{activeProfile?.role_title || 'Chennai Transit Commuter'}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Boarding Hub:</span>
              <strong className="text-slate-800">{activeProfile?.home_station || 'Kilambakkam (KCBT)'}</strong>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Destination:</span>
              <strong className="text-slate-800">{activeProfile?.work_station || 'Chennai Central'}</strong>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Agencies:</span>
              <span className="text-emerald-700 font-bold">
                {activeProfile?.preferred_agencies?.join(', ') || 'MTC, CMRL'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Active Subscriptions:</span>
              <strong className="text-[#13BCEB]">{savedRoutes.length} Corridors</strong>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onNavigateTab('users')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2 px-4 text-xs font-bold text-white hover:bg-cyan-500 transition shadow-xs cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>Edit Profile in Database</span>
            </button>
            <button
              onClick={() => onNavigateTab('notifications')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2 px-4 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <Bell className="h-4 w-4 text-cyan-600" />
              <span>Manage Commute Alerts</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Route Selector & Bookmarking */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-emerald-600" />
                <span>My Commute Corridors</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any route to instantly filter active diversions and timetable advisories.
              </p>
            </div>
            <span className="text-xs text-slate-400">
              Filter: <strong className="text-slate-800">{selectedRoute}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {popularCorridors.map((c) => {
              const isSelected = selectedRoute === c.id;
              const isSaved = savedRoutes.includes(c.id);

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedRoute(isSelected ? 'ALL' : c.id)}
                  className={`relative flex flex-col justify-between rounded-xl p-3 border cursor-pointer transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded text-white ${
                      c.agency === 'MTC' ? 'bg-emerald-700' :
                      c.agency === 'CMRL' ? 'bg-blue-600' : 'bg-rose-700'
                    }`}>
                      {c.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveRoute(c.id);
                      }}
                      className="text-slate-400 hover:text-amber-500 transition"
                      title={isSaved ? 'Remove from saved' : 'Save route'}
                    >
                      <Star className={`h-4 w-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <p className="text-[11px] font-medium text-slate-700 mt-2 line-clamp-1">
                    {c.desc}
                  </p>

                  <div className="mt-2.5 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="uppercase font-semibold tracking-wider">{c.mode}</span>
                    <span className={isSelected ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                      {isSelected ? 'Active Filter ✓' : 'Click to filter'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedRoute !== 'ALL' && (
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-medium">
                Filtering by <strong>{selectedRoute}</strong>
              </span>
              <button
                onClick={() => setSelectedRoute('ALL')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Reset Route Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Agency Filter Tabs */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Live Disruptions Impacting Commuters</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified official notices currently in effect for Chennai & Tamil Nadu
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedAgency('ALL')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                selectedAgency === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Agencies
            </button>
            <button
              onClick={() => setSelectedAgency('MTC')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                selectedAgency === 'MTC' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MTC Buses
            </button>
            <button
              onClick={() => setSelectedAgency('CMRL')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                selectedAgency === 'CMRL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CMRL Metro
            </button>
            <button
              onClick={() => setSelectedAgency('TNSTC')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                selectedAgency === 'TNSTC' ? 'bg-rose-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TNSTC Express
            </button>
            <button
              onClick={() => setSelectedAgency('CUMTA')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                selectedAgency === 'CUMTA' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CUMTA
            </button>
            <button
              onClick={() => setSelectedAgency('SR')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                selectedAgency === 'SR' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SR Suburban
            </button>
            <button
              onClick={() => setSelectedAgency('SETC')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                selectedAgency === 'SETC' ? 'bg-orange-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SETC Buses
            </button>
            <button
              onClick={() => setSelectedAgency('GCTP')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                selectedAgency === 'GCTP' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Traffic Police
            </button>
          </div>
        </div>

        {/* Notices Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading active passenger notices...</div>
        ) : notices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800">No disruptions reported for this filter</h3>
            <p className="text-xs text-slate-500 mt-1">Normal scheduled services are running smoothly.</p>
            <button
              onClick={() => {
                setSelectedRoute('ALL');
                setSelectedAgency('ALL');
                setSearchStop('');
              }}
              className="mt-4 rounded-lg bg-[#071B2D] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notices.map((notice) => (
              <NoticeCard
                key={notice.notice_id}
                notice={notice}
                onClick={() => onSelectNotice(notice)}
                onFilterRoute={(r) => onFilterRoute(r)}
                onOpenSourceModal={onOpenSourceModal}
              />
            ))}
          </div>
        )}
      </section>

      {/* Official Booking & Timetable Links for Passengers */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-[#13BCEB]" />
          <span>Official Passenger Portals for Online Booking & Real-Time Tracking</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://mtcbus.tn.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition group"
          >
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">MTC Bus Routes & Pass</span>
              <p className="text-[11px] text-slate-500">Citizen charter & bus timetable</p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </a>

          <a
            href="https://chennaimetrorail.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200 hover:border-blue-500 hover:shadow-xs transition group"
          >
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700">CMRL Metro QR Ticket</span>
              <p className="text-[11px] text-slate-500">Fare chart & smart card recharge</p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
          </a>

          <a
            href="https://www.tnstc.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200 hover:border-rose-500 hover:shadow-xs transition group"
          >
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-rose-700">TNSTC / SETC E-Booking</span>
              <p className="text-[11px] text-slate-500">Book long-distance bus tickets</p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-rose-600 transition" />
          </a>
        </div>
      </section>
    </div>
  );
};
