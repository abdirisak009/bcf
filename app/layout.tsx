import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Merriweather } from 'next/font/google'
import { VercelAnalyticsOptional } from '@/components/vercel-analytics-optional'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
})
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

// Favicons: app/icon.tsx + app/apple-icon.tsx (letter B PNG via ImageResponse).

export const metadata: Metadata = {
  title: 'Bararug',
  description: 'Bararug website',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${merriweather.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <VercelAnalyticsOptional enabled={process.env.VERCEL === '1'} />
      </body>
    </html>
  )
}
