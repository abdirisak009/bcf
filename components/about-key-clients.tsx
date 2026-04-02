'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getApiBase } from '@/lib/api';
import { cn } from '@/lib/utils';

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
    <section className="relative overflow-hidden bg-slate-50 py-8 md:py-10 px-4 md:px-6">
      <div className="absolute top-0 right-0 h-[280px] w-[280px] rounded-full bg-brand-teal/4 blur-3xl -mr-32 -mt-24 md:h-[400px] md:w-[400px]" />
      <div className="absolute bottom-0 left-0 h-[220px] w-[220px] rounded-full bg-brand-navy/4 blur-3xl -ml-24 -mb-20" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-7 text-center md:mb-8">
          <div className="mb-2 inline-block rounded-full border border-brand-teal/30 bg-brand-teal/15 px-3 py-1 text-[10px] font-bold tracking-widest text-brand-teal md:text-[11px]">
            TRUSTED PARTNERSHIPS
          </div>
          <h2 className="mb-2 text-2xl font-bold text-brand-navy md:text-3xl">Key Clients</h2>
          <div className="mx-auto mb-2 h-0.5 w-14 rounded-full bg-brand-teal md:w-16" />
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-slate-600 [text-wrap:balance] md:text-sm">
            Trusted by leading international organizations, government institutions, and development agencies across the
            region
          </p>
        </div>

        {loading ? (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl border border-slate-100 bg-slate-200/80"
                aria-hidden
              />
            ))}
          </div>
        ) : loadError ? (
          <p className="mb-8 text-center text-sm text-amber-800" role="alert">
            {loadError}
          </p>
        ) : items.length === 0 ? (
          <p className="mb-8 text-center text-sm text-slate-500">
            No clients listed yet. Add organizations in the dashboard under Clients.
          </p>
        ) : (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-6">
            {items.map((client) => {
              const logo = client.logo_url?.trim();
              return (
                <div key={client.id} className="group relative">
                  <div className="absolute inset-0 rounded-2xl bg-brand-navy/10 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
                  <div
                    className={cn(
                      'relative flex min-h-[5.5rem] flex-col items-center justify-center rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition-all duration-300 sm:min-h-[6.25rem] sm:p-3',
                      'aspect-square group-hover:-translate-y-0.5 group-hover:border-brand-teal/50 group-hover:shadow-md',
                    )}
                  >
                    {logo ? (
                      <div className="relative mx-auto h-14 w-full max-w-[100px] sm:h-16 md:h-20">
                        <Image
                          src={logo}
                          alt={client.name}
                          fill
                          sizes="(max-width: 768px) 42vw, 16vw"
                          className="object-contain object-center p-0.5"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <span className="text-center text-xs font-bold leading-tight text-brand-navy transition-colors duration-300 group-hover:text-brand-teal sm:text-sm">
                        {client.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 md:gap-4">
          {[
            { value: '9+', label: 'Active Clients' },
            { value: '200+', label: 'Projects Delivered' },
            { value: '10+', label: 'Global Partners' },
            { value: '3+', label: 'Countries' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-teal/35 hover:shadow-md sm:px-5 sm:py-3"
            >
              <p className="text-xl font-bold tabular-nums text-brand-navy sm:text-2xl">{stat.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
