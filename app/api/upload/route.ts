import { dashboardUploadPost } from '@/lib/dashboard-upload-handler'

/** POST /api/upload — same as POST /upload (Bearer auth, Cloudinary). Prefer /upload when /api is proxied to Go. */
export async function POST(req: Request) {
  return dashboardUploadPost(req)
}
