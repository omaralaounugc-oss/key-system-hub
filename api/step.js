import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';
import { pageUrl, TOTAL_STEPS, WAIT_SECONDS } from './_shared.js';

const sql = neon(process.env.DATABASE_URL);
const HEX = /^[a-f0-9]{32}$/;

// index1.html sends the player here when its timer ends:  /api/step?nonce=...&next=<current step token>
// The server checks the token AND that WAIT_SECONDS really passed since the page was issued.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'no-store');

  const { nonce, next } = req.query;
  if (!HEX.test(nonce || '') || !HEX.test(next || '')) {
    return res.redirect(302, '/api/start');
  }

  try {
    const newTok = randomBytes(16).toString('hex');

    // 1) Not the last step yet: move to the next page.
    const adv = await sql`
      UPDATE sessions
      SET step = step + 1, step_token = ${newTok}, step_at = NOW()
      WHERE nonce = ${nonce}
        AND step_token = ${next}
        AND used = false
        AND created_at > NOW() - INTERVAL '1 hour'
        AND step_at < NOW() - (${WAIT_SECONDS}::int * INTERVAL '1 second')
        AND step < ${TOTAL_STEPS}::int
      RETURNING step
    `;
    if (adv.length) {
      return res.redirect(302, pageUrl(adv[0].step, nonce, newTok));
    }

    // 2) Last step finished: mark the session verified and send to the key page.
    const fin = await sql`
      UPDATE sessions
      SET verified = true, step_token = ${newTok}
      WHERE nonce = ${nonce}
        AND step_token = ${next}
        AND used = false
        AND created_at > NOW() - INTERVAL '1 hour'
        AND step_at < NOW() - (${WAIT_SECONDS}::int * INTERVAL '1 second')
        AND step >= ${TOTAL_STEPS}::int
      RETURNING token, hub
    `;
    if (fin.length) {
      return res.redirect(
        302,
        `/index.html?nonce=${nonce}&t=${fin[0].token}&hub=${encodeURIComponent(fin[0].hub)}`
      );
    }

    // 3) Neither worked. If the token is still valid the player was just too early: send back to the same page.
    const cur = await sql`
      SELECT step, hub FROM sessions
      WHERE nonce = ${nonce} AND step_token = ${next} AND used = false
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    if (cur.length) return res.redirect(302, pageUrl(cur[0].step, nonce, next));

    return res.redirect(302, '/api/start');
  } catch (err) {
    return res.status(500).send('Server error');
  }
}
