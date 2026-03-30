/**
 * Base URL for the Go API (no trailing slash).
 * Production: set NEXT_PUBLIC_API_URL to the **public** API URL (e.g. http://YOUR_VPS_IP:8080).
 * Never use 127.0.0.1 in production — the browser runs on the visitor's machine, not your server.
 */
export function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080'
  return raw.replace(/\/$/, '')
}

export type ApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: string
}
