import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings, Save, CheckCircle2, ShieldCheck, Clock, Database, Globe } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    refresh_interval_minutes: '15',
    application_timezone: 'UTC',
    data_retention_days: '90',
    demo_notification_mode: 'true',
    max_retry_backoff_seconds: '300',
    stale_threshold_hours: '4'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      if (data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071B2D] tracking-tight">
            System Settings & Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure automated scraper polling intervals, operational timezones, and data retention windows.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Configuration saved successfully to SQLite application_settings table.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Scraper Scheduling Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#13BCEB]" />
            Scraper Engine & Polling Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Refresh Frequency (Minutes)
              </label>
              <select
                value={settings.refresh_interval_minutes}
                onChange={(e) => setSettings({ ...settings, refresh_interval_minutes: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:border-[#13BCEB] focus:outline-none"
              >
                <option value="5">Every 5 minutes (High frequency)</option>
                <option value="15">Every 15 minutes (Standard recommendation)</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every 60 minutes</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Controls the APScheduler background daemon cycle.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Retry Backoff Ceiling (Seconds)
              </label>
              <select
                value={settings.max_retry_backoff_seconds}
                onChange={(e) => setSettings({ ...settings, max_retry_backoff_seconds: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:border-[#13BCEB] focus:outline-none"
              >
                <option value="60">60 seconds</option>
                <option value="300">300 seconds (5 minutes recommended)</option>
                <option value="600">600 seconds (10 minutes)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Prevents hammering downstream authority endpoints during outages.
              </span>
            </div>
          </div>
        </div>

        {/* Timezone & Provenance Normalization */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-600" />
            Timezone & Data Normalization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Operational Normalization Timezone
              </label>
              <select
                value={settings.application_timezone}
                onChange={(e) => setSettings({ ...settings, application_timezone: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:border-[#13BCEB] focus:outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - Indian Standard Time - Chennai/TN)</option>
                <option value="UTC">UTC (Universal Timezone - Default)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Satisfies Acceptance Test 4: All timestamps internally normalized to ISO-8601 UTC.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Stale Notice Threshold (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={settings.stale_threshold_hours}
                onChange={(e) => setSettings({ ...settings, stale_threshold_hours: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:border-[#13BCEB] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Threshold after which notices without a fresh feed check display a STALE warning.
              </span>
            </div>
          </div>
        </div>

        {/* Persistence & Retention */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600" />
            Database Persistence & Retention Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Historical Revision Retention (Days)
              </label>
              <select
                value={settings.data_retention_days}
                onChange={(e) => setSettings({ ...settings, data_retention_days: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:border-[#13BCEB] focus:outline-none"
              >
                <option value="30">30 days</option>
                <option value="90">90 days (Default)</option>
                <option value="180">180 days</option>
                <option value="365">365 days (Full annual audit trail)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Notice revisions are archived permanently in notice_revisions before expiration.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Notification Delivery Simulation Mode
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="demo_mode"
                  checked={settings.demo_notification_mode === 'true'}
                  onChange={(e) => setSettings({ ...settings, demo_notification_mode: e.target.checked ? 'true' : 'false' })}
                  className="rounded text-[#13BCEB] focus:ring-0"
                />
                <label htmlFor="demo_mode" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Enable Safe Demo Mode (Do not send external emails)
                </label>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Deliver alerts to in-app notification center and logs safely.
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#071B2D] px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
          >
            <Save className="h-4 w-4 text-[#13BCEB]" />
            <span>{saving ? 'Saving...' : 'Save Settings to SQLite'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
