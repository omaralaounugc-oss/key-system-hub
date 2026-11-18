// Shared settings for the step system.
// Files starting with "_" inside /api are NOT turned into endpoints by Vercel, so this is safe here.
export const TOTAL_STEPS = 3;    // how many timer pages before the key (index1.html is reused for all of them)
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
