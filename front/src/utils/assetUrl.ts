import { API_URL } from "../services/api.service";

/**
 * Turn any stored media reference into a URL the current environment can load.
 * - data:/blob: and external https URLs are returned untouched.
 * - "/uploads/..." (what the backend stores) is served by the active backend:
 *   localhost:3001 in dev, the Tailscale Funnel URL in production.
 * - Older records that baked in a host of ours (localhost, *.ts.net, any port
 *   such as the retired :8443) are re-pointed at the active backend.
 */
export function resolveAssetUrl(value?: string | null): string {
  if (!value) return "";
  const raw = value.trim();
  if (/^(data|blob):/i.test(raw)) return raw;

  const base = (API_URL || "").replace(/\/+$/, "");
  const match = raw.match(/^(?:(https?:)\/\/([^/]+))?(\/uploads\/.*)$/i);
  if (match) {
    const host = (match[2] ?? "").split(":")[0]!.toLowerCase();
    const isOurs =
      !match[2] || host === "localhost" || host === "127.0.0.1" || host.endsWith(".ts.net");
    if (isOurs) return base + match[3];
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  return base + (raw.startsWith("/") ? raw : "/" + raw);
}
