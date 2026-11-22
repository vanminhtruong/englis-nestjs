export const BACKEND_URL_STORAGE_KEY = "vocabmaster.backend-url";

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
    return saved ? normalizeTailscaleBackendUrl(saved) : null;
  } catch {
    return null;
  }
}
