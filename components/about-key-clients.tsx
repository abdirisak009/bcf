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
    <section className="relative overflow-hidden bg-slate-50 py-28 px-4 md:px-8">
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-brand-teal/4 blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-brand-navy/4 blur-3xl -ml-32 -mb-32" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <div className="mb-5 inline-block rounded-full border border-brand-teal/30 bg-brand-teal/15 px-6 py-2 text-sm font-bold tracking-widest text-brand-teal">
            TRUSTED PARTNERSHIPS
          </div>
          <h2 className="mb-6 text-5xl font-bold text-brand-navy md:text-6xl">Key Clients</h2>
          <div className="mx-auto mb-6 h-1.5 w-24 rounded-full bg-brand-teal" />
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            Trusted by leading international organizations, government institutions, and development agencies across the
            region
          </p>
        </div>

        {loading ? (
          <div className="mb-16 grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl border-2 border-slate-100 bg-slate-200/80"
                aria-hidden
              />
            ))}
          </div>
        ) : loadError ? (
          <p className="mb-16 text-center text-sm text-amber-800" role="alert">
            {loadError}
          </p>
        ) : items.length === 0 ? (
          <p className="mb-16 text-center text-slate-500">
            No clients listed yet. Add organizations in the dashboard under Clients.
          </p>
        ) : (
          <div className="mb-16 grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-6">
            {items.map((client) => {
              const logo = client.logo_url?.trim();
              return (
                <div key={client.id} className="group relative">
                  <div className="absolute inset-0 rounded-2xl bg-brand-navy/10 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
                  <div
                    className={cn(
                      'relative flex min-h-[7.5rem] flex-col items-center justify-center rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 sm:min-h-[8.5rem]',
                      'aspect-square group-hover:-translate-y-1 group-hover:border-brand-teal/50 group-hover:shadow-xl',
                    )}
                  >
                    {logo ? (
                      <div className="relative mx-auto h-20 w-full max-w-[120px] sm:h-24">
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

        <div className="flex flex-wrap justify-center gap-6">
          {[
            { value: '9+', label: 'Active Clients' },
            { value: '200+', label: 'Projects Delivered' },
            { value: '10+', label: 'Global Partners' },
            { value: '3+', label: 'Countries' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border-2 border-slate-100 bg-white px-8 py-5 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-teal/40 hover:shadow-lg"
            >
              <p className="mb-1 text-3xl font-bold text-brand-navy">{stat.value}</p>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
