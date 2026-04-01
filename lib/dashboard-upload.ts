import { getToken } from '@/lib/auth-client'

/** Upload to MinIO via `POST /upload` (not under `/api` so production nginx can send `/api` → Go). */
export async function uploadDashboardFile(
  file: File,
  folder: 'news' | 'publications' | 'clients' | 'partners' | 'expenses' | 'certificates',
): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const token = getToken()
  const headers: HeadersInit = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch('/upload', { method: 'POST', body: fd, headers })
  const data = (await res.json()) as { success?: boolean; data?: { url?: string }; error?: string }
  if (!res.ok || !data.success || !data.data?.url) {
    throw new Error(data.error ?? `Upload failed (${res.status})`)
  }
  return data.data.url
}
