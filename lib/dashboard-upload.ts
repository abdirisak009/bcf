import { getBrowserApiUrl } from '@/lib/api'
import { getToken } from '@/lib/auth-client'

/**
 * Upload via `POST /api/upload` (Go API when nginx sends `/api` → backend; Next route when dev hits Node).
 * Same JSON envelope: `{ success, url }` or `{ success, error }`.
 */
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
  const res = await fetch(getBrowserApiUrl('/api/upload'), { method: 'POST', body: fd, headers })
  const raw = await res.text()
  let data: { success?: boolean; url?: string; data?: { url?: string }; error?: string }
  try {
    data = JSON.parse(raw) as typeof data
  } catch {
    const hint = raw.trimStart().startsWith('<')
      ? 'The server returned a web page instead of JSON. Deploy the backend with POST /api/upload and CLOUDINARY_* env, or configure Cloudinary on the Next.js server.'
      : raw.slice(0, 200)
    throw new Error(`Upload failed (${res.status}): ${hint}`)
  }
  const url = typeof data.url === 'string' ? data.url : data.data?.url
  if (!res.ok || !data.success || !url) {
    throw new Error(data.error ?? `Upload failed (${res.status})`)
  }
  return url
}
