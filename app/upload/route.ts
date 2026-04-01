import { dashboardUploadPost } from '@/lib/dashboard-upload-handler'

/**
 * POST /upload — MinIO dashboard upload (Bearer auth). **Not** under `/api` so nginx can route
 * `/api/*` to Go while Next handles multipart uploads.
 */
export async function POST(req: Request) {
  return dashboardUploadPost(req)
}
