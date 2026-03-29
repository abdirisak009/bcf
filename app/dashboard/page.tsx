import type { Metadata } from 'next'

import { DashboardGate } from '@/components/dashboard-gate'

import { DashboardView } from './dashboard-view'

export const metadata: Metadata = {
  title: 'Dashboard | Bararug',
  description: 'View public stats and admin data.',
}

export default function DashboardPage() {
  return (
    <DashboardGate>
      <DashboardView />
    </DashboardGate>
  )
}
