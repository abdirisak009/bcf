"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getApiBase } from "@/lib/api";

/** Must match `GET /api/clients` JSON (database `clients` table). */
type ClientRow = {
  id: string;
  name: string;
  logo_url?: string | null;
  sort_order?: number;
};

/** Logos per slide; carousel controls appear when there are more than this many. */
const SLIDE_SIZE = 4;

export default function StrategicPartners() {
  const [apiClients, setApiClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${getApiBase()}/api/clients?limit=100`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) {
            setLoadError(`Could not load clients (${res.status})`);
            setApiClients([]);
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
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.id).localeCompare(String(b.id)),
        );
        setApiClients(sorted);
      } catch {
        if (!cancelled) {
          setLoadError("Could not load clients. Check API connection.");
          setApiClients([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const listLength = apiClients.length;
  const totalPages = Math.max(1, Math.ceil(listLength / SLIDE_SIZE));
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  const clampedPage = Math.min(page, totalPages - 1);
  const start = clampedPage * SLIDE_SIZE;
  const slice = useMemo(
    () => apiClients.slice(start, start + SLIDE_SIZE),
    [apiClients, start],
  );

  const showNav = !loading && !loadError && listLength > SLIDE_SIZE;
  const canPrev = clampedPage > 0;
  const canNext = clampedPage < totalPages - 1;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 md:py-24">
      <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/3 -translate-y-1/4 rounded-full bg-brand-teal/[0.07]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/4 rounded-full bg-brand-navy/[0.06]" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center md:mb-16"
        >
          <span className="mb-4 inline-block rounded-full border border-slate-200/90 bg-white px-5 py-1.5 text-sm font-semibold tracking-wide text-brand-navy shadow-sm">
            Trusted organizations
          </span>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-brand-navy md:text-5xl">
            Clients
          </h2>
          <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-brand-teal" />
          <p className="mx-auto max-w-2xl text-lg text-slate-600 md:text-xl">
            Leading institutions and organizations we work with to drive innovation and excellence
            across Somalia
          </p>
        </motion.div>

        {loading ? (
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
            {Array.from({ length: SLIDE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="h-[148px] animate-pulse rounded-3xl bg-gradient-to-br from-slate-200/80 to-slate-100/90 shadow-inner"
                aria-hidden
              />
            ))}
          </div>
        ) : loadError ? (
          <p className="text-center text-sm text-amber-800" role="alert">
            {loadError}
          </p>
        ) : listLength === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No clients in the directory yet. Add clients with logos in the dashboard to show them
            here.
          </p>
        ) : (
          <div className="mx-auto max-w-5xl">
            <div className="flex items-stretch gap-2 sm:gap-3 md:gap-5">
              {showNav ? (
                <div className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!canPrev}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className={cn(
                      "h-12 w-12 rounded-2xl border-brand-navy/10 bg-white/90 shadow-lg shadow-brand-navy/5 backdrop-blur-sm md:h-14 md:w-14",
                      "text-brand-navy ring-1 ring-black/[0.04] transition-all",
                      "hover:border-brand-teal/40 hover:bg-brand-teal/[0.08] hover:text-brand-teal hover:shadow-brand-teal/15",
                      "disabled:pointer-events-none disabled:opacity-30",
                    )}
                    aria-label="Previous clients"
                  >
                    <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                  </Button>
                </div>
              ) : null}

              <div className="min-w-0 flex-1 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={clampedPage}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -28 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4"
                  >
                    {slice.map((client, index) => {
                      const logo = client.logo_url?.trim();
                      return (
                        <motion.div
                          key={client.id}
                          initial={{ opacity: 0, y: 16, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          className="group"
                        >
                          <div
                            className={cn(
                              "relative flex min-h-[148px] flex-col items-center justify-center overflow-hidden rounded-3xl p-5 pb-8 sm:min-h-[160px] sm:p-6 sm:pb-9",
                              "border border-white/90 bg-gradient-to-b from-white via-white to-slate-50/95",
                              "shadow-[0_2px_0_0_rgba(255,255,255,0.8)_inset,0_12px_40px_-18px_rgba(15,23,42,0.25),0_4px_16px_-6px_rgba(23,94,126,0.12)]",
                              "ring-1 ring-slate-200/60 transition-[box-shadow,transform,border-color] duration-500",
                              "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(45,212,191,0.12),transparent_55%)]",
                              "after:pointer-events-none after:absolute after:inset-px after:rounded-[22px] after:border after:border-white/60 after:opacity-0 after:transition-opacity after:duration-500 group-hover:after:opacity-100",
                              "group-hover:border-brand-teal/20 group-hover:shadow-[0_2px_0_0_rgba(255,255,255,0.9)_inset,0_24px_50px_-20px_rgba(23,94,126,0.28),0_12px_32px_-12px_rgba(45,212,191,0.15)]",
                            )}
                          >
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-teal/[0.07] via-transparent to-brand-navy/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-teal/[0.06] blur-2xl transition-all duration-700 group-hover:bg-brand-teal/10" />
                            {logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={logo}
                                alt={client.name}
                                className="relative z-10 max-h-[4.75rem] w-full max-w-[140px] object-contain drop-shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-transform duration-500 group-hover:scale-[1.04]"
                              />
                            ) : (
                              <span className="relative z-10 px-1 text-center text-xs font-bold leading-snug tracking-tight text-brand-navy sm:text-sm">
                                {client.name}
                              </span>
                            )}
                            {logo ? (
                              <span className="pointer-events-none absolute bottom-3 left-2 right-2 z-10 line-clamp-2 translate-y-1 text-center text-[10px] font-medium leading-tight text-slate-600 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-3.5 sm:text-xs">
                                {client.name}
                              </span>
                            ) : null}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {showNav ? (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <div
                      className="flex items-center justify-center gap-2"
                      role="tablist"
                      aria-label="Client logos pages"
                    >
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          role="tab"
                          aria-selected={i === clampedPage}
                          aria-label={`Go to page ${i + 1} of ${totalPages}`}
                          onClick={() => setPage(i)}
                          className={cn(
                            "h-2.5 rounded-full transition-all duration-300",
                            i === clampedPage
                              ? "w-8 bg-brand-teal shadow-sm shadow-brand-teal/40"
                              : "w-2.5 bg-slate-300/90 hover:bg-slate-400",
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-center text-xs tabular-nums text-slate-500" aria-live="polite">
                      {clampedPage + 1} / {totalPages}
                    </p>
                  </div>
                ) : null}
              </div>

              {showNav ? (
                <div className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!canNext}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    className={cn(
                      "h-12 w-12 rounded-2xl border-brand-navy/10 bg-white/90 shadow-lg shadow-brand-navy/5 backdrop-blur-sm md:h-14 md:w-14",
                      "text-brand-navy ring-1 ring-black/[0.04] transition-all",
                      "hover:border-brand-teal/40 hover:bg-brand-teal/[0.08] hover:text-brand-teal hover:shadow-brand-teal/15",
                      "disabled:pointer-events-none disabled:opacity-30",
                    )}
                    aria-label="Next clients"
                  >
                    <ChevronRight className="h-6 w-6" strokeWidth={2} />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto mt-16 h-px max-w-md bg-gradient-to-r from-transparent via-brand-teal/40 to-transparent"
        />
      </div>
    </section>
  );
}
