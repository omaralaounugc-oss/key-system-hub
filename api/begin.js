import { neon } from '@neondatabase/serverless';
import { randomBytes, randomInt } from 'crypto';

const sql = neon(process.env.DATABASE_URL);

// Any hub name works: it comes from the link (?hub=NAME). Letters, numbers, - and _ only.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);

// Work.ink destination: https://keyhub-system.vercel.app/api/begin
// The hub comes from ?hub=... or from the "hub" cookie that /api/choose sets.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fromCookie = ((req.headers.cookie || '').match(/(?:^|;\s*)hub=([a-z0-9]+)/) || [])[1];
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
    const code = String(randomInt(100000, 1000000));

    await sql`
      INSERT INTO sessions (nonce, ip, code, continued_at, token, hub)
      VALUES (${nonce}, ${ip}, ${code}, NOW(), ${token}, ${hub})
    `;

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, `/index1.html?nonce=${nonce}&t=${token}&hub=${hub}`);
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
