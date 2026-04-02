"use client";

import Image from "next/image";
import { Handshake, Lightbulb, Leaf, Heart } from "lucide-react";

import { cn } from "@/lib/utils";

const values = [
  {
    title: "Integrity",
    description:
      "We uphold honesty, transparency, and ethical conduct in every engagement—earning trust through accountable actions and clear communication.",
    icon: Handshake,
    accent: "bg-brand-teal",
    iconSurface: "bg-brand-teal",
    iconRing: "ring-brand-teal/15",
  },
  {
    title: "Innovation",
    description:
      "We embrace creative thinking, modern tools, and evidence-based approaches to solve complex challenges and unlock new opportunities for our clients.",
    icon: Lightbulb,
    accent: "bg-brand-navy",
    iconSurface: "bg-brand-navy",
    iconRing: "ring-brand-navy/15",
  },
  {
    title: "Sustainability",
    description:
      "We design solutions that strengthen institutions over time: resilient systems, responsible resource use, and outcomes that endure beyond the project cycle.",
    icon: Leaf,
    accent: "bg-brand-teal",
    iconSurface: "bg-brand-teal",
    iconRing: "ring-brand-teal/15",
  },
  {
    title: "Client-Centricity",
    description:
      "We listen first, align with your priorities, and measure success by the impact we create together—your goals shape every step of our work.",
    icon: Heart,
    accent: "bg-brand-navy",
    iconSurface: "bg-brand-navy",
    iconRing: "ring-brand-navy/15",
  },
];

export default function CoreValues() {
  return (
    <section
      className="relative overflow-hidden border-t border-slate-100 bg-white py-8 md:py-10 lg:py-12"
      aria-labelledby="core-values-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-15%,rgba(85,197,147,0.07),transparent_58%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Header — same language as Who We Are + About hero */}
        <div className="mx-auto mb-7 max-w-3xl text-center md:mb-8 lg:mb-9">
          <div className="mb-2 flex justify-center md:mb-3">
            <span
              className={cn(
                "inline-flex items-center rounded-full border border-brand-teal/35 bg-brand-teal/[0.12] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-teal backdrop-blur-sm sm:px-4 sm:text-xs"
              )}
            >
              What drives us
            </span>
          </div>

          <h2
            id="core-values-heading"
            className="text-3xl font-bold leading-[1.1] tracking-tight text-brand-navy md:text-4xl lg:text-[2.35rem]"
          >
            <span className="relative inline-block">
              Our
              <span
                className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-brand-teal via-brand-mint to-brand-teal/80"
                aria-hidden
              />
            </span>{" "}
            Core Values
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:mt-4 md:text-base md:leading-relaxed">
            The principles that guide every project, partnership, and decision at Baraarug Consulting Firm.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10">
          {/* Framed image — matches Who We Are (light) */}
          <div className="relative order-1 min-h-0">
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-brand-teal/[0.12] blur-3xl md:h-40 md:w-40"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-brand-navy/[0.07] blur-2xl"
              aria-hidden
            />

            <div className="relative group">
              <div className="relative overflow-hidden rounded-[1.35rem] bg-white p-[11px] shadow-[0_24px_56px_-20px_rgba(15,60,80,0.18)] ring-1 ring-slate-200/90 transition-shadow duration-500 group-hover:shadow-[0_32px_64px_-24px_rgba(15,60,80,0.22)]">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl sm:aspect-[3/4]">
                  <Image
                    src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=900&q=85"
                    alt="Growth, trust, and long-term value for our partners"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 42vw, 100vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent" />
                </div>
              </div>

              <div className="absolute -bottom-2 left-4 right-4 sm:left-auto sm:right-5 sm:w-auto">
                <div className="rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-center shadow-lg sm:inline-block sm:text-left">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand-teal">
                    Values
                  </p>
                  <p className="text-sm font-semibold text-brand-navy">
                    Excellence in every engagement
                  </p>
                </div>
              </div>
            </div>

            <div
              className="pointer-events-none absolute -bottom-1 -left-1 grid grid-cols-4 gap-2 opacity-90"
              aria-hidden
            >
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-brand-mint/90 shadow-[0_0_10px_rgba(85,197,147,0.35)]"
                />
              ))}
            </div>
          </div>

          {/* 2×2 — same card system as Vision / Mission on About */}
          <div className="order-2 grid min-h-0 min-w-0 grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
            {values.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className={cn(
                    "group relative flex min-h-[168px] flex-col overflow-hidden rounded-2xl border transition-all duration-500 sm:min-h-[188px] sm:rounded-3xl md:min-h-0",
                    "border-slate-200/95 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_16px_36px_-14px_rgba(15,60,80,0.12)] ring-1 ring-slate-100",
                    "hover:-translate-y-1 hover:border-brand-teal/25 hover:shadow-[0_22px_48px_-16px_rgba(15,60,80,0.18)]"
                  )}
                >
                  <div className={cn("h-1 w-full", item.accent)} aria-hidden />
                  <div className="flex flex-1 flex-col bg-gradient-to-b from-slate-50/90 to-white p-3 sm:p-4 md:p-5">
                    <div className="mb-3 flex items-start justify-between gap-2 sm:mb-3.5">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ring-2 transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10 md:h-11 md:w-11",
                          item.iconSurface,
                          item.iconRing
                        )}
                      >
                        <Icon
                          className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem] md:h-5 md:w-5"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </div>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] sm:text-[10px]",
                          index % 2 === 0
                            ? "bg-brand-teal/10 text-brand-teal"
                            : "bg-brand-navy/10 text-brand-navy"
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mb-1.5 text-xs font-bold leading-snug tracking-tight text-brand-navy sm:mb-2 sm:text-sm md:text-base">
                      {item.title}
                    </h3>
                    <p className="flex-1 text-[0.68rem] leading-relaxed text-slate-600 sm:text-[0.7rem] md:text-xs md:leading-relaxed lg:text-sm">
                      {item.description}
                    </p>
                    <div
                      className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-brand-teal/20 to-transparent sm:mt-3.5"
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
