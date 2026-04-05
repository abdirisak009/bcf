/**
 * Helpers that turn a raw Cloudinary publication URL into something the
 * browser can actually consume — both as a direct download and inside an
 * embedded PDF viewer (iframe).
 *
 * Core problem: PDFs uploaded via `resource_type: "auto"` end up under
 * `/image/upload/` in Cloudinary. That path returns a rasterised image
 * preview, not the original PDF bytes. Requesting `/raw/upload/` for
 * those files returns 404 because the resource lives in the "image"
 * namespace.  The fix is to add the `fl_attachment` Cloudinary flag,
 * which forces delivery of the *original* file regardless of resource
 * type.
 */

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

function ensureHttps(raw: string): string {
  const u = raw.trim()
  if (!u) return u
  if (u.startsWith('//')) return `https:${u}`
  try {
    const parsed = new URL(u)
    if (
      parsed.protocol === 'http:' &&
      parsed.hostname.toLowerCase().endsWith('cloudinary.com')
    ) {
      parsed.protocol = 'https:'
    }
    return parsed.toString()
  } catch {
    return u
  }
}

/**
 * Insert the `fl_attachment` Cloudinary flag right after `/upload/` so
 * that Cloudinary delivers the *original* file bytes rather than a
 * rendered preview.  Safe to call on any URL — non-Cloudinary URLs and
 * URLs that already carry the flag are returned unchanged.
 */
function withAttachmentFlag(url: string): string {
  try {
    const u = new URL(url)
    if (!u.hostname.toLowerCase().endsWith('cloudinary.com')) return url
    if (u.pathname.includes('/fl_attachment')) return url
    u.pathname = u.pathname.replace(
      /\/(image|video)\/upload\//,
      '/$1/upload/fl_attachment/',
    )
    return u.toString()
  } catch {
    return url
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * URL for the **download** button.  Returns the Cloudinary URL with
 * `fl_attachment` so the browser gets the real PDF (triggers download).
 */
export function normalizePublicationFileUrlForBrowser(raw: string): string {
  const url = ensureHttps(raw)
  if (!url) return url
  return withAttachmentFlag(url)
}

/**
 * URL for the in-page **iframe** PDF reader.
 *
 * Points at our own `/pdf-stream` proxy which fetches from Cloudinary
 * (with `fl_attachment`) and re-serves the bytes as
 * `Content-Disposition: inline` + `Content-Type: application/pdf` so
 * the browser renders the PDF inside the iframe rather than triggering
 * a download.
 */
export function publicationPdfIframeSrc(fileUrl: string): string {
  const url = ensureHttps(fileUrl)
  if (!url) return url
  return `/pdf-stream?url=${encodeURIComponent(url)}`
}
