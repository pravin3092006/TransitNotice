import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Code2,
  RefreshCw,
  FileCheck
} from 'lucide-react';

export const MentorConsolePage: React.FC = () => {
  // Acceptance Tests State
  const [acceptanceResults, setAcceptanceResults] = useState<any>(null);
  const [testingRunning, setTestingRunning] = useState(false);

  // Live Challenges State
  const [ch1Result, setCh1Result] = useState<any>(null);
  const [ch1Loading, setCh1Loading] = useState(false);

  const [ch2Result, setCh2Result] = useState<any>(null);
  const [ch2Loading, setCh2Loading] = useState(false);

  // Challenge 3 SQL Runner State
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT notice_id, agency, route_id, status, revision_id, valid_from, valid_to FROM notices ORDER BY revision_id DESC LIMIT 5;'
  );
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlError, setSqlError] = useState<string | null>(null);

  useEffect(() => {
    runAcceptanceTests();
  }, []);

  const runAcceptanceTests = async () => {
    setTestingRunning(true);
    try {
      const res = await api.getAcceptanceTests();
      setAcceptanceResults(res);
    } catch (err) {
      console.error('Failed to run acceptance tests:', err);
    } finally {
      setTestingRunning(false);
    }
  };

  const handleRunChallenge1 = async () => {
    setCh1Loading(true);
    try {
      const res = await api.runMentorChallenge1();
      setCh1Result(res);
      await runAcceptanceTests();
    } catch (err: any) {
      alert(`Challenge 1 error: ${err.message}`);
    } finally {
      setCh1Loading(false);
    }
  };

  const handleRunChallenge2 = async () => {
    setCh2Loading(true);
    try {
      const res = await api.runMentorChallenge2();
      setCh2Result(res);
      await runAcceptanceTests();
    } catch (err: any) {
      alert(`Challenge 2 error: ${err.message}`);
    } finally {
      setCh2Loading(false);
    }
  };

  const handleRunSqlQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSqlLoading(true);
    setSqlError(null);
    try {
      const res = await api.runMentorChallenge3(sqlQuery);
      setSqlResult(res);
    } catch (err: any) {
      setSqlError(err.response?.data?.error || err.message);
      setSqlResult(null);
    } finally {
      setSqlLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
            <Award className="h-4 w-4 text-indigo-600" />
            Cybernaut Mentorship Evaluation & Viva Workbench
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071B2D] tracking-tight">
            Live Mentor Challenges & Acceptance Test Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated verification harness for the 6 mandatory acceptance tests and 3 live mentor challenges.
          </p>
        </div>

        <button
          onClick={runAcceptanceTests}
          disabled={testingRunning}
          className="flex items-center gap-2 rounded-xl bg-[#13BCEB] px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${testingRunning ? 'animate-spin' : ''}`} />
          <span>{testingRunning ? 'Running Test Suite...' : 'Re-Run All 6 Tests'}</span>
        </button>
      </div>

      {/* Part 1: Mandatory Acceptance Tests (PDF Section 11) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-600" />
              The Six Mandatory Acceptance Tests
            </h2>
            <p className="text-xs text-slate-500">
              Audited against real database records and state transitions in SQLite.
            </p>
          </div>

          {acceptanceResults && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold border ${
              acceptanceResults.all_passed
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {acceptanceResults.all_passed ? 'ALL 6 TESTS PASSED (100%)' : 'SOME TESTS FAILED'}
            </span>
          )}
        </div>

        {acceptanceResults?.tests && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {acceptanceResults.tests.map((test: any) => (
              <div
                key={test.test_id}
                className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#071B2D] text-white px-2 py-0.5 rounded">
                      {test.test_id}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900">{test.title}</h3>
                  </div>
                  {test.passed ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> PASS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">
                      <XCircle className="h-3.5 w-3.5" /> FAIL
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  Requirement: {test.requirement}
                </p>

                <div className="rounded bg-white p-2.5 border border-slate-200 text-xs font-mono text-slate-800 text-[11px] break-words">
                  {test.details}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Part 2: Three Live Mentor Challenges (PDF Section 10) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Interactive Live Mentor Challenges
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute real scenarios during evaluation to demonstrate live change detection and error handling.
          </p>
        </div>

        {/* Challenge 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-100 text-indigo-800 px-2 py-0.5 text-xs font-bold">
                  Challenge 1
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Mentor extends an outage by 24 hours in sample notice
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                The application must detect the change, preserve revision history, update the expiry time, and generate exactly ONE alert.
              </p>
            </div>

            <button
              onClick={handleRunChallenge1}
              disabled={ch1Loading}
              className="flex items-center gap-2 rounded-xl bg-[#071B2D] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50 shrink-0"
            >
              <Play className={`h-4 w-4 text-[#13BCEB] ${ch1Loading ? 'animate-pulse' : ''}`} />
              <span>{ch1Loading ? 'Executing Simulation...' : 'Simulate 24h Extension'}</span>
            </button>
          </div>

          {ch1Result && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Challenge 1 Successfully Verified!
                </span>
                <span className="font-mono text-[10px] text-indigo-700">
                  Total Revisions: {ch1Result.total_revisions}
                </span>
              </div>
              <p className="text-indigo-900">{ch1Result.explanation}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px] bg-white p-3 rounded-lg border border-indigo-100">
                <div>
                  <span className="text-slate-400 block">Updated Expiry Time:</span>
                  <span className="font-bold text-slate-800">{new Date(ch1Result.updated_notice.valid_to).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Revision ID:</span>
                  <span className="font-bold text-slate-800">v{ch1Result.updated_notice.revision_id}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-400 block">Deduplicated Notification Event:</span>
                  <span className="text-emerald-700 font-semibold">{ch1Result.alert_generated?.title}: {ch1Result.alert_generated?.message}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Challenge 2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-100 text-indigo-800 px-2 py-0.5 text-xs font-bold">
                  Challenge 2
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Mentor supplies an advisory without an end date
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                The application must handle open-ended notices without incorrectly marking them expired.
              </p>
            </div>

            <button
              onClick={handleRunChallenge2}
              disabled={ch2Loading}
              className="flex items-center gap-2 rounded-xl bg-[#071B2D] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50 shrink-0"
            >
              <Play className={`h-4 w-4 text-[#13BCEB] ${ch2Loading ? 'animate-pulse' : ''}`} />
              <span>{ch2Loading ? 'Testing...' : 'Test No End Date Notice'}</span>
            </button>
          </div>

          {ch2Result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2 text-xs animate-in fade-in">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Challenge 2 Successfully Verified!
              </span>
              <p className="text-emerald-900">{ch2Result.explanation}</p>
              <div className="font-mono text-[11px] bg-white p-3 rounded-lg border border-emerald-100">
                Notice Status: <strong>{ch2Result.notice_status}</strong> (is_active: {ch2Result.is_active ? 'TRUE' : 'FALSE'}) • valid_to: <strong>NULL (Until further notice)</strong>
              </div>
            </div>
          )}
        </div>

        {/* Challenge 3: Live SQL Query & Parser Explain Console */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-100 text-indigo-800 px-2 py-0.5 text-xs font-bold">
                Challenge 3
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Viva Query Console & Parser Logic Explainer
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              "A student must explain and modify a parser or SQL query without relying on generated code."
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 py-1">Presets:</span>
            <button
              type="button"
              onClick={() => setSqlQuery('SELECT notice_id, agency, route_id, status, revision_id, change_summary FROM notices ORDER BY revision_id DESC;')}
              className="rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-slate-700 font-medium"
            >
              Check Notice Revisions
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery('SELECT nr.route_id, COUNT(nr.notice_id) as affected_count FROM notice_routes nr GROUP BY nr.route_id;')}
              className="rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-slate-700 font-medium"
            >
              Multi-Route Junction Count
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery('SELECT id, name, permission_status, robots_txt_status, health_status FROM sources;')}
              className="rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-slate-700 font-medium"
            >
              Audit Source Permissions
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery('SELECT event_type, dedup_key, delivery_status, timestamp FROM notifications ORDER BY timestamp DESC LIMIT 5;')}
              className="rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-slate-700 font-medium"
            >
              Verify Alert Deduplication
            </button>
          </div>

          <form onSubmit={handleRunSqlQuery} className="space-y-3">
            <div className="relative">
              <textarea
                rows={3}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#071B2D] p-3 text-xs font-mono text-cyan-300 focus:border-[#13BCEB] focus:outline-none"
                placeholder="Enter SQL SELECT query on transitnotice.db..."
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Safe Read-Only Mode: SELECT and EXPLAIN queries supported.
              </span>
              <button
                type="submit"
                disabled={sqlLoading}
                className="flex items-center gap-1.5 rounded-lg bg-[#071B2D] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                <Terminal className="h-3.5 w-3.5 text-[#13BCEB]" />
                <span>{sqlLoading ? 'Executing...' : 'Run SQL Query'}</span>
              </button>
            </div>
          </form>

          {sqlError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              {sqlError}
            </div>
          )}

          {sqlResult && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 overflow-x-auto">
              <div className="text-xs font-bold text-slate-700">
                Query Result ({sqlResult.row_count} row{sqlResult.row_count !== 1 ? 's' : ''}):
              </div>
              <pre className="text-[11px] font-mono text-slate-800 bg-white p-3 rounded border border-slate-200 overflow-x-auto max-h-60">
                {JSON.stringify(sqlResult.results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
