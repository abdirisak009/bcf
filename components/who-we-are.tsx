"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, TrendingUp, Heart } from "lucide-react";
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
    {
      icon: Heart,
      title: "Our Values",
      description:
        "Excellence, Integrity, Innovation, and Collaboration guide everything we do.",
      topBar: "bg-brand-green",
      titleColor: "text-brand-navy",
      iconBg: "bg-brand-teal/12",
      iconColor: "text-brand-teal",
      borderHover: "hover:border-brand-teal/40",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`relative py-24 md:py-32 overflow-hidden ${
        isLight
          ? "border-t border-slate-200/60 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100"
          : ""
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

      <div
        className={`relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${
          isLight
            ? "relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-gradient-to-br from-brand-navy via-[#134d66] to-brand-navy-mid p-6 shadow-[0_28px_80px_-20px_rgba(15,60,80,0.55)] ring-1 ring-white/10 sm:p-8 md:p-10 lg:p-12"
            : ""
        }`}
      >
        {isLight && (
          <>
            <div
              className="pointer-events-none absolute -right-24 -top-28 h-[min(420px,55vw)] w-[min(420px,55vw)] rounded-full bg-brand-teal/30 blur-[100px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-36 -left-20 h-[min(380px,50vw)] w-[min(380px,50vw)] rounded-full bg-brand-navy-deep/80 blur-[90px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 h-[min(90vw,640px)] w-[min(90vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-[80px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_42%,transparent_58%,rgba(255,255,255,0.05)_100%)]"
              aria-hidden
            />
          </>
        )}

        <div className="relative z-10 grid min-w-0 grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-20 items-center">
          {/* Left */}
          <div
            className={`min-w-0 transition-all duration-1000 ease-out ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-brand-teal text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              About Baraarug
            </p>

            <h2
              className={`text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.1] mb-6 ${
                isLight ? "text-white drop-shadow-sm" : "text-white"
              }`}
            >
              <span className="relative inline-block">
                Who
                {isLight ? (
                  <span
                    className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-brand-teal via-brand-mint to-brand-teal/80 opacity-90"
                    aria-hidden
                  />
                ) : (
                  <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-brand-green" aria-hidden />
                )}
              </span>{" "}
              <span className={isLight ? "text-white/95" : "text-white/95"}>
                We Are
              </span>
            </h2>

            <p
              className={`text-lg md:text-xl leading-relaxed max-w-xl mb-12 ${
                isLight ? "text-white/80" : "text-white/85"
              }`}
            >
              Baraarug Consulting is a leading professional services firm
              dedicated to helping organizations navigate complex challenges and
              achieve sustainable growth.
            </p>

            <div className="grid sm:grid-cols-3 gap-5 md:gap-6">
              {cards.map((card, index) => (
                <article
                  key={card.title}
                  className={`group relative rounded-2xl border p-5 md:p-6 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.45)] ${
                    isLight
                      ? "border-white/40 bg-white/[0.97] shadow-[0_16px_48px_-20px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-white/60 hover:bg-white hover:shadow-[0_24px_56px_-18px_rgba(0,0,0,0.4)]"
                      : "border-white/10 bg-white/[0.97] hover:border-white/25"
                  } ${card.borderHover} ${
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{
                    transitionDelay: inView ? `${120 + index * 90}ms` : "0ms",
                  }}
                >
                  <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl ${card.topBar}`} aria-hidden />
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} ring-1 ring-black/[0.04] transition-transform duration-300 group-hover:scale-110`}
                  >
                    <card.icon
                      className={`h-6 w-6 ${card.iconColor}`}
                      strokeWidth={2}
                    />
                  </div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand-navy/50 mb-1">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className={`mb-2 text-base font-bold ${card.titleColor}`}>{card.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Right — image */}
          <div
            className={`relative mx-auto min-w-0 max-w-lg lg:max-w-none transition-all duration-1000 ease-out delay-150 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div
              className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl md:h-52 md:w-52 ${
                isLight ? "bg-white/20" : "bg-brand-teal/25"
              }`}
            />
            <div
              className={`pointer-events-none absolute -left-6 bottom-1/4 h-32 w-32 rounded-full blur-2xl ${
                isLight ? "bg-brand-teal/25" : "bg-brand-navy/40"
              }`}
            />

            <div className="relative group">
              <div
                className={`relative overflow-hidden rounded-2xl bg-white p-2.5 ring-1 transition-shadow duration-500 ${
                  isLight
                    ? "shadow-[0_32px_64px_-20px_rgba(0,0,0,0.45)] ring-white/50 group-hover:shadow-[0_40px_72px_-24px_rgba(0,0,0,0.5)]"
                    : "shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45)] ring-white/60 group-hover:shadow-[0_40px_72px_-28px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ou3BZ1b95Gqq6UZ1VPr8XRiPRADdEf.png"
                    alt="Baraarug Consulting team in a training session"
                    width={600}
                    height={400}
                    className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                  <div
                    className={`pointer-events-none absolute inset-0 ${
                      isLight ? "bg-gradient-to-t from-brand-navy/25 via-transparent to-transparent" : "bg-brand-navy/15"
                    }`}
                  />
                </div>
              </div>

              {/* Floating label */}
              <div className="absolute -bottom-3 left-6 right-6 sm:left-auto sm:right-6 sm:w-auto">
                <div
                  className={`rounded-xl border px-4 py-2.5 text-center shadow-lg backdrop-blur-md sm:inline-block sm:text-left ${
                    isLight
                      ? "border-white/30 bg-white/95 text-brand-navy shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)]"
                      : "border-white/20 bg-brand-navy/90 text-white"
                  }`}
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-brand-teal">
                    Impact
                  </p>
                  <p className={`text-sm font-medium ${isLight ? "text-brand-navy" : "text-white"}`}>
                    Building capacity across the region
                  </p>
                </div>
              </div>
            </div>

            {/* Dot grid */}
            <div
              className="pointer-events-none absolute -bottom-2 -left-2 grid grid-cols-4 gap-2 opacity-90"
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
      </div>
    </section>
  );
}
