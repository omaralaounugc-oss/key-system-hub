<!DOCTYPE html>
<html lang="en">
<head>
<script src="https://quge5.com/88/tag.min.js" data-zone="307027" async data-cfasync="false"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3893185157459343"
     crossorigin="anonymous"></script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>Key System</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a1a; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; color: white; }
  .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px 50px; width: 420px; max-width: 92vw; text-align: center; }
  .title { color: #aaa; font-size: 18px; font-weight: bold; letter-spacing: 1px; margin-bottom: 24px; }
  .msg { color: #aaa; font-size: 14px; margin-bottom: 18px; }
  input { width: 100%; padding: 14px; background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.3); border-radius: 10px; color: white; font-size: 24px; text-align: center; letter-spacing: 6px; outline: none; margin-bottom: 12px; }
  input:focus { border-color: #6c63ff; }
  button { width: 100%; padding: 12px; background: linear-gradient(135deg,#6c63ff,#a78bfa); border: none; border-radius: 10px; color: white; font-size: 14px; font-weight: bold; cursor: pointer; }
  button:disabled { opacity: 0.6; cursor: default; }
  .error { color: #ef4444; font-size: 13px; min-height: 18px; margin-bottom: 12px; }
  .forgot { margin-top: 18px; font-size: 13px; color: #888; }
  .forgot a { color: #a78bfa; text-decoration: none; cursor: pointer; }
  .forgot a:hover { text-decoration: underline; }
  .spinner { width: 40px; height: 40px; border: 3px solid rgba(108,99,255,0.2); border-top-color: #6c63ff; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .hidden { display: none; }
</style>
</head>
<body>
  <div class="card">
    <div class="title">Key System</div>

    <div id="loading" class="hidden">
      <div class="spinner"></div>
      <div class="msg">Preparing your key...</div>
    </div>

    <div id="form">
      <div class="msg">Enter the number you saved earlier.</div>
      <input id="code" type="text" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="------">
      <div id="ts" style="display:flex;justify-content:center;margin-bottom:12px;"></div>
      <div class="error" id="error"></div>
      <button id="submit">Submit</button>
      <div class="forgot">Forgot it? <a id="forgot">Start over</a></div>
    </div>
  </div>

<script>
(function () {
  const params = new URLSearchParams(window.location.search);
  const nonce = params.get('nonce');
  const t = params.get('t');

  const form = document.getElementById('form');
  const loading = document.getElementById('loading');
  const input = document.getElementById('code');
  const errorEl = document.getElementById('error');
  const btn = document.getElementById('submit');

  function restart() { window.location.replace('/api/start'); }

  document.getElementById('forgot').addEventListener('click', restart);

  // Valid key already saved in this browser? Skip everything.
  const cachedKey = localStorage.getItem('wowhub_key');
  const cachedExpiry = localStorage.getItem('wowhub_key_expiry');
  if (cachedKey && cachedExpiry) {
    if (new Date(cachedExpiry) > new Date()) {
      goToKey(cachedKey, cachedExpiry);
      return;
    }
    localStorage.removeItem('wowhub_key');
    localStorage.removeItem('wowhub_key_expiry');
  }

  // No session? Start from the beginning.
  if (!nonce || !t) { restart(); return; }

  function goToKey(key, expiresAt) {
    window.location.replace(
      '/index.html?key=' + encodeURIComponent(key) +
      '&expiry=' + encodeURIComponent(expiresAt)
    );
  }

  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '');
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });
  btn.addEventListener('click', submit);

  // Cloudflare Turnstile (free). Paste your SITE key here to turn it on.
  const TURNSTILE_SITE_KEY = '0x4AAAAAAF3dS3Ln8Bfv2fv1';
  let tsToken = '';
  let tsWidget = null;
  if (TURNSTILE_SITE_KEY) {
    window.onTurnstileLoad = function () {
      tsWidget = turnstile.render('#ts', {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        callback: (tk) => { tsToken = tk; },
        'expired-callback': () => { tsToken = ''; }
      });
    };
    const sc = document.createElement('script');
    sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
    sc.async = true;
    document.head.appendChild(sc);
  }
  function resetTurnstile() {
    tsToken = '';
    if (TURNSTILE_SITE_KEY && window.turnstile && tsWidget !== null) turnstile.reset(tsWidget);
  }

  async function submit() {
    const code = input.value.trim();
    errorEl.textContent = '';
    if (code.length !== 6) {
      errorEl.textContent = 'Enter the 6 digit number.';
      return;
    }
    if (TURNSTILE_SITE_KEY && !tsToken) {
      errorEl.textContent = 'Please complete the security check.';
      return;
    }

    btn.disabled = true;
    try {
      // 1) check the number
      const r1 = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, code, t, ts: tsToken })
      });
      const d1 = await r1.json();
      resetTurnstile();

      if (!r1.ok) {
        errorEl.textContent = d1.error || 'Something went wrong.';
        if (d1.restart) setTimeout(restart, 2000);
        btn.disabled = false;
        return;
      }

      // 2) number is correct -> get the key
      form.classList.add('hidden');
      loading.classList.remove('hidden');

      const r2 = await fetch('/api/getkey?nonce=' + encodeURIComponent(nonce) + '&t=' + encodeURIComponent(t));
      const d2 = await r2.json();

      if (!r2.ok || !d2.key) {
        loading.classList.add('hidden');
        form.classList.remove('hidden');
        errorEl.textContent = d2.error || 'Could not get a key. Try again.';
        btn.disabled = false;
        return;
      }

      localStorage.setItem('wowhub_key', d2.key);
      localStorage.setItem('wowhub_key_expiry', d2.expires_at);
      goToKey(d2.key, d2.expires_at);
    } catch (e) {
      loading.classList.add('hidden');
      form.classList.remove('hidden');
      errorEl.textContent = 'Network error. Try again.';
      btn.disabled = false;
    }
  }
})();
</script>
</body>
</html>
