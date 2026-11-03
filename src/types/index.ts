export type AdvisoryType =
  | 'Route Diversion'
  | 'Service Interruption'
  | 'Planned Maintenance'
  | 'Delay'
  | 'Route Closure'
  | 'Service Cancellation'
  | 'Service Resumption'
  | 'General Advisory';

export type NoticeStatus =
  | 'Scheduled'
  | 'Active'
  | 'Expired'
  | 'Cancelled'
  | 'Withdrawn'
  | 'Unknown';

export interface RouteItem {
  route_id: string;
  route_name: string;
  route_mode: string;
  direction?: string;
}

export interface NoticeRevision {
  id: number;
  notice_id: string;
  revision_id: number;
  title: string;
  summary: string;
  description: string;
  type: AdvisoryType;
  status: NoticeStatus;
  valid_from: string;
  valid_to: string | null;
  content_hash: string;
  change_type: 'NEW' | 'REVISED' | 'EXTENDED' | 'WITHDRAWN' | 'CANCELLED' | 'EXPIRED' | 'RESUMED';
  change_summary: string;
  detected_at: string;
  affected_routes_json: string;
}

export interface TransitNotice {
  notice_id: string;
  agency: string;
  route_id: string;
  area: string;
  source_url: string;
  type: AdvisoryType;
  is_type_inferred: number;
  title: string;
  summary: string;
  description: string;
  published_at: string;
  valid_from: string;
  valid_to: string | null;
  status: NoticeStatus;
  observed_at: string;
  last_confirmed_at: string;
  last_verified_at: string;
  content_hash: string;
  revision_id: number;
  change_summary: string;
  source_id?: string;
  subscriber_filter?: string;
  alert_status: string;
  alerted_at?: string;
  is_demo: number;
  affected_routes?: RouteItem[];
}

export interface Agency {
  id: string;
  name: string;
  jurisdiction: string;
  website: string;
  contact_email?: string;
  created_at: string;
  total_notices?: number;
  active_notices?: number;
}

export interface Source {
  id: string;
  agency_id: string;
  agency_name?: string;
  name: string;
  source_url: string;
  source_type: 'API' | 'RSS' | 'HTML';
  permission_status: 'Approved' | 'Conditional' | 'Unverified';
  robots_txt_status: 'Allowed' | 'Restricted' | 'Review Needed';
  terms_of_use_status: string;
  refresh_frequency_minutes: number;
  is_active: number;
  last_attempted_at?: string;
  last_successful_fetch_at?: string;
  last_error?: string;
  consecutive_failures: number;
  health_status: 'HEALTHY' | 'DEGRADED' | 'FAILING' | 'UNVERIFIED';
  created_at: string;
  notices_count?: number;
}

export interface ScrapeLog {
  id: number;
  run_id?: string;
  source_id?: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  details_json?: string;
}

export interface NotificationItem {
  id: string;
  notice_id: string;
  subscriber_id?: string;
  channel: string;
  event_type: string;
  title: string;
  message: string;
  delivery_status: string;
  timestamp: string;
  is_read: number;
  dedup_key: string;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  persona: 'PASSENGER' | 'OPERATIONS_MONITOR';
  created_at: string;
  filters?: Array<{
    id?: number;
    subscriber_id?: string;
    agency?: string;
    route_id?: string;
    area?: string;
    advisory_type?: string;
  }>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  persona: 'PASSENGER' | 'OPERATIONS_MONITOR' | 'STUDENT_COMMUTER' | 'FIELD_INSPECTOR';
  role_title?: string;
  home_station?: string;
  work_station?: string;
  preferred_agencies: string[];
  preferred_routes: string[];
  alert_channels: string[];
  notification_frequency?: 'REALTIME' | 'DAILY_DIGEST' | 'CRITICAL_ONLY';
  bio?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalNotices: number;
  activeAdvisories: number;
  plannedInterruptions: number;
  routeDiversions: number;
  cancelledNotices: number;
  expiredNotices: number;
  revisedNotices: number;
  lastSuccessfulRefresh: string;
  totalAgencies: number;
  totalSources: number;
  healthySources: number;
  charts: {
    byType: Array<{ name: string; count: number }>;
    byAgency: Array<{ name: string; count: number }>;
    byStatus: Array<{ name: string; count: number }>;
    byRoute: Array<{ route: string; count: number }>;
    overTime: Array<{ date: string; count: number }>;
  };
}
