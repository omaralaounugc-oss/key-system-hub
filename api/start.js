// Any hub name works: it comes from the link (?hub=NAME). Letters, numbers, - and _ only.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);

function noHubPage() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Key</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;font-family:-apple-system,'Inter',Segoe UI,sans-serif;text-align:center;padding:24px}</style></head>
<body><p>Open this page from the link inside your script.</p></body></html>`;
}

// ====== PUT YOUR VIDEO LINKS HERE ======
// YouTube link (watch / youtu.be / embed) or a direct .mp4 link. Leave '' to show "coming soon".
const VIDEO_LOOTLABS = '/videos/lootlabs.mp4';
const VIDEO_WORKINK  = '/videos/workink.mp4';
// =======================================

function embed(url) {
  if (!url) return '<div class="soon">Video coming soon</div>';
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) {
    return '<iframe src="https://www.youtube.com/embed/' + yt[1] + '?rel=0&playsinline=1" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';
  }
  return '<video src="' + url.replace(/"/g, '&quot;') + '" controls playsinline preload="metadata"></video>';
}

function tutorialPage(hub) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Key Tutorial</title>
<script>try{var k=JSON.parse(localStorage.getItem('wowhub_keys')||'{}')['${hub}'];if(k&&new Date(k.expiry)>new Date())location.replace('/index.html?hub=${hub}')}catch(e){}</script>
<style>
  :root{--label:#fff;--label-2:rgba(235,235,245,.60);--fill:rgba(120,120,128,.20);--sep:rgba(255,255,255,.10);--font:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;--ease:cubic-bezier(.22,1,.36,1)}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html{background:#000}
  body{min-height:100vh;min-height:100dvh;font-family:var(--font);color:var(--label);-webkit-font-smoothing:antialiased;overflow-x:hidden}
  .bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:#000}
  .orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.55}
  .orb.a{width:70vmax;height:70vmax;left:-25vmax;top:-30vmax;background:radial-gradient(circle,#2b4a8f 0%,transparent 68%)}
  .orb.b{width:60vmax;height:60vmax;right:-25vmax;bottom:-28vmax;background:radial-gradient(circle,#5b2d8a 0%,transparent 68%)}
  .screen{position:relative;z-index:1;width:100%;max-width:430px;min-height:100vh;min-height:100dvh;margin:0 auto;display:flex;flex-direction:column;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 28px) 20px calc(env(safe-area-inset-bottom,0px) + 28px)}
  .icon{width:64px;height:64px;border-radius:15px;margin:0 auto 22px;display:grid;place-items:center;background:linear-gradient(160deg,#3a8dff 0%,#0a60ff 55%,#3b3bd6 100%);box-shadow:0 10px 30px rgba(10,96,255,.35)}
  .icon svg{width:30px;height:30px;color:#fff}
  h1{font-size:26px;line-height:1.15;font-weight:700;letter-spacing:-.02em;text-align:center}
  .lede{margin:10px auto 26px;font-size:15px;color:var(--label-2);text-align:center}
  .opt{display:flex;align-items:center;gap:14px;width:100%;padding:16px;margin-bottom:12px;border-radius:18px;text-decoration:none;color:inherit;background:var(--fill);border:.5px solid var(--sep);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);transition:transform .25s var(--ease),background .25s var(--ease)}
  .opt:active{transform:scale(.98);background:rgba(120,120,128,.32)}
  .logo{flex:0 0 46px;height:46px;border-radius:12px;display:grid;place-items:center;font-weight:800;font-size:20px;color:#fff}
  .loot .logo{background:linear-gradient(160deg,#ffb13b,#ff7a00)}
  .work .logo{background:linear-gradient(160deg,#34d399,#059669)}
  .txt{flex:1;min-width:0}
  .name{font-size:17px;font-weight:600;letter-spacing:-.01em;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .tag{font-size:11.5px;font-weight:600;padding:3px 8px;border-radius:8px;letter-spacing:0}
  .tag.warn{color:#ff9f0a;background:rgba(255,159,10,.15)}
  .sub{margin-top:3px;font-size:13.5px;color:var(--label-2)}
  .chev{flex:0 0 auto;width:18px;height:18px;color:rgba(235,235,245,.30)}
  .ad{display:flex;justify-content:center;margin:12px 0}
  .wide{display:none}
  .rail{display:none}
  @media(min-width:840px){.wide{display:flex;justify-content:center;margin:10px auto}.rail{display:block;position:fixed;top:120px;z-index:1}.rail.l{left:calc(50% - 405px)}.rail.r{right:calc(50% - 405px)}}

  .vid{margin:0 0 22px}
  .vid h2{font-size:17px;font-weight:600;letter-spacing:-.01em;margin:0 0 10px;display:flex;align-items:center;gap:10px}
  .vid h2 .dot{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;font-size:13px;font-weight:800;color:#fff}
  .vid.loot .dot{background:linear-gradient(160deg,#ffb13b,#ff7a00)}
  .vid.work .dot{background:linear-gradient(160deg,#34d399,#059669)}
  .frame{position:relative;width:100%;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#0b0b0f;border:.5px solid var(--sep)}
  .frame iframe,.frame video{position:absolute;inset:0;width:100%;height:100%;border:0}
  .soon{position:absolute;inset:0;display:grid;place-items:center;color:var(--label-2);font-size:14px}
  .cta{display:flex;align-items:center;justify-content:center;width:100%;height:54px;margin-top:6px;border-radius:16px;font-size:17px;font-weight:600;color:#fff;text-decoration:none;background:linear-gradient(160deg,#3a8dff,#0a60ff);box-shadow:0 10px 26px rgba(10,96,255,.35);transition:transform .25s var(--ease)}
  .cta:active{transform:scale(.98)}
</style>
<script>
function adBanner(k,w,h,min){if(innerWidth<min)return;document.write('<scr'+'ipt>atOptions={"key":"'+k+'","format":"iframe","height":'+h+',"width":'+w+',"params":{}};</scr'+'ipt><scr'+'ipt src="https://bauval.org/22/'+k+'"></scr'+'ipt>')}
</script>
</head>
<body>
<div class="bg"><div class="orb a"></div><div class="orb b"></div></div>
<div class="rail l"><script>adBanner('980accb5247e3b507876a5598c5dac63',160,600,840)</script></div>
<div class="rail r"><script>adBanner('e7d297afa4abe6d8e9ae4b6d4a9e413e',160,300,840)</script></div>
<div class="wide"><script>adBanner('a973ad4d1946ecff433073faf4287a75',728,90,840)</script></div>
<main class="screen" style="justify-content:flex-start">
  <div class="ad"><script>adBanner('c1e961c0589310bb251d53941c12fbb1',320,50,0)</script></div>
  <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3m-3 3 3 3m-6 0 2 2"/></svg></div>
  <h1>Key Tutorial</h1>
  <p class="lede">Watch how to get the key, then press Continue.</p>

  <section class="vid loot">
    <h2><span class="dot">L</span>How to get the key with LootLabs</h2>
    <div class="frame">${embed(VIDEO_LOOTLABS)}</div>
  </section>

  <section class="vid work">
    <h2><span class="dot">W</span>How to get the key with Work.ink</h2>
    <div class="frame">${embed(VIDEO_WORKINK)}</div>
  </section>

  <a class="cta" href="/api/choose?hub=${hub}">Continue</a>
  <div class="ad"><script>adBanner('a60c9cdf9090006b20d869deedf8faef',300,250,0)</script></div>
</main>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const hub = String(req.query.hub || '').toLowerCase();
  if (!isHub(hub)) return res.status(200).send(noHubPage());
  return res.status(200).send(tutorialPage(hub));
}
