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
            ? "border-y border-slate-100 bg-white shadow-[0_1px_0_0_rgba(15,60,80,0.04)]"
            : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        }`}
      >
        {isLight && (
          <>
            <div
              className="pointer-events-none absolute -right-24 -top-28 h-[min(380px,50vw)] w-[min(380px,50vw)] rounded-full bg-brand-teal/[0.09] blur-[100px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-32 -left-16 h-[min(320px,45vw)] w-[min(320px,45vw)] rounded-full bg-brand-navy/[0.05] blur-[90px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(85,197,147,0.06),transparent_55%)]"
              aria-hidden
            />
          </>
        )}

        <div
          className={`relative z-10 mx-auto flex min-w-0 w-full max-w-[1600px] flex-col ${
            isLight ? "gap-7 lg:gap-9" : "gap-12 lg:gap-16"
          } ${
            isLight
              ? "px-4 py-8 sm:px-6 sm:py-9 md:py-10 lg:px-8 lg:py-11 xl:px-10"
              : ""
          }`}
        >
          {/* Row 1: intro copy + image (one row from md+) */}
          <div className="grid min-w-0 grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8 lg:gap-10 xl:gap-12">
            <div
              className={`order-2 min-w-0 md:order-1 transition-all duration-1000 ease-out ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <p className="text-brand-teal mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-xs">
                About Baraarug
              </p>

              <h2
                className={`mb-3 text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl lg:mb-4 lg:text-[2.35rem] ${
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
                className={`max-w-xl text-sm leading-[1.65] sm:text-[0.9375rem] md:max-w-none md:leading-[1.75] ${
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
              className={`relative order-1 mx-auto min-w-0 max-w-md md:order-2 md:max-w-none lg:sticky lg:top-20 transition-all duration-1000 ease-out md:delay-100 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl md:h-52 md:w-52 ${
                  isLight ? "bg-brand-teal/15" : "bg-brand-teal/25"
                }`}
              />
              <div
                className={`pointer-events-none absolute -left-6 bottom-1/4 h-32 w-32 rounded-full blur-2xl ${
                  isLight ? "bg-brand-teal/10" : "bg-brand-navy/40"
                }`}
              />

              <div className="relative group">
                <div
                  className={`relative overflow-hidden rounded-[1.35rem] bg-white p-[11px] ring-1 transition-shadow duration-500 ${
                    isLight
                      ? "shadow-[0_24px_56px_-20px_rgba(15,60,80,0.18)] ring-slate-200/90 group-hover:shadow-[0_32px_64px_-24px_rgba(15,60,80,0.22)]"
                      : "shadow-[0_36px_72px_-28px_rgba(0,0,0,0.48)] ring-white/65 group-hover:shadow-[0_44px_80px_-30px_rgba(0,0,0,0.52)]"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ou3BZ1b95Gqq6UZ1VPr8XRiPRADdEf.png"
                      alt="Baraarug Consulting team in a training session"
                      width={600}
                      height={400}
                      className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      sizes="(min-width: 768px) 42vw, 100vw"
                    />
                    <div
                      className={`pointer-events-none absolute inset-0 ${
                        isLight ? "bg-gradient-to-t from-slate-900/10 via-transparent to-transparent" : "bg-brand-navy/15"
                      }`}
                    />
                  </div>
                </div>

                <div className="absolute -bottom-2 left-4 right-4 sm:left-auto sm:right-5 sm:w-auto">
                  <div
                    className={`rounded-2xl border px-4 py-3 text-center shadow-xl backdrop-blur-md sm:inline-block sm:text-left ${
                      isLight
                        ? "border-slate-200/90 bg-white text-brand-navy shadow-[0_12px_36px_-12px_rgba(15,60,80,0.2)]"
                        : "border-white/25 bg-brand-navy/92 text-white"
                    }`}
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand-teal">
                      Impact
                    </p>
                    <p className={`text-sm font-semibold ${isLight ? "text-brand-navy" : "text-white"}`}>
                      Building capacity across the region
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
                    className={
                      isLight
                        ? "h-2 w-2 rounded-full bg-brand-mint/90 shadow-[0_0_10px_rgba(85,197,147,0.45)]"
                        : "h-2 w-2 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(85,197,147,0.5)]"
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Vision + Mission — full-width row, editorial / professional cards */}
          <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6">
            {cards.map((card, index) => (
              <article
                key={card.title}
                className={`group relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl border transition-all duration-500 sm:min-h-[220px] sm:rounded-3xl ${
                  isLight
                    ? "border-slate-200/95 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_16px_36px_-14px_rgba(15,60,80,0.12)] ring-1 ring-slate-100 hover:-translate-y-2 hover:border-brand-teal/25 hover:shadow-[0_22px_48px_-16px_rgba(15,60,80,0.18)]"
                    : "border-white/12 bg-white/[0.97] hover:border-white/28"
                } ${card.borderHover} ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: inView ? `${200 + index * 100}ms` : "0ms",
                }}
              >
                <div className={`h-1 w-full ${card.topBar}`} aria-hidden />
                <div
                  className={`flex flex-1 flex-col bg-gradient-to-b p-4 sm:p-5 md:p-6 ${
                    isLight
                      ? "from-slate-50/90 to-white"
                      : "from-white/[0.08] to-white/[0.02]"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/[0.04] sm:h-11 sm:w-11 md:h-12 md:w-12 ${card.iconBg}`}
                    >
                      <card.icon
                        className={`h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem] ${card.iconColor}`}
                        strokeWidth={1.75}
                      />
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px] ${
                        index === 0
                          ? "bg-brand-teal/10 text-brand-teal"
                          : "bg-brand-navy/10 text-brand-navy"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3
                    className={`mb-2 text-base font-bold tracking-tight sm:mb-4 sm:text-lg ${card.titleColor}`}
                  >
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-[0.95rem] md:leading-[1.6]">
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
