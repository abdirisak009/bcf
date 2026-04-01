import { dashboardUploadPost } from '@/lib/dashboard-upload-handler'

/** POST /api/upload — same behaviour as /api/dashboard/upload (Bearer auth, MinIO storage). */
export async function POST(req: Request) {
  return dashboardUploadPost(req)
}
