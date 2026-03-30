/**
 * Go API base URL as seen from the **Next.js server** (Node). No trailing slash.
 *
 * - **Docker:** set `API_INTERNAL_URL` to the Compose service (e.g. `http://go_backend:8080`).
 * - **Local dev:** defaults to `http://127.0.0.1:8080`, or use `NEXT_PUBLIC_API_URL` if set.
 */
export function getApiInternalBase(): string {
  const raw =
    process.env.API_INTERNAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    'http://127.0.0.1:8080'
  return raw.replace(/\/$/, '')
}

/**
 * Base URL for API calls from **the browser**.
 *
 * - If `NEXT_PUBLIC_API_URL` is set → direct to that host (must be public, not 127.0.0.1 in production).
 * - If unset → empty string: use same-origin paths like `/api/academies/catalog` (Next proxies to Go). Works with Docker/VPS without baking the IP into the client bundle.
 *
 * On the **server** (SSR/RSC), this returns `getApiInternalBase()` so fetches reach Go from Node.
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const pub = process.env.NEXT_PUBLIC_API_URL?.trim()
    if (pub) return pub.replace(/\/$/, '')
    return ''
  }
  return getApiInternalBase()
}

export type ApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: string
}
