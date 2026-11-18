import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// NOTE: this Map lives inside one serverless instance only, so it is a weak limiter. Fine as a first layer.
const attempts = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
  const now = Date.now();

  const a = attempts.get(ip);
  if (a && now - a.timestamp < 60000) {
    if (a.count >= 10) return res.status(429).json({ error: 'Too many attempts. Wait 1 minute.' });
    a.count++;
  } else {
    attempts.set(ip, { count: 1, timestamp: now });
  }

  try {
    const { key, hwid, hub } = req.body || {};
    const REQUIRE_HUB = false; // set true after ALL hub scripts send "hub" (otherwise a key of one hub works on every hub)

    if (!key) return res.status(400).json({ error: 'No key provided' });
    if (!hwid) return res.status(400).json({ error: 'No hwid provided' });
    if (REQUIRE_HUB && !hub) return res.status(400).json({ error: 'No hub provided' });

    const rows = await sql`SELECT key, expires_at, hwid, hub, used FROM keys WHERE key = ${key}`;
    if (!rows || rows.length === 0) return res.status(403).json({ valid: false, message: 'Invalid key' });

    const data = rows[0];
    // FIX: keys from the pre-generated pool that nobody got through the steps are not valid
    if (!data.used) return res.status(403).json({ valid: false, message: 'Invalid key' });
    if (hub && data.hub !== hub) return res.status(403).json({ valid: false, message: 'This key is for another hub' });
    if (new Date() > new Date(data.expires_at)) return res.status(403).json({ valid: false, message: 'Key expired' });

    if (!data.hwid) {
      // FIX: bind atomically so two devices cannot claim the key at the same moment
      const upd = await sql`UPDATE keys SET hwid = ${hwid} WHERE key = ${key} AND hwid IS NULL RETURNING key`;
      if (upd.length) return res.status(200).json({ valid: true });
      const again = await sql`SELECT hwid FROM keys WHERE key = ${key}`;
      if (again[0] && again[0].hwid === hwid) return res.status(200).json({ valid: true });
      return res.status(403).json({ valid: false, message: 'Key used on another device' });
    }
    if (data.hwid !== hwid) return res.status(403).json({ valid: false, message: 'Key used on another device' });
    return res.status(200).json({ valid: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
