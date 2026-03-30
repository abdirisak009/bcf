import { NextResponse } from 'next/server'

import { getApiInternalBase } from '@/lib/api'

/** Public: submits training application to Go API (stored in DB for dashboard). */
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const trainingId = typeof body.training_id === 'string' ? body.training_id.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!trainingId || !email) {
    return NextResponse.json(
      { success: false, error: 'training_id and email are required.' },
      { status: 400 },
    )
  }

  const payload: Record<string, unknown> = {
    training_id: trainingId,
    email,
  }
  if (typeof body.applicant_type === 'string' && body.applicant_type.trim()) {
    payload.applicant_type = body.applicant_type.trim().toLowerCase()
  }
  if (typeof body.first_name === 'string' && body.first_name.trim()) payload.first_name = body.first_name.trim()
  if (typeof body.last_name === 'string' && body.last_name.trim()) payload.last_name = body.last_name.trim()
  if (typeof body.phone === 'string' && body.phone.trim()) payload.phone = body.phone.trim()
  if (typeof body.company === 'string' && body.company.trim()) payload.company = body.company.trim()
  if (typeof body.message === 'string' && body.message.trim()) payload.message = body.message.trim()
  if (typeof body.job_title === 'string' && body.job_title.trim()) payload.job_title = body.job_title.trim()
  if (typeof body.employee_count_band === 'string' && body.employee_count_band.trim()) {
    payload.employee_count_band = body.employee_count_band.trim()
  }
  if (typeof body.employee_count_custom === 'string' && body.employee_count_custom.trim()) {
    payload.employee_count_custom = body.employee_count_custom.trim()
  }
  if (typeof body.participant_count === 'number' && Number.isFinite(body.participant_count)) {
    payload.participant_count = Math.floor(body.participant_count)
  }
  if (Array.isArray(body.participant_roles)) {
    const roles = body.participant_roles.filter(
      (x): x is string => typeof x === 'string' && x.trim().length > 0,
    )
    if (roles.length) payload.participant_roles = roles.map((r) => r.trim())
  }
  if (typeof body.training_format === 'string' && body.training_format.trim()) {
    payload.training_format = body.training_format.trim()
  }

  const res = await fetch(`${getApiInternalBase()}/api/trainings/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await res.json().catch(() => ({ success: false, error: 'Bad response' }))) as Record<
    string,
    unknown
  >
  return NextResponse.json(data, { status: res.status })
}
