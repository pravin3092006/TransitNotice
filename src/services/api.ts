import axios from 'axios';
import {
  TransitNotice,
  Agency,
  Source,
  ScrapeLog,
  NotificationItem,
  Subscriber,
  UserProfile,
  DashboardStats,
  NoticeRevision
} from '../types';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000
});

export const api = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await client.get('/dashboard/stats');
    return res.data;
  },

  getNotices: async (params: {
    search?: string;
    agency?: string;
    area?: string;
    type?: string;
    status?: string;
    route_id?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await client.get('/notices', { params });
    return res.data as {
      notices: TransitNotice[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  },

  getNoticeById: async (id: string) => {
    const res = await client.get(`/notices/${encodeURIComponent(id)}`);
    return res.data as TransitNotice & {
      revisions: NoticeRevision[];
      agency_info: Agency;
      source_info: Source | null;
    };
  },

  getNoticeHistory: async (id: string) => {
    const res = await client.get(`/notices/${encodeURIComponent(id)}/history`);
    return res.data as { notice_id: string; revisions: NoticeRevision[] };
  },

  getGlobalHistory: async (params?: { change_type?: string; limit?: number }) => {
    const res = await client.get('/history', { params });
    return res.data as { history: Array<NoticeRevision & { agency: string; area: string; notice_primary_routes: string }> };
  },

  getRoutes: async () => {
    const res = await client.get('/routes');
    return res.data as {
      routes: Array<{
        route_id: string;
        route_name: string;
        route_mode: string;
        agency: string;
        area: string;
        total_notices: number;
        active_notices: number;
        last_updated: string;
      }>;
    };
  },

  getAgencies: async () => {
    const res = await client.get('/agencies');
    return res.data as { agencies: Agency[] };
  },

  getSources: async () => {
    const res = await client.get('/sources');
    return res.data as { sources: Source[] };
  },

  getScraperStatus: async () => {
    const res = await client.get('/scraper/status');
    return res.data as {
      sources: Source[];
      recentRuns: any[];
      lastRefresh: string | null;
      nextScheduledRefresh: string;
      intervalMinutes: number;
      totalConfiguredSources: number;
      failedSourcesCount: number;
    };
  },

  getScraperLogs: async (params?: { level?: string; limit?: number }) => {
    const res = await client.get('/scraper/logs', { params });
    return res.data as { logs: ScrapeLog[] };
  },

  triggerScraperRefresh: async (sourceId?: string) => {
    const res = await client.post('/scraper/refresh', { source_id: sourceId });
    return res.data;
  },

  getNotifications: async (params?: { subscriber_id?: string; unread_only?: boolean }) => {
    const res = await client.get('/notifications', { params: { ...params, unread_only: params?.unread_only ? 'true' : 'false' } });
    return res.data as { notifications: NotificationItem[]; unreadCount: number };
  },

  markNotificationRead: async (id: string) => {
    const res = await client.patch(`/notifications/${encodeURIComponent(id)}/read`);
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await client.post('/notifications/mark-all-read');
    return res.data;
  },

  getSubscribers: async () => {
    const res = await client.get('/subscribers');
    return res.data as { subscribers: Subscriber[] };
  },

  saveSubscriber: async (data: Partial<Subscriber>) => {
    const res = await client.post('/subscribers', data);
    return res.data;
  },

  getSettings: async () => {
    const res = await client.get('/settings');
    return res.data as { settings: Record<string, string>; list: any[] };
  },

  updateSettings: async (settings: Record<string, string>) => {
    const res = await client.put('/settings', settings);
    return res.data;
  },

  // Mentor Challenge Endpoints
  runMentorChallenge1: async () => {
    const res = await client.post('/mentor/challenge-1');
    return res.data;
  },

  runMentorChallenge2: async () => {
    const res = await client.post('/mentor/challenge-2');
    return res.data;
  },

  runMentorChallenge3: async (sqlQuery: string) => {
    const res = await client.post('/mentor/challenge-3', { sql_query: sqlQuery });
    return res.data;
  },

  getAcceptanceTests: async () => {
    const res = await client.get('/mentor/acceptance-tests');
    return res.data as {
      all_passed: boolean;
      evaluated_at: string;
      tests: Array<{
        test_id: string;
        title: string;
        requirement: string;
        passed: boolean;
        details: string;
      }>;
    };
  },

  checkPortals: async () => {
    const res = await client.get('/scraper/check-portals');
    return res.data as {
      portals: Array<{
        agency: string;
        name: string;
        url: string;
        homepage: string;
        description: string;
        status: string;
        http_code: number;
        latency_ms: number;
        notes: string;
        last_checked: string;
      }>;
      timestamp: string;
    };
  },

  // User Profiles & Accounts Management (SQLite Persistent)
  getUsers: async () => {
    const res = await client.get('/users');
    return res.data as { users: UserProfile[]; total: number };
  },

  getActiveUser: async () => {
    const res = await client.get('/users/active/current');
    return res.data as { user: UserProfile };
  },

  getUserById: async (id: string) => {
    const res = await client.get(`/users/${encodeURIComponent(id)}`);
    return res.data as { user: UserProfile; notifications: NotificationItem[] };
  },

  createUser: async (data: Partial<UserProfile>) => {
    const res = await client.post('/users', data);
    return res.data as { success: boolean; message: string; user: UserProfile };
  },

  updateUser: async (id: string, data: Partial<UserProfile>) => {
    const res = await client.put(`/users/${encodeURIComponent(id)}`, data);
    return res.data as { success: boolean; message: string; user: UserProfile };
  },

  activateUser: async (id: string) => {
    const res = await client.post(`/users/${encodeURIComponent(id)}/activate`);
    return res.data as { success: boolean; message: string; user: UserProfile };
  },

  deleteUser: async (id: string) => {
    const res = await client.delete(`/users/${encodeURIComponent(id)}`);
    return res.data as { success: boolean; message: string };
  }
};

