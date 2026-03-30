"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Training & Events: sawirro maxalli ah (`/public`) si ay u soo baxaan si joogto ah.
 * Training = maktabad / barasho guud (aan coding ahayn). Events = marxalad / dhacdo (sawir maxalli ah).
 */
const items = [
  {
    label: "Blogs",
    href: "/news",
    description: "Stories & insights",
    ariaLabel: "Blogs — stories and updates",
    imageSrc:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=82",
  },
  {
    label: "Training",
    href: "/training",
    description: "Catalogue & apply",
    ariaLabel: "Training catalogue and applications",
    imageSrc: "/explore-training.jpg",
  },
  {
    label: "Research",
    href: "/publications",
    description: "Reports & briefs",
    ariaLabel: "Research publications and briefs",
    imageSrc:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=82",
  },
  {
    label: "Events",
    href: "/#events",
    description: "News & highlights",
    ariaLabel: "Events and news highlights on the home page",
    imageSrc: "/explore-events-venue.jpg",
  },
] as const;

/** Hal nidaam midab — brand teal + navy (aan indigo/emerald kala duwan) */
const OVERLAY_TINT =
  "from-brand-teal/50 via-brand-navy/28 to-brand-navy/[0.82]";
const OVERLAY_VIGNETTE = "from-brand-navy/[0.9] via-brand-navy/38 to-transparent";

function ExploreTileBg({ src, priority }: { src: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-brand-teal via-brand-navy to-brand-navy-mid"
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      className="object-cover transition duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
      sizes="(max-width: 640px) 50vw, 36vw"
      onError={() => setFailed(true)}
    />
  );
}

export default function HomeExploreStrip() {
  const onNavigate = useCallback((e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href !== "/#events") return;
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;
    e.preventDefault();
    document.getElementById("events")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section
      aria-label="Explore Baraarug"
      className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 md:py-16"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_65%_at_50%_-12%,rgba(85,197,147,0.1),transparent_52%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-7">
          {items.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.55,
                delay: i * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="min-w-0"
            >
              <motion.div
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.992 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
                className="h-full"
              >
                <Link
                  href={item.href}
                  aria-label={item.ariaLabel}
                  onClick={(e) => onNavigate(e, item.href)}
                  className={cn(
                    "group relative flex aspect-[4/3] min-h-[168px] w-full flex-col justify-end overflow-hidden rounded-[1.35rem] sm:aspect-[16/10] sm:min-h-[210px] sm:rounded-[1.75rem] md:min-h-[260px]",
                    "shadow-[0_24px_56px_-26px_rgba(10,35,50,0.5),inset_0_0_0_1px_rgba(255,255,255,0.1)]",
                    "ring-1 ring-black/[0.05]",
                    "transition-[box-shadow] duration-500 ease-out",
                    "hover:shadow-[0_34px_70px_-30px_rgba(10,40,55,0.58),inset_0_0_0_1px_rgba(85,197,147,0.25)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2",
                  )}
                >
                  <ExploreTileBg
                    key={item.imageSrc}
                    src={item.imageSrc}
                    priority={i < 2 || i === 3}
                  />

                  {/* Midab isku mid ah; Events: overlay fudud si sawirka marxaladda uu u muuqdo */}
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-gradient-to-br transition-opacity duration-500",
                      item.label === "Events"
                        ? "opacity-[0.76] group-hover:opacity-[0.84]"
                        : "opacity-[0.88] group-hover:opacity-[0.92]",
                      OVERLAY_TINT,
                    )}
                    aria-hidden
                  />

                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-transparent opacity-55"
                    aria-hidden
                  />

                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent",
                      OVERLAY_VIGNETTE,
                    )}
                    aria-hidden
                  />

                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-brand-mint/[0.06] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    aria-hidden
                  />

                  <div
                    className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20"
                    aria-hidden
                  />

                  <div className="relative z-[1] flex flex-col gap-1.5 p-4 sm:p-6 md:p-7">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-brand-mint sm:text-[0.7rem]">
                          {item.description}
                        </p>
                        <h3 className="mt-1.5 text-[1.35rem] font-bold leading-[1.15] tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.4)] sm:text-2xl md:text-[1.75rem]">
                          {item.label}
                        </h3>
                      </div>
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white",
                          "bg-white/15 ring-1 ring-white/30 backdrop-blur-md",
                          "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]",
                          "transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                          "group-hover:bg-brand-teal group-hover:ring-brand-mint/50 group-hover:shadow-[0_12px_28px_-10px_rgba(85,197,147,0.4)]",
                          "sm:h-12 sm:w-12 sm:rounded-[1.1rem]",
                        )}
                      >
                        <ArrowUpRight className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={2.2} aria-hidden />
                      </span>
                    </div>
                    <p className="text-[0.8rem] font-semibold text-white/90 transition-colors group-hover:text-white sm:text-sm">
                      Read more…
                    </p>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
