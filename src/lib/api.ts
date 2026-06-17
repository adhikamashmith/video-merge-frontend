const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return configuredBaseUrl ? `${configuredBaseUrl}${normalizedPath}` : normalizedPath;
}
