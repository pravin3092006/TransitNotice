import React, { useState } from 'react';
import {
  Bell,
  Search,
  RefreshCw,
  UserCheck,
  ShieldCheck,
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
    if (e.key === 'Enter' && searchValue.trim()) {
      onSearchSubmit(searchValue.trim());
    }
  };

  const handleSwitchPersona = async (
    p: 'PASSENGER' | 'OPERATIONS_MONITOR'
  ) => {
    onPersonaChange(p);

    try {
      await setPersona(p);
    } catch (e) {
      console.warn('Persona update error:', e);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex min-h-16 w-full flex-wrap items-center justify-between gap-2 px-2 py-2 pl-16 sm:flex-nowrap sm:gap-3 sm:px-6 lg:px-8">

        {/* Right controls */}
        <div className="order-1 flex min-w-0 flex-1 items-center justify-end gap-1 sm:order-2 sm:flex-none sm:gap-3">

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefreshClick}
            disabled={isRefreshing}
            title="Refresh transport sources"
            aria-label="Refresh feeds"
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 text-[#13BCEB] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden lg:inline">
              {isRefreshing ? 'Checking...' : 'Sync Feeds'}
            </span>
          </button>

          {/* Passenger / Ops */}
          <div className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => handleSwitchPersona('PASSENGER')}
              aria-label="Passenger mode"
              aria-pressed={currentPersona === 'PASSENGER'}
              className={`flex h-8 items-center justify-center gap-1 rounded-md px-2 sm:px-2.5 font-bold transition ${
                currentPersona === 'PASSENGER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Passenger</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchPersona('OPERATIONS_MONITOR')}
              aria-label="Operations mode"
              aria-pressed={currentPersona === 'OPERATIONS_MONITOR'}
              className={`flex h-8 items-center justify-center gap-1 rounded-md px-2 sm:px-2.5 font-bold transition ${
                currentPersona === 'OPERATIONS_MONITOR'
                  ? 'bg-[#071B2D] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-cyan-500" />
              <span className="hidden sm:inline">Ops</span>
            </button>
          </div>

          {/* Profiles */}
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('users')}
              aria-label="Profiles database"
              className="hidden lg:flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-50 px-2.5 py-2 text-xs font-bold text-cyan-900 hover:bg-cyan-100"
            >
              <User className="h-4 w-4 text-cyan-600" />
              Profiles DB
            </button>
          )}

          {/* Account */}
          {firebaseUser ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifMenu(false);
                }}
                aria-label="Account menu"
                className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-800 hover:bg-slate-100"
              >
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#071B2D] text-[10px] font-bold text-white">
                    {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}

                <span className="hidden lg:inline max-w-[100px] truncate">
                  {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
                </span>

                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[min(270px,calc(100vw-20px))] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 border-b border-slate-100 pb-2">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {firebaseUser.displayName || 'Signed In User'}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {firebaseUser.email}
                    </p>

                    <div className="mt-2 flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700">
                      <Database className="h-3 w-3" />
                      Cloud SQL: ID #{dbUser?.id || 'synced'}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="px-2 py-1 text-slate-500">
                      Role: <strong className="text-slate-800">{dbUser?.role || 'user'}</strong>
                    </p>
                    <p className="px-2 py-1 text-slate-500">
                      Persona: <strong className="text-slate-800">{currentPersona}</strong>
                    </p>
                  </div>

                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-[#071B2D] px-2 sm:px-3 text-xs font-bold text-white hover:bg-slate-800"
            >
              <LogIn className="h-4 w-4 text-[#13BCEB]" />
              <span className="hidden sm:inline">Sign In / Up</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              aria-label={`Notifications, ${unreadCount} unread`}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[min(360px,calc(100vw-16px))] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-slate-800">
                      Advisory Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] text-cyan-800">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="shrink-0 text-[11px] font-medium text-[#13BCEB] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((notif) => (
                      <button
                        type="button"
                        key={notif.id}
                        onClick={() => {
                          onNotificationClick(notif);
                          setShowNotifMenu(false);
                        }}
                        className={`w-full rounded-lg p-2.5 text-left text-xs transition ${
                          notif.is_read
                            ? 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            : 'border-l-4 border-[#13BCEB] bg-cyan-50/60 font-medium text-slate-800 hover:bg-cyan-100'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-cyan-700">
                            {notif.event_type.replace('_', ' ')}
                          </span>
                          <span>
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="line-clamp-1 font-semibold text-slate-900">
                          {notif.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                          {notif.message}
                        </p>
                      </button>
                    ))
                  )}
                </div>

                <div className="mt-2 border-t border-slate-100 pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab?.('notifications');
                      setShowNotifMenu(false);
                    }}
                    className="text-xs font-medium text-[#13BCEB] hover:underline"
                  >
                    View all alerts & delivery logs
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feed Status */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Feeds Live
          </div>
        </div>

        {/* Search */}
        <div className="order-2 flex w-full min-w-0 items-center sm:order-1 sm:w-auto sm:max-w-md sm:flex-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search routes or notices..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKey}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-[#13BCEB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#13BCEB]"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
