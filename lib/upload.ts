/**
 * Dashboard uploads: validate files and store via Cloudinary (same rules as Go POST /api/upload).
 */
import path from 'path'

import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'

export const DASHBOARD_FOLDERS = [
  'news',
  'publications',
  'clients',
  'partners',
  'expenses',
  'certificates',
] as const

export type DashboardFolder = (typeof DASHBOARD_FOLDERS)[number]

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.pdf'])

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
}

/** Same limit as the Go API (5 MB). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export function contentTypeForExt(ext: string): string {
  return MIME_BY_EXT[ext.toLowerCase()] ?? 'application/octet-stream'
}

export function isDashboardFolder(s: string): s is DashboardFolder {
  return (DASHBOARD_FOLDERS as readonly string[]).includes(s)
}

export type ValidateResult =
  | { ok: true; ext: string }
  | { ok: false; error: string; status: number }

/** Validate extension and size (jpg, jpeg, png, pdf; max 5 MB). */
export function validateDashboardBlob(
  file: Blob,
  originalName: string,
  _folder: DashboardFolder,
): ValidateResult {
  void _folder
  const ext =
    path.extname(originalName).toLowerCase() ||
    '.jpg'

  if (!ALLOWED_EXT.has(ext)) {
    return {
      ok: false,
      status: 400,
      error: 'Allowed types: .jpg, .jpeg, .png, .pdf',
    }
  }
  if (file.size <= 0) {
    return { ok: false, status: 400, error: 'Missing file' }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, status: 400, error: 'File too large (max 5 MB)' }
  }
  return { ok: true, ext }
}

function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  )
}

function ensureCloudinary(): void {
  if (!cloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    )
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!.trim(),
    api_key: process.env.CLOUDINARY_API_KEY!.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET!.trim(),
  })
}

/** Upload a buffer to Cloudinary under `uploads/{subdir}` with resource_type auto; returns secure URL. */
export async function uploadBufferToCloudinary(params: {
  subdir: string
  buffer: Buffer
  contentType: string
}): Promise<{ url: string }> {
  ensureCloudinary()
  const { subdir, buffer, contentType } = params
  const publicId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const folder = `uploads/${subdir}`
  const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: publicId,
    resource_type: 'auto',
    unique_filename: false,
  })

  const url = result.secure_url || result.url
  if (!url) {
    throw new Error('Cloudinary upload returned no URL')
  }
  return { url }
}

export function isAllowedDashboardObjectKey(objectKey: string): boolean {
  const first = objectKey.split('/')[0]
  return (DASHBOARD_FOLDERS as readonly string[]).includes(first)
}

/**
 * Legacy GET /files/... streamed from MinIO. New uploads use Cloudinary HTTPS URLs in the database.
 */
export async function streamMinioFileToNextResponse(objectKey: string): Promise<NextResponse> {
  void objectKey
  return NextResponse.json(
    {
      success: false,
      error:
        'This path is no longer served from MinIO. New uploads use Cloudinary; use the HTTPS URL stored for the asset.',
    },
    { status: 410 },
  )
}
