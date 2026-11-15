import { neon } from '@neondatabase/serverless';
import { pageUrl, renderPage } from './_shared.js';

const sql = neon(process.env.DATABASE_URL);

// Any hub name works: it comes from the link (?hub=NAME). Letters, numbers, - and _ only.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);
const isHex = (v) => typeof v === 'string' && /^[a-f0-9]{32}$/.test(v);

function noHubPage() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Key</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;font-family:-apple-system,'Inter',Segoe UI,sans-serif;text-align:center;padding:24px}</style></head>
<body><p>Open this page from the link inside your script.</p></body></html>`;
}

// 1) /api/start?hub=hub1            -> entry used by the scripts (goes to the key page if a key is valid, otherwise starts the steps)
// 2) /api/start?nonce=...&k=...     -> the "start" page of the steps
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  const { nonce, k } = req.query;
  if (nonce !== undefined || k !== undefined) {
    try {
      if (!isHex(nonce) || !isHex(k)) return res.redirect(302, '/api/start');
      const rows = await sql`
        SELECT step, step_token, used FROM sessions
        WHERE nonce = ${nonce} AND created_at > NOW() - INTERVAL '1 hour'
      `;
      if (!rows || rows.length === 0 || rows[0].used || !rows[0].step_token) {
        return res.redirect(302, '/api/start');
      }
      const s = rows[0];
      if (k !== s.step_token) return res.redirect(302, pageUrl(s.step, nonce, s.step_token));
      return res.status(200).send(renderPage(nonce, s.step_token, s.step, 0));
    } catch (err) {
      return res.status(500).send('Server error');
    }
  }

  const hub = String(req.query.hub || '').toLowerCase();
  if (!isHub(hub)) return res.status(200).send(noHubPage());

  return res.status(200).send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Loading</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;font-family:-apple-system,'Inter',Segoe UI,sans-serif}</style></head>
<body><p>Loading...</p>
<script>
try{var k=JSON.parse(localStorage.getItem('wowhub_keys')||'{}')['${hub}'];if(k&&new Date(k.expiry)>new Date()){location.replace('/index.html?hub=${hub}');}else{location.replace('/api/begin?hub=${hub}');}}catch(e){location.replace('/api/begin?hub=${hub}');}
</script>
<noscript><a href="/api/begin?hub=${hub}" style="color:#fff">Continue</a></noscript>
</body></html>`);
}
