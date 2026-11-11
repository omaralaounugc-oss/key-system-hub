import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';

const sql = neon(process.env.DATABASE_URL);

const LOOT_LINK = 'https://loot-link.com/s?9diqLQbJ';
const SITE = 'https://keyhub-system.vercel.app';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nonce } = req.query;
  if (!nonce || !/^[a-f0-9]{32}$/.test(nonce)) {
    return res.redirect(302, '/api/start');
  }

  try {
    const newToken = randomBytes(16).toString('hex');

    // Safe to press Continue more than once: the first press saves the token,
    // later presses reuse the SAME token instead of sending the user back to start.
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

    // Encrypt the real destination with Loot Labs
    const dest = `${SITE}/index2.html?nonce=${nonce}&t=${token}`;
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
