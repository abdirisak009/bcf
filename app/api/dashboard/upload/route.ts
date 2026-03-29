import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

import { NextResponse } from 'next/server'

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const PUBLICATION_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'])

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_PDF_BYTES = 25 * 1024 * 1024

export async function POST(req: Request) {
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

  const folderRaw = form.get('folder')
  const folder =
    folderRaw === 'publications'
      ? 'publications'
      : folderRaw === 'clients'
        ? 'clients'
        : folderRaw === 'partners'
          ? 'partners'
          : folderRaw === 'expenses'
            ? 'expenses'
            : 'news'

  const originalName = 'name' in file && typeof file.name === 'string' ? file.name : 'file'
  const ext =
    path.extname(originalName).toLowerCase() ||
    (folder === 'news' || folder === 'clients' || folder === 'partners' ? '.jpg' : '.pdf')

  if (folder === 'news' || folder === 'clients' || folder === 'partners') {
    if (!IMAGE_EXT.has(ext)) {
      return NextResponse.json(
        { success: false, error: `Image: allowed types: ${[...IMAGE_EXT].join(', ')}` },
        { status: 400 },
      )
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ success: false, error: 'File too large (max 8 MB)' }, { status: 400 })
    }
  } else if (folder === 'publications' || folder === 'expenses') {
    if (!PUBLICATION_EXT.has(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Publications: allowed types: ${[...PUBLICATION_EXT].join(', ')}`,
        },
        { status: 400 },
      )
    }
    const maxBytes = ext === '.pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          success: false,
          error: ext === '.pdf' ? 'PDF too large (max 25 MB)' : 'Image too large (max 8 MB)',
        },
        { status: 400 },
      )
    }
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
  const subdir =
    folder === 'publications'
      ? 'publications'
      : folder === 'clients'
        ? 'clients'
        : folder === 'partners'
          ? 'partners'
          : folder === 'expenses'
            ? 'expenses'
            : 'news'
  const dir = path.join(process.cwd(), 'public', 'uploads', subdir)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, safe), buf)

  const url = `/uploads/${subdir}/${safe}`
  return NextResponse.json({ success: true, data: { url } })
}
