import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';

const sql = neon(process.env.DATABASE_URL);

// ================= SETTINGS (change only these) =================
const TOTAL_STEPS = 50;      // 5 pages x 10 steps each
const WAIT_SECONDS = 5;      // wait on every step
const MIN_SERVER_WAIT = 4.5; // server-side check (seconds), a little below WAIT_SECONDS
// ================================================================

const isHex = (v) => typeof v === 'string' && /^[a-f0-9]{32}$/.test(v);

// ---- Adsterra display ads (all visible) ----
const AD = {
  b320: `<div class="ad"><script>adBanner('c1e961c0589310bb251d53941c12fbb1',320,50,0)</script></div>`,
  b300: `<div class="ad"><script>adBanner('a60c9cdf9090006b20d869deedf8faef',300,250,0)</script></div>`,
  b468: `<div class="ad"><script>adBanner('cc5ea8dc8c31159728959dc71eef513f',468,60,500)</script></div>`,
  native: `<div class="ad"><script async="async" data-cfasync="false" src="https://bauval.org/21/83e2d8f4007a7f9643ce1333685516fb"></script><div id="container-83e2d8f4007a7f9643ce1333685516fb"></div></div>`,
};

// ---- The 5 pages, repeated in turn: start, step, index1, index2, index3 (each one appears 10 times in 50 steps) ----
// kind 'card' = the card page, kind 'hero' = the old index pages design
const STYLES = [
  { name: 'start',  kind: 'card', accent: '#0a84ff', accent2: '#7b5cff', top: ['b320'], bottom: ['b300', 'native', 'b468'] },
  { name: 'step',   kind: 'card', accent: '#7b5cff', accent2: '#c05cff', top: ['b300'], bottom: ['b320', 'native', 'b468'] },
  { name: 'index1', kind: 'hero', title: 'Welcome',      lede: 'Finish the steps and your key will appear on the last page.', top: ['b320'], bottom: ['b300', 'native', 'b468'] },
  { name: 'index2', kind: 'hero', title: 'Almost there', lede: 'One short wait, then the next step.',                         top: ['b320'], bottom: ['b300', 'native', 'b468'] },
  { name: 'index3', kind: 'hero', title: 'Almost done',  lede: 'One more wait, then the next step.',                          top: ['b320'], bottom: ['b300', 'native', 'b468'] },
];

const CSS_COMMON = `
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  .ad{display:flex;justify-content:center;margin:14px 0;overflow:hidden}
  .wide{display:none}.rail{display:none}
  @media(min-width:840px){
    .wide{display:flex;justify-content:center;margin:14px auto}
    .rail{display:block;position:fixed;top:120px;z-index:1}
    .rail.l{left:calc(50% - 405px)}.rail.r{right:calc(50% - 405px)}
  }
`;

const CSS_CARD = (st, pct) => `
  :root{--sec:rgba(235,235,245,.62);--blue:${st.accent};--blue2:${st.accent2};--font:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif}
  html{background:#06070a}
  body{min-height:100vh;min-height:100dvh;font-family:var(--font);color:#fff;-webkit-font-smoothing:antialiased;overflow-x:hidden;
    background:radial-gradient(70vmax 60vmax at 15% -5%,rgba(43,74,143,.45),transparent 62%),radial-gradient(60vmax 55vmax at 105% 105%,rgba(91,45,138,.4),transparent 60%),#06070a}
  .screen{width:100%;max-width:430px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 18px) 16px calc(env(safe-area-inset-bottom,0px) + 24px)}
  .card{margin-top:12px;border-radius:24px;padding:24px 18px 20px;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.04));border:.5px solid rgba(255,255,255,.14);text-align:center}
  .chip{display:inline-block;padding:6px 14px;border-radius:15px;background:rgba(120,120,128,.24);font-size:14px;font-weight:600;color:var(--sec)}
  h1{margin-top:14px;font-size:24px;font-weight:700;letter-spacing:-.02em}
  .lede{margin-top:6px;font-size:15px;color:var(--sec)}
  .bar{margin:18px 0 6px;height:8px;border-radius:4px;background:rgba(120,120,128,.28);overflow:hidden}
  .bar i{display:block;height:100%;width:${pct}%;border-radius:4px;background:linear-gradient(90deg,var(--blue),var(--blue2))}
  .pct{font-size:13px;color:var(--sec)}
  .go{display:flex;align-items:center;justify-content:center;width:100%;height:56px;margin-top:18px;border-radius:16px;background:var(--blue);color:#fff;text-decoration:none;font:600 17px var(--font)}
  .go.locked{background:rgba(120,120,128,.32);color:rgba(255,255,255,.78);pointer-events:none}
  .go:active{filter:brightness(.92)}
`;

const CSS_HERO = `
  :root{--bg:#000;--label:#fff;--label-2:rgba(235,235,245,.60);--label-3:rgba(235,235,245,.30);--fill-2:rgba(120,120,128,.16);--blue:#0a84ff;--orange:#ff9f0a;--green:#30d158;
    --font:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;--ease:cubic-bezier(.22,1,.36,1)}
  html{background:var(--bg);-webkit-text-size-adjust:100%}
  body{min-height:100vh;min-height:100dvh;font-family:var(--font);color:var(--label);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden;font-variant-numeric:tabular-nums}
  .bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:#000}
  .orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.55;will-change:transform}
  .orb.a{width:70vmax;height:70vmax;left:-25vmax;top:-30vmax;background:radial-gradient(circle,#2b4a8f 0%,transparent 68%);animation:drift 22s ease-in-out infinite alternate}
  .orb.b{width:60vmax;height:60vmax;right:-25vmax;bottom:-28vmax;background:radial-gradient(circle,#5b2d8a 0%,transparent 68%);animation:drift 26s ease-in-out infinite alternate-reverse}
  @keyframes drift{from{transform:translate3d(0,0,0)}to{transform:translate3d(6vmax,4vmax,0)}}
  .screen{position:relative;z-index:1;width:100%;max-width:430px;min-height:100vh;min-height:100dvh;margin:0 auto;display:flex;flex-direction:column;
    padding:calc(env(safe-area-inset-top,0px) + 28px) 20px calc(env(safe-area-inset-bottom,0px) + 20px)}
  .top{display:flex;justify-content:center;padding-top:6px}
  .chip{display:inline-flex;align-items:center;gap:8px;height:30px;padding:0 13px 0 11px;border-radius:15px;background:var(--fill-2);border:.5px solid rgba(255,255,255,.08);
    -webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);font-size:13px;font-weight:500;color:var(--label-2);letter-spacing:-.01em}
  .chip i{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 3px rgba(48,209,88,.18)}
  .hero{flex:1;display:flex;flex-direction:column;justify-content:center;padding:28px 0 12px}
  .icon{width:64px;height:64px;border-radius:15px;margin:0 auto 22px;display:grid;place-items:center;background:linear-gradient(160deg,#3a8dff 0%,#0a60ff 55%,#3b3bd6 100%);
    box-shadow:0 10px 30px rgba(10,96,255,.35),inset 0 .5px 0 rgba(255,255,255,.45),inset 0 -.5px 0 rgba(0,0,0,.2)}
  .icon svg{width:30px;height:30px;color:#fff}
  h1{font-size:28px;line-height:1.14;font-weight:700;letter-spacing:-.022em;text-align:center}
  .lede{margin:10px auto 0;max-width:30ch;font-size:16px;line-height:1.38;color:var(--label-2);text-align:center;letter-spacing:-.011em}
  .notice{display:flex;gap:11px;align-items:flex-start;margin-top:14px;padding:13px 14px;border-radius:16px;background:rgba(255,159,10,.10);border:.5px solid rgba(255,159,10,.22);
    font-size:14px;line-height:1.38;color:rgba(255,214,150,.95);letter-spacing:-.008em}
  .notice svg{flex:none;width:18px;height:18px;margin-top:1px;color:var(--orange)}
  .dock{padding-top:20px}
  .go{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;width:100%;height:56px;border-radius:16px;background:var(--blue);color:#fff;text-decoration:none;
    font:600 17px var(--font);letter-spacing:-.015em;box-shadow:0 8px 24px rgba(10,132,255,.38),inset 0 .5px 0 rgba(255,255,255,.35);transition:transform .2s var(--ease),filter .2s}
  .go:hover{filter:brightness(1.08)}
  .go:active{transform:scale(.975);filter:brightness(.94)}
  .go.locked{background:rgba(120,120,128,.32);box-shadow:none;color:rgba(255,255,255,.78);cursor:default;pointer-events:none}
  .foot{margin-top:12px;text-align:center;font-size:12.5px;color:var(--label-3)}
  @media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`;

const LOCK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" fill="currentColor" stroke="none"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>`;
const INFO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.5" r=".6" fill="currentColor"/></svg>`;

function page(nonce, stepToken, step) {
  const last = step >= TOTAL_STEPS;
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  const st = STYLES[(step - 1) % STYLES.length];
  const top = st.top.map((k) => AD[k]).join('\n');
  const bottom = st.bottom.map((k) => AD[k]).join('\n');
  const wide = `<div class="wide"><script>adBanner('a973ad4d1946ecff433073faf4287a75',728,90,840)</script></div>`;

  let css, body;
  if (st.kind === 'card') {
    css = CSS_CARD(st, pct);
    body = `<main class="screen">
${top}
  <section class="card">
    <span class="chip">Step ${step} of ${TOTAL_STEPS}</span>
    <h1>${last ? 'Last step' : 'Please wait'}</h1>
    <p class="lede">${last ? 'Press the button to get your key.' : 'Keep this page open, then press Continue.'}</p>
    <div class="bar"><i></i></div>
    <div class="pct">${pct}%</div>
    <a class="go locked" id="go" aria-disabled="true"><span id="golabel">Continue in ${WAIT_SECONDS}</span></a>
  </section>
  ${wide}
${bottom}
</main>`;
  } else {
    css = CSS_HERO;
    body = `<div class="bg" aria-hidden="true"><div class="orb a"></div><div class="orb b"></div></div>
<main class="screen">
${top}
  <div class="top"><span class="chip"><i></i>Step ${step} of ${TOTAL_STEPS}</span></div>
  <section class="hero">
    <div class="icon" aria-hidden="true">${LOCK_SVG}</div>
    <h1>${last ? 'Last step' : st.title}</h1>
    <p class="lede">${last ? 'Press the button to get your key.' : st.lede}</p>
    <div class="notice" role="note">${INFO_SVG}<span>Step ${step} of ${TOTAL_STEPS}. Please do not close this page.</span></div>
  </section>
  <div class="dock">
    <a class="go locked" id="go" role="link" aria-disabled="true"><span id="golabel">Continue in ${WAIT_SECONDS}</span></a>
    <p class="foot" id="foot">Please wait a moment.</p>
  </div>
  ${wide}
${bottom}
</main>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="referrer" content="no-referrer-when-downgrade" />
<meta name="clckd" content="7115760891f9ae23bf15d477c7aeebe1" />
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-MF9MT7J6"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3893185157459343" crossorigin="anonymous"></script>
<title>Step ${step} of ${TOTAL_STEPS}</title>
<style>${CSS_COMMON}${css}</style>
<script>
function adBanner(k,w,h,min){if(innerWidth<min)return;document.write('<scr'+'ipt>atOptions={"key":"'+k+'","format":"iframe","height":'+h+',"width":'+w+',"params":{}};</scr'+'ipt><scr'+'ipt src="https://bauval.org/22/'+k+'"></scr'+'ipt>')}
</script>
</head>
<body>
<div class="rail l"><script>adBanner('980accb5247e3b507876a5598c5dac63',160,600,840)</script></div>
<div class="rail r"><script>adBanner('e7d297afa4abe6d8e9ae4b6d4a9e413e',160,300,840)</script></div>
${body}

<script>
(function(){
  var WAIT = ${WAIT_SECONDS} * 1000, elapsed = 0, last = Date.now(), shown = -1;
  var go = document.getElementById('go'), label = document.getElementById('golabel'), foot = document.getElementById('foot');
  var NEXT = '/api/step?nonce=${nonce}&next=${stepToken}';
  var timer = setInterval(function(){
    var n = Date.now();
    if (!document.hidden) elapsed += n - last;
    last = n;
    if (elapsed >= WAIT) {
      clearInterval(timer);
      go.classList.remove('locked');
      go.setAttribute('href', NEXT);
      go.removeAttribute('aria-disabled');
      if (foot) foot.textContent = '';
      label.textContent = ${last ? "'Get my key'" : "'Continue'"};
      return;
    }
    var left = Math.ceil((WAIT - elapsed) / 1000);
    if (left !== shown) { shown = left; label.textContent = 'Continue in ' + left; }
  }, 250);
})();
</script>

<!-- Monetag (no popunder, no direct link) -->
<!-- Push Notifications -->
<script src="https://5gvci.com/act/files/tag.min.js?z=12265052" data-cfasync="false" async></script>
<script src="https://5gvci.com/act/files/tag.min.js?z=12265060" data-cfasync="false" async></script>
<script src="https://5gvci.com/act/files/tag.min.js?z=12265063" data-cfasync="false" async></script>
<script src="https://5gvci.com/act/files/tag.min.js?z=12265075" data-cfasync="false" async></script>
<!-- In-Page Push -->
<script>(function(s){s.dataset.zone='12265057',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265059',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265062',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265071',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<!-- Vignette Banner -->
<script>(function(s){s.dataset.zone='12265058',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'no-store');

  try {
    const { nonce, k, next } = req.query;
    if (!isHex(nonce)) return res.redirect(302, '/api/start');

    const rows = await sql`
      SELECT hub, token, step, step_token, used,
             EXTRACT(EPOCH FROM (NOW() - step_at))::float AS elapsed
      FROM sessions
      WHERE nonce = ${nonce}
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    if (!rows || rows.length === 0 || rows[0].used || !rows[0].step_token) {
      return res.redirect(302, '/api/start');
    }
    const s = rows[0];
    const here = `/api/step?nonce=${nonce}&k=${s.step_token}`;

    // "Continue" was pressed
    if (next !== undefined) {
      if (next !== s.step_token || s.elapsed < MIN_SERVER_WAIT) {
        return res.redirect(302, here); // too early or old link: stay on the current step
      }

      // Last step finished: mark the session verified and send the player to the key page
      if (s.step >= TOTAL_STEPS) {
        const done = await sql`
          UPDATE sessions SET verified = true
          WHERE nonce = ${nonce} AND step_token = ${next} AND used = false
          RETURNING nonce
        `;
        if (!done || done.length === 0) return res.redirect(302, here);
        return res.redirect(302, `/index.html?nonce=${nonce}&t=${s.token}&hub=${s.hub}`);
      }

      // Go to the next step with a new random link
      const newTok = randomBytes(16).toString('hex');
      const upd = await sql`
        UPDATE sessions
        SET step = step + 1, step_token = ${newTok}, step_at = NOW()
        WHERE nonce = ${nonce} AND step_token = ${next} AND used = false
        RETURNING step
      `;
      if (!upd || upd.length === 0) return res.redirect(302, here);
      return res.redirect(302, `/api/step?nonce=${nonce}&k=${newTok}`);
    }

    // Show the current step
    if (k !== s.step_token) return res.redirect(302, here);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(page(nonce, s.step_token, s.step));
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
