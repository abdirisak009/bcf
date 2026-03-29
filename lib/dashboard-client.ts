import { getToken } from '@/lib/auth-client'

/** Headers for browser calls to `/api/dashboard/*` (Authorization forwarded to Go). */
export function dashboardAuthHeaders(extra?: Record<string, string>): HeadersInit {
  const token = getToken()
  const h: Record<string, string> = {
    Accept: 'application/json',
    ...extra,
  }
  if (token) {
    h.Authorization = `Bearer ${token}`
  }
  return h
}
