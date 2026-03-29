import type { ApiNewsRow } from '@/lib/map-news-to-cards'
import type { ApiPublicationRow } from '@/lib/map-publications-to-cards'

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '')
}

/** Latest news from the Go API (newest first). */
export async function fetchNewsFromApi(limit = 100): Promise<ApiNewsRow[]> {
  try {
    const res = await fetch(`${apiBase()}/api/news?limit=${limit}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { success?: boolean; data?: { items?: ApiNewsRow[] } }
    if (!json.success || !json.data?.items) return []
    return json.data.items
  } catch {
    return []
  }
}

/** Latest publications from the Go API (newest first). */
export async function fetchPublicationsFromApi(limit = 100): Promise<ApiPublicationRow[]> {
  try {
    const res = await fetch(`${apiBase()}/api/publications?limit=${limit}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { success?: boolean; data?: { items?: ApiPublicationRow[] } }
    if (!json.success || !json.data?.items) return []
    return json.data.items
  } catch {
    return []
  }
}
