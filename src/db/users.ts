import { db } from '../server/db.js';

export async function getOrCreateUser(data: {
  uid: string;
  email: string;
  name?: string;
  photoUrl?: string;
  persona?: string;
}) {
  try {
    const existing = db.prepare('SELECT * FROM user_profiles WHERE id = ? OR email = ?').get(data.uid, data.email.toLowerCase()) as any;
    if (existing) {
      return {
        ...existing,
        photoUrl: data.photoUrl || null
      };
    }

    const now = new Date().toISOString();
    const id = data.uid || `USR-${Date.now().toString(36).toUpperCase()}`;
    const name = data.name || data.email.split('@')[0];
    const persona = data.persona || 'PASSENGER';

    db.prepare(`
      INSERT INTO user_profiles (
        id, name, email, phone, persona, role_title,
        home_station, work_station, preferred_agencies_json,
        preferred_routes_json, alert_channels_json, notification_frequency,
        bio, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      data.email.toLowerCase(),
      null,
      persona,
      'Chennai Commuter',
      'Kilambakkam (KCBT)',
      'Chennai Central',
      JSON.stringify(['MTC', 'CMRL']),
      JSON.stringify(['21G', 'Blue-Line']),
      JSON.stringify(['IN_APP', 'EMAIL']),
      'REALTIME',
      null,
      1,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(id) as any;
    return {
      ...created,
      photoUrl: data.photoUrl || null
    };
  } catch (error) {
    console.error('Failed to get or create user:', error);
    throw error;
  }
}

export async function getUserByUid(uid: string) {
  try {
    const row = db.prepare('SELECT * FROM user_profiles WHERE id = ? OR email = ?').get(uid, uid) as any;
    if (!row) return null;
    return {
      ...row,
      photoUrl: null
    };
  } catch (error) {
    console.error('Failed to fetch user by UID:', error);
    return null;
  }
}

export async function updateUserPersona(uid: string, persona: string) {
  try {
    const now = new Date().toISOString();
    db.prepare('UPDATE user_profiles SET persona = ?, updated_at = ? WHERE id = ? OR email = ?').run(persona, now, uid, uid);
    return getUserByUid(uid);
  } catch (error) {
    console.error('Failed to update user persona:', error);
    return null;
  }
}

export async function getUserSubscriptions(userId: number | string) {
  try {
    return db.prepare('SELECT * FROM subscriber_filters WHERE subscriber_id = ?').all(String(userId));
  } catch (error) {
    console.error('Failed to fetch user subscriptions:', error);
    return [];
  }
}

export async function addUserSubscription(userId: number | string, routeId: string, agency?: string, area?: string) {
  try {
    const info = db.prepare(`
      INSERT INTO subscriber_filters (subscriber_id, route_id, agency, area)
      VALUES (?, ?, ?, ?)
    `).run(String(userId), routeId, agency || null, area || null);
    return { id: info.lastInsertRowid, subscriber_id: String(userId), route_id: routeId, agency, area };
  } catch (error) {
    console.error('Failed to add user subscription:', error);
    throw error;
  }
}

export async function removeUserSubscription(userId: number | string, subId: number) {
  try {
    db.prepare('DELETE FROM subscriber_filters WHERE id = ? AND subscriber_id = ?').run(subId, String(userId));
    return { success: true };
  } catch (error) {
    console.error('Failed to remove user subscription:', error);
    throw error;
  }
}
