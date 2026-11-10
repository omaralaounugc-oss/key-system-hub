import { neon } from '@neondatabase/serverless';
import { randomBytes, randomInt } from 'crypto';

const sql = neon(process.env.DATABASE_URL);

function page(code, nonce) {
  const cells = (str) => str.split('').map((d) => `<span class="digit">${d}</span>`).join('');
  const left = code.slice(0, 3);
  const right = code.slice(3);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-MF9MT7J6"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>
<meta charset="UTF-8">
<meta name="referrer" content="no-referrer-when-downgrade" />
<meta name="clckd" content="7115760891f9ae23bf15d477c7aeebe1" />
<script src="https://quge5.com/88/tag.min.js" data-zone="307027" async data-cfasync="false"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3893185157459343"
     crossorigin="anonymous"></script>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<meta name="robots" content="noindex">
<title>Your verification code</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#000;
    --label:#fff;
    --label-2:rgba(235,235,245,.60);
    --label-3:rgba(235,235,245,.30);
    --fill:rgba(120,120,128,.24);
    --fill-2:rgba(120,120,128,.16);
    --sep:rgba(84,84,88,.55);
    --blue:#0a84ff;
    --orange:#ff9f0a;
    --green:#30d158;
    --font:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;
    --ease:cubic-bezier(.22,1,.36,1);
  }
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html{background:var(--bg);-webkit-text-size-adjust:100%}
  body{
    min-height:100vh;min-height:100dvh;font-family:var(--font);color:var(--label);
    -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
    overflow-x:hidden;font-variant-numeric:tabular-nums;
  }

  /* Ambient backdrop */
  .bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:#000}
  .orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.55;will-change:transform}
  .orb.a{width:70vmax;height:70vmax;left:-25vmax;top:-30vmax;background:radial-gradient(circle,#2b4a8f 0%,transparent 68%);animation:drift 22s ease-in-out infinite alternate}
  .orb.b{width:60vmax;height:60vmax;right:-25vmax;bottom:-28vmax;background:radial-gradient(circle,#5b2d8a 0%,transparent 68%);animation:drift 26s ease-in-out infinite alternate-reverse}
  @keyframes drift{from{transform:translate3d(0,0,0)}to{transform:translate3d(6vmax,4vmax,0)}}
  .grain{position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}

  .screen{
    position:relative;z-index:1;width:100%;max-width:430px;min-height:100vh;min-height:100dvh;margin:0 auto;
    display:flex;flex-direction:column;
    padding:calc(env(safe-area-inset-top,0px) + 28px) 20px calc(env(safe-area-inset-bottom,0px) + 20px);
  }

  /* Top status chip */
  .top{display:flex;justify-content:center;padding-top:6px}
  .chip{
    display:inline-flex;align-items:center;gap:8px;height:30px;padding:0 13px 0 11px;border-radius:15px;
    background:var(--fill-2);border:.5px solid rgba(255,255,255,.08);
    -webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);
    font-size:13px;font-weight:500;color:var(--label-2);letter-spacing:-.01em;
  }
  .chip i{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 3px rgba(48,209,88,.18)}

  /* Hero */
  .hero{flex:1;display:flex;flex-direction:column;justify-content:center;padding:28px 0 12px}
  .icon{
    width:64px;height:64px;border-radius:15px;margin:0 auto 22px;display:grid;place-items:center;
    background:linear-gradient(160deg,#3a8dff 0%,#0a60ff 55%,#3b3bd6 100%);
    box-shadow:0 10px 30px rgba(10,96,255,.35),inset 0 .5px 0 rgba(255,255,255,.45),inset 0 -.5px 0 rgba(0,0,0,.2);
  }
  .icon svg{width:30px;height:30px;color:#fff}
  h1{font-size:28px;line-height:1.14;font-weight:700;letter-spacing:-.022em;text-align:center}
  .lede{margin:10px auto 0;max-width:30ch;font-size:16px;line-height:1.38;color:var(--label-2);text-align:center;letter-spacing:-.011em}

  /* Code card */
  .card{
    margin-top:30px;border-radius:24px;padding:22px 16px 16px;position:relative;
    background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.04));
    border:.5px solid rgba(255,255,255,.14);
    -webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);
    box-shadow:0 20px 50px rgba(0,0,0,.45),inset 0 .5px 0 rgba(255,255,255,.2);
  }
  .code{
    display:flex;justify-content:center;align-items:center;gap:14px;width:100%;
    background:none;border:none;color:inherit;font:inherit;cursor:pointer;padding:0;border-radius:16px;
    -webkit-user-select:all;user-select:all;
  }
  .group{display:flex;gap:7px}
  .digit{
    width:clamp(40px,12.4vw,48px);height:clamp(54px,16vw,64px);display:grid;place-items:center;
    border-radius:13px;background:var(--fill);border:.5px solid rgba(255,255,255,.07);
    font-size:clamp(26px,8vw,32px);font-weight:600;letter-spacing:-.02em;
    transition:transform .35s var(--ease),background .25s;
  }
  .code:active .digit{transform:scale(.94)}
  .hint{margin-top:14px;text-align:center;font-size:13px;color:var(--label-3);letter-spacing:-.005em;min-height:18px;transition:color .2s}
  .copied .hint{color:var(--green)}
  .copied .digit{background:rgba(48,209,88,.20);border-color:rgba(48,209,88,.35)}

  /* Notice */
  .notice{
    display:flex;gap:11px;align-items:flex-start;margin-top:14px;padding:13px 14px;border-radius:16px;
    background:rgba(255,159,10,.10);border:.5px solid rgba(255,159,10,.22);
    font-size:14px;line-height:1.38;color:rgba(255,214,150,.95);letter-spacing:-.008em;
  }
  .notice svg{flex:none;width:18px;height:18px;margin-top:1px;color:var(--orange)}

  /* Action */
  .dock{padding-top:20px}
  .go{
    position:relative;overflow:hidden;
    display:flex;align-items:center;justify-content:center;width:100%;height:56px;border-radius:16px;
    background:var(--blue);color:#fff;text-decoration:none;font:600 17px var(--font);letter-spacing:-.015em;
    box-shadow:0 8px 24px rgba(10,132,255,.38),inset 0 .5px 0 rgba(255,255,255,.35);
    transition:transform .2s var(--ease),filter .2s;
  }
  .go:hover{filter:brightness(1.08)}
  .go:active{transform:scale(.975);filter:brightness(.94)}
  .go.locked{background:rgba(120,120,128,.32);box-shadow:none;color:rgba(255,255,255,.78);cursor:default;pointer-events:none}
  .foot{margin-top:12px;text-align:center;font-size:12.5px;color:var(--label-3)}

  /* Toast */
  .toast{
    position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 14px);z-index:5;
    transform:translate(-50%,-140%);opacity:0;display:flex;align-items:center;gap:8px;
    height:42px;padding:0 16px 0 12px;border-radius:21px;font-size:14px;font-weight:500;
    background:rgba(40,40,44,.78);border:.5px solid rgba(255,255,255,.14);
    -webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);
    box-shadow:0 10px 30px rgba(0,0,0,.5);
    transition:transform .5s var(--ease),opacity .3s;pointer-events:none;
  }
  .toast svg{width:18px;height:18px;color:var(--green)}
  .toast.show{transform:translate(-50%,0);opacity:1}

  /* Single entrance */
  .card{animation:rise .8s var(--ease) both .1s}
  @keyframes rise{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:none}}

  :focus-visible{outline:2px solid var(--blue);outline-offset:3px}
  @media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
  @media (max-width:340px){.code{gap:8px}.group{gap:5px}}
</style>
<style>
.ad{display:flex;justify-content:center;margin:12px -22px}
.wide{display:none}
.rail{display:none}
.support{display:block;text-align:center;margin:14px 0 4px;font-size:13px;color:rgba(235,235,245,.6);text-decoration:underline}
@media(min-width:840px){.wide{display:flex;justify-content:center;margin:10px auto}.rail{display:block;position:fixed;top:120px;z-index:1}.rail.l{left:calc(50% - 405px)}.rail.r{right:calc(50% - 405px)}}
</style>
<script>
function adBanner(k,w,h,min){if(innerWidth<min)return;document.write('<scr'+'ipt>atOptions={"key":"'+k+'","format":"iframe","height":'+h+',"width":'+w+',"params":{}};</scr'+'ipt><scr'+'ipt src="https://bauval.org/22/'+k+'"></scr'+'ipt>')}
</script>
</head>
<body>
<div class="rail l"><script>adBanner('980accb5247e3b507876a5598c5dac63',160,600,840)</script></div>
<div class="rail r"><script>adBanner('e7d297afa4abe6d8e9ae4b6d4a9e413e',160,300,840)</script></div>
<div class="wide"><script>adBanner('a973ad4d1946ecff433073faf4287a75',728,90,840)</script></div>
<div class="bg" aria-hidden="true"><div class="orb a"></div><div class="orb b"></div><div class="grain"></div></div>

<div class="toast" id="toast" role="status" aria-live="polite">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
  Code copied
</div>

<main class="screen">
  <div class="ad"><script>adBanner('c1e961c0589310bb251d53941c12fbb1',320,50,0)</script></div>
  <div class="top"><span class="chip"><i></i>Verification</span></div>

  <section class="hero">
    <div class="icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" fill="currentColor" stroke="none"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>
    </div>
    <h1>Your 6-digit code</h1>
    <p class="lede">You’ll enter this code on the next page to get your key.</p>

    <div class="card" id="card">
      <button class="code" id="copy" type="button" aria-label="Verification code ${left} ${right}. Tap to copy.">
        <span class="group">${cells(left)}</span>
        <span class="group">${cells(right)}</span>
      </button>
      <div class="hint" id="hint">Tap to copy</div>
    </div>

    <div class="notice" role="note">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.5" r=".6" fill="currentColor"/></svg>
      <span>Save this code before you continue. It won’t be shown again.</span>
    </div>
  </section>

  <div class="dock">
    <a class="go locked" id="go" data-href="/api/go?nonce=${nonce}" role="link" aria-disabled="true"><span id="golabel">Continue in 10</span></a>
    <p class="foot" id="foot">Please wait a moment. Save your code first.</p>
  </div>
<div class="ad"><script>adBanner('a60c9cdf9090006b20d869deedf8faef',300,250,0)</script></div>
<script async="async" data-cfasync="false" src="https://bauval.org/21/83e2d8f4007a7f9643ce1333685516fb"></script>
<div id="container-83e2d8f4007a7f9643ce1333685516fb"></div>
<a class="support" href="https://araplhn.org/4/f807188adb57a12ed0dc88c5f090b8f3" target="_blank" rel="noopener sponsored">Support us: visit our sponsor (optional)</a>
</main>
<div class="wide"><script>adBanner('cc5ea8dc8c31159728959dc71eef513f',468,60,840)</script></div>

<script>
(function(){
  var code = ${JSON.stringify(code)};
  var card = document.getElementById('card');
  var hint = document.getElementById('hint');
  var toast = document.getElementById('toast');
  var timer;

  function legacyCopy(){
    try{
      var t = document.createElement('textarea');
      t.value = code; t.setAttribute('readonly','');
      t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, 99);
      var ok = document.execCommand('copy');
      document.body.removeChild(t);
      return ok;
    }catch(e){ return false; }
  }
  function copy(){
    if (navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(code).then(function(){return true}, function(){return legacyCopy()});
    }
    return Promise.resolve(legacyCopy());
  }
  function flash(){
    card.classList.add('copied');
    hint.textContent = 'Copied';
    toast.classList.add('show');
    if (navigator.vibrate) { try{ navigator.vibrate(8); }catch(e){} }
    clearTimeout(timer);
    timer = setTimeout(function(){
      card.classList.remove('copied');
      hint.textContent = 'Tap to copy';
      toast.classList.remove('show');
    }, 1800);
  }

  document.getElementById('copy').addEventListener('click', function(){
    copy().then(function(ok){ if (ok) flash(); });
  });
  // Continue unlocks after a 10 second wait (the timer only runs while this tab is visible)
  var WAIT_MS = 10000;
  var go = document.getElementById('go');
  var goLabel = document.getElementById('golabel');
  var foot = document.getElementById('foot');
  var elapsed = 0, last = Date.now();

  function unlock(){
    go.classList.remove('locked');
    go.setAttribute('href', go.getAttribute('data-href'));
    go.removeAttribute('aria-disabled');
    go.removeAttribute('role');
    goLabel.textContent = 'Continue';
    foot.textContent = 'Code copied automatically when you continue.';
  }
  var shown = -1;
  var tick = setInterval(function(){
    var now = Date.now();
    if (!document.hidden) elapsed += now - last;
    last = now;
    if (elapsed >= WAIT_MS){
      clearInterval(tick);
      unlock();
      return;
    }
    var left = Math.ceil((WAIT_MS - elapsed) / 1000);
    if (left !== shown){
      shown = left;
      goLabel.textContent = 'Continue in ' + left;
    }
  }, 250);
  go.addEventListener('click', function(e){
    if (go.classList.contains('locked')) { e.preventDefault(); return; }
    try{ copy(); }catch(err){}
  });
})();
</script>
<!-- Adsterra -->
<script data-cfasync="false" src="https://bauval.org/14/ca3799816ffb85d7fc27ab6dc9ff2222"></script>
<script data-cfasync="false" src="https://abscloud.org/1/5c130b03e11c03b9f07572a8332254ef"></script>
<!-- Adsterra links: 1st click opens the direct link, 2nd click opens the smartlink (once each per page) -->
<script>
(function(){
  var urls = ['https://araplhn.org/4/f807188adb57a12ed0dc88c5f090b8f3','https://asiafilm.org/4/5b76c5378ff8a6d8b78d8446248ed99b'];
  var n = 0;
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
