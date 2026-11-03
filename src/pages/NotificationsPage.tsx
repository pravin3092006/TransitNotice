import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NotificationItem, Subscriber } from '../types';
import {
  BellRing,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Filter,
  Check,
  UserCheck,
  Settings,
  Mail,
  Smartphone,
  AlertCircle
} from 'lucide-react';

interface NotificationsPageProps {
  onSelectNoticeId: (id: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onSelectNoticeId }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedSubId, unreadOnly]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifRes, subsRes] = await Promise.all([
        api.getNotifications({
          subscriber_id: selectedSubId !== 'ALL' ? selectedSubId : undefined,
          unread_only: unreadOnly
        }),
        api.getSubscribers()
      ]);
      setNotifications(notifRes.notifications);
      setSubscribers(subsRes.subscribers);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071B2D] tracking-tight">
            Advisory Alerts & Delivery Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Event-driven notification system with automated alert deduplication and subscriber filtering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Safe Demo Mode Notice */}
      <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 text-xs text-cyan-950 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#13BCEB] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Safe Demo Notification Mode Active</span>
          <p className="text-[11px] text-cyan-900 mt-0.5">
            Per Cybernaut Section 12 specifications, live email/SMS dispatch is safely mocked in simulation mode. Notifications are delivered to the in-app notification center and recorded in persistent SQLite delivery logs without sending unsolicited external messages.
          </p>
        </div>
      </div>

      {/* Subscribers Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subscribers.map((sub) => (
          <div
            key={sub.id}
            onClick={() => setSelectedSubId(selectedSubId === sub.id ? 'ALL' : sub.id)}
            className={`rounded-xl border p-4 cursor-pointer transition ${
              selectedSubId === sub.id
                ? 'border-[#13BCEB] bg-cyan-50/40 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">{sub.name}</span>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                sub.persona === 'PASSENGER' ? 'bg-cyan-100 text-cyan-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {sub.persona}
              </span>
            </div>
            <p className="text-xs text-slate-500">{sub.email}</p>
            <div className="mt-2 text-[11px] text-slate-600">
              {sub.filters && sub.filters.length > 0 ? (
                <span>Filters: {sub.filters.map(f => f.route_id || f.area || f.agency).filter(Boolean).join(', ')}</span>
              ) : (
                <span>All network advisories (Global broadcast)</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded text-[#13BCEB] focus:ring-0"
            />
            <span>Show Unread Only</span>
          </label>
        </div>

        <span className="text-slate-400">
          Showing {notifications.length} logged alert{notifications.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Notifications Stream */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading notification logs...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          No notifications recorded.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition ${
                n.is_read
                  ? 'border-slate-200 bg-white text-slate-600'
                  : 'border-cyan-300 bg-cyan-50/30 text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="rounded bg-[#071B2D] text-white px-2 py-0.5 text-[10px] font-bold">
                      {n.event_type.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Target: {n.notice_id}
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-bold">
                      {n.delivery_status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                    <span>Channel: {n.channel}</span>
                    <span>•</span>
                    <span className="font-mono" title={n.dedup_key}>Key: {n.dedup_key.slice(0, 28)}...</span>
                    <span>•</span>
                    <span>Delivered: {new Date(n.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectNoticeId(n.notice_id)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#13BCEB] hover:bg-slate-50"
                  >
                    View
                  </button>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="rounded-lg bg-slate-100 hover:bg-slate-200 p-1 text-slate-500"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
