'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { getApiBase } from '@/lib/api'

type ClientRow = { id: string; name: string; logo_url?: string | null }

export default function ClientLogos() {
  const [items, setItems] = useState<ClientRow[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/clients?limit=100`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        const json = (await res.json()) as { success?: boolean; data?: { items?: ClientRow[] } }
        if (cancelled) return
        setItems(json.success && json.data?.items ? json.data.items : [])
      } catch {
        if (!cancelled) setItems([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (items.length === 0) return null

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
          <span className="inline-block rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-brand-navy">
            Clients
          </span>
          <h2 className="mt-3 text-3xl font-bold text-brand-navy md:text-4xl">Organizations we serve</h2>
          <div className="mx-auto mt-4 h-1 w-16 bg-brand-teal" />
        </motion.div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {items.map((c, i) => {
            const logo = c.logo_url?.trim()
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex h-24 w-36 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 shadow-sm"
              >
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={c.name} className="max-h-16 w-full max-w-[140px] object-contain" />
                ) : (
                  <span className="text-center text-sm font-semibold text-brand-navy">{c.name}</span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
