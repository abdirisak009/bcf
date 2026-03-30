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

function stripTrailingSlash(raw: string): string {
  return raw.replace(/\/$/, '')
}

function isLoopbackHostname(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h.endsWith('.localhost')
}

/**
 * Browsers block a **public** page (e.g. `http://62.x:3000`) from fetching **loopback**
 * (`http://127.0.0.1:8080`) — "more-private address space" / Private Network Access.
 * Builds that bake `NEXT_PUBLIC_API_URL=http://127.0.0.1:8080` therefore break in production.
 * On localhost we still allow loopback API URLs for normal dev.
 */
function browserResolvedPublicApiBase(pubRaw: string): string {
  const pub = stripTrailingSlash(pubRaw)
  let apiHost: string
  try {
    apiHost = new URL(pub).hostname
  } catch {
    return ''
  }
  const pageHost = window.location.hostname.toLowerCase()
  const pageIsLocal =
    pageHost === 'localhost' ||
    pageHost === '127.0.0.1' ||
    pageHost === '[::1]' ||
    pageHost.endsWith('.localhost')

  if (isLoopbackHostname(apiHost) && !pageIsLocal) {
    return ''
  }
  return pub
}

/**
 * Base URL for API calls from **the browser**.
 *
 * - If `NEXT_PUBLIC_API_URL` is a safe, non-loopback URL (or you are on localhost dev) → use it.
 * - If it points at loopback but the site is not served from localhost → **ignored**; use same-origin
 *   `/api/...` (Next `app/api/[...path]` proxies to Go). Fixes production when the env was wrongly set to 127.0.0.1.
 * - If unset → `''` (same-origin).
 *
 * On the **server** (SSR/RSC), this returns `getApiInternalBase()` so fetches reach Go from Node.
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const pub = process.env.NEXT_PUBLIC_API_URL?.trim()
    if (pub) {
      const resolved = browserResolvedPublicApiBase(pub)
      if (resolved) return resolved
    }
    return ''
  }
  return getApiInternalBase()
}

export type ApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: string
}
