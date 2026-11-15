import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';
import { TOTAL_STEPS, pageUrl, renderPage } from './_shared.js';

const sql = neon(process.env.DATABASE_URL);

const MIN_SERVER_WAIT = 4.5; // server-side check (seconds), a little below WAIT_SECONDS (in _shared.js)

const isHex = (v) => typeof v === 'string' && /^[a-f0-9]{32}$/.test(v);

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
    return res.status(200).send(renderPage(nonce, s.step_token, s.step, 1));
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
