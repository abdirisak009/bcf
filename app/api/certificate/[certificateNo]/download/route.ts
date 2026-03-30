import { NextResponse } from 'next/server'

import { getApiInternalBase } from '@/lib/api'

/** Public: download filled PDF for certificate number. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ certificateNo: string }> },
) {
  const { certificateNo } = await context.params
  const no = encodeURIComponent(certificateNo.trim())
  const res = await fetch(`${getApiInternalBase()}/api/certificate/${no}/download`, {
    headers: { Accept: 'application/pdf' },
    cache: 'no-store',
  })
  const ct = res.headers.get('Content-Type') ?? ''

  if (!res.ok) {
    if (ct.includes('application/json')) {
      const data = (await res.json()) as { error?: string; message?: string }
      return NextResponse.json(
        { success: false, error: data.error ?? data.message ?? `Error ${res.status}` },
        { status: res.status },
      )
    }
    const t = await res.text()
    return NextResponse.json({ success: false, error: t || `Backend ${res.status}` }, { status: res.status })
  }

  if (!ct.includes('application/pdf')) {
    return NextResponse.json({ success: false, error: 'Unexpected response from server.' }, { status: 502 })
  }

  const buf = await res.arrayBuffer()
  const disp = res.headers.get('Content-Disposition')
  const headers = new Headers()
  headers.set('Content-Type', 'application/pdf')
  headers.set('Cache-Control', 'no-store')
  if (disp) {
    headers.set('Content-Disposition', disp)
  } else {
    headers.set('Content-Disposition', 'attachment; filename="certificate.pdf"')
  }

  return new NextResponse(buf, { status: 200, headers })
}
