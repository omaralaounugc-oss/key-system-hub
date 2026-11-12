// Any hub name works: it comes from the link (?hub=NAME). Letters, numbers, - and _ only.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);
const WORKINK_LINK = 'https://work.ink/3a3P/key-system';

function choosePage(hub) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-MF9MT7J6"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>
<meta name="referrer" content="no-referrer-when-downgrade" />
<meta name="clckd" content="7115760891f9ae23bf15d477c7aeebe1" />
<script src="https://quge5.com/88/tag.min.js" data-zone="307027" async data-cfasync="false"></script>
<script src="https://quge5.com/88/tag.min.js" data-zone="308573" async data-cfasync="false"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3893185157459343"
     crossorigin="anonymous"></script>
<title>Get your key</title>
<style>
  :root{--label:#fff;--label-2:rgba(235,235,245,.60);--fill:rgba(120,120,128,.20);--sep:rgba(255,255,255,.10);--font:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;--ease:cubic-bezier(.22,1,.36,1)}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  
  /* --- ANTI-SCROLL FIXES --- */
  html, body {
    height: 100vh;
    height: 100dvh;
    overflow: hidden; /* Prevents scrolling */
    overscroll-behavior: none; /* Prevents mobile bounce */
    position: fixed;
    width: 100%;
    background: #000;
  }

  body{font-family:var(--font);color:var(--label);-webkit-font-smoothing:antialiased}
  
  /* Background z-index is 1, Ads are z-index 0 (underneath) */
  .bg{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;background:#000}
  .orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.55}
  .orb.a{width:70vmax;height:70vmax;left:-25vmax;top:-30vmax;background:radial-gradient(circle,#2b4a8f 0%,transparent 68%)}
  .orb.b{width:60vmax;height:60vmax;right:-25vmax;bottom:-28vmax;background:radial-gradient(circle,#5b2d8a 0%,transparent 68%)}
  
  /* Main screen z-index is 2 (above background) */
  .screen{position:absolute;top:0;left:0;z-index:2;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 28px) 20px calc(env(safe-area-inset-bottom,0px) + 28px)}
  
  .content-wrapper {
    width: 100%;
    max-width: 430px;
    display: flex;
    flex-direction: column;
  }

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
  
  @media(min-width:840px){
    .wide{display:flex;justify-content:center;margin:10px auto;position:absolute;bottom:20px;left:0;width:100%;z-index:3;}
    .rail{display:block;position:fixed;top:120px;z-index:3;}
    .rail.l{left:calc(50% - 405px)}
    .rail.r{right:calc(50% - 405px)}
  }
</style>
<script>
function adBanner(k,w,h,min){if(innerWidth<min)return;document.write('<scr'+'ipt>atOptions={"key":"'+k+'","format":"iframe","height":'+h+',"width":'+w+',"params":{}};</scr'+'ipt><scr'+'ipt src="https://bauval.org/22/'+k+'"></scr'+'ipt>')}
</script>
</head>
<body>

<!-- ADS (Z-index 0, hidden behind .bg) -->
<div class="rail l"><script>adBanner('980accb5247e3b507876a5598c5dac63',160,600,840)</script></div>
<div class="rail r"><script>adBanner('e7d297afa4abe6d8e9ae4b6d4a9e413e',160,300,840)</script></div>
<div class="wide"><script>adBanner('a973ad4d1946ecff433073faf4287a75',728,90,840)</script></div>

<!-- SOLID BACKGROUND (Z-index 1) -->
<div class="bg"><div class="orb a"></div><div class="orb b"></div></div>

<!-- MAIN CONTENT (Z-index 2) -->
<main class="screen">
  <div class="content-wrapper">
    <div class="ad"><script>adBanner('c1e961c0589310bb251d53941c12fbb1',320,50,0)</script></div>
    <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3m-3 3 3 3m-6 0 2 2"/></svg></div>
    <h1>How do you want to get the key?</h1>
    <p class="lede">Pick one way to continue.</p>

    <a class="opt loot" href="/api/go?hub=${hub}" id="loot">
      <div class="logo">L</div>
      <div class="txt">
        <div class="name">LootLabs <span class="tag warn">may be broken now</span></div>
      </div>
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>
    </a>

    <a class="opt work" href="${WORKINK_LINK}">
      <div class="logo">W</div>
      <div class="txt">
        <div class="name">Work.ink</div>
        <div class="sub">lil hard to get</div>
      </div>
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>
    </a>
    <div class="ad"><script>adBanner('a60c9cdf9090006b20d869deedf8faef',300,250,0)</script></div>
  </div>
</main>

<script async="async" data-cfasync="false" src="https://bauval.org/21/83e2d8f4007a7f9643ce1333685516fb"></script>
<div id="container-83e2d8f4007a7f9643ce1333685516fb" style="position:absolute; z-index:0; pointer-events:none; opacity:0;"></div>
<!-- Adsterra -->
<script data-cfasync="false" src="https://bauval.org/14/ca3799816ffb85d7fc27ab6dc9ff2222"></script>
<script data-cfasync="false" src="https://abscloud.org/1/5c130b03e11c03b9f07572a8332254ef"></script>
<script>
(function(){
  var urls = ['https://araplhn.org/4/f807188adb57a12ed0dc88c5f090b8f3'];
  var n = 0;
  var go = false;
  document.querySelectorAll('a.opt').forEach(function(a){ a.addEventListener('click', function(e){ if (go) { e.preventDefault(); return; } go = true; setTimeout(function(){ go = false; }, 8000); }); });
  document.addEventListener('click', function(){
    if (n >= urls.length) return;
    window.open(urls[n++], '_blank');
  }, true);
})();
</script>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const hub = String(req.query.hub || '').toLowerCase();
  if (!isHub(hub)) return res.redirect(302, '/api/start');
  // Work.ink sends people back to /api/begin, which reads the hub from this cookie
  res.setHeader('Set-Cookie', `hub=${hub}; Path=/; Max-Age=3600; SameSite=Lax; Secure`);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(choosePage(hub));
}
