/**
 * Baraarug brand palette — use for TS/Canvas/SVG hex when CSS variables are unavailable.
 * Authoritative tokens: `app/globals.css` `:root` (edit the 4 `--brand-*` bases + derived mix vars).
 */
export const brand = {
  /** Deep institutional blue — headings, nav, authority UI */
  navy: '#175E7E',
  /** Soft mint — section washes, subtle fills, cards */
  mint: '#CEF4D1',
  /** Bright green — highlights, focus rings, chart accents */
  green: '#7CE395',
  /** Teal — primary CTAs, links, interactive emphasis */
  teal: '#55C593',
} as const

export type BrandColor = keyof typeof brand
