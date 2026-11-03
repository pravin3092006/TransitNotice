import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Agency, Source } from '../types';
import {
  Building2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  FileCode2,
  Info
} from 'lucide-react';
import { normalizeOfficialUrl, openOfficialUrl } from '../utils/urlHelper';

export const AgenciesPage: React.FC = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sources' | 'approval_doc'>('sources');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [agRes, srcRes] = await Promise.all([api.getAgencies(), api.getSources()]);
      setAgencies(agRes.agencies);
      setSources(srcRes.sources);
    } catch (err) {
      console.error('Failed to load agencies/sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const retrySource = async (sourceId: string) => {
    try {
      await api.triggerScraperRefresh(sourceId);
    } catch (error) {
      console.warn('Source retry completed with an error:', error);
    } finally {
      await loadData();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071B2D] tracking-tight">
            Agencies & Source Provenance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitored public authorities, official feed licenses, robots.txt compliance, and source health.
          </p>
        </div>

        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sources')}
            className={`rounded px-3 py-1.5 transition ${activeTab === 'sources' ? 'bg-white text-[#071B2D] shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Configured Sources ({sources.length})
          </button>
          <button
            onClick={() => setActiveTab('approval_doc')}
            className={`rounded px-3 py-1.5 transition ${activeTab === 'approval_doc' ? 'bg-white text-[#071B2D] shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Source Approval Document
          </button>
        </div>
      </div>

      {activeTab === 'sources' ? (
        <div className="space-y-6">
          {/* Agencies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agencies.map((agency) => (
              <div key={agency.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between hover:border-[#13BCEB] transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded text-white ${
                      agency.id === 'MTC' ? 'bg-emerald-700' :
                      agency.id === 'CMRL' ? 'bg-blue-600' :
                      agency.id === 'TNSTC' ? 'bg-rose-700' :
                      agency.id === 'CUMTA' ? 'bg-amber-600' :
                      agency.id === 'TNTD' ? 'bg-indigo-900' :
                      agency.id === 'SR' ? 'bg-teal-700' :
                      agency.id === 'SETC' ? 'bg-orange-700' :
                      agency.id === 'GCTP' ? 'bg-slate-700' :
                      agency.id === 'CMDA' ? 'bg-purple-700' : 'bg-slate-800'
                    }`}>
                      {agency.id}
                    </span>
                    <a
                      href={normalizeOfficialUrl(agency.website, agency.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        openOfficialUrl(agency.website, agency.id);
                      }}
                      className="text-slate-400 hover:text-[#13BCEB] transition"
                      title={`Open official website: ${normalizeOfficialUrl(agency.website, agency.id)}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{agency.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{agency.jurisdiction}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                  <div className="text-[10px] text-slate-400 truncate">Contact: {agency.contact_email || 'Public Open Data'}</div>
                  <a
                    href={normalizeOfficialUrl(agency.website, agency.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      openOfficialUrl(agency.website, agency.id);
                    }}
                    className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 py-1.5 text-xs font-bold text-slate-700 transition"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="h-3 w-3 text-[#13BCEB]" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Sources Detailed Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Authorized Public Source Feeds
              </h3>
              <p className="text-xs text-slate-500">
                Ethical scraping compliance: All sources verified against robots.txt and official Tamil Nadu Government Open Data terms.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Source Name & Agency</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Permission Status</th>
                    <th className="py-3 px-3">robots.txt Review</th>
                    <th className="py-3 px-3">Terms of Use</th>
                    <th className="py-3 px-3">Frequency</th>
                    <th className="py-3 px-3">Health Status</th>
                    <th className="py-3 px-3">Last Successful Fetch</th>
                    <th className="py-3 px-3 text-right">Direct Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sources.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-400 font-mono text-[10px]">
                          <span>{s.agency_id}</span>
                          <span>•</span>
                          <a
                            href={s.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#13BCEB] hover:underline flex items-center gap-0.5"
                          >
                            <span className="truncate max-w-[180px]">{s.source_url}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-800">
                          {s.source_type}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          {s.permission_status}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {s.robots_txt_status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate" title={s.terms_of_use_status}>
                        {s.terms_of_use_status}
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">
                        Every {s.refresh_frequency_minutes} min
                      </td>

                      <td className="py-3 px-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          s.health_status === 'HEALTHY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.source_url.includes('eservices.tnpolice.gov.in') && /CERTIFICATE_ERROR|certificate validation issue|certificate/i.test(s.last_error || '')
                            ? 'CERTIFICATE_ERROR'
                            : s.health_status}
                        </span>
                        {s.source_url.includes('eservices.tnpolice.gov.in') && /CERTIFICATE_ERROR|certificate validation issue|certificate/i.test(s.last_error || '') && (
                          <div className="mt-2 min-w-[220px]">
                            <p className="text-[11px] text-rose-700 mb-2">TN Police official website is temporarily unavailable due to a certificate validation issue. Please try again later.</p>
                            <button onClick={() => retrySource(s.id)} className="rounded bg-[#071B2D] text-white px-3 py-1 text-[11px] font-semibold hover:bg-slate-800">Retry</button>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {s.last_successful_fetch_at
                          ? new Date(s.last_successful_fetch_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Pending'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <a
                          href={normalizeOfficialUrl(s.source_url, s.agency_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openOfficialUrl(s.source_url, s.agency_id);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-[#071B2D] text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-slate-800 transition"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3 text-[#13BCEB]" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Source Approval Document Tab */
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-mono font-bold text-[#13BCEB] uppercase tracking-wider">
              Document: SOURCE_APPROVAL.md
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Official Transport Source Approval & Permissions Charter
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Legal review, robots.txt compliance, rate-limiting, and ethical web scraping across Tamil Nadu public transport endpoints.
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Ethical Web Scraping Constitution
              </h4>
              <p>
                In accordance with state transit data guidelines and fair use policies, TransitNotice monitors ONLY publicly available authority feeds and permitted open bulletins:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                <li><strong>No Login Bypasses:</strong> Never bypass access restrictions or authentication walls.</li>
                <li><strong>No CAPTCHA Evasion:</strong> We do not deploy CAPTCHA solvers or evasive user-agent rotating proxies.</li>
                <li><strong>No Private Data:</strong> We extract solely public route disruption bulletins and timetable adjustments; no passenger personal data is collected or stored.</li>
                <li><strong>Rate Limiting & Backoff:</strong> Requests are throttled with exponential backoff and a 300-second retry ceiling.</li>
              </ul>
            </div>

            {/* Matrix of Sources */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">
                Tamil Nadu Transit Source Review Matrix
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>1. Metropolitan Transport Corporation (MTC Chennai)</span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px]">Approved</span>
                  </div>
                  <p><strong>Endpoint:</strong> https://mtcbus.tn.gov.in</p>
                  <p><strong>License:</strong> Government of Tamil Nadu Public Portal (Citizen Information Charter).</p>
                  <p><strong>robots.txt:</strong> Allowed for public pages. Standard rate limiting applied.</p>
                  <p><strong>Extracted Fields:</strong> Route numbers, diversion paths, temporary terminals (Kilambakkam KCBT, Tambaram), effective dates.</p>
                  <p><strong>Risk & Mitigation:</strong> High traffic during peak hours; mitigated by caching and 15-minute polling interval.</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>2. Chennai Metro Rail Limited (CMRL)</span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px]">Approved</span>
                  </div>
                  <p><strong>Endpoint:</strong> https://chennaimetrorail.org/press-release/</p>
                  <p><strong>License:</strong> CMRL Official Press & Passenger Communication Policy.</p>
                  <p><strong>robots.txt:</strong> Allowed for press releases and passenger advisories.</p>
                  <p><strong>Extracted Fields:</strong> Press release title, Metro corridor (Blue Line, Green Line, Phase-2), date, operational timetable adjustments.</p>
                  <p><strong>Risk & Mitigation:</strong> Dynamic WordPress formatting; parsed with safe semantic DOM extraction.</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>3. Tamil Nadu State Transport Corporation (TNSTC)</span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px]">Approved</span>
                  </div>
                  <p><strong>Endpoint:</strong> https://www.tnstc.in</p>
                  <p><strong>License:</strong> TNSTC Official Online Reservation & Public Announcement System.</p>
                  <p><strong>robots.txt:</strong> Allowed for public news tickers and operational bulletins.</p>
                  <p><strong>Extracted Fields:</strong> Special festive bus armadas, terminal relocations (KCBT & MMBT), division updates (Villupuram, Salem, Kumbakonam, Madurai).</p>
                  <p><strong>Risk & Mitigation:</strong> Heavy server load during festive bookings; mitigated by cached snapshot fallbacks.</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>4. Chennai Unified Metropolitan Transport Authority (CUMTA)</span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px]">Approved</span>
                  </div>
                  <p><strong>Endpoint:</strong> https://cumta.tn.gov.in</p>
                  <p><strong>License:</strong> CUMTA Statutory Authority Public Integration Directives.</p>
                  <p><strong>robots.txt:</strong> Allowed for policy notifications and integration advisories.</p>
                  <p><strong>Extracted Fields:</strong> Multimodal ticketing mandates, Bus Priority Lanes (OMR), skywalk infrastructure announcements.</p>
                  <p><strong>Risk & Mitigation:</strong> Low update frequency; handled by 30-minute interval checks.</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>5. Tamil Nadu Transport Department (TNSTA)</span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px]">Approved</span>
                  </div>
                  <p><strong>Endpoint:</strong> https://transport.tn.gov.in / https://tnsta.gov.in</p>
                  <p><strong>License:</strong> State Transport Authority Regulatory Circulars & Government Orders.</p>
                  <p><strong>robots.txt:</strong> Allowed for public circulars and citizen notices.</p>
                  <p><strong>Extracted Fields:</strong> Tariff regulations, omnibus fare ceilings, interstate permits, safety mandates.</p>
                  <p><strong>Risk & Mitigation:</strong> Occasional NIC network latency; handled with 4-second timeout and fallback records.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
