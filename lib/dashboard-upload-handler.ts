import { NextResponse } from 'next/server'

import type { DashboardFolder } from '@/lib/upload'
import {
  contentTypeForExt,
  uploadBufferToCloudinary,
  validateDashboardBlob,
} from '@/lib/upload'

function parseFolder(raw: FormDataEntryValue | null): DashboardFolder {
  const s = typeof raw === 'string' ? raw : ''
  if (s === 'publications') return 'publications'
  if (s === 'clients') return 'clients'
  if (s === 'partners') return 'partners'
  if (s === 'expenses') return 'expenses'
  if (s === 'certificates') return 'certificates'
  return 'news'
}

/** Shared POST handler for dashboard uploads (Bearer auth). */
export async function dashboardUploadPost(req: Request): Promise<NextResponse> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Sign in required. Open the dashboard after logging in.' },
      { status: 401 },
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!file || !(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ success: false, error: 'Missing file' }, { status: 400 })
  }

  const folder = parseFolder(form.get('folder'))
  const originalName = 'name' in file && typeof file.name === 'string' ? file.name : 'file'

  const validated = validateDashboardBlob(file, originalName, folder)
  if (!validated.ok) {
    return NextResponse.json({ success: false, error: validated.error }, { status: validated.status })
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer())
    const subdir =
      folder === 'publications'
        ? 'publications'
        : folder === 'clients'
          ? 'clients'
          : folder === 'partners'
            ? 'partners'
            : folder === 'expenses'
              ? 'expenses'
              : folder === 'certificates'
                ? 'certificates'
                : 'news'

    const contentType = contentTypeForExt(validated.ext)
    const { url } = await uploadBufferToCloudinary({
      subdir,
      buffer: buf,
      contentType,
    })
    return NextResponse.json({ success: true, url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed'
    console.error('[upload]', e)
    return NextResponse.json(
      { success: false, error: message.includes('Cloudinary') ? message : 'Upload failed. Check Cloudinary configuration.' },
      { status: 502 },
    )
  }
}
