import { neon } from '@neondatabase/serverless';
import { randomInt } from 'crypto';

const sql = neon(process.env.DATABASE_URL);

const MAX_KEYS = 3000; // change this when you upgrade Neon

const UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS  = '0123456789';
const SYMBOLS = '!@#$%&*?-_+=';
const ALL     = UPPER + LOWER + DIGITS + SYMBOLS;
const KEY_LENGTH = 20;

function pick(chars) {
  return chars[randomInt(chars.length)];
}

function generateKey() {
  // Guarantee at least one of each type
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)];

  while (chars.length < KEY_LENGTH) {
    chars.push(pick(ALL));
  }

  // Shuffle so the guaranteed characters aren't always at the start
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

export default async function handler(req, res) {
  try {
    // 1. Delete expired keys (used keys after 12h, unused keys after ~7 days)
    await sql`DELETE FROM keys WHERE expires_at < NOW()`;

    // 1b. Clean up old one-time sessions
    await sql`DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '1 day'`;

    // 2. Count what's left
    const result = await sql`SELECT COUNT(*)::int AS count FROM keys`;
    const total = result[0].count;
    const missing = MAX_KEYS - total;

    if (missing <= 0) {
      return res.status(200).json({ success: true, added: 0, total });
    }

    // 3. Create only the missing keys, in one single query.
    // Each unused key gets a slightly different expiry (6 to 7 days) so they don't all
    // expire at the same moment and leave the pool empty until the next cron run.
    const DAY = 24 * 60 * 60 * 1000;
    const newKeys = Array.from({ length: missing }, generateKey);
    const expiries = newKeys.map(() => new Date(Date.now() + 6 * DAY + Math.random() * DAY).toISOString());

    await sql`
      INSERT INTO keys (key, expires_at, used)
      SELECT t.k, t.e::timestamptz, false
      FROM unnest(${newKeys}::text[], ${expiries}::text[]) AS t(k, e)
      ON CONFLICT (key) DO NOTHING
    `;

    return res.status(200).json({ success: true, added: missing, total: MAX_KEYS });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
