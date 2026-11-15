import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';
import { TOTAL_STEPS, pageUrl, renderPage } from './_shared.js';

const sql = neon(process.env.DATABASE_URL);

const MIN_SERVER_WAIT = 4.5; // server-side check (seconds), a little below WAIT_SECONDS (in _shared.js)

const isHex = (v) => typeof v === 'string' && /^[a-f0-9]{32}$/.test(v);

// ---- extra ad slots injected into the step page (on top of what renderPage already emits) ----
// All hidden by the .ad CSS from _shared.js: still load, still fire, clipped to 1px.
const EXTRA_TOP = `
  <div class="ad"><script>adBanner('c1e961c0589310bb251d53941c12fbb1',320,50,0)</script></div>
  <div class="ad"><script async="async" data-cfasync="false" src="https://bauval.org/21/83e2d8f4007a7f9643ce1333685516fb"></script><div id="container-step-top-native"></div></div>
`;

const EXTRA_BOTTOM = `
  <div class="wide"><script>adBanner('a973ad4d1946ecff433073faf4287a75',728,90,840)</script></div>
  <div class="ad"><script>adBanner('a60c9cdf9090006b20d869deedf8faef',300,250,0)</script></div>
  <div class="ad"><script>adBanner('cc5ea8dc8c31159728959dc71eef513f',468,60,500)</script></div>
  <div class="ad"><script async="async" data-cfasync="false" src="https://bauval.org/21/83e2d8f4007a7f9643ce1333685516fb"></script><div id="container-step-bottom-native"></div></div>
`;

function injectExtraAds(html) {
  let out = html.replace('<section class="card">', EXTRA_TOP + '<section class="card">');
  out = out.replace('</main>', EXTRA_BOTTOM + '</main>');
  return out;
}

// This file is the "step" page and also the place that moves every player to the next step.
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
    const here = pageUrl(s.step, nonce, s.step_token); // the page of the current step

    // "Continue" was pressed on any of the 5 pages
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

      // Go to the next step: new random link, and the page that belongs to that step
      const newTok = randomBytes(16).toString('hex');
      const upd = await sql`
        UPDATE sessions
        SET step = step + 1, step_token = ${newTok}, step_at = NOW()
        WHERE nonce = ${nonce} AND step_token = ${next} AND used = false
        RETURNING step
      `;
      if (!upd || upd.length === 0) return res.redirect(302, here);
      return res.redirect(302, pageUrl(upd[0].step, nonce, newTok));
    }

    // Show the "step" page
    if (k !== s.step_token) return res.redirect(302, here);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const html = renderPage(nonce, s.step_token, s.step, 1);
    return res.status(200).send(injectExtraAds(html));
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
