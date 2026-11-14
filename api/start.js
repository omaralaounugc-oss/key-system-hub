// Entry point used by the scripts: /api/start?hub=hub1
// If this browser already has a valid key for the hub, go to the key page. Otherwise start the steps.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);

function noHubPage() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Key</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;font-family:-apple-system,'Inter',Segoe UI,sans-serif;text-align:center;padding:24px}</style></head>
<body><p>Open this page from the link inside your script.</p></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
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
