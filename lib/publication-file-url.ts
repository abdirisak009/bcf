/**
 * Publication PDFs are stored as HTTPS URLs (usually Cloudinary). In production, older or
 * misconfigured values may use `http://` against `res.cloudinary.com`, which browsers block
 * in embedded viewers on HTTPS pages (mixed content). Normalize those to `https://`.
 */
export function normalizePublicationFileUrlForBrowser(raw: string): string {
  const u = raw.trim()
  if (!u) return u
  if (u.startsWith('//')) {
    return `https:${u}`
  }
  try {
    const parsed = new URL(u)
    if (parsed.protocol === 'http:' && parsed.hostname.toLowerCase().endsWith('cloudinary.com')) {
      parsed.protocol = 'https:'
      return parsed.toString()
    }
    return u
  } catch {
    return u
  }
}

/**
 * Same-origin URL that streams the PDF from Cloudinary — use for the embedded reader iframe so
 * the document loads on HTTPS even when the DB has `http://` CDN links, and to avoid fragile
 * cross-origin PDF embedding in some browsers.
 */
export function publicationPdfIframeSrc(fileUrl: string): string {
  const normalized = normalizePublicationFileUrlForBrowser(fileUrl)
  try {
    const u = new URL(normalized)
    if (u.protocol !== 'https:') return normalized
    const h = u.hostname.toLowerCase()
    if (!h.endsWith('cloudinary.com')) return normalized
    /** Not under `/api/publications/*` — Go already binds `GET /publications/:id` and treats `pdf-proxy` as an id. */
    return `/api/pdf-proxy?url=${encodeURIComponent(normalized)}`
  } catch {
    return normalized
  }
}
