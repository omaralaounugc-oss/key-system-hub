import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Any hub name works: it comes from the link (?hub=NAME). Letters, numbers, - and _ only.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);

// Only these hubs can get a key. To add a new hub later, add its name here.
const ALLOWED_HUBS = ['hub1', 'hub2', 'hub3', 'hub4'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nonce, t } = req.query;
  if (
    !nonce || !/^[a-f0-9]{32}$/.test(nonce) ||
    !t || !/^[a-f0-9]{32}$/.test(t)
  ) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  try {
    const session = await sql`
      UPDATE sessions SET used = true
      WHERE nonce = ${nonce}
        AND token = ${t}
        AND used = false
        AND verified = true
        AND continued_at < NOW() - INTERVAL '25 seconds'
        AND created_at > NOW() - INTERVAL '1 hour'
      RETURNING nonce, hub
    `;
    if (!session || session.length === 0) {
      return res.status(403).json({ error: 'Invalid or expired session' });
    }

    const hub = session[0].hub;
    if (!isHub(hub)) {
      await sql`UPDATE sessions SET used = false WHERE nonce = ${nonce}`;
      return res.status(400).json({ error: 'Unknown hub. Please start again.' });
    }

    // Any other hub can do all the steps, but gets an error at the end.
    if (!ALLOWED_HUBS.includes(hub)) {
      return res.status(400).json({ error: 'Invalid hub link.' });
    }

    const now = new Date();
    const expires = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    // One shared pool: take any random unused key and bind it to this session's hub.
    const rows = await sql`
      UPDATE keys
      SET used = true,
          hub = ${hub},
          activated_at = ${now.toISOString()},
          expires_at = ${expires.toISOString()}
      WHERE key = (
        SELECT key FROM keys
        WHERE used = false
          AND hwid IS NULL
          AND expires_at > ${now.toISOString()}
        ORDER BY RANDOM()
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING key, expires_at
    `;

    if (!rows || rows.length === 0) {
      await sql`UPDATE sessions SET used = false WHERE nonce = ${nonce}`;
      return res.status(404).json({ error: 'No keys available' });
    }

    return res.status(200).json({ key: rows[0].key, expires_at: rows[0].expires_at, hub });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
