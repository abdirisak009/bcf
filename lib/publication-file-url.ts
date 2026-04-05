/**
 * Helpers that turn a raw Cloudinary publication URL into something the
 * browser can actually consume — both as a direct download and inside an
 * embedded PDF viewer (iframe).
 *
 * Previous approaches that failed in production:
 *  - Rewriting `/image/upload/` → `/raw/upload/` → 404 (wrong namespace)
 *  - Server-side proxy with `fl_attachment` → server can't reach Cloudinary
 *
 * Current approach:
 *  - **Iframe reader**: Google Docs Viewer (renders any public PDF URL)
 *  - **Download link**: original Cloudinary URL (opens in new tab)
 */

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
 * URL for the **download** / **open in new tab** button.
 * Returns the Cloudinary HTTPS URL as-is — the browser handles it directly.
 */
export function normalizePublicationFileUrlForBrowser(raw: string): string {
  return ensureHttps(raw)
}

/**
 * URL for the in-page **iframe** PDF reader.
 *
 * Uses Google Docs Viewer which fetches the PDF from Cloudinary's public
 * URL on Google's servers and renders it as an embedded document.  This
 * bypasses every server-side issue (network restrictions, Cloudinary
 * resource-type mismatches, CORS, etc.) because the rendering happens
 * entirely between the user's browser and Google.
 */
export function publicationPdfIframeSrc(fileUrl: string): string {
  const url = ensureHttps(fileUrl)
  if (!url) return url
  return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
}
