/**
 * Cloudinary PDFs uploaded with `resource_type: "auto"` are often stored under `/image/upload/`
 * in the returned secure_url. That path may return a rendered-image preview (or 404/error) instead
 * of the actual PDF bytes. Swapping to `/raw/upload/` forces Cloudinary to serve the original file.
 */
function ensureCloudinaryRawDelivery(url: string): string {
  try {
    const u = new URL(url)
    const h = u.hostname.toLowerCase()
    if (!h.endsWith('cloudinary.com')) return url
    u.pathname = u.pathname.replace(/\/(image|video)\/upload\//, '/raw/upload/')
    return u.toString()
  } catch {
    return url
  }
}

/**
 * Normalize a publication file URL for the browser:
 * - protocol-relative → https
 * - http Cloudinary → https
 * - /image/upload/ → /raw/upload/ (serve actual PDF, not image preview)
 */
export function normalizePublicationFileUrlForBrowser(raw: string): string {
  const u = raw.trim()
  if (!u) return u
  if (u.startsWith('//')) {
    return ensureCloudinaryRawDelivery(`https:${u}`)
  }
  try {
    const parsed = new URL(u)
    if (parsed.protocol === 'http:' && parsed.hostname.toLowerCase().endsWith('cloudinary.com')) {
      parsed.protocol = 'https:'
    }
    return ensureCloudinaryRawDelivery(parsed.toString())
  } catch {
    return u
  }
}

/**
 * URL for the in-page PDF reader iframe.
 *
 * Cloudinary already serves with `access-control-allow-origin: *` over HTTPS, so we use the
 * Cloudinary URL directly (no same-origin proxy needed). We just normalize http → https and
 * image/upload → raw/upload.
 */
export function publicationPdfIframeSrc(fileUrl: string): string {
  return normalizePublicationFileUrlForBrowser(fileUrl)
}
