"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, TrendingUp } from "lucide-react";
import Image from "next/image";

type WhoWeAreProps = {
  /** `light` = white background (e.g. About page). Default `dark` = home-style navy hero. */
  surface?: "dark" | "light";
};

export default function WhoWeAre({ surface = "dark" }: WhoWeAreProps) {
  const isLight = surface === "light";
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const cards = [
    {
      icon: Eye,
      title: "Our Vision",
      description:
        "To be the premier consulting partner driving innovation and excellence in Africa.",
      topBar: "bg-brand-teal",
      titleColor: "text-brand-teal",
      iconBg: "bg-brand-teal/12",
      iconColor: "text-brand-teal",
      borderHover: "hover:border-brand-teal/40",
    },
    {
      icon: TrendingUp,
      title: "Our Mission",
      description:
        "Empowering organizations through innovative solutions and sustainable transformation.",
      topBar: "bg-brand-navy",
      titleColor: "text-brand-navy",
      iconBg: "bg-brand-navy/12",
      iconColor: "text-brand-navy",
      borderHover: "hover:border-brand-navy/35",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`relative overflow-hidden ${
        isLight
          ? "w-full border-t border-slate-200/60 bg-white py-0"
          : "py-24 md:py-32"
      }`}
    >
      {!isLight && (
        <>
          <div className="absolute inset-0 bg-brand-navy" />
          <div className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-brand-teal/[0.12] blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full bg-brand-navy-mid/90 blur-[90px]" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-[min(80vw,720px)] w-[min(80vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-teal/[0.04] blur-[120px]" />
        </>
      )}

      {/* About (`light`): full-bleed white + subtle brand wash; home (`dark`): contained navy hero */}
      <div
        className={`relative w-full min-w-0 ${
          isLight
            ? "border-y border-slate-200/70 bg-gradient-to-b from-[color-mix(in_srgb,var(--brand-mint)_14%,white)] via-white to-[color-mix(in_srgb,var(--brand-navy)_4%,white)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
            : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        }`}
      >
        {isLight && (
          <>
            <div
              className="pointer-events-none absolute -right-24 -top-28 h-[min(420px,55vw)] w-[min(420px,55vw)] rounded-full bg-brand-teal/[0.11] blur-[110px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-36 -left-20 h-[min(360px,50vw)] w-[min(360px,50vw)] rounded-full bg-brand-navy/[0.07] blur-[100px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-5%,rgba(85,197,147,0.09),transparent_58%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-teal/25 to-transparent"
              aria-hidden
            />
          </>
        )}

        <div
          className={`relative z-10 mx-auto flex min-w-0 w-full max-w-[1600px] flex-col ${
            isLight ? "gap-12 lg:gap-16" : "gap-12 lg:gap-16"
          } ${
            isLight
              ? "px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:px-10 lg:py-24 xl:px-12"
              : ""
          }`}
        >
          {/* Row 1: intro copy + image (one row from md+) */}
          <div className="grid min-w-0 grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-12 xl:gap-14">
            <div
              className={`order-2 min-w-0 md:order-1 transition-all duration-1000 ease-out ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              } ${isLight ? "relative pl-0 md:pl-2" : ""}`}
            >
              {isLight ? (
                <div
                  className="absolute -left-1 top-1 hidden h-[min(100%,12rem)] w-1 rounded-full bg-gradient-to-b from-brand-teal via-brand-mint to-brand-navy/30 md:block"
                  aria-hidden
                />
              ) : null}
              <p className="text-brand-teal mb-4 inline-flex items-center rounded-full border border-brand-teal/25 bg-brand-teal/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] shadow-sm sm:text-sm">
                About Baraarug
              </p>

              <h2
                className={`mb-5 text-4xl font-extrabold leading-[1.06] tracking-tight md:text-5xl lg:mb-6 lg:text-[2.85rem] xl:text-[3.1rem] ${
                  isLight ? "text-brand-navy" : "text-white"
                }`}
              >
                <span className="relative inline-block">
                  Who
                  {isLight ? (
                    <span
                      className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-brand-teal via-brand-mint to-brand-teal/80"
                      aria-hidden
                    />
                  ) : (
                    <span
                      className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-brand-green"
                      aria-hidden
                    />
                  )}
                </span>{" "}
                <span className={isLight ? "text-brand-navy" : "text-white/95"}>
                  We Are
                </span>
              </h2>

              <p
                className={`max-w-xl text-lg leading-[1.75] text-pretty sm:text-xl md:max-w-[46ch] md:leading-[1.8] ${
                  isLight ? "text-slate-600" : "text-white/90"
                }`}
              >
                Baraarug Consulting Firm, established in 2012, is a leading
                consulting provider in Somalia focused on delivering expert
                services to drive institutional growth, enhance governance, and
                foster sustainable development. We specialize in offering
                comprehensive consulting solutions across various sectors,
                including policy development, public financial management, project
                management, and business development.
              </p>
            </div>

            {/* Image column */}
            <div
              className={`relative order-1 mx-auto min-w-0 max-w-md md:order-2 md:max-w-none lg:sticky lg:top-24 transition-all duration-1000 ease-out md:delay-100 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl md:h-56 md:w-56 ${
                  isLight ? "bg-brand-teal/18" : "bg-brand-teal/25"
                }`}
              />
              <div
                className={`pointer-events-none absolute -left-8 bottom-1/4 h-36 w-36 rounded-full blur-2xl ${
                  isLight ? "bg-brand-navy/12" : "bg-brand-navy/40"
                }`}
              />

              <div className="relative group">
                {isLight ? (
                  <div
                    className="pointer-events-none absolute -inset-[2px] rounded-[1.45rem] bg-gradient-to-br from-brand-teal/35 via-white/40 to-brand-navy/25 opacity-90 blur-[2px]"
                    aria-hidden
                  />
                ) : null}
                <div
                  className={`relative overflow-hidden rounded-[1.35rem] bg-white p-[11px] ring-1 transition-all duration-500 ${
                    isLight
                      ? "shadow-[0_28px_64px_-28px_rgba(15,60,80,0.28),0_0_0_1px_rgba(255,255,255,0.8)_inset] ring-slate-300/80 group-hover:-translate-y-1 group-hover:shadow-[0_36px_72px_-28px_rgba(23,94,126,0.28)]"
                      : "shadow-[0_36px_72px_-28px_rgba(0,0,0,0.48)] ring-white/65 group-hover:shadow-[0_44px_80px_-30px_rgba(0,0,0,0.52)]"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-xl ring-1 ring-slate-200/60">
                    <Image
                      src="/about.jpg"
                      alt="Baraarug Consulting team in a training session"
                      width={1600}
                      height={1066}
                      priority={isLight}
                      className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      sizes="(min-width: 768px) 42vw, 100vw"
                    />
                    <div
                      className={`pointer-events-none absolute inset-0 ${
                        isLight
                          ? "bg-gradient-to-t from-slate-900/25 via-slate-900/[0.02] to-transparent"
                          : "bg-brand-navy/15"
                      }`}
                    />
                  </div>
                </div>

                <div className="absolute -bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-auto">
                  <div
                    className={`rounded-2xl border px-5 py-4 text-center shadow-2xl backdrop-blur-md sm:inline-block sm:text-left ${
                      isLight
                        ? "border-white/90 bg-white/95 text-brand-navy shadow-[0_20px_50px_-20px_rgba(23,94,126,0.35)] ring-1 ring-slate-200/70"
                        : "border-white/25 bg-brand-navy/92 text-white"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-teal sm:text-sm">
                      Impact
                    </p>
                    <p className={`mt-1 text-lg font-bold tracking-tight sm:text-xl ${isLight ? "text-brand-navy" : "text-white"}`}>
                      Building capacity across the region
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="pointer-events-none absolute -bottom-2 -left-2 grid grid-cols-4 gap-2.5 opacity-[0.85]"
                aria-hidden
              >
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className={
                      isLight
                        ? "h-2.5 w-2.5 rounded-full bg-brand-teal/80 shadow-[0_0_14px_rgba(85,197,147,0.5)]"
                        : "h-2 w-2 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(85,197,147,0.5)]"
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Vision + Mission — editorial cards */}
          <div
            className={`grid min-w-0 grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 ${
              isLight ? "relative border-t border-slate-200/60 pt-10 md:pt-14" : ""
            }`}
          >
            {isLight ? (
              <div
                className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px max-w-md bg-gradient-to-r from-transparent via-brand-teal/40 to-transparent"
                aria-hidden
              />
            ) : null}
            {cards.map((card, index) => (
              <article
                key={card.title}
                className={`group relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-2xl border transition-all duration-500 sm:min-h-[270px] sm:rounded-[1.75rem] ${
                  isLight
                    ? "border-slate-200/90 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.04),0_24px_48px_-20px_rgba(15,60,80,0.14)] ring-1 ring-slate-100/90 before:pointer-events-none before:absolute before:inset-0 before:rounded-[1.75rem] before:bg-[radial-gradient(ellipse_90%_60%_at_100%_0%,rgba(85,197,147,0.06),transparent_50%)] hover:-translate-y-[10px] hover:border-brand-teal/30 hover:shadow-[0_32px_64px_-24px_rgba(23,94,126,0.22)]"
                    : "border-white/12 bg-white/[0.97] hover:border-white/28"
                } ${card.borderHover} ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: inView ? `${200 + index * 100}ms` : "0ms",
                }}
              >
                <div
                  className={`relative h-1.5 w-full overflow-hidden ${
                    index === 0
                      ? "bg-gradient-to-r from-brand-teal via-brand-mint to-brand-teal/90"
                      : "bg-gradient-to-r from-brand-navy via-[color-mix(in_srgb,var(--brand-navy)_70%,var(--brand-teal))] to-brand-navy"
                  }`}
                  aria-hidden
                />
                <div
                  className={`relative flex flex-1 flex-col bg-gradient-to-b p-5 sm:p-6 md:p-8 lg:p-9 ${
                    isLight
                      ? "from-white via-slate-50/40 to-white"
                      : "from-white/[0.08] to-white/[0.02]"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-2 sm:mb-5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/[0.04] sm:h-14 sm:w-14 md:h-[3.75rem] md:w-[3.75rem] ${card.iconBg}`}
                    >
                      <card.icon
                        className={`h-6 w-6 sm:h-7 sm:w-7 ${card.iconColor}`}
                        strokeWidth={1.75}
                      />
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] shadow-sm sm:text-sm ${
                        index === 0
                          ? "border-brand-teal/20 bg-brand-teal/[0.12] text-brand-teal"
                          : "border-brand-navy/15 bg-brand-navy/[0.08] text-brand-navy"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3
                    className={`mb-3 text-xl font-extrabold tracking-tight sm:mb-4 sm:text-2xl md:text-[1.65rem] ${card.titleColor}`}
                  >
                    {card.title}
                  </h3>
                  <p className="text-base leading-[1.65] text-slate-600 md:text-lg md:leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
