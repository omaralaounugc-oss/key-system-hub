import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const LOOT_LINK = 'https://loot-link.com/s?9diqLQbJ';
const SITE = 'https://wowhub-webhook.vercel.app';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nonce } = req.query;
  if (!nonce || !/^[a-f0-9]{32}$/.test(nonce)) {
    return res.redirect(302, '/api/start');
  }

  try {
    // Continue works only ONE time per number.
    // If the user comes back and presses it again, they start over with a new number.
    const rows = await sql`
      UPDATE sessions SET continued_at = NOW()
      WHERE nonce = ${nonce}
        AND continued_at IS NULL
        AND used = false
        AND created_at > NOW() - INTERVAL '30 minutes'
      RETURNING nonce
    `;
    if (!rows || rows.length === 0) {
      return res.redirect(302, '/api/start');
    }

    // Encrypt the real destination with Loot Labs
    const dest = `${SITE}/index2.html?nonce=${nonce}`;
    const apiUrl =
      'https://creators.lootlabs.gg/api/public/url_encryptor' +
      `?destination_url=${encodeURIComponent(dest)}` +
      `&api_token=${process.env.LOOTLABS_API_TOKEN}`;

    const r = await fetch(apiUrl);
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = null; }

    if (!data || typeof data.message !== 'string' || data.type === 'error') {
      // give the session back so the user can retry
      await sql`UPDATE sessions SET continued_at = NULL WHERE nonce = ${nonce}`;
      return res.status(502).send('Could not create link. Try again.');
    }

    return res.redirect(302, `${LOOT_LINK}&data=${data.message}`);
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
