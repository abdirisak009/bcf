import { NextResponse } from 'next/server'

import { getApiInternalBase } from '@/lib/api'

export function backendBase(): string {
  return getApiInternalBase()
}

function unauthorized(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Sign in required. Open the dashboard after logging in.' },
    { status: 401 },
  )
}

/**
 * Proxies JSON to the Go API using the browser's Bearer token.
 * Returns NextResponse (401) or native Response from fetch.
 */
export async function proxyDashboardFetch(
  req: Request,
  backendPath: string,
  method: string,
  body?: string,
): Promise<Response | NextResponse> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return unauthorized()
  }
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: auth,
  }
  if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = 'application/json'
  }
  return fetch(`${backendBase()}${backendPath}`, {
    method,
    headers,
    body: method === 'DELETE' ? undefined : body,
  })
}

/** Proxies PDF GET (e.g. invoice PDF) with Bearer token. */
export async function proxyDashboardPdf(req: Request, backendPathWithQuery: string): Promise<NextResponse> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return unauthorized()
  }
  const res = await fetch(`${backendBase()}${backendPathWithQuery}`, {
    method: 'GET',
    headers: {
      Accept: 'application/pdf',
      Authorization: auth,
    },
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    return NextResponse.json(
      { success: false, error: errText || `Backend returned ${res.status}` },
      { status: res.status },
    )
  }
  const buf = await res.arrayBuffer()
  const disp = res.headers.get('Content-Disposition')
  const headers = new Headers()
  headers.set('Content-Type', 'application/pdf')
  headers.set('Cache-Control', 'no-store')
  if (disp) {
    headers.set('Content-Disposition', disp)
  }
  return new NextResponse(buf, { status: 200, headers })
}
