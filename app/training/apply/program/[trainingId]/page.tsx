import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { TrainingApplyDbPageClient } from '@/components/training-apply-db-page'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type Props = {
  params: Promise<{ trainingId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trainingId } = await params
  const title = UUID_RE.test(trainingId) ? 'Apply for training | Baraarug Consulting Firm' : 'Training application'
  return {
    title,
    description: 'Submit your training application — Baraarug Consulting Firm.',
  }
}

export default async function TrainingApplyProgramByIdPage({ params }: Props) {
  const { trainingId } = await params
  if (!UUID_RE.test(trainingId)) {
    notFound()
  }
  return <TrainingApplyDbPageClient trainingId={trainingId} />
}
