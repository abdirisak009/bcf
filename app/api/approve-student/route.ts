import { NextResponse } from 'next/server'

function backendBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '')
}

/** Server-side: create certificate for approved application (requires dashboard key). */
export async function POST(request: Request) {
  const key = request.headers.get('X-Dashboard-Key') ?? ''
  const serverKey = process.env.DASHBOARD_WRITE_KEY ?? ''
  if (!serverKey || key !== serverKey) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const res = await fetch(`${backendBase()}/api/approve-student`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Dashboard-Key': serverKey,
    },
    body: JSON.stringify(body),
  })

  const data = (await res.json().catch(() => ({ success: false, error: 'Bad response' }))) as Record<
    string,
    unknown
  >
  return NextResponse.json(data, { status: res.status })
}
