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

/** Docker Compose / K8s service names (e.g. go_backend) — not resolvable in the visitor's browser. */
function isDockerInternalHostname(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (isLoopbackHostname(h)) return false
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(h)) return false
  if (h.includes(':')) return false
  if (h.includes('.')) return false
  return true
}

/**
 * Browsers block a **public** page (e.g. `http://62.x:3000`) from fetching **loopback**
 * (`http://127.0.0.1:8080`) — "more-private address space" / Private Network Access.
 * Builds that bake `NEXT_PUBLIC_API_URL=http://127.0.0.1:8080` therefore break in production.
 * On localhost we still allow loopback API URLs for normal dev.
 *
 * Also rejects:
 * - Docker internal hostnames (`go_backend`, etc.) — use `API_INTERNAL_URL` for server-side proxy only.
 * - Mixed content: HTTPS page + `http://` API (use same-origin `/api` or `https://` API URL).
 */
function browserResolvedPublicApiBase(pubRaw: string): string {
  const pub = stripTrailingSlash(pubRaw)
  let apiHost: string
  let apiProtocol: string
  try {
    const u = new URL(pub)
    apiHost = u.hostname
    apiProtocol = u.protocol
  } catch {
    return ''
  }
  const pageHost = window.location.hostname.toLowerCase()
  const pageIsLocal =
    pageHost === 'localhost' ||
    pageHost === '127.0.0.1' ||
    pageHost === '[::1]' ||
    pageHost.endsWith('.localhost')
  const pageIsHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'

  if (isDockerInternalHostname(apiHost)) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        '[api] NEXT_PUBLIC_API_URL uses a Docker/internal hostname (not reachable from the browser). ' +
          'Falling back to same-origin /api. Set API_INTERNAL_URL=http://go_backend:8080 on the Next server only; unset NEXT_PUBLIC_API_URL.',
      )
    }
    return ''
  }

  if (isLoopbackHostname(apiHost) && !pageIsLocal) {
    return ''
  }

  if (pageIsHttps && apiProtocol === 'http:' && !isLoopbackHostname(apiHost)) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        '[api] Mixed content: HTTPS page cannot call HTTP API. Falling back to same-origin /api. ' +
          'Unset NEXT_PUBLIC_API_URL or use an https:// API URL.',
      )
    }
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

/**
 * Full path for **browser** fetches to the Go API (always starts with `/api/`).
 * - When `NEXT_PUBLIC_API_URL` is unset → same-origin `/api/...` (Next proxies to Go; recommended on VPS).
 * - When set → `https://host:8080/api/...` (no duplicated `/api`).
 */
export function getBrowserApiUrl(apiPath: string): string {
  const base = stripTrailingSlash(getApiBase())
  const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`
  if (!base) return path
  return `${base}${path}`
}

export type ApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: string
}
