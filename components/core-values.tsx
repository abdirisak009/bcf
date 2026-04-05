"use client";

import Image from "next/image";
import { Handshake, Lightbulb, Leaf, Heart } from "lucide-react";

import { cn } from "@/lib/utils";

/** Local asset: place your photo at `public/b.jpg` (Core Values hero, left column). */
const VALUES_HERO_IMAGE = "/b.jpg";

const values = [
  {
    title: "Integrity",
    description:
      "We uphold honesty, transparency, and ethical conduct in every engagement—earning trust through accountable actions and clear communication.",
    icon: Handshake,
    topGradient: "from-brand-teal via-brand-mint to-brand-teal/90",
    iconSurface: "bg-brand-teal",
    iconRing: "ring-brand-teal/20",
    badgeClass: "border-brand-teal/25 bg-brand-teal/[0.12] text-brand-teal",
  },
  {
    title: "Innovation",
    description:
      "We embrace creative thinking, modern tools, and evidence-based approaches to solve complex challenges and unlock new opportunities for our clients.",
    icon: Lightbulb,
    topGradient: "from-brand-navy via-[color-mix(in_srgb,var(--brand-navy)_65%,var(--brand-teal))] to-brand-navy",
    iconSurface: "bg-brand-navy",
    iconRing: "ring-brand-navy/20",
    badgeClass: "border-brand-navy/20 bg-brand-navy/[0.1] text-brand-navy",
  },
  {
    title: "Sustainability",
    description:
      "We design solutions that strengthen institutions over time: resilient systems, responsible resource use, and outcomes that endure beyond the project cycle.",
    icon: Leaf,
    topGradient: "from-brand-teal via-brand-mint to-brand-teal/90",
    iconSurface: "bg-brand-teal",
    iconRing: "ring-brand-teal/20",
    badgeClass: "border-brand-teal/25 bg-brand-teal/[0.12] text-brand-teal",
  },
  {
    title: "Client-Centricity",
    description:
      "We listen first, align with your priorities, and measure success by the impact we create together—your goals shape every step of our work.",
    icon: Heart,
    topGradient: "from-brand-navy via-slate-700 to-brand-navy",
    iconSurface: "bg-brand-navy",
    iconRing: "ring-brand-navy/20",
    badgeClass: "border-brand-navy/20 bg-brand-navy/[0.1] text-brand-navy",
  },
];

export default function CoreValues() {
  return (
    <section
      className="relative overflow-hidden border-t border-slate-200/70 bg-gradient-to-b from-[color-mix(in_srgb,var(--brand-mint)_12%,white)] via-white to-[color-mix(in_srgb,var(--brand-navy)_5%,white)] py-14 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] md:py-20 lg:py-24"
      aria-labelledby="core-values-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(85,197,147,0.1),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-teal/30 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-14 lg:mb-16">
          <div className="mb-4 flex justify-center md:mb-5">
            <span
              className={cn(
                "inline-flex items-center rounded-full border border-brand-teal/30 bg-brand-teal/[0.1] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-brand-teal shadow-sm backdrop-blur-sm sm:px-6 sm:text-sm",
              )}
            >
              What drives us
            </span>
          </div>

          <h2
            id="core-values-heading"
            className="text-4xl font-extrabold leading-[1.08] tracking-tight text-brand-navy md:text-5xl lg:text-[2.85rem] xl:text-[3rem]"
          >
            <span className="relative inline-block">
              Our
              <span
                className="absolute -bottom-1.5 left-0 h-1.5 w-full rounded-full bg-gradient-to-r from-brand-teal via-brand-mint to-brand-teal/80"
                aria-hidden
              />
            </span>{" "}
            Core Values
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 md:mt-6 md:text-xl md:leading-relaxed">
            The principles that guide every project, partnership, and decision at Baraarug Consulting Firm.
          </p>
        </div>

        <div className="relative grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-14">
          <div
            className="pointer-events-none absolute inset-x-0 -top-6 mx-auto hidden h-px max-w-lg bg-gradient-to-r from-transparent via-brand-teal/35 to-transparent lg:block"
            aria-hidden
          />

          {/* Hero image — `public/b.jpg`; thick white frame + premium shadow */}
          <div className="relative order-1 min-h-0 lg:sticky lg:top-24">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-[min(280px,70vw)] w-[min(280px,70vw)] rounded-full bg-brand-teal/[0.16] blur-[88px] md:h-52 md:w-52"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-8 -left-8 h-44 w-44 rounded-full bg-brand-navy/[0.12] blur-3xl"
              aria-hidden
            />

            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div
                className="pointer-events-none absolute -inset-1 rounded-[1.6rem] bg-gradient-to-br from-brand-teal/25 via-white/60 to-brand-navy/18 opacity-95 blur-[3px]"
                aria-hidden
              />
              <div className="relative group">
                <div
                  className="relative overflow-hidden rounded-[1.4rem] bg-white p-3 shadow-[0_32px_72px_-32px_rgba(15,60,80,0.35),0_0_0_1px_rgba(255,255,255,0.95)_inset,0_1px_0_rgba(255,255,255,1)_inset] ring-1 ring-slate-200/90 transition-all duration-500 ease-out sm:p-3.5 md:rounded-[1.5rem] md:p-4 group-hover:-translate-y-1.5 group-hover:shadow-[0_40px_88px_-36px_rgba(23,94,126,0.38)]"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100 ring-[6px] ring-white sm:aspect-[3/4] sm:rounded-[1.15rem] sm:ring-[8px]">
                    <Image
                      src={VALUES_HERO_IMAGE}
                      alt="Baraarug Consulting — values in action: growth, trust, and partnership"
                      fill
                      className="object-cover object-center transition-transform duration-[1.1s] ease-out group-hover:scale-[1.04]"
                      sizes="(min-width: 1280px) 520px, (min-width: 1024px) 42vw, 92vw"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-slate-900/[0.04]" />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25 sm:rounded-[1.15rem]" />
                  </div>
                </div>

                <div className="absolute -bottom-4 left-2 right-2 z-10 sm:left-auto sm:right-7 sm:w-auto">
                  <div className="rounded-2xl border border-white/95 bg-white/98 px-5 py-4 text-center shadow-[0_24px_60px_-18px_rgba(23,94,126,0.42)] ring-1 ring-slate-200/80 backdrop-blur-xl sm:inline-block sm:px-6 sm:py-4 sm:text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-teal sm:text-sm">Values</p>
                    <p className="mt-1.5 text-lg font-extrabold tracking-tight text-brand-navy sm:text-xl">
                      Excellence in every engagement
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="pointer-events-none absolute -bottom-1 -left-1 grid grid-cols-4 gap-2.5 opacity-90"
              aria-hidden
            >
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-brand-teal/80 shadow-[0_0_14px_rgba(85,197,147,0.5)]"
                />
              ))}
            </div>
          </div>

          {/* 2×2 value cards */}
          <div className="order-2 grid min-h-0 min-w-0 grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {values.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className={cn(
                    "group relative flex min-h-[230px] flex-col overflow-hidden rounded-2xl border transition-all duration-500 sm:min-h-[250px] sm:rounded-[1.75rem] md:min-h-0",
                    "border-slate-200/90 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.04),0_22px_48px_-22px_rgba(15,60,80,0.14)] ring-1 ring-slate-100/90",
                    "before:pointer-events-none before:absolute before:inset-0 before:rounded-[1.75rem] before:bg-[radial-gradient(ellipse_95%_70%_at_100%_-10%,rgba(85,197,147,0.07),transparent_52%)]",
                    "hover:-translate-y-[10px] hover:border-brand-teal/35 hover:shadow-[0_36px_72px_-28px_rgba(23,94,126,0.22)] hover:ring-brand-teal/15",
                  )}
                >
                  <div
                    className={cn("relative h-1.5 w-full overflow-hidden bg-gradient-to-r", item.topGradient)}
                    aria-hidden
                  />
                  <div className="relative flex flex-1 flex-col bg-gradient-to-b from-white via-slate-50/35 to-white p-4 sm:p-5 md:p-6 lg:p-7">
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md ring-2 transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14",
                          item.iconSurface,
                          item.iconRing,
                        )}
                      >
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} aria-hidden />
                      </div>
                      <span
                        className={cn(
                          "inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-bold tabular-nums tracking-[0.08em] shadow-inner sm:min-h-9 sm:min-w-9 sm:text-xs",
                          item.badgeClass,
                          "bg-white/90",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-extrabold leading-snug tracking-tight text-brand-navy sm:mb-3 sm:text-xl md:text-[1.35rem]">
                      {item.title}
                    </h3>
                    <p className="flex-1 text-sm leading-[1.65] text-slate-600 md:text-base md:leading-relaxed">
                      {item.description}
                    </p>
                    <div
                      className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-brand-teal/25 to-transparent md:mt-5"
                      aria-hidden
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
