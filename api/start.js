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
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#06070a">
<meta name="robots" content="noindex">
<title>Key System</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --sec:rgba(235,235,245,.62); --ter:rgba(235,235,245,.34); --warn:#ff9f0a;
    --font:'Inter',-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  }
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html{background:#06070a}
  body{min-height:100vh;min-height:100dvh;font-family:var(--font);color:#fff;-webkit-font-smoothing:antialiased;
    font-variant-numeric:tabular-nums;overflow-x:hidden}
  body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
    background:
      radial-gradient(70vmax 60vmax at 15% -5%,rgba(96,116,150,.34),transparent 62%),
      radial-gradient(60vmax 55vmax at 105% 105%,rgba(70,78,98,.30),transparent 60%),
      #06070a}
  .screen{position:relative;z-index:1;width:100%;max-width:420px;min-height:100vh;min-height:100dvh;margin:0 auto;display:flex;flex-direction:column;
    padding:calc(env(safe-area-inset-top,0px) + 30px) 22px calc(env(safe-area-inset-bottom,0px) + 22px)}
  .hero{display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:clamp(8px,5vh,48px)}
  .lock{width:22px;height:28px;margin-bottom:16px;color:#fff}
  .cap{font-size:15px;font-weight:500;color:var(--sec)}
  .clock{font-size:clamp(52px,16vw,76px);font-weight:200;letter-spacing:.06em;line-height:1.04;margin-top:8px;user-select:all;-webkit-user-select:all}
  .sub{font-size:15px;line-height:1.4;color:var(--sec);margin-top:10px;max-width:30ch}
  .warn{font-size:13px;line-height:1.4;color:var(--warn);margin-top:18px;max-width:30ch}
  .dock{margin-top:auto;padding-top:28px}
  .go{display:block;width:100%;height:52px;line-height:52px;text-align:center;text-decoration:none;border:none;border-radius:16px;background:#fff;color:#000;
    font:600 16px var(--font);cursor:pointer;transition:transform .15s}
  .go:active{transform:scale(.98)}
  :focus-visible{outline:2px solid #fff;outline-offset:3px}
</style>
</head>
<body>
<main class="screen">
  <div class="hero">
    <svg class="lock" viewBox="0 0 22 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="11.5" width="18" height="14" rx="3.5" fill="currentColor" stroke="none"/><path d="M6 11.5V8a5 5 0 0 1 10 0v3.5"/></svg>
    <div class="cap">Your number</div>
    <div class="clock">${code}</div>
    <div class="sub">You will need these 6 digits on the next page.</div>
    <div class="warn">Save this number before you continue.</div>
  </div>
  <div class="dock">
    <a class="go" href="/api/go?nonce=${nonce}">Continue</a>
  </div>
</main>
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
