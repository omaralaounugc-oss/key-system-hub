import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Cloudflare Turnstile (free). Skipped until TURNSTILE_SECRET is set in Vercel.
async function passedTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true;
  if (!token || typeof token !== 'string') return false;
  try {
    const params = new URLSearchParams({ secret, response: token });
    if (ip) params.append('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const d = await r.json();
    return d.success === true;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nonce, t, ts } = req.body || {};

    // No code needed anymore: nonce + secret token (+ Turnstile) are enough.
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

    // Session must exist, must have gone through "Continue", and must not be used yet
    if (!rows || rows.length === 0 || !rows[0].continued_at || rows[0].used) {
      return res.status(403).json({ error: 'Session expired', restart: true });
    }

    const s = rows[0];

    // The secret token proves the user came through the Loot Labs link
    if (!s.token || s.token !== t) {
      return res.status(403).json({ error: 'Invalid session', restart: true });
    }

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (!(await passedTurnstile(ts, ip))) {
      return res.status(400).json({ error: 'Security check failed. Try again.' });
    }

    await sql`UPDATE sessions SET verified = true WHERE nonce = ${nonce}`;
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
