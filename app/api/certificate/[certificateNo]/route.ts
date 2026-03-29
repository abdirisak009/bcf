import { NextResponse } from 'next/server'

function backendBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '')
}

/** Public: fetch certificate metadata by number (BCF-YYYY-NNNN). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ certificateNo: string }> },
) {
  const { certificateNo } = await context.params
  const no = encodeURIComponent(certificateNo.trim())
  const res = await fetch(`${backendBase()}/api/certificate/${no}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  const data = (await res.json().catch(() => ({ success: false, error: 'Bad response' }))) as Record<
    string,
    unknown
  >
  return NextResponse.json(data, { status: res.status })
}
