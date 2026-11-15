// Shared settings and page builder for the step pages. (Used by step.js, start.js and begin.js)

// ================= SETTINGS (change only these) =================
export const TOTAL_STEPS = 50;  // 5 pages x 10 steps each
export const WAIT_SECONDS = 5;  // wait on every step
// ================================================================

// The 5 pages, used in turn: step 1 = start, step 2 = step, step 3 = index1, step 4 = index2, step 5 = index3, step 6 = start ...
const PAGES = ['/api/start', '/api/step', '/index1.html', '/index2.html', '/index3.html'];

// Link of the page that belongs to a step (always with a new random token)
export const pageUrl = (step, nonce, tok) =>
  `${PAGES[(step - 1) % PAGES.length]}?nonce=${nonce}&k=${tok}&s=${step}&n=${TOTAL_STEPS}&w=${WAIT_SECONDS}`;

// ---- Adsterra display ads (all visible) ----
const AD = {
  b320: `<div class="ad"><script>adBanner('c1e961c0589310bb251d53941c12fbb1',320,50,0)</script></div>`,
  b300: `<div class="ad"><script>adBanner('a60c9cdf9090006b20d869deedf8faef',300,250,0)</script></div>`,
  b468: `<div class="ad"><script>adBanner('cc5ea8dc8c31159728959dc71eef513f',468,60,500)</script></div>`,
  native: `<div class="ad"><script async="async" data-cfasync="false" src="https://bauval.org/21/83e2d8f4007a7f9643ce1333685516fb"></script><div id="container-83e2d8f4007a7f9643ce1333685516fb"></div></div>`,
};

// Look of the two pages that are built here: 0 = start, 1 = step
const STYLES = [
  { accent: '#0a84ff', accent2: '#7b5cff', top: ['b320'], bottom: ['b300', 'native', 'b468'] },
  { accent: '#7b5cff', accent2: '#c05cff', top: ['b300'], bottom: ['b320', 'native', 'b468'] },
];

const CSS = (st, pct) => `
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
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
  .ad{display:flex;justify-content:center;margin:14px 0;overflow:hidden}
  .wide{display:none}.rail{display:none}
  @media(min-width:840px){
    .wide{display:flex;justify-content:center;margin:14px auto}
    .rail{display:block;position:fixed;top:120px;z-index:1}
    .rail.l{left:calc(50% - 405px)}.rail.r{right:calc(50% - 405px)}
  }
`;

// Builds the page of the "start" (styleIdx 0) and "step" (styleIdx 1) steps
export function renderPage(nonce, stepToken, step, styleIdx) {
  const last = step >= TOTAL_STEPS;
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  const st = STYLES[styleIdx] || STYLES[0];
  const top = st.top.map((k) => AD[k]).join('\n');
  const bottom = st.bottom.map((k) => AD[k]).join('\n');
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
<style>${CSS(st, pct)}</style>
<script>
function adBanner(k,w,h,min){if(innerWidth<min)return;document.write('<scr'+'ipt>atOptions={"key":"'+k+'","format":"iframe","height":'+h+',"width":'+w+',"params":{}};</scr'+'ipt><scr'+'ipt src="https://bauval.org/22/'+k+'"></scr'+'ipt>')}
</script>
</head>
<body>
<div class="rail l"><script>adBanner('980accb5247e3b507876a5598c5dac63',160,600,840)</script></div>
<div class="rail r"><script>adBanner('e7d297afa4abe6d8e9ae4b6d4a9e413e',160,300,840)</script></div>
<main class="screen">
${top}
  <section class="card">
    <span class="chip">Step ${step} of ${TOTAL_STEPS}</span>
    <h1>${last ? 'Last step' : 'Please wait'}</h1>
    <p class="lede">${last ? 'Press the button to get your key.' : 'Keep this page open, then press Continue.'}</p>
    <div class="bar"><i></i></div>
    <div class="pct">${pct}%</div>
    <a class="go locked" id="go" aria-disabled="true"><span id="golabel">Continue in ${WAIT_SECONDS}</span></a>
  </section>
  <div class="wide"><script>adBanner('a973ad4d1946ecff433073faf4287a75',728,90,840)</script></div>
${bottom}
  <a href="https://araplhn.org/4/f807188adb57a12ed0dc88c5f090b8f3" target="_blank" rel="noopener sponsored" style="display:block;text-align:center;margin:14px 0 4px;font-size:13px;color:rgba(235,235,245,.6);text-decoration:underline">Support us: visit our sponsor (optional)</a>
</main>

<script>
(function(){
  var WAIT = ${WAIT_SECONDS} * 1000, elapsed = 0, last = Date.now(), shown = -1;
  var go = document.getElementById('go'), label = document.getElementById('golabel');
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
      label.textContent = ${last ? "'Get my key'" : "'Continue'"};
      return;
    }
    var left = Math.ceil((WAIT - elapsed) / 1000);
    if (left !== shown) { shown = left; label.textContent = 'Continue in ' + left; }
  }, 250);
})();
</script>

<!-- Monetag (no popunder, no direct link) -->
<script src="https://5gvci.com/act/files/tag.min.js?z=12265052" data-cfasync="false" async></script>
<script src="https://5gvci.com/act/files/tag.min.js?z=12265060" data-cfasync="false" async></script>
<script src="https://5gvci.com/act/files/tag.min.js?z=12265063" data-cfasync="false" async></script>
<script src="https://5gvci.com/act/files/tag.min.js?z=12265075" data-cfasync="false" async></script>
<script>(function(s){s.dataset.zone='12265057',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265059',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265062',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265071',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12265058',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<!-- All other ad scripts (popunder and the rest) -->
<script src="https://quge5.com/88/tag.min.js" data-zone="307027" async data-cfasync="false"></script>
<script src="https://quge5.com/88/tag.min.js" data-zone="308573" async data-cfasync="false"></script>
<script>(function(s){s.dataset.zone='12267246',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script>(function(s){s.dataset.zone='12267249',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
<script data-cfasync="false" src="https://bauval.org/14/ca3799816ffb85d7fc27ab6dc9ff2222"></script>
<script data-cfasync="false" src="https://abscloud.org/1/5c130b03e11c03b9f07572a8332254ef"></script>
</body>
</html>`;
}

// Not a page: this file only holds shared code. If it is ever opened as a link it just says not found.
export default function handler(req, res) {
  return res.status(404).send('Not found');
}
