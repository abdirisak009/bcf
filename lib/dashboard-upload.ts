import { getToken } from '@/lib/auth-client'

/** Upload to `public/uploads/{news|publications|clients|partners|expenses}/` via the dashboard API. */
export async function uploadDashboardFile(
  file: File,
  folder: 'news' | 'publications' | 'clients' | 'partners' | 'expenses',
): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const token = getToken()
  const headers: HeadersInit = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch('/api/dashboard/upload', { method: 'POST', body: fd, headers })
  const data = (await res.json()) as { success?: boolean; data?: { url?: string }; error?: string }
  if (!res.ok || !data.success || !data.data?.url) {
    throw new Error(data.error ?? `Upload failed (${res.status})`)
  }
  return data.data.url
}
