import { ImageResponse } from 'next/og'

/** PNG favicon (letter B) — overrides v0 / default icons in the App Router. */
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#175e7e',
          color: '#ffffff',
          fontSize: 20,
          fontWeight: 700,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        B
      </div>
    ),
    {
      ...size,
    },
  )
}
