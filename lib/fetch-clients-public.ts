import { getApiInternalBase } from '@/lib/api'

export type PublicClientRow = {
  id: string
  name: string
  logo_url?: string | null
  sort_order?: number
}

/** Public client list for About / partners (no auth). Server-only fetch via API_INTERNAL_URL. */
export async function fetchClientsForPublic(limit = 100): Promise<PublicClientRow[]> {
  const base = getApiInternalBase().replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/api/clients?limit=${limit}`, {
      next: { revalidate: 120 },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { success?: boolean; data?: { items?: PublicClientRow[] } }
    if (!json.success || !json.data?.items?.length) return []
    return [...json.data.items].sort(
      (a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.id).localeCompare(String(b.id)),
    )
  } catch {
    return []
  }
}
