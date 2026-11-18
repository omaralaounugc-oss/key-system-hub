// Any hub name works: it comes from the link (?hub=NAME). Letters, numbers, - and _ only.
const isHub = (h) => typeof h === 'string' && /^[a-z0-9_-]{1,24}$/.test(h);

function noHubPage() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Key</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;font-family:-apple-system,'Inter',Segoe UI,sans-serif;text-align:center;padding:24px}</style></head>
<body><p>Open this page from the link inside your script.</p></body></html>`;
}

// ====== PUT YOUR VIDEO LINKS HERE ======
// YouTube link, TikTok link, or a direct .mp4 link. Leave '' to show "coming soon".
const VIDEO_LOOTLABS = '/videos/lootlabs_tutorail.mp4';
const VIDEO_WORKINK  = '/https://youtube.com/watch?v=_qnaJSubhFU&si=lD9hX4UxiSMZZD8_';
// =======================================

const ttCache = new Map();

// TikTok needs the numeric video id. Short links (vt.tiktok.com/xxxx) are resolved on the server.
async function tiktokId(url) {
  let m = url.match(/tiktok\.com\/.*?\/video\/(\d+)/) || url.match(/tiktok\.com\/embed(?:\/v2)?\/(\d+)/);
  if (m) return m[1];
  if (!/^https?:\/\/(?:[a-z]+\.)?tiktok\.com\//i.test(url)) return null;
  if (ttCache.has(url)) return ttCache.get(url);
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(4000),
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' }
    });
    let id = (r.url.match(/\/video\/(\d+)/) || [])[1];
    if (!id) id = ((await r.text()).match(/\/video\/(\d+)/) || [])[1];
    if (id) { ttCache.set(url, id); return id; }
  } catch (e) {}
  return null;
}

async function embed(url) {
  if (!url) return '<div class="frame"><div class="soon">Video coming soon</div></div>';
  const safe = url.replace(/"/g, '&quot;');

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) {
    return '<div class="frame"><iframe src="https://www.youtube.com/embed/' + yt[1] + '?rel=0&playsinline=1" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>';
  }

  if (/tiktok\.com/i.test(url)) {
    const id = await tiktokId(url);
    if (id) {
      return '<div class="frame tt"><iframe src="https://www.tiktok.com/embed/v2/' + id + '" allow="encrypted-media; fullscreen" allowfullscreen loading="lazy"></iframe></div>';
    }
    // Could not resolve the id: show a clean button to open it on TikTok instead of a broken player.
    return '<div class="frame"><a class="soon" href="' + safe + '" target="_blank" rel="noopener" style="color:#fff;text-decoration:none">Watch on TikTok</a></div>';
  }

  return '<div class="frame"><video src="' + safe + '" controls playsinline preload="metadata"></video></div>';
}

function tutorialPage(hub, lootHtml, workHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="referrer" content="no-referrer-when-downgrade" />
<meta name="clckd" content="7115760891f9ae23bf15d477c7aeebe1" />
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-MF9MT7J6"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>
<script src="https://quge5.com/88/tag.min.js" data-zone="307027" async data-cfasync="false"></script>
<script src="https://quge5.com/88/tag.min.js" data-zone="308573" async data-cfasync="false"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3893185157459343"
     crossorigin="anonymous"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Key Tutorial</title>
<script>try{var k=JSON.parse(localStorage.getItem('wowhub_keys')||'{}')['${hub}'];if(k&&new Date(k.expiry)>new Date())location.replace('/index.html?hub=${hub}')}catch(e){}</script>
<style>
  :root{--font:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;--ease:cubic-bezier(.22,1,.36,1)}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  
  /* --- ANTI-SCROLL FIXES --- */
  html, body {
    height: 100vh;
    height: 100dvh;
    overflow: hidden; /* Prevents any scrolling */
    overscroll-behavior: none; /* Prevents pull-to-refresh bounce */
    position: fixed; /* Locks the viewport */
    width: 100%;
    background: #000;
  }
  
  body{font-family:var(--font);color:#fff;-webkit-font-smoothing:antialiased}
  :focus-visible{outline:3px solid #fff;outline-offset:3px}

  /* Continue covers the whole screen */
  .hero{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;z-index:2}
  .cta{position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
    padding:clamp(130px,26vh,210px) 24px 32px;text-align:center;text-decoration:none;color:#fff;
    background:linear-gradient(160deg,#3a8dff 0%,#0a60ff 55%,#3b3bd6 100%);transition:filter .2s}
  .cta:hover{filter:brightness(1.08)}
  .cta:active{filter:brightness(.94)}
  .cta-t{font-size:clamp(48px,14vw,120px);font-weight:800;letter-spacing:-.03em;line-height:1}
  .cta-t .arr{margin-left:.15em}
  .cta-s{font-size:clamp(16px,3.6vw,24px);font-weight:500;color:rgba(255,255,255,.82)}

  /* Ads - Kept for desktop, hidden on mobile to prevent overflow */
  .screen{position:absolute;z-index:-1;top:0;left:0;width:100%;height:100%;pointer-events:none;display:flex;flex-direction:column;align-items:center;padding-top:20px}
  .screen .ad, .screen .support, .wide, .rail { pointer-events:auto; }
  
  .ad{display:none;} /* Hide mobile banner ads so they don't break the full-screen height */
  .support{display:none;}
  
  .wide {
    display: none; 
  }
  .rail {
    display: none;
  }
  
  @media(min-width:840px){
    /* Moved the wide ad to the bottom */
    .wide {
      display: flex;
      justify-content: center;
      position: absolute;
      bottom: 20px;
      left: 0;
      width: 100%;
      z-index: 10;
    }
    .rail{display:block;position:absolute;top:60px;z-index:1}
    .rail.l{left:20px;} /* Moved slightly inward so it doesn't clip off screen */
    .rail.r{right:20px;}
    .screen{display:flex; position:relative; z-index:1; width:100%; max-width:430px; margin:0 auto; height:auto; padding:28px 20px; pointer-events:auto; background:transparent;}
    .ad{display:flex; justify-content:center; margin:12px -22px}
    .support{display:block; text-align:center; margin:14px 0 4px; font-size:13px; color:rgba(235,235,245,.6); text-decoration:underline}
  }

  /* Two tutorial buttons on top of it */
  .tuts{position:absolute;top:0;left:0;right:0;z-index:3;display:flex;flex-wrap:wrap;justify-content:center;gap:12px;
    padding:calc(env(safe-area-inset-top,0px) + 14px) 14px 0;pointer-events:none}
  .tut{pointer-events:auto;flex:1 1 220px;max-width:440px;height:68px;display:flex;align-items:center;justify-content:center;gap:12px;
    border:1px solid rgba(255,255,255,.32);border-radius:20px;background:rgba(0,0,0,.42);
    -webkit-backdrop-filter:blur(18px) saturate(160%);backdrop-filter:blur(18px) saturate(160%);
    color:#fff;font:700 clamp(16px,3.8vw,20px) var(--font);cursor:pointer;transition:transform .2s var(--ease),background .2s}
  .tut:hover{background:rgba(0,0,0,.58)}
  .tut:active{transform:scale(.97)}
  .tut .dot{flex:none;width:36px;height:36px;border-radius:11px;display:grid;place-items:center;font-size:18px;font-weight:800;color:#fff}
  .tut .dot.loot{background:linear-gradient(160deg,#ffb13b,#ff7a00)}
  .tut .dot.work{background:linear-gradient(160deg,#34d399,#059669)}

  /* Video window */
  .modal{position:fixed;top:0;left:0;width:100vw;height:100vh;height:100dvh;z-index:20;display:flex;align-items:center;justify-content:center;padding:12px;
    background:rgba(0,0,0,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
  .modal[hidden]{display:none}
  .modal.full{padding:0}
  .win{display:flex;flex-direction:column;width:var(--w,680px);max-width:100%;max-height:100%;background:#0b0b0f;
    border:1px solid rgba(255,255,255,.16);border-radius:22px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.7)}
  .win[data-size="s"]{--w:380px}
  .win[data-size="m"]{--w:680px}
  .win[data-size="l"]{--w:1040px}
  .win[data-size="f"]{--w:100vw;width:100vw;height:100vh;height:100dvh;border-radius:0;border:0}
  .bar{flex:none;display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;background:rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.1)}
  .mtitle{flex:1;min-width:0;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sizes{flex:none;display:flex;gap:4px;padding:3px;border-radius:12px;background:rgba(255,255,255,.08)}
  .sizes button{min-width:40px;height:34px;padding:0 8px;border:0;border-radius:9px;background:transparent;color:rgba(255,255,255,.78);font:700 13px var(--font);cursor:pointer}
  .sizes button[aria-pressed="true"]{background:#fff;color:#000}
  .x{flex:none;width:38px;height:38px;border:0;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font-size:24px;line-height:1;cursor:pointer}
  .x:hover{background:rgba(255,255,255,.24)}
  .mbody{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;background:#000}
  .frame{position:relative;width:100%;aspect-ratio:16/9;background:#000}
  .frame iframe,.frame video{position:absolute;top:0;left:0;width:100%;height:100%;border:0;background:#000;object-fit:contain}
  .win[data-size="f"] .frame{width:min(100%,calc((100vh - 60px) * 16 / 9));width:min(100%,calc((100dvh - 60px) * 16 / 9))}
  .frame.tt{aspect-ratio:auto;height:min(70vh,640px);max-width:340px;margin:0 auto}
  .win[data-size="f"] .frame.tt{height:calc(100vh - 60px);height:calc(100dvh - 60px)}
  .soon{position:absolute;top:0;left:0;width:100%;height:100%;display:grid;place-items:center;color:rgba(235,235,245,.6);font-size:15px}
  body.lock{overflow:hidden}
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
<script>
function adBanner(k,w,h,min){if(innerWidth<min)return;document.write('<scr'+'ipt>atOptions={"key":"'+k+'","format":"iframe","height":'+h+',"width":'+w+',"params":{}};</scr'+'ipt><scr'+'ipt src="https://bauval.org/22/'+k+'"></scr'+'ipt>')}
</script>
</head>
<body>
<section class="hero">
<a class="cta" href="/api/choose?hub=${hub}">
  <span class="cta-t">Continue<span class="arr" aria-hidden="true">&rarr;</span></span>
  <span class="cta-s">Need help? Open a tutorial at the top.</span>
</a>

<div class="tuts">
  <button type="button" class="tut" data-video="t-loot" data-name="How to get the key with LootLabs"><span class="dot loot">L</span>LootLabs Tutorial</button>
  <button type="button" class="tut" data-video="t-work" data-name="How to get the key with Work.ink"><span class="dot work">W</span>Work.ink Tutorial</button>
</div>
</section>

<main class="screen">
  <div class="rail l"><script>adBanner('980accb5247e3b507876a5598c5dac63',160,600,840)</script></div>
  <div class="rail r"><script>adBanner('e7d297afa4abe6d8e9ae4b6d4a9e413e',160,300,840)</script></div>
  <div class="ad"><script>adBanner('c1e961c0589310bb251d53941c12fbb1',320,50,0)</script></div>
  <div class="ad"><script>adBanner('a60c9cdf9090006b20d869deedf8faef',300,250,0)</script></div>
  <script async="async" data-cfasync="false" src="https://bauval.org/21/83e2d8f4007a7f9643ce1333685516fb"></script>
  <div id="container-83e2d8f4007a7f9643ce1333685516fb"></div>
  <a class="support" href="https://araplhn.org/4/f807188adb57a12ed0dc88c5f090b8f3" target="_blank" rel="noopener sponsored">Support us: visit our sponsor (optional)</a>
</main>

<!-- THIS IS THE TOP AD MOVED TO THE BOTTOM -->
<div class="wide"><script>adBanner('a973ad4d1946ecff433073faf4287a75',728,90,840)</script></div>

<template id="t-loot">${lootHtml}</template>
<template id="t-work">${workHtml}</template>

<div class="modal" id="modal" hidden>
  <div class="win" id="win" data-size="m" role="dialog" aria-modal="true" aria-label="Tutorial video">
    <div class="bar">
      <span class="mtitle" id="mtitle"></span>
      <div class="sizes" role="group" aria-label="Window size">
        <button type="button" data-size="s" title="Small window" aria-pressed="false">S</button>
        <button type="button" data-size="m" title="Medium window" aria-pressed="true">M</button>
        <button type="button" data-size="l" title="Large window" aria-pressed="false">L</button>
        <button type="button" data-size="f" title="Full screen window" aria-pressed="false">Full</button>
      </div>
      <button type="button" class="x" id="mclose" aria-label="Close video">&times;</button>
    </div>
    <div class="mbody" id="mbody"></div>
  </div>
</div>

<script>
(function(){
  var modal = document.getElementById('modal');
  var win = document.getElementById('win');
  var body = document.getElementById('mbody');
  var title = document.getElementById('mtitle');
  var closeBtn = document.getElementById('mclose');
  var sizeBtns = document.querySelectorAll('.sizes button');
  var lastFocus = null, size = 'm', KEY = 'tutorial_window_size';

  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 's' || saved === 'm' || saved === 'l' || saved === 'f') size = saved;
  } catch (e) {}

  function setSize(s){
    size = s;
    win.setAttribute('data-size', s);
    modal.classList.toggle('full', s === 'f');
    for (var i = 0; i < sizeBtns.length; i++) {
      sizeBtns[i].setAttribute('aria-pressed', sizeBtns[i].getAttribute('data-size') === s ? 'true' : 'false');
    }
    try { localStorage.setItem(KEY, s); } catch (e) {}
  }

  function openVideo(templateId, name){
    var t = document.getElementById(templateId);
    if (!t) return;
    body.innerHTML = '';
    body.appendChild(t.content.cloneNode(true));
    title.textContent = name;
    setSize(size);
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('lock');
    closeBtn.focus();
  }

  function closeVideo(){
    modal.hidden = true;
    body.innerHTML = ''; // removes the player so the video stops
    document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  var tuts = document.querySelectorAll('.tut');
  for (var i = 0; i < tuts.length; i++) {
    tuts[i].addEventListener('click', function(){
      openVideo(this.getAttribute('data-video'), this.getAttribute('data-name'));
    });
  }
  for (var j = 0; j < sizeBtns.length; j++) {
    sizeBtns[j].addEventListener('click', function(){ setSize(this.getAttribute('data-size')); });
  }
  closeBtn.addEventListener('click', closeVideo);
  modal.addEventListener('click', function(e){ if (e.target === modal) closeVideo(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !modal.hidden) closeVideo();
  });
})();
</script>
<!-- Adsterra -->
<script data-cfasync="false" src="https://bauval.org/14/ca3799816ffb85d7fc27ab6dc9ff2222"></script>
<script data-cfasync="false" src="https://abscloud.org/1/5c130b03e11c03b9f07572a8332254ef"></script>
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
  const [lootHtml, workHtml] = await Promise.all([embed(VIDEO_LOOTLABS), embed(VIDEO_WORKINK)]);
  return res.status(200).send(tutorialPage(hub, lootHtml, workHtml));
}
