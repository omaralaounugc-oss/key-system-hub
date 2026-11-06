import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const MAX_ATTEMPTS = 5;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nonce, code } = req.body || {};

    if (!nonce || !/^[a-f0-9]{32}$/.test(nonce) || !code) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const rows = await sql`
      SELECT code, attempts, continued_at, verified, used
      FROM sessions
      WHERE nonce = ${nonce}
        AND created_at > NOW() - INTERVAL '1 hour'
    `;

    // Session must exist, must have gone through "Continue", and must not be used yet
    if (!rows || rows.length === 0 || !rows[0].continued_at || rows[0].used) {
      return res.status(403).json({ error: 'Session expired', restart: true });
    }

    const s = rows[0];

    if (s.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many wrong tries', restart: true });
    }

    if (String(code).trim() !== s.code) {
      await sql`UPDATE sessions SET attempts = attempts + 1 WHERE nonce = ${nonce}`;
      const left = MAX_ATTEMPTS - (s.attempts + 1);
      return res.status(400).json({
        error: left > 0 ? `Wrong number. ${left} tries left.` : 'Too many wrong tries',
        restart: left <= 0
      });
    }

    await sql`UPDATE sessions SET verified = true WHERE nonce = ${nonce}`;
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
