import { getApiBase, type ApiEnvelope } from '@/lib/api'

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

export async function loginRequest(body: LoginBody): Promise<ApiEnvelope<LoginData>> {
  const res = await fetch(`${getApiBase()}/api/auth/login`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  return (await res.json()) as ApiEnvelope<LoginData>
}
