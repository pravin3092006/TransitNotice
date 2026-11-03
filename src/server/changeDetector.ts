import crypto from 'crypto';
import { db } from './db.js';

export interface ScrapedNoticeInput {
  notice_id: string;
  agency: string;
  route_ids: string[]; // List of affected route IDs
  route_names?: string[]; // Names matching route IDs
  area: string;
  source_url: string;
  type: string;
  is_type_inferred?: boolean;
  title: string;
  summary: string;
  description: string;
  published_at: string;
  valid_from: string;
  valid_to: string | null;
  status?: string; // If source supplies explicit status
  source_id?: string;
  is_demo?: boolean;
}

export interface ChangeDetectionResult {
  action: 'NEW' | 'UNCHANGED' | 'REVISED' | 'EXTENDED' | 'WITHDRAWN' | 'CANCELLED' | 'EXPIRED';
  notice_id: string;
  revision_id: number;
  change_summary: string;
  alert_generated: boolean;
}

export function computeContentHash(input: {
  title: string;
  description: string;
  type: string;
  routes: string[];
  valid_from: string;
  valid_to: string | null;
  status: string;
}): string {
  const normalized = [
    input.title.trim().toLowerCase(),
    input.description.trim().toLowerCase(),
    input.type.trim(),
    [...input.routes].sort().join(','),
    new Date(input.valid_from).toISOString(),
    input.valid_to ? new Date(input.valid_to).toISOString() : 'NO_END_DATE',
    input.status
  ].join('||');

  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Calculates current advisory status based on announced validity window and cancellation state.
 * Mandatory Acceptance Test 1: Expired advisory must not be marked currently active.
 * Mandatory Acceptance Test 4: Timezone aware calculation.
 * Mandatory Challenge 2: Advisory without end date must NOT be marked expired.
 */
export function calculateAdvisoryStatus(
  announcedStatus: string | undefined,
  validFromStr: string,
  validToStr: string | null
): 'Scheduled' | 'Active' | 'Expired' | 'Cancelled' | 'Withdrawn' | 'Unknown' {
  if (announcedStatus) {
    const s = announcedStatus.toLowerCase();
    if (s.includes('cancel')) return 'Cancelled';
    if (s.includes('withdrawn') || s.includes('clear') || s.includes('resolved') || s.includes('resumed')) return 'Withdrawn';
  }

  const now = new Date();
  const validFrom = new Date(validFromStr);

  if (isNaN(validFrom.getTime())) {
    return 'Unknown';
  }

  // Future start date
  if (validFrom > now) {
    return 'Scheduled';
  }

  // If there is an end date
  if (validToStr && validToStr.trim() !== '') {
    const validTo = new Date(validToStr);
    if (!isNaN(validTo.getTime())) {
      if (now > validTo) {
        return 'Expired';
      }
    }
  }

  // If no end date or now is within valid window -> Active
  return 'Active';
}

/**
 * Idempotently processes an incoming scraped notice.
 */
export function processScrapedNotice(input: ScrapedNoticeInput): ChangeDetectionResult {
  const now = new Date().toISOString();
  const calculatedStatus = calculateAdvisoryStatus(input.status, input.valid_from, input.valid_to);

  const cleanRoutes = Array.from(new Set(input.route_ids.map(r => r.trim()).filter(Boolean)));
  const primaryRouteStr = cleanRoutes.join(', ') || 'System-Wide';

  const contentHash = computeContentHash({
    title: input.title,
    description: input.description,
    type: input.type,
    routes: cleanRoutes,
    valid_from: input.valid_from,
    valid_to: input.valid_to,
    status: calculatedStatus
  });

  // Check if notice already exists in database
  const existing = db.prepare('SELECT * FROM notices WHERE notice_id = ?').get(input.notice_id) as any;

  if (!existing) {
    // 1. BRAND NEW ADVISORY
    const revisionId = 1;
    const changeSummary = `Initial advisory recorded for route(s) ${primaryRouteStr}.`;

    const insertNoticeStmt = db.prepare(`
      INSERT INTO notices (
        notice_id, agency, route_id, area, source_url, type, is_type_inferred,
        title, summary, description, published_at, valid_from, valid_to,
        status, observed_at, last_confirmed_at, last_verified_at,
        content_hash, revision_id, change_summary, source_id,
        subscriber_filter, alert_status, alerted_at, is_demo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertNoticeStmt.run(
      input.notice_id,
      input.agency,
      primaryRouteStr,
      input.area,
      input.source_url,
      input.type,
      input.is_type_inferred ? 1 : 0,
      input.title,
      input.summary,
      input.description,
      input.published_at,
      input.valid_from,
      input.valid_to,
      calculatedStatus,
      now,
      now,
      now,
      contentHash,
      revisionId,
      changeSummary,
      input.source_id || null,
      input.area,
      'SENT',
      now,
      input.is_demo ? 1 : 0
    );

    // Insert associated routes into notice_routes
    const insertRouteStmt = db.prepare(`
      INSERT OR IGNORE INTO notice_routes (notice_id, route_id, route_name, route_mode, direction)
      VALUES (?, ?, ?, ?, ?)
    `);

    cleanRoutes.forEach((routeId, idx) => {
      const routeName = (input.route_names && input.route_names[idx]) ? input.route_names[idx] : `Route ${routeId}`;
      insertRouteStmt.run(input.notice_id, routeId, routeName, 'BUS', 'Both');
    });

    // Save Revision 1
    const insertRevStmt = db.prepare(`
      INSERT INTO notice_revisions (
        notice_id, revision_id, title, summary, description, type,
        status, valid_from, valid_to, content_hash, change_type,
        change_summary, detected_at, affected_routes_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertRevStmt.run(
      input.notice_id,
      revisionId,
      input.title,
      input.summary,
      input.description,
      input.type,
      calculatedStatus,
      input.valid_from,
      input.valid_to,
      contentHash,
      'NEW',
      changeSummary,
      now,
      JSON.stringify(cleanRoutes)
    );

    // Generate notification for eligible subscribers
    dispatchNotification(input.notice_id, revisionId, 'NEW_ADVISORY', `New Advisory: ${input.title}`, changeSummary, input.agency, cleanRoutes, input.area);

    return {
      action: 'NEW',
      notice_id: input.notice_id,
      revision_id: revisionId,
      change_summary: changeSummary,
      alert_generated: true
    };
  }

  // 2. EXISTING NOTICE - COMPARE HASH
  if (existing.content_hash === contentHash) {
    // Unchanged advisory: update last_confirmed_at and last_verified_at without generating duplicate revision or alert!
    db.prepare(`
      UPDATE notices
      SET last_confirmed_at = ?, last_verified_at = ?
      WHERE notice_id = ?
    `).run(now, now, input.notice_id);

    return {
      action: 'UNCHANGED',
      notice_id: input.notice_id,
      revision_id: existing.revision_id,
      change_summary: 'Unchanged advisory confirmed in source feed.',
      alert_generated: false
    };
  }

  // 3. NOTICE CHANGED: DETECT EXTENSION, REVISION, CANCELLATION, OR WITHDRAWAL
  let changeType: 'REVISED' | 'EXTENDED' | 'WITHDRAWN' | 'CANCELLED' = 'REVISED';
  let diffMessages: string[] = [];

  // Extension check (valid_to extended to a later time)
  if (input.valid_to && existing.valid_to) {
    const oldValidTo = new Date(existing.valid_to).getTime();
    const newValidTo = new Date(input.valid_to).getTime();
    if (newValidTo > oldValidTo) {
      changeType = 'EXTENDED';
      const hoursDiff = Math.round((newValidTo - oldValidTo) / (1000 * 3600));
      diffMessages.push(`Service outage extended by ${hoursDiff} hours (New valid until: ${new Date(input.valid_to).toLocaleString()}).`);
    } else if (newValidTo < oldValidTo) {
      diffMessages.push(`Validity end date shortened to ${new Date(input.valid_to).toLocaleString()}.`);
    }
  } else if (input.valid_to && !existing.valid_to) {
    diffMessages.push(`Fixed end date established: ${new Date(input.valid_to).toLocaleString()}.`);
  } else if (!input.valid_to && existing.valid_to) {
    diffMessages.push(`End date removed (now open-ended/until further notice).`);
  }

  if (calculatedStatus === 'Cancelled' && existing.status !== 'Cancelled') {
    changeType = 'CANCELLED';
    diffMessages.push('Service notice officially cancelled by transit agency.');
  } else if (calculatedStatus === 'Withdrawn' && existing.status !== 'Withdrawn') {
    changeType = 'WITHDRAWN';
    diffMessages.push('Advisory withdrawn/cleared by authority.');
  }

  if (existing.title !== input.title) {
    diffMessages.push(`Title updated from "${existing.title.slice(0, 30)}..." to "${input.title.slice(0, 30)}...".`);
  }

  if (existing.description !== input.description && diffMessages.length === 0) {
    diffMessages.push('Advisory description updated with new travel guidance.');
  }

  if (existing.type !== input.type) {
    diffMessages.push(`Advisory classification changed from ${existing.type} to ${input.type}.`);
  }

  const newRevisionId = existing.revision_id + 1;
  const fullChangeSummary = diffMessages.join(' ') || 'Service update details revised by source.';

  // Update existing notice record
  db.prepare(`
    UPDATE notices
    SET agency = ?, route_id = ?, area = ?, source_url = ?, type = ?,
        title = ?, summary = ?, description = ?, valid_from = ?, valid_to = ?,
        status = ?, observed_at = ?, last_confirmed_at = ?, last_verified_at = ?,
        content_hash = ?, revision_id = ?, change_summary = ?, alert_status = 'SENT',
        alerted_at = ?
    WHERE notice_id = ?
  `).run(
    input.agency,
    primaryRouteStr,
    input.area,
    input.source_url,
    input.type,
    input.title,
    input.summary,
    input.description,
    input.valid_from,
    input.valid_to,
    calculatedStatus,
    now,
    now,
    now,
    contentHash,
    newRevisionId,
    fullChangeSummary,
    now,
    input.notice_id
  );

  // Update routes
  db.prepare('DELETE FROM notice_routes WHERE notice_id = ?').run(input.notice_id);
  const insertRouteStmt = db.prepare(`
    INSERT OR IGNORE INTO notice_routes (notice_id, route_id, route_name, route_mode, direction)
    VALUES (?, ?, ?, ?, ?)
  `);
  cleanRoutes.forEach((routeId, idx) => {
    const routeName = (input.route_names && input.route_names[idx]) ? input.route_names[idx] : `Route ${routeId}`;
    insertRouteStmt.run(input.notice_id, routeId, routeName, 'BUS', 'Both');
  });

  // Archive new revision (preserving old revisions forever!)
  db.prepare(`
    INSERT INTO notice_revisions (
      notice_id, revision_id, title, summary, description, type,
      status, valid_from, valid_to, content_hash, change_type,
      change_summary, detected_at, affected_routes_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.notice_id,
    newRevisionId,
    input.title,
    input.summary,
    input.description,
    input.type,
    calculatedStatus,
    input.valid_from,
    input.valid_to,
    contentHash,
    changeType,
    fullChangeSummary,
    now,
    JSON.stringify(cleanRoutes)
  );

  // Dispatch ONE deduplicated alert event
  const eventTypeMap: Record<string, string> = {
    'EXTENDED': 'EXTENDED_ADVISORY',
    'WITHDRAWN': 'WITHDRAWN_ADVISORY',
    'CANCELLED': 'CANCELLED_ADVISORY',
    'REVISED': 'REVISED_ADVISORY'
  };

  dispatchNotification(
    input.notice_id,
    newRevisionId,
    eventTypeMap[changeType] || 'REVISED_ADVISORY',
    `Update on ${input.notice_id}: ${input.title}`,
    fullChangeSummary,
    input.agency,
    cleanRoutes,
    input.area
  );

  return {
    action: changeType,
    notice_id: input.notice_id,
    revision_id: newRevisionId,
    change_summary: fullChangeSummary,
    alert_generated: true
  };
}

/**
 * Dispatches deduplicated notifications to matching subscribers.
 */
function dispatchNotification(
  noticeId: string,
  revisionId: number,
  eventType: string,
  title: string,
  message: string,
  agency: string,
  routes: string[],
  area: string
) {
  const subscribers = db.prepare('SELECT id, persona FROM subscribers').all() as Array<{ id: string; persona: string }>;
  const now = new Date().toISOString();

  const insertNotifStmt = db.prepare(`
    INSERT OR IGNORE INTO notifications (
      id, notice_id, subscriber_id, channel, event_type,
      title, message, delivery_status, timestamp, is_read, dedup_key
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const sub of subscribers) {
    // Check if subscriber matches filter
    const filters = db.prepare('SELECT * FROM subscriber_filters WHERE subscriber_id = ?').all(sub.id) as any[];
    let matches = false;

    if (filters.length === 0 || sub.persona === 'OPERATIONS_MONITOR') {
      matches = true; // Subscribed to all
    } else {
      for (const filter of filters) {
        if (filter.agency && filter.agency !== agency) continue;
        if (filter.route_id && !routes.includes(filter.route_id)) continue;
        if (filter.area && !area.toLowerCase().includes(filter.area.toLowerCase())) continue;
        matches = true;
        break;
      }
    }

    if (matches) {
      const dedupKey = `DEDUP-${noticeId}-REV-${revisionId}-SUB-${sub.id}`;
      const notifId = `NOTIF-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      insertNotifStmt.run(
        notifId,
        noticeId,
        sub.id,
        'IN_APP',
        eventType,
        title,
        message,
        'DELIVERED',
        now,
        0,
        dedupKey
      );
    }
  }
}

/**
 * Routine to mark expired advisories whose valid_to date has elapsed.
 * Mandatory Rule: An advisory without a valid_to must NEVER be expired!
 */
export function refreshAdvisoriesStatus(): number {
  const now = new Date().toISOString();
  // Find active notices with an expired valid_to
  const expiredNotices = db.prepare(`
    SELECT * FROM notices
    WHERE status = 'Active'
      AND valid_to IS NOT NULL
      AND valid_to != ''
      AND valid_to < ?
  `).all(now) as any[];

  let count = 0;
  for (const n of expiredNotices) {
    db.prepare(`
      UPDATE notices
      SET status = 'Expired',
          last_verified_at = ?
      WHERE notice_id = ?
    `).run(now, n.notice_id);

    // Save revision for status transition
    const revId = n.revision_id + 1;
    const changeSummary = `Notice validity period elapsed (${new Date(n.valid_to).toLocaleString()}). Status updated to Expired.`;

    db.prepare(`
      INSERT INTO notice_revisions (
        notice_id, revision_id, title, summary, description, type,
        status, valid_from, valid_to, content_hash, change_type,
        change_summary, detected_at, affected_routes_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      n.notice_id,
      revId,
      n.title,
      n.summary,
      n.description,
      n.type,
      'Expired',
      n.valid_from,
      n.valid_to,
      n.content_hash,
      'EXPIRED',
      changeSummary,
      now,
      JSON.stringify([n.route_id])
    );

    count++;
  }
  return count;
}
