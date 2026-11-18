import { neon } from '@neondatabase/serverless';
import { randomBytes, randomInt } from 'crypto';
import { pageUrl, sidCookie } from './_shared.js';

const sql = neon(process.env.DATABASE_URL);

// Any hub name works: it comes from the link (?hub=NAME). Letters, numbers, - and _ only.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);

// Creates a session and sends the player to step 1 (the "start" page).
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // FIX: the cookie pattern now allows _ and - (before, "my-hub" was cut to "my")
    const fromCookie = ((req.headers.cookie || '').match(/(?:^|;\s*)hub=([a-z0-9_-]{1,24})/) || [])[1];
    const hub = String(req.query.hub || fromCookie || '').toLowerCase();
    if (!isHub(hub)) return res.redirect(302, '/api/start');

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    const recent = await sql`
      SELECT COUNT(*)::int AS c FROM sessions
      WHERE ip = ${ip} AND created_at > NOW() - INTERVAL '10 minutes'
    `;
    if (recent[0].c >= 10) {
      return res.status(429).send('Too many attempts. Try again later.');
    }

    const nonce = randomBytes(16).toString('hex');
    const token = randomBytes(16).toString('hex');
    const stepToken = randomBytes(16).toString('hex');
    const code = String(randomInt(100000, 1000000));

    await sql`
      INSERT INTO sessions (nonce, ip, code, continued_at, token, hub, step, step_token, step_at)
      VALUES (${nonce}, ${ip}, ${code}, NOW(), ${token}, ${hub}, 1, ${stepToken}, NOW())
    `;

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, pageUrl(1, nonce, stepToken));
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
