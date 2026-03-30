'use client'

import dynamic from 'next/dynamic'

const VercelAnalytics = dynamic(
  () => import('@vercel/analytics/next').then((m) => m.Analytics),
  { ssr: false },
)

/** Only when `enabled` (e.g. server sets from VERCEL=1). Self-hosted builds omit analytics. */
export function VercelAnalyticsOptional({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return null
  }
  return <VercelAnalytics />
}
