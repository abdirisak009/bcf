/**
 * MinIO S3-compatible client (singleton).
 * Configure via MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET.
 * Optional: MINIO_USE_SSL=true, MINIO_REGION=us-east-1
 */
import * as Minio from 'minio'

let client: Minio.Client | null = null

export function getMinioConfig(): {
  endPoint: string
  port: number
  useSSL: boolean
  accessKey: string
  secretKey: string
  bucket: string
  region?: string
} {
  const endPoint = process.env.MINIO_ENDPOINT?.trim()
  const portRaw = process.env.MINIO_PORT?.trim()
  const accessKey = process.env.MINIO_ACCESS_KEY?.trim()
  const secretKey = process.env.MINIO_SECRET_KEY?.trim()
  const bucket = process.env.MINIO_BUCKET?.trim()

  if (!endPoint || !portRaw || !accessKey || !secretKey || !bucket) {
    throw new Error(
      'MinIO is not configured. Set MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET.',
    )
  }

  const port = Number.parseInt(portRaw, 10)
  if (Number.isNaN(port) || port < 1) {
    throw new Error('MINIO_PORT must be a valid port number.')
  }

  return {
    endPoint,
    port,
    useSSL: process.env.MINIO_USE_SSL === 'true' || process.env.MINIO_USE_SSL === '1',
    accessKey,
    secretKey,
    bucket,
    region: process.env.MINIO_REGION?.trim() || undefined,
  }
}

export function getMinioClient(): Minio.Client {
  if (client) return client
  const cfg = getMinioConfig()
  client = new Minio.Client({
    endPoint: cfg.endPoint,
    port: cfg.port,
    useSSL: cfg.useSSL,
    accessKey: cfg.accessKey,
    secretKey: cfg.secretKey,
    region: cfg.region,
  })
  return client
}

/** Ensure bucket exists (idempotent). */
export async function ensureBucket(): Promise<void> {
  const cfg = getMinioConfig()
  const mc = getMinioClient()
  const exists = await mc.bucketExists(cfg.bucket)
  if (!exists) {
    await mc.makeBucket(cfg.bucket, cfg.region || '')
  }
}

export function getBucketName(): string {
  return getMinioConfig().bucket
}
