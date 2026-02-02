const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return "";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function resolveMediaUrl(path, baseUrl = DEFAULT_BASE_URL) {
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path)) return path;
  if (path.startsWith("data:") || path.startsWith("blob:")) return path;
  const base = normalizeBaseUrl(baseUrl);
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
}
