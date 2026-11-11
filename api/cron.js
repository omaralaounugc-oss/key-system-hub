import { neon } from '@neondatabase/serverless';
import { randomInt } from 'crypto';

const sql = neon(process.env.DATABASE_URL);

// PUT YOUR HUB NAMES HERE (same names you use in the links: /api/start?hub=NAME). Lowercase letters, numbers, - and _.
const HUBS = ['hub1', 'hub2'];
const MAX_KEYS_PER_HUB = 1500; // x2 hubs = the old 3000 total

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
    await sql`DELETE FROM keys WHERE expires_at < NOW()`;
    await sql`DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '1 day'`;

    const DAY = 24 * 60 * 60 * 1000;
    const report = {};
    for (const hub of HUBS) {
      const c = await sql`SELECT COUNT(*)::int AS count FROM keys WHERE hub = ${hub}`;
      const missing = MAX_KEYS_PER_HUB - c[0].count;
      report[hub] = Math.max(missing, 0);
      if (missing <= 0) continue;

      const newKeys = Array.from({ length: missing }, generateKey);
      const expiries = newKeys.map(() => new Date(Date.now() + 6 * DAY + Math.random() * DAY).toISOString());
      await sql`
        INSERT INTO keys (key, expires_at, used, hub)
        SELECT t.k, t.e::timestamptz, false, ${hub}
        FROM unnest(${newKeys}::text[], ${expiries}::text[]) AS t(k, e)
        ON CONFLICT (key) DO NOTHING
      `;
    }
    return res.status(200).json({ success: true, added: report });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
