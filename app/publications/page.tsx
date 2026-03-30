import type { Metadata } from 'next'

import { ContentHubPage } from '@/components/content-hub-page'
import { fetchPublicationsFromApi } from '@/lib/fetch-content-api'
import { mapPublicationRowToCard } from '@/lib/map-publications-to-cards'

export const metadata: Metadata = {
  title: 'Publications | Baraarug Consulting Firm',
  description:
    'Research reports, methodology briefs, and policy notes from Baraarug Consulting — institutional insight for leaders and public-sector teams.',
}

export default async function PublicationsPage() {
  const apiRows = await fetchPublicationsFromApi(100)
  const items = apiRows.map(mapPublicationRowToCard)

  return (
    <ContentHubPage
      variant="publications"
      eyebrow="Publications"
      title="Knowledge that"
      titleAccent="moves institutions forward"
      subtitle="Research reports, methodology briefs, and policy notes from Baraarug Consulting — crafted for leaders who need clarity, rigor, and actionable insight."
      items={items}
    />
  )
}
