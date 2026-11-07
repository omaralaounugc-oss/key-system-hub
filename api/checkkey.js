import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Used by index.html: only shows a key if the server really issued it and it is still valid.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ valid: false });
  }

  const key = req.query.key;
  if (!key || typeof key !== 'string' || key.length > 64) {
    return res.status(400).json({ valid: false });
  }

  try {
    const rows = await sql`
      SELECT expires_at FROM keys
      WHERE key = ${key} AND used = true AND expires_at > NOW()
    `;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ valid: false });
    }
    return res.status(200).json({ valid: true, expires_at: rows[0].expires_at });
  } catch (err) {
    return res.status(500).json({ valid: false });
  }
}
