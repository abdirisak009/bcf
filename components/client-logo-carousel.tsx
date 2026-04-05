"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ClientLogoRow = {
  id: string;
  name: string;
  logo_url?: string | null;
};

/** Single logo tile — shared by carousel and full grid (About page). */
export function ClientLogoCard({
  client,
  className,
}: {
  client: ClientLogoRow;
  /** e.g. carousel: flex-1 basis-0; grid: w-full */
  className?: string;
}) {
  const logo = client.logo_url?.trim();
  return (
    <div className={cn("group min-w-0", className)}>
      <div
        className={cn(
          "relative flex h-full min-h-[152px] flex-col items-stretch justify-center overflow-hidden rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-2.5 pb-7 sm:min-h-[168px] sm:p-3 sm:pb-8",
          "border border-slate-200/90 bg-white",
          "shadow-[0_2px_0_0_rgba(255,255,255,1)_inset,0_10px_36px_-16px_rgba(15,23,42,0.18)]",
          "ring-1 ring-slate-200/45 transition-[box-shadow,transform,border-color] duration-500",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-tl-3xl before:rounded-tr-3xl before:rounded-bl-3xl before:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(45,212,191,0.08),transparent_55%)]",
          "group-hover:border-brand-teal/30 group-hover:shadow-[0_2px_0_0_rgba(255,255,255,1)_inset,0_18px_40px_-16px_rgba(23,94,126,0.2)]",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-teal/[0.04] via-transparent to-brand-navy/[0.02] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-teal/[0.05] blur-2xl transition-all duration-700 group-hover:bg-brand-teal/10" />
        <div
          className={cn(
            "relative z-10 flex min-h-[6rem] flex-1 flex-col items-center justify-center rounded-lg border border-slate-200/90 bg-white px-3 py-4",
            "shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1px_0_rgba(15,23,42,0.04)]",
            "sm:min-h-[6.5rem] sm:px-4 sm:py-5",
          )}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={client.name}
              decoding="async"
              className={cn(
                "h-[4.5rem] w-full max-w-[min(100%,11rem)] object-contain object-center sm:h-[5rem]",
                "transition-transform duration-500 group-hover:scale-[1.03]",
                "[image-rendering:auto]",
              )}
            />
          ) : (
            <span className="px-1 text-center text-xs font-bold leading-snug tracking-tight text-brand-navy sm:text-sm">
              {client.name}
            </span>
          )}
        </div>
        {logo ? (
          <span className="pointer-events-none absolute bottom-2.5 left-2 right-2 z-10 line-clamp-2 translate-y-1 text-center text-[10px] font-medium leading-tight text-slate-600 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-3 sm:text-xs">
            {client.name}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** All clients in a responsive grid (About page — no API from browser). */
export function ClientLogoGrid({ items }: { items: ClientLogoRow[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5 lg:grid-cols-5 lg:gap-6">
      {items.map((client) => (
        <motion.div
          key={client.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="h-full w-full"
        >
          <ClientLogoCard client={client} className="h-full w-full" />
        </motion.div>
      ))}
    </div>
  );
}

const SLIDE_SIZE = 4;
const AUTOPLAY_MS = 5500;

type ClientLogoCarouselProps = {
  items: ClientLogoRow[];
  loading: boolean;
  loadError: string | null;
  emptyMessage: string;
  /** Dot nav + page counter live under the row (default true when multiple pages). */
  showDots?: boolean;
};

export function ClientLogoCarousel({
  items,
  loading,
  loadError,
  emptyMessage,
  showDots = true,
}: ClientLogoCarouselProps) {
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const listLength = items.length;
  const totalPages = Math.max(1, Math.ceil(listLength / SLIDE_SIZE));
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    if (totalPages <= 1 || loading || loadError || reduceMotion || autoplayPaused) return;
    const id = window.setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [totalPages, loading, loadError, reduceMotion, autoplayPaused]);

  const clampedPage = Math.min(page, totalPages - 1);
  const start = clampedPage * SLIDE_SIZE;
  const slice = useMemo(() => items.slice(start, start + SLIDE_SIZE), [items, start]);

  const showNav = !loading && !loadError && listLength > SLIDE_SIZE;
  const canPrev = clampedPage > 0;
  const canNext = clampedPage < totalPages - 1;
  const partialRow = slice.length > 0 && slice.length < SLIDE_SIZE;

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-row gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: SLIDE_SIZE }).map((_, i) => (
          <div
            key={i}
            className="h-[152px] min-w-0 flex-1 basis-0 animate-pulse rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-gradient-to-br from-slate-200/80 to-slate-100/90 shadow-inner sm:h-[168px]"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <p className="text-center text-sm text-amber-800" role="alert">
        {loadError}
      </p>
    );
  }

  if (listLength === 0) {
    return <p className="text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div
      className="mx-auto max-w-5xl"
      onMouseEnter={() => setAutoplayPaused(true)}
      onMouseLeave={() => setAutoplayPaused(false)}
    >
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
              initial={{ opacity: 0, x: reduceMotion ? 0 : 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduceMotion ? 0 : -36 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex w-full flex-row flex-nowrap items-stretch gap-3 sm:gap-4 md:gap-5",
                partialRow && "justify-center",
              )}
            >
              {slice.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.12 : 0.38,
                    delay: reduceMotion ? 0 : index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
                  className={cn(
                    "min-w-0",
                    partialRow ? "w-full max-w-[15.5rem] shrink-0 sm:max-w-[17rem]" : "flex-1 basis-0",
                  )}
                >
                  <ClientLogoCard client={client} className="h-full w-full" />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {showNav && showDots ? (
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
  );
}
