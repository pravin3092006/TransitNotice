import React, { useState } from 'react';
import {
  Bell,
  Search,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  LogIn,
  ChevronDown,
  Database
} from 'lucide-react';
import { NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentPersona: 'PASSENGER' | 'OPERATIONS_MONITOR';
  onPersonaChange: (persona: 'PASSENGER' | 'OPERATIONS_MONITOR') => void;
  onSearchSubmit: (query: string) => void;
  onRefreshClick: () => void;
  isRefreshing: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  onNotificationClick: (notif: NotificationItem) => void;
  onMarkAllRead: () => void;
  onOpenAuthModal: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  onPersonaChange,
  onSearchSubmit,
  onRefreshClick,
  isRefreshing,
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAllRead,
  onOpenAuthModal,
  onNavigateTab
}) => {
  const { firebaseUser, dbUser, logout, setPersona } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchValue);
    }
  };

  const handleSwitchPersona = async (p: 'PASSENGER' | 'OPERATIONS_MONITOR') => {
    onPersonaChange(p);
    try {
      await setPersona(p);
    } catch (e) {
      console.warn('Persona update error:', e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Search Bar */}
      <div className="flex flex-1 items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search routes, corridors, notices (e.g. 21G, 102, 570, Blue Line, Kilambakkam, OMR)..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKey}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-[#13BCEB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#13BCEB]"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Scraper Manual Refresh */}
        <button
          onClick={onRefreshClick}
          disabled={isRefreshing}
          title="Manual refresh of permitted transport sources"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#13BCEB] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{isRefreshing ? 'Checking Feeds...' : 'Sync Feeds'}</span>
        </button>

        {/* Persona Switcher (Passenger vs Ops Controller) */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => handleSwitchPersona('PASSENGER')}
            className={`flex items-center gap-1 rounded-md px-2 sm:px-2.5 py-1 font-bold transition cursor-pointer ${
              currentPersona === 'PASSENGER'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Daily Passenger Commuter Mode"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="inline text-[11px] sm:text-xs">Passenger</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchPersona('OPERATIONS_MONITOR')}
            className={`flex items-center gap-1 rounded-md px-2 sm:px-2.5 py-1 font-bold transition cursor-pointer ${
              currentPersona === 'OPERATIONS_MONITOR'
                ? 'bg-[#071B2D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Operations Controller Mode"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[11px] sm:text-xs">Ops</span>
          </button>
        </div>

        {/* User Profiles DB Shortcut */}
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('users')}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-50/70 hover:bg-cyan-100 px-2.5 py-1.5 text-xs font-bold text-cyan-900 transition cursor-pointer"
            title="Manage User Profiles stored in SQLite Database"
          >
            <User className="h-3.5 w-3.5 text-cyan-600" />
            <span>Profiles DB</span>
          </button>
        )}

        {/* User Account Button / Dropdown */}
        {firebaseUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100 transition"
            >
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'User'}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#071B2D] text-[10px] font-bold text-white">
                  {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="hidden md:inline max-w-[100px] truncate">
                {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in">
                <div className="border-b border-slate-100 pb-2 mb-2">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {firebaseUser.displayName || 'Signed In User'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{firebaseUser.email}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    <Database className="h-3 w-3" />
                    <span>Cloud SQL: ID #{dbUser?.id || 'synced'}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="px-2 py-1 text-[11px] text-slate-500">
                    Role: <strong className="text-slate-800 uppercase">{dbUser?.role || 'user'}</strong>
                  </div>
                  <div className="px-2 py-1 text-[11px] text-slate-500">
                    Persona: <strong className="text-slate-800">{currentPersona}</strong>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2 mt-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 rounded-lg bg-[#071B2D] px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs"
          >
            <LogIn className="h-3.5 w-3.5 text-[#13BCEB]" />
            <span>Sign In / Up</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            title="Advisory Alerts & Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Advisory Alerts</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-800">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-[11px] font-medium text-[#13BCEB] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        onNotificationClick(notif);
                        setShowNotifMenu(false);
                      }}
                      className={`cursor-pointer rounded-lg p-2.5 transition text-left text-xs ${
                        notif.is_read ? 'bg-slate-50 hover:bg-slate-100 text-slate-600' : 'bg-cyan-50/60 hover:bg-cyan-100/50 text-slate-800 font-medium border-l-3 border-[#13BCEB]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold text-cyan-700">{notif.event_type.replace('_', ' ')}</span>
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="font-semibold text-slate-900 line-clamp-1">{notif.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 pt-2 mt-2 text-center">
                <a
                  href="#/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs font-medium text-[#13BCEB] hover:underline"
                >
                  View all alerts & delivery logs →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Live Feed Status Chip */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Feeds Live</span>
        </div>
      </div>
    </header>
  );
};
