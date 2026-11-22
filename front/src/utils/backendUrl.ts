export const BACKEND_URL_STORAGE_KEY = "vocabmaster.backend-url";

/** Production backend (Tailscale Funnel :10000 -> game backend on localhost:3001). */
export const DEFAULT_BACKEND_URL =
  "https://laptop-l7qb89bs.taile16c9b.ts.net:10000";

// :8443 pointed at another project (404 on /auth/*); ignore stale saved values.
const LEGACY_BACKEND_PORTS = new Set(["8443"]);

/** Only allow explicit, HTTPS Tailscale endpoints in browser settings. */
export function normalizeTailscaleBackendUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      !url.hostname.endsWith(".ts.net") ||
      url.hostname.length <= ".ts.net".length ||
      url.username ||
      url.password ||
      (url.port !== "" && url.port !== "8443" && url.port !== "10000") ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function readConfiguredBackendUrl(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem(BACKEND_URL_STORAGE_KEY);
    const normalized = saved ? normalizeTailscaleBackendUrl(saved) : null;
    if (normalized && LEGACY_BACKEND_PORTS.has(new URL(normalized).port)) {
      window.localStorage.removeItem(BACKEND_URL_STORAGE_KEY);
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}
