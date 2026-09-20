// API Client utility for EquipLend
// Reads VITE_API_URL if configured (for production cross-origin deployments e.g. Railway backend)
// Defaults to empty string (which uses relative paths '/api/...' via Vite proxy or Vercel rewrites)

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}
