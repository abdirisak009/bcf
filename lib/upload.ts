/**
 * Upload helpers: validate dashboard files and store buffers in MinIO.
 * Public URLs use `/files/...` (same-origin; not under `/api` so nginx can route to Next when `/api` → Go).
 * Legacy `/api/files/...` GET still works.
 */
import path from 'path'
import { Readable } from 'stream'

import { NextResponse } from 'next/server'

import { ensureBucket, getBucketName, getMinioClient } from '@/lib/minio'

export const DASHBOARD_FOLDERS = [
  'news',
  'publications',
  'clients',
  'partners',
  'expenses',
  'certificates',
] as const

export type DashboardFolder = (typeof DASHBOARD_FOLDERS)[number]

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const PUBLICATION_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
])

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_PDF_BYTES = 25 * 1024 * 1024
export const MAX_DOC_BYTES = 15 * 1024 * 1024

export function contentTypeForExt(ext: string): string {
  return MIME_BY_EXT[ext.toLowerCase()] ?? 'application/octet-stream'
}

export function isDashboardFolder(s: string): s is DashboardFolder {
  return (DASHBOARD_FOLDERS as readonly string[]).includes(s)
}

export type ValidateResult =
  | { ok: true; ext: string }
  | { ok: false; error: string; status: number }

/** Validate file extension and size for dashboard folder (same rules as legacy local upload). */
export function validateDashboardBlob(
  file: Blob,
  originalName: string,
  folder: DashboardFolder,
): ValidateResult {
  const ext =
    path.extname(originalName).toLowerCase() ||
    (folder === 'news' || folder === 'clients' || folder === 'partners' || folder === 'certificates'
      ? '.jpg'
      : '.pdf')

  if (folder === 'news' || folder === 'clients' || folder === 'partners' || folder === 'certificates') {
    if (!IMAGE_EXT.has(ext)) {
      return {
        ok: false,
        status: 400,
        error: `Image: allowed types: ${[...IMAGE_EXT].join(', ')}`,
      }
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { ok: false, status: 400, error: 'File too large (max 8 MB)' }
    }
    return { ok: true, ext }
  }

  if (folder === 'publications' || folder === 'expenses') {
    if (!PUBLICATION_EXT.has(ext)) {
      return {
        ok: false,
        status: 400,
        error: `Allowed types: ${[...PUBLICATION_EXT].join(', ')}`,
      }
    }
    const maxBytes =
      ext === '.pdf'
        ? MAX_PDF_BYTES
        : ext === '.doc' || ext === '.docx'
          ? MAX_DOC_BYTES
          : MAX_IMAGE_BYTES
    if (file.size > maxBytes) {
      return {
        ok: false,
        status: 400,
        error:
          ext === '.pdf'
            ? 'PDF too large (max 25 MB)'
            : ext === '.doc' || ext === '.docx'
              ? 'Document too large (max 15 MB)'
              : 'Image too large (max 8 MB)',
      }
    }
    return { ok: true, ext }
  }

  return { ok: false, status: 400, error: 'Invalid folder' }
}

function buildSafeFilename(ext: string): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
}

/** Object key: `{subdir}/{timestamp-random.ext}` */
export function buildObjectKey(subdir: string, ext: string): string {
  return `${subdir}/${buildSafeFilename(ext)}`
}

export function isAllowedDashboardObjectKey(objectKey: string): boolean {
  const first = objectKey.split('/')[0]
  return (DASHBOARD_FOLDERS as readonly string[]).includes(first)
}

/**
 * Public URL served by Next (`GET /files/...`). Same-origin; works in <img> and DB.
 * If MINIO_PRESIGNED_URLS=1, use getPresignedReadUrl instead for direct MinIO access.
 */
export function publicFileUrl(objectKey: string): string {
  const segments = objectKey.split('/').filter(Boolean)
  const pathPart = segments.map((s) => encodeURIComponent(s)).join('/')
  return `/files/${pathPart}`
}

/** Upload buffer to MinIO; returns object key and public URL. */
export async function uploadBufferToMinio(params: {
  objectKey: string
  buffer: Buffer
  contentType: string
}): Promise<{ key: string; url: string }> {
  const { objectKey, buffer, contentType } = params
  await ensureBucket()
  const bucket = getBucketName()
  const mc = getMinioClient()
  await mc.putObject(bucket, objectKey, buffer, buffer.length, {
    'Content-Type': contentType,
  })

  // Stable same-origin URL for DB (images, PDFs). Use getPresignedReadUrl() only for one-off downloads.
  return { key: objectKey, url: publicFileUrl(objectKey) }
}

/** Presigned GET (7 days default). Use when MINIO_PRESIGNED_URLS is enabled or for one-off links. */
export async function getPresignedReadUrl(
  objectKey: string,
  expirySeconds = 60 * 60 * 24 * 7,
): Promise<string> {
  const bucket = getBucketName()
  const mc = getMinioClient()
  return mc.presignedGetObject(bucket, objectKey, expirySeconds)
}

/** Stream object from MinIO (for GET /files/... and GET /api/files/...). */
export async function getObjectStream(objectKey: string): Promise<{
  stream: Readable
  contentType: string
  size: number
}> {
  const bucket = getBucketName()
  const mc = getMinioClient()
  const [stream, stat] = await Promise.all([
    mc.getObject(bucket, objectKey),
    mc.statObject(bucket, objectKey),
  ])
  const meta = stat.metaData as Record<string, string> | undefined
  const contentType =
    meta?.['content-type'] ??
    meta?.['Content-Type'] ??
    'application/octet-stream'
  return { stream, contentType, size: stat.size }
}

/** Stream MinIO object as a Next.js response (shared by `/files` and `/api/files`). */
export async function streamMinioFileToNextResponse(objectKey: string): Promise<NextResponse> {
  const { stream, contentType, size } = await getObjectStream(objectKey)
  const webBody =
    typeof Readable.toWeb === 'function'
      ? Readable.toWeb(stream)
      : (stream as unknown as ReadableStream)
  return new NextResponse(webBody as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      ...(size > 0 ? { 'Content-Length': String(size) } : {}),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
