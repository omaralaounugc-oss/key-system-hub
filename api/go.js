import { neon } from '@neondatabase/serverless';
import { randomBytes, randomInt } from 'crypto';

const sql = neon(process.env.DATABASE_URL);

const LOOT_LINK = 'https://loot-link.com/s?9diqLQbJ';
const SITE = 'https://keyhub-system.vercel.app';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let nonce = req.query.nonce;
    const newToken = randomBytes(16).toString('hex');

    if (!nonce || !/^[a-f0-9]{32}$/.test(nonce)) {
      // Fresh visitor from the choice page: make a session here.
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
      await sql`INSERT INTO sessions (nonce, ip, code) VALUES (${nonce}, ${ip}, ${code})`;
    }

    // Safe to open more than once: the same token is reused.
    const rows = await sql`
      UPDATE sessions
      SET continued_at = COALESCE(continued_at, NOW()),
          token = COALESCE(token, ${newToken})
      WHERE nonce = ${nonce}
        AND used = false
        AND created_at > NOW() - INTERVAL '30 minutes'
      RETURNING token
    `;

    if (!rows || rows.length === 0) {
      return res.redirect(302, '/api/start');
    }

    const token = rows[0].token;

    // After LootLabs, the player lands on Step 1 of 4 (inside our site).
    const dest = `${SITE}/index1.html?nonce=${nonce}&t=${token}`;
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
