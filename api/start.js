import { neon } from '@neondatabase/serverless';
import { randomBytes, randomInt } from 'crypto';

const sql = neon(process.env.DATABASE_URL);

function page(code, nonce) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<script src="https://quge5.com/88/tag.min.js" data-zone="307027" async data-cfasync="false"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3893185157459343"
     crossorigin="anonymous"></script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>Key System</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a1a; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; color: white; }
  .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px 50px; width: 420px; max-width: 92vw; text-align: center; }
  .title { color: #aaa; font-size: 18px; font-weight: bold; letter-spacing: 1px; margin-bottom: 24px; }
  .msg { color: #aaa; font-size: 14px; margin-bottom: 18px; line-height: 1.5; }
  .code { background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.3); border-radius: 12px; padding: 18px; font-size: 38px; font-weight: bold; letter-spacing: 8px; margin-bottom: 14px; user-select: all; }
  .warn { color: #fbbf24; font-size: 13px; margin-bottom: 24px; }
  a.btn { display: block; padding: 12px; background: linear-gradient(135deg,#6c63ff,#a78bfa); border-radius: 10px; color: white; font-size: 14px; font-weight: bold; text-decoration: none; }
</style>
</head>
<body>
  <div class="card">
    <div class="title">Key System</div>
    <div class="msg">Here is your number:</div>
    <div class="code">${code}</div>
    <div class="warn">Save this number, you will need it later.</div>
    <a class="btn" href="/api/go?nonce=${nonce}">Continue</a>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';

    // Rate limit: max 10 sessions per IP per 10 minutes
    const recent = await sql`
      SELECT COUNT(*)::int AS c FROM sessions
      WHERE ip = ${ip} AND created_at > NOW() - INTERVAL '10 minutes'
    `;
    if (recent[0].c >= 10) {
      return res.status(429).send('Too many attempts. Try again later.');
    }

    const nonce = randomBytes(16).toString('hex');
    const code = String(randomInt(100000, 1000000)); // 6 digits

    await sql`INSERT INTO sessions (nonce, ip, code) VALUES (${nonce}, ${ip}, ${code})`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(page(code, nonce));
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
