import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nonce, t } = req.body || {};

    if (
      !nonce || !/^[a-f0-9]{32}$/.test(nonce) ||
      !t || !/^[a-f0-9]{32}$/.test(t)
    ) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const rows = await sql`
      SELECT continued_at, used, token
      FROM sessions
      WHERE nonce = ${nonce}
        AND created_at > NOW() - INTERVAL '1 hour'
    `;

    if (!rows || rows.length === 0 || !rows[0].continued_at || rows[0].used) {
      return res.status(403).json({ error: 'Session expired', restart: true });
    }

    const s = rows[0];

    if (!s.token || s.token !== t) {
      return res.status(403).json({ error: 'Invalid session', restart: true });
    }

    await sql`UPDATE sessions SET verified = true WHERE nonce = ${nonce}`;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('check error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
