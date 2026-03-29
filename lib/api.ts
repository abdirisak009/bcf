/** Base URL for the Go API (no trailing slash). */
export function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080'
  return raw.replace(/\/$/, '')
}

export type ApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: string
}
