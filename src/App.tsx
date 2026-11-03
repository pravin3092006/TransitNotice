import React, { useCallback, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { api } from './services/api';
import { DashboardStats, NoticeRevision, NotificationItem, TransitNotice } from './types';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { NoticeDetailModal } from './components/NoticeDetailModal';
import { OfficialSourceModal } from './components/OfficialSourceModal';

import { HomePage } from './pages/HomePage';
import { PassengerPage } from './pages/PassengerPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { NoticesPage } from './pages/NoticesPage';
import { RoutesPage } from './pages/RoutesPage';
import { AgenciesPage } from './pages/AgenciesPage';
import { HistoryPage } from './pages/HistoryPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ScraperMonitoringPage } from './pages/ScraperMonitoringPage';
import { MentorConsolePage } from './pages/MentorConsolePage';
import { SettingsPage } from './pages/SettingsPage';

type Persona = 'PASSENGER' | 'OPERATIONS_MONITOR';

function AppShell() {
  const [tab, setTab] = useState('home');
  const [persona, setPersona] = useState<Persona>('PASSENGER');
  const [search, setSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<TransitNotice[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [selected, setSelected] = useState<TransitNotice | null>(null);
  const [revisions, setRevisions] = useState<NoticeRevision[]>([]);
  const [sourceNotice, setSourceNotice] = useState<TransitNotice | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [s, n, notif] = await Promise.allSettled([
      api.getStats(),
      api.getNotices({ limit: 8, sortBy: 'published_at', sortOrder: 'desc' }),
      api.getNotifications(),
    ]);
    if (s.status === 'fulfilled') setStats(s.value);
    if (n.status === 'fulfilled') setRecent(n.value.notices || []);
    if (notif.status === 'fulfilled') {
      setNotifications(notif.value.notifications || []);
      setUnread(notif.value.unreadCount || 0);
    }
    const failed = [s, n, notif].find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
    if (failed) {
      const err: any = failed.reason;
      const msg = err?.response
        ? `HTTP ${err.response.status} from ${err.config?.url}`
        : err?.message || 'Unknown error';
      console.error('API load failed:', err);
      setApiError(`Cannot reach backend API (${msg}). Make sure Render runs "npm start" as a Web Service.`);
    } else {
      setApiError(null);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 60000);
    return () => clearInterval(t);
  }, [loadAll]);

  const openNotice = async (notice: TransitNotice) => {
    setSelected(notice);
    try {
      const full = await api.getNoticeById(notice.notice_id);
      setRevisions(full.revisions || []);
    } catch {
      setRevisions([]);
    }
  };

  const openNoticeById = async (id: string) => {
    try {
      const full = await api.getNoticeById(id);
      setSelected(full);
      setRevisions(full.revisions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const goTab = (t: string) => setTab(t);

  const doSearch = (q: string) => {
    setSearch(q);
    setTab('notices');
  };

  const filterRoute = (routeId: string) => {
    setRouteFilter(routeId);
    setTab('notices');
    setSelected(null);
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await api.triggerScraperRefresh();
    } catch (e) {
      console.error(e);
    }
    await loadAll();
    setRefreshing(false);
  };

  const onNotificationClick = async (n: NotificationItem) => {
    try {
      await api.markNotificationRead(n.id);
    } catch {}
    loadAll();
    openNoticeById(n.notice_id);
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
    } catch {}
    loadAll();
  };

  const renderPage = () => {
    switch (tab) {
      case 'home':
        return (
          <HomePage
            stats={stats}
            recentNotices={recent}
            onSearch={doSearch}
            onSelectNotice={openNotice}
            onNavigateTab={goTab}
            onFilterRoute={filterRoute}
            onOpenSourceModal={setSourceNotice}
          />
        );
      case 'passenger':
        return (
          <PassengerPage
            onSelectNotice={openNotice}
            onFilterRoute={filterRoute}
            onNavigateTab={goTab}
            onOpenSourceModal={setSourceNotice}
          />
        );
      case 'users':
        return <UserProfilePage onNavigateTab={goTab} />;
      case 'dashboard':
        return (
          <DashboardPage
            stats={stats}
            recentNotices={recent}
            onSelectNotice={openNotice}
            onNavigateTab={goTab}
          />
        );
      case 'notices':
        return (
          <NoticesPage
            initialSearch={search}
            initialRouteFilter={routeFilter}
            onSelectNotice={openNotice}
            onClearInitialRouteFilter={() => setRouteFilter('')}
            onOpenSourceModal={setSourceNotice}
          />
        );
      case 'routes':
        return <RoutesPage onSelectRouteFilter={filterRoute} />;
      case 'agencies':
        return <AgenciesPage />;
      case 'history':
        return <HistoryPage onSelectNoticeId={openNoticeById} />;
      case 'notifications':
        return <NotificationsPage onSelectNoticeId={openNoticeById} />;
      case 'scraper':
        return <ScraperMonitoringPage />;
      case 'mentor':
        return <MentorConsolePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar currentTab={tab} onSelectTab={goTab} unreadAlertsCount={unread} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          currentPersona={persona}
          onPersonaChange={setPersona}
          onSearchSubmit={doSearch}
          onRefreshClick={refresh}
          isRefreshing={refreshing}
          notifications={notifications}
          unreadCount={unread}
          onNotificationClick={onNotificationClick}
          onMarkAllRead={markAllRead}
          onOpenAuthModal={() => setAuthOpen(true)}
          onNavigateTab={goTab}
        />
        {apiError && (
          <div className="mx-6 mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {apiError}
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>

      <NoticeDetailModal
        notice={selected}
        revisions={revisions}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        onFilterRoute={filterRoute}
      />
      <OfficialSourceModal
        notice={sourceNotice}
        isOpen={!!sourceNotice}
        onClose={() => setSourceNotice(null)}
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
