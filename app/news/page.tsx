import type { Metadata } from 'next'

import { ContentHubPage } from '@/components/content-hub-page'
import { fetchNewsFromApi } from '@/lib/fetch-content-api'
import { mapNewsRowToCard } from '@/lib/map-news-to-cards'

export const metadata: Metadata = {
  title: 'News | Baraarug Consulting Firm',
  description:
    'Latest announcements, events, partnerships, and training updates from Baraarug Consulting.',
}

export default async function NewsPage() {
  const apiRows = await fetchNewsFromApi(100)
  const items = apiRows.map(mapNewsRowToCard)

  return (
    <ContentHubPage
      variant="news"
      eyebrow="News & media"
      title="Stories &"
      titleAccent="announcements"
      subtitle="Latest updates on events, partnerships, training cohorts, and firm news — stay connected with Baraarug Consulting."
      items={items}
    />
  )
}
