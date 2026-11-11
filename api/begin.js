import { neon } from '@neondatabase/serverless';
import { randomBytes, randomInt } from 'crypto';

const sql = neon(process.env.DATABASE_URL);

// Set this as the DESTINATION of your Work.ink link:
// https://keyhub-system.vercel.app/api/begin
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
      INSERT INTO sessions (nonce, ip, code, continued_at, token)
      VALUES (${nonce}, ${ip}, ${code}, NOW(), ${token})
    `;

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, `/index1.html?nonce=${nonce}&t=${token}`);
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
