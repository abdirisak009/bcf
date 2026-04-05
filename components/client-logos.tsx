'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { ClientLogoCarousel } from '@/components/client-logo-carousel'
import { getApiBase } from '@/lib/api'

type ClientRow = { id: string; name: string; logo_url?: string | null; sort_order?: number }

export default function ClientLogos() {
  const [items, setItems] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${getApiBase()}/api/clients?limit=100`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        const json = (await res.json()) as { success?: boolean; data?: { items?: ClientRow[] } }
        if (cancelled) return
        const raw = json.success && json.data?.items ? json.data.items : []
        const sorted = [...raw].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.id).localeCompare(String(b.id)),
        )
        setItems(sorted)
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!loading && items.length === 0) return null

  return (
    <section className="relative overflow-hidden border-y border-slate-200/80 bg-white py-16">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <span className="inline-block rounded-full border border-brand-teal/35 bg-brand-teal/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-navy">
            Our network
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl lg:text-5xl">
            Our Clients
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base font-bold leading-snug text-brand-navy md:text-lg">
            Organizations we serve
          </p>
          <div className="mx-auto mt-5 h-1.5 w-20 rounded-full bg-brand-teal md:w-24" />
        </motion.div>
        <ClientLogoCarousel
          items={items}
          loading={loading}
          loadError={null}
          emptyMessage="No clients to display."
        />
      </div>
    </section>
  )
}
