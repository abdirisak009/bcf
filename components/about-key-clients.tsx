'use client';

import { useEffect, useState } from 'react';
import { ClientLogoCarousel } from '@/components/client-logo-carousel';
import { getApiBase } from '@/lib/api';

type ClientRow = {
  id: string;
  name: string;
  logo_url?: string | null;
  sort_order?: number;
};

export function AboutKeyClientsSection() {
  const [items, setItems] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${getApiBase()}/api/clients?limit=100`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) {
          if (!cancelled) {
            setLoadError(`Could not load clients (${res.status})`);
            setItems([]);
          }
          return;
        }
        const json = (await res.json()) as {
          success?: boolean;
          data?: { items?: ClientRow[] };
        };
        if (cancelled) return;
        const raw = json.success && json.data?.items ? json.data.items : [];
        const sorted = [...raw].sort(
          (a, b) =>
            (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.id).localeCompare(String(b.id)),
        );
        setItems(sorted);
      } catch {
        if (!cancelled) {
          setLoadError('Could not load clients. Check API connection.');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-12 md:py-16 px-4 sm:px-6">
      <div className="absolute top-0 right-0 h-[280px] w-[280px] rounded-full bg-brand-teal/4 blur-3xl -mr-32 -mt-24 md:h-[400px] md:w-[400px]" />
      <div className="absolute bottom-0 left-0 h-[220px] w-[220px] rounded-full bg-brand-navy/4 blur-3xl -ml-24 -mb-20" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 text-center md:mb-12">
          <div className="mb-3 inline-block rounded-full border border-brand-teal/40 bg-brand-teal/20 px-4 py-2 text-xs font-bold tracking-widest text-brand-navy sm:text-sm">
            TRUSTED PARTNERSHIPS
          </div>
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-brand-navy md:text-5xl lg:text-[2.85rem] lg:leading-tight">
            Our Clients
          </h2>
          <div className="mx-auto mb-5 h-1 w-24 rounded-full bg-brand-teal md:w-28" />
          <p className="mx-auto max-w-2xl text-lg font-bold leading-snug text-brand-navy [text-wrap:balance] md:text-xl md:leading-relaxed">
            Trusted by leading international organizations, government institutions, and development agencies across the
            region
          </p>
        </div>

        <div className="mb-8">
          <ClientLogoCarousel
            items={items}
            loading={loading}
            loadError={loadError}
            emptyMessage="No clients listed yet. Add organizations in the dashboard under Clients."
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 md:gap-4">
          {[
            { value: '100+', label: 'Projects' },
            { value: '200+', label: 'Projects Delivered' },
            { value: '5', label: 'International Partners' },
            { value: '3+', label: 'Countries' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/90 bg-white px-5 py-3.5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-teal/35 hover:shadow-md sm:px-6 sm:py-4"
            >
              <p className="text-2xl font-bold tabular-nums text-brand-navy sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
