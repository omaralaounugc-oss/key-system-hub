import { neon } from '@neondatabase/serverless';
import { randomBytes, randomInt } from 'crypto';
import { pageUrl, sidCookie } from './_shared.js';

const sql = neon(process.env.DATABASE_URL);

// Any hub name works: it comes from the link (?hub=NAME). Letters, numbers, - and _ only.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);
const LOOT_LINK = 'https://lootdest.org/s?BeIF65tP';
// Must be the real address of THIS Vercel project (set SITE_URL in Vercel env vars, or edit the fallback).
const SITE = process.env.SITE_URL || 'https://keyhub-system.vercel.app';

// LootLabs path. Creates a session already in the NEW step format, then LootLabs sends the
// player to step 1 (index1.html) with nonce + step token (k) in the format index1.html expects.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const hub = String(req.query.hub || '').toLowerCase();
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

    const dest = `${SITE}${pageUrl(1, nonce, stepToken)}`;
    const apiUrl =
      'https://creators.lootlabs.gg/api/public/url_encryptor' +
      `?destination_url=${encodeURIComponent(dest)}` +
      `&api_token=${process.env.LOOTLABS_API_TOKEN}`;

    const r = await fetch(apiUrl);
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = null; }

    if (!data || typeof data.message !== 'string' || data.type === 'error') {
      return res.status(502).send('Could not create link. Try again.');
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, `${LOOT_LINK}&data=${data.message}`);
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
