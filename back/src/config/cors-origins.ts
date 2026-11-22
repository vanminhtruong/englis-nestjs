/** Exact browser origins allowed to call the Tailscale-backed API.
 * Both Vite localhost and GitHub Pages must work even with NODE_ENV=production.
 */
export function getAllowedFrontendOrigins(
  extras: string = process.env.CORS_ORIGINS || '',
): Set<string> {
  return new Set([
    'https://vanminhtruong.github.io',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    ...extras
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]);
}
