"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sawirada: `public/blogs.jpg`, `training.jpg`, `research.jpg`, `events.jpg`
 * Research: isku day `/research` iyo `/Research` + `.jpg`/`.png`/…
 */
const items = [
  {
    label: "Blogs",
    href: "/news",
    description: "Stories & insights",
    ariaLabel: "Blogs — stories and updates",
    imageSrc: "/blogs.jpg",
  },
  {
    label: "Training",
    href: "/training",
    description: "Catalogue & apply",
    ariaLabel: "Training catalogue and applications",
    imageSrc: "/training.jpg",
  },
  {
    label: "Research",
    href: "/publications",
    description: "Reports & briefs",
    ariaLabel: "Research publications and briefs",
    /** `public/research.jpg` (ama `Research.jpg` — Linux wuu kala duwan yahay magaca). */
    imageSrc: "/research.jpg",
  },
  {
    label: "Events",
    href: "/#events",
    description: "News & highlights",
    ariaLabel: "Events and news highlights on the home page",
    imageSrc: "/events.jpg",
  },
] as const;

const EXPLORE_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"] as const;

/** Kadib `/research.*`: isku day `/Research.*` (xarfaha waaweyn), ka dib magacyadii hore. */
const EXPLORE_LEGACY_STEMS = ["/Research", "/explore-research"] as const;

function exploreImageStem(src: string): string {
  return src.replace(/\.(jpg|jpeg|png|webp)$/i, "");
}

function urlForExploreAttempt(
  attempt: number,
  primaryStem: string,
  fallbackSrc?: string,
): string | null {
  const perStem = EXPLORE_IMAGE_EXTS.length;
  const legacyCount = EXPLORE_LEGACY_STEMS.length * perStem;
  const localTotal = perStem + legacyCount;

  if (attempt < perStem) {
    return primaryStem + EXPLORE_IMAGE_EXTS[attempt];
  }
  if (attempt < localTotal) {
    const i = attempt - perStem;
    const stemIdx = Math.floor(i / perStem);
    const extIdx = i % perStem;
    return EXPLORE_LEGACY_STEMS[stemIdx] + EXPLORE_IMAGE_EXTS[extIdx];
  }
  if (attempt === localTotal && fallbackSrc) {
    return fallbackSrc;
  }
  return null;
}

function ExploreTileBg({
  src,
  fallbackSrc,
  priority,
}: {
  src: string;
  fallbackSrc?: string;
  priority?: boolean;
}) {
  const primaryStem = useMemo(() => exploreImageStem(src), [src]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setAttempt(0);
  }, [primaryStem, fallbackSrc]);

  const resolved = useMemo(
    () => urlForExploreAttempt(attempt, primaryStem, fallbackSrc),
    [attempt, primaryStem, fallbackSrc],
  );

  if (resolved === null) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-brand-teal via-brand-navy to-brand-navy-mid"
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt=""
      fill
      priority={priority}
      className="object-cover transition duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
      sizes="(max-width: 640px) 50vw, 36vw"
      onError={() => setAttempt((a) => a + 1)}
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
                    fallbackSrc={
                      "fallbackSrc" in item && typeof item.fallbackSrc === "string"
                        ? item.fallbackSrc
                        : undefined
                    }
                    priority={i < 2 || i === 3}
                  />

                  {/* Sawirka badankiis wuu muuqdaa; halbeeg hoosta oo keliya + hadh fudud — aan daboolin card-ka oo dhan */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/[0.07] via-transparent to-transparent"
                    aria-hidden
                  />

                  <div
                    className={cn(
                      "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent transition-opacity duration-500",
                      item.label === "Events"
                        ? "h-[50%] from-brand-navy/[0.78] via-brand-navy/[0.28]"
                        : "h-[54%] sm:h-[52%] from-brand-navy/[0.85] via-brand-navy/[0.32]",
                      "group-hover:from-brand-navy/[0.9] group-hover:via-brand-navy/[0.38]",
                    )}
                    aria-hidden
                  />

                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-teal/[0.12] via-transparent to-brand-navy/[0.08] opacity-70 mix-blend-soft-light"
                    aria-hidden
                  />

                  <div
                    className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/25"
                    aria-hidden
                  />

                  <div className="relative z-[1] flex flex-col gap-1.5 p-4 sm:p-6 md:p-7">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] sm:text-[0.7rem]">
                          {item.description}
                        </p>
                        <h3 className="mt-1.5 text-[1.35rem] font-bold leading-[1.15] tracking-tight text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.55),0_8px_28px_rgba(0,0,0,0.45)] sm:text-2xl md:text-[1.75rem]">
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
                    <p className="text-[0.8rem] font-semibold text-white/95 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] transition-colors group-hover:text-white sm:text-sm">
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
