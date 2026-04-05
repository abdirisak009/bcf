"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Afar sawir: `slide1`, `slide2`, `slide3`, `slide5` (slide 4 la saaray).
 * `public/slideN.jpeg` — root-ka public.
 */
const SLIDE_NUMBERS = [1, 2, 3, 5] as const
const EXT_FALLBACK = ['jpeg', 'jpg', 'png', 'webp'] as const

function HeroSlideImage({ slideNo, active }: { slideNo: number; active: boolean }) {
  const [extIdx, setExtIdx] = useState(0)
  const src =
    extIdx < EXT_FALLBACK.length
      ? `/slide${slideNo}.${EXT_FALLBACK[extIdx]}`
      : '/placeholder.svg'

  const onError = useCallback(() => {
    setExtIdx((i) => i + 1)
  }, [])

  return (
    <motion.div
      className="relative h-full w-full origin-center overflow-hidden bg-brand-navy/40"
      initial={false}
      animate={{
        scale: active ? 1 : 1.07,
      }}
      transition={{
        type: 'spring',
        stiffness: 42,
        damping: 20,
        mass: 0.45,
      }}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        width={1920}
        height={1080}
        className="h-full w-full object-cover object-center"
        onError={onError}
        loading={slideNo === 1 ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
    </motion.div>
  )
}

/** 4 slides — ~5.5s slide kasta */
const AUTO_MS = 5_500;

/** Smooth spring — jidid fiican, dhaqdhaqaaq dabiici ah */
const slideSpring = {
  type: 'spring' as const,
  stiffness: 68,
  damping: 26,
  mass: 0.52,
};

const settleEase = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [autoplayKey, setAutoplayKey] = useState(0);

  const slideCount = SLIDE_NUMBERS.length;
  const slidePercent = 100 / slideCount;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (slideCount <= 1) return;
    const id = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % slideCount);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [slideCount, autoplayKey]);

  const goTo = useCallback(
    (next: number) => {
      setSlideIndex(((next % slideCount) + slideCount) % slideCount);
      setAutoplayKey((k) => k + 1);
    },
    [slideCount]
  );

  return (
    <section
      className="relative pt-24 sm:pt-28 w-full min-h-[52vh] sm:min-h-[56vh] lg:min-h-[60vh] flex flex-col justify-center overflow-hidden border-b border-white/20"
      aria-roledescription="carousel"
      aria-label="Hero highlights"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="flex h-full"
          style={{ width: `${slideCount * 100}%` }}
          initial={false}
          animate={{ x: `-${slideIndex * slidePercent}%` }}
          transition={slideSpring}
        >
          {SLIDE_NUMBERS.map((slideNo, i) => (
            <div
              key={slideNo}
              className="h-full shrink-0 overflow-hidden"
              style={{ width: `${slidePercent}%` }}
            >
              <HeroSlideImage slideNo={slideNo} active={slideIndex === i} />
            </div>
          ))}
        </motion.div>

        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background: `
              linear-gradient(90deg,
                color-mix(in srgb, #0c4a63 96%, black) 0%,
                color-mix(in srgb, #175e7e 78%, transparent) 28%,
                color-mix(in srgb, #175e7e 35%, transparent) 52%,
                rgba(23, 94, 126, 0.08) 68%,
                transparent 82%
              )
            `,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2] opacity-90 mix-blend-soft-light"
          style={{
            background: `
              radial-gradient(ellipse 85% 120% at 12% 45%,
                color-mix(in srgb, #55c593 42%, transparent) 0%,
                transparent 55%
              )
            `,
          }}
        />
      </div>

      {slideCount > 1 && (
        <>
          <motion.button
            type="button"
            onClick={() => goTo(slideIndex - 1)}
            className="absolute left-3 sm:left-5 top-[42%] sm:top-1/2 -translate-y-1/2 z-[4] rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/35 p-2.5 text-white shadow-lg shadow-brand-navy/20 focus:outline-none focus:ring-2 focus:ring-brand-teal"
            aria-label="Previous slide"
            whileHover={{ scale: 1.08, x: -2 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </motion.button>
          <motion.button
            type="button"
            onClick={() => goTo(slideIndex + 1)}
            className="absolute right-3 sm:right-5 top-[42%] sm:top-1/2 -translate-y-1/2 z-[4] rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/35 p-2.5 text-white shadow-lg shadow-brand-navy/20 focus:outline-none focus:ring-2 focus:ring-brand-teal"
            aria-label="Next slide"
            whileHover={{ scale: 1.08, x: 2 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </motion.button>
        </>
      )}

      <div className="relative z-[3] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 pb-14 sm:pb-16 md:pb-20 text-left">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 22 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: settleEase }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-[1.12] drop-shadow-sm">
            <span className="block">Expertise Beyond</span>
            <span className="block text-brand-teal drop-shadow-[0_0_24px_rgba(85,197,147,0.35)]">
              Boundaries
            </span>
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-white mt-2 sm:mt-3">
              for Your Business
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-white/95 mb-5 sm:mb-6 max-w-2xl leading-snug sm:leading-relaxed drop-shadow-md">
            We empower organizations to achieve excellence through innovative solutions and sustainable
            transformation.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              asChild
              className="bg-brand-teal hover:bg-brand-teal/90 text-white text-base sm:text-lg h-11 sm:h-12 px-6 sm:px-8 rounded-full group w-fit shadow-lg shadow-brand-teal/25"
            >
              <Link href="/training">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white/50 text-white hover:bg-white/15 text-base sm:text-lg h-11 sm:h-12 px-6 sm:px-8 rounded-full bg-white/5 backdrop-blur-sm group w-fit"
            >
              <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Watch Video
            </Button>
          </div>

          {slideCount > 1 && (
            <div
              className="flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 mt-10 sm:mt-12"
              role="tablist"
              aria-label="Hero slides"
            >
              {SLIDE_NUMBERS.map((_, i) => (
                <motion.button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 focus:ring-offset-transparent ${
                    slideIndex === i
                      ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                      : 'border-2 border-white/70 bg-transparent hover:bg-white/30'
                  }`}
                  animate={{
                    width: slideIndex === i ? 36 : 10,
                    scale: slideIndex === i ? 1 : 0.92,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.88 }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
