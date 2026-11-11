import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Any hub name works: it comes from the link (?hub=NAME). Letters, numbers, - and _ only.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);

// Used by index.html: a saved key is shown only if the server issued it for that hub and it is still valid.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ valid: false });
  }

  const { key, hub } = req.query;
  if (!key || typeof key !== 'string' || key.length > 64 || !isHub(hub)) {
    return res.status(400).json({ valid: false });
  }

  try {
    const rows = await sql`
      SELECT expires_at FROM keys
      WHERE key = ${key} AND hub = ${hub} AND used = true AND expires_at > NOW()
    `;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ valid: false });
    }
    return res.status(200).json({ valid: true, expires_at: rows[0].expires_at });
  } catch (err) {
    return res.status(500).json({ valid: false });
  }
}
