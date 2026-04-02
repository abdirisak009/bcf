import { getBrowserApiUrl } from '@/lib/api'
import { getToken } from '@/lib/auth-client'

/**
 * Upload to MinIO via `POST /api/upload` (Go API when nginx sends `/api` → backend; Next route when dev hits Node).
 * Same JSON envelope as Next `app/api/upload`.
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
  let data: { success?: boolean; data?: { url?: string }; error?: string }
  try {
    data = JSON.parse(raw) as typeof data
  } catch {
    const hint = raw.trimStart().startsWith('<')
      ? 'The server returned a web page instead of JSON. Deploy the backend with POST /api/upload and MINIO_* env, or route /api/upload to the app that runs MinIO uploads.'
      : raw.slice(0, 200)
    throw new Error(`Upload failed (${res.status}): ${hint}`)
  }
  if (!res.ok || !data.success || !data.data?.url) {
    throw new Error(data.error ?? `Upload failed (${res.status})`)
  }
  return data.data.url
}
