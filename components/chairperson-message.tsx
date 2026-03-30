"use client";

import { motion } from "framer-motion";
import { Quote, Sparkles } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export default function ChairpersonMessage() {
  return (
    <section className="relative overflow-hidden border-y border-slate-100/90 bg-white py-24 md:py-32">
      {/* Ambient depth — very subtle */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(23,94,126,0.06),transparent)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-32 top-1/4 h-[420px] w-[420px] rounded-full bg-brand-teal/[0.04] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-[360px] w-[360px] rounded-full bg-brand-navy/[0.04] blur-3xl" aria-hidden />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Image */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
            >
              <div className="group relative">
                {/* Thick watery-mint frame */}
                <div className="relative rounded-[2rem] bg-brand-mint p-4 shadow-[0_24px_48px_-20px_rgba(85,197,147,0.22),0_8px_20px_-8px_rgba(23,94,126,0.08)] ring-1 ring-brand-teal/25 sm:rounded-[2.25rem] sm:p-5 md:p-6">
                  <div className="relative overflow-hidden rounded-2xl bg-white p-1 shadow-inner ring-1 ring-white/80 sm:rounded-[1.35rem] sm:p-1.5">
                    <div className="relative overflow-hidden rounded-[1.15rem] sm:rounded-xl">
                      <img
                        src="/ayan.jpeg"
                        alt="Mrs. Ayan Ali - CEO"
                        loading="lazy"
                        className="h-[min(38rem,86vh)] w-full origin-[48%_40%] object-cover object-[40%_38%] scale-[1.14] transition duration-500 ease-out group-hover:scale-[1.2]"
                      />
                    </div>
                  </div>

                  <div className="absolute -right-2 -top-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal text-white shadow-lg ring-4 ring-brand-mint transition duration-500 group-hover:rotate-0 group-hover:scale-105 sm:-right-3 sm:-top-3 sm:h-16 sm:w-16 rotate-6">
                    <Quote className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
                  </div>

                  <div className="absolute -bottom-2 -left-2 grid grid-cols-3 gap-1 rounded-2xl border border-brand-mint/80 bg-white/95 p-2 shadow-sm backdrop-blur-sm">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-brand-teal/50" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Copy */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col space-y-8"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-teal/20 bg-brand-teal/[0.07] px-4 py-2 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-brand-teal" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">
                  Leadership
                </span>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-bold leading-[1.12] tracking-tight md:text-5xl lg:text-[3.15rem]">
                  <span className="block font-semibold tracking-tight text-brand-navy">
                    Message from the
                  </span>
                  <span className="mt-2 block bg-gradient-to-r from-brand-teal via-brand-teal to-brand-teal/80 bg-clip-text font-extrabold text-transparent">
                    CEO
                  </span>
                </h2>
                <div className="flex items-center gap-2 pt-1">
                  <span className="h-1 w-14 rounded-full bg-brand-teal" />
                  <span className="h-1 w-4 rounded-full bg-brand-teal/45" />
                  <span className="h-1 w-2 rounded-full bg-brand-navy/25" />
                </div>
              </div>

              <div className="relative max-w-xl space-y-5 text-[17px] leading-[1.75] text-slate-600">
                <Quote
                  className="absolute -left-1 -top-1 h-14 w-14 text-brand-teal/[0.12]"
                  strokeWidth={1}
                  aria-hidden
                />
                <p className="relative pl-2">
                  At Baraarug Consulting Firm, we believe that true success is achieved through collaboration and a
                  deep understanding of our clients&apos; needs. We are committed to working hand-in-hand with our
                  clients, providing tailored solutions and strategic insights that drive measurable results.
                </p>
                <p>
                  Our interdisciplinary team brings expertise, innovation, and a relentless pursuit of excellence to
                  every project. We strive to exceed expectations, foster long-term partnerships, and empower our
                  clients to thrive. Baraarug is your trusted partner for navigating complexity and achieving
                  sustainable growth.
                </p>
              </div>

              <blockquote className="relative max-w-xl rounded-r-2xl border-l-[3px] border-brand-teal bg-gradient-to-r from-brand-teal/[0.07] to-transparent py-4 pl-6 pr-4 text-[17px] italic leading-relaxed text-slate-600 shadow-sm">
                With our extensive experience and dedicated team of experts, we provide comprehensive solutions that
                drive growth and create lasting impact for our clients.
              </blockquote>

              <div className="flex max-w-xl flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/90 to-white px-6 py-5 shadow-[0_8px_30px_-12px_rgba(23,94,126,0.1)]">
                  <div className="flex h-14 w-1.5 overflow-hidden rounded-full bg-slate-200">
                    <span className="h-full w-1/2 bg-brand-teal" />
                    <span className="h-full w-1/2 bg-brand-navy" />
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-tight text-brand-navy md:text-xl">Mrs. Ayan Ali</p>
                    <p className="mt-0.5 text-sm font-semibold uppercase tracking-wider text-brand-teal">CEO</p>
                  </div>
                </div>
                <svg viewBox="0 0 200 32" className="h-9 w-36 shrink-0 text-brand-navy/25 sm:w-40" aria-hidden>
                  <path
                    d="M4 22 Q 36 6, 72 18 T 140 14 T 196 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
