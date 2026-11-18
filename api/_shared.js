// Shared settings for the step system.
// Files starting with "_" inside /api are NOT turned into endpoints by Vercel, so this is safe here.
export const TOTAL_STEPS = 2;    // timer pages before the key (2 = "Step 2 of 4" and "Step 3 of 4", then the key)
export const WAIT_SECONDS = 10;  // wait time on each page (the server enforces it too)

// Builds the URL of a step page. nonce and stepToken must be 32 hex chars (index1.html checks this).
export function pageUrl(step, nonce, stepToken) {
  const q = new URLSearchParams({
    nonce,
    k: stepToken,
    s: String(step),
    n: String(TOTAL_STEPS),
    w: String(WAIT_SECONDS),
  });
  return `/index1.html?${q.toString()}`;
}

// ---- Browser binding: the session is tied to the browser that started it (cookie "sid" = session token) ----
export function getCookie(req, name) {
  const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? m[1] : '';
}

export function sidCookie(token) {
  return `sid=${token}; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Lax`;
}
