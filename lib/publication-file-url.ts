/**
 * Build URLs for reading/downloading publication files.
 *
 * All access goes through the Go backend endpoint
 *   GET /api/publications/:id/file          → inline PDF stream
 *   GET /api/publications/:id/file?download=1 → forced download
 *
 * The Go backend generates a time-limited Cloudinary signed URL and
 * streams the file bytes back with proper Content-Type / Content-Disposition
 * headers, bypassing Cloudinary 401 authentication issues entirely.
 */

/** Inline URL for the PDF viewer iframe. */
export function publicationPdfIframeSrc(pubId: string): string {
  return `/api/publications/${encodeURIComponent(pubId)}/file`
}

/** URL for the download button (opens in new tab and triggers save). */
export function publicationFileDownloadUrl(pubId: string): string {
  return `/api/publications/${encodeURIComponent(pubId)}/file?download=1`
}

/**
 * Legacy helper kept for any callers that still pass a raw URL.
 * Falls back to the raw URL unchanged so nothing breaks.
 */
export function normalizePublicationFileUrlForBrowser(raw: string): string {
  return raw.trim()
}
