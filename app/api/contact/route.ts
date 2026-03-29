import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[contact]', new Date().toISOString(), body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }
}
