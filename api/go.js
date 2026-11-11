import { neon } from '@neondatabase/serverless';
import { randomBytes, randomInt } from 'crypto';

const sql = neon(process.env.DATABASE_URL);

// Any hub name works: it comes from the link (?hub=NAME). Letters, numbers, - and _ only.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);
const LOOT_LINK = 'https://lootdest.org/s?BeIF65tP';
const SITE = 'https://keyhub-system.vercel.app';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let nonce = req.query.nonce;
    const newToken = randomBytes(16).toString('hex');

    if (!nonce || !/^[a-f0-9]{32}$/.test(nonce)) {
      // Fresh visitor: the hub must be known before we make a session.
      const hubQ = String(req.query.hub || '').toLowerCase();
      if (!isHub(hubQ)) return res.redirect(302, '/api/start');

      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
      const recent = await sql`
        SELECT COUNT(*)::int AS c FROM sessions
        WHERE ip = ${ip} AND created_at > NOW() - INTERVAL '10 minutes'
      `;
      if (recent[0].c >= 10) {
        return res.status(429).send('Too many attempts. Try again later.');
      }
      nonce = randomBytes(16).toString('hex');
      const code = String(randomInt(100000, 1000000));
      await sql`INSERT INTO sessions (nonce, ip, code, hub) VALUES (${nonce}, ${ip}, ${code}, ${hubQ})`;
    }

    const rows = await sql`
      UPDATE sessions
      SET continued_at = COALESCE(continued_at, NOW()),
          token = COALESCE(token, ${newToken})
      WHERE nonce = ${nonce}
        AND used = false
        AND created_at > NOW() - INTERVAL '30 minutes'
      RETURNING token, hub
    `;

    if (!rows || rows.length === 0) {
      return res.redirect(302, '/api/start');
    }

    const { token, hub } = rows[0];

    // hub in the URL is only for the UI; getkey always reads the hub from the session.
    const dest = `${SITE}/index1.html?nonce=${nonce}&t=${token}&hub=${hub}`;
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

    return res.redirect(302, `${LOOT_LINK}&data=${data.message}`);
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
