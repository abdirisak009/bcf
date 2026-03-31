import { getBrowserApiUrl, type ApiEnvelope } from '@/lib/api'

const TOKEN_KEY = 'bararug_auth_token'
const USER_KEY = 'bararug_auth_user'

export type AuthUser = {
  id: string
  email: string
  role: string
  /** Dashboard module keys; admins typically omit (full access). */
  permissions?: string[]
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setSession(token: string, user: AuthUser): void {
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

/** Headers for authenticated GET/JSON requests to the Go API. */
export function getAuthHeaders(): HeadersInit {
  const token = getToken()
  const h: Record<string, string> = {
    Accept: 'application/json',
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

type LoginBody = { email: string; password: string }
type LoginData = { token: string; user: AuthUser & { permissions?: string[] } }

/** Gin's ShouldBindJSON requires Content-Type to include application/json. */
function loginJsonHeaders(): Headers {
  const h = new Headers()
  h.set('Accept', 'application/json')
  h.set('Content-Type', 'application/json; charset=utf-8')
  return h
}

export async function loginRequest(body: LoginBody): Promise<ApiEnvelope<LoginData>> {
  const res = await fetch(getBrowserApiUrl('/api/auth/login'), {
    method: 'POST',
    headers: loginJsonHeaders(),
    body: JSON.stringify({
      email: body.email.trim().toLowerCase(),
      password: body.password.trim(),
    }),
    cache: 'no-store',
    credentials: 'omit',
  })
  const text = await res.text()
  try {
    return JSON.parse(text) as ApiEnvelope<LoginData>
  } catch {
    return {
      success: false,
      error:
        res.status >= 500
          ? `Sign-in service error (${res.status}). Check API_INTERNAL_URL and that the Go API is running.`
          : `Unexpected response (${res.status}).`,
    }
  }
}
