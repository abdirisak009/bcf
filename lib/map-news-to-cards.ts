import type { ContentCard } from '@/lib/publications-news-data'

export type ApiNewsRow = {
  id: string
  title: string
  excerpt?: string | null
  body?: string | null
  category?: string | null
  featured_image_url?: string | null
  gallery_urls?: string[] | null
  published_at?: string | null
  created_at: string
}

function looksLikeNewsDetailId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

export function mapNewsRowToCard(n: ApiNewsRow): ContentCard {
  const raw = n.published_at || n.created_at
  const d = new Date(raw)
  const excerpt =
    (n.excerpt && n.excerpt.trim()) ||
    (n.body
      ? `${n.body.slice(0, 220).trim()}${n.body.length > 220 ? '…' : ''}`
      : '')
  const len = n.body?.length ?? 0
  const readTime = len > 500 ? '5 min read' : len > 200 ? '3 min read' : '2 min read'
  const featured =
    n.featured_image_url && n.featured_image_url.trim() ? n.featured_image_url.trim() : undefined
  return {
    id: n.id,
    title: n.title,
    excerpt,
    category: (n.category && n.category.trim()) || 'News',
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime,
    featuredImageUrl: featured,
    href: looksLikeNewsDetailId(n.id) ? `/news/${n.id}` : undefined,
  }
}
