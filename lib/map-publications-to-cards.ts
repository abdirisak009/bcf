import type { ContentCard } from '@/lib/publications-news-data'

export type ApiPublicationRow = {
  id: string
  title: string
  excerpt?: string | null
  category?: string | null
  cover_image_url?: string | null
  file_url?: string | null
  created_at: string
}

function looksLikePublicationDetailId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

export function mapPublicationRowToCard(p: ApiPublicationRow): ContentCard {
  const d = new Date(p.created_at)
  const excerpt =
    (p.excerpt && p.excerpt.trim()) ||
    (p.file_url ? 'Download the full brief from this publication page.' : '')
  const cover = p.cover_image_url && p.cover_image_url.trim() ? p.cover_image_url.trim() : undefined
  return {
    id: p.id,
    title: p.title,
    excerpt,
    category: (p.category && p.category.trim()) || 'Publication',
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: p.file_url ? 'PDF / brief' : undefined,
    featuredImageUrl: cover,
    href: looksLikePublicationDetailId(p.id) ? `/publications/${p.id}` : undefined,
  }
}
