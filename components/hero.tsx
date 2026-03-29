"use client";

import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

/** Add or reorder images in public/images — each path is one slide */
const HERO_SLIDES = [
  '/images/hero-training.jpg',
  '/images/chairperson.jpg',
];

const AUTO_MS = 3_000;

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [autoplayKey, setAutoplayKey] = useState(0);

  const slideCount = HERO_SLIDES.length;

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

  const goPrev = () => goTo(slideIndex - 1);
  const goNext = () => goTo(slideIndex + 1);

  return (
    <section className="relative pt-32 min-h-screen flex items-center overflow-hidden">
      {/* Background slider */}
      <div className="absolute inset-0">
        {HERO_SLIDES.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('${src}')`,
              opacity: slideIndex === i ? 1 : 0,
              zIndex: slideIndex === i ? 1 : 0,
            }}
            aria-hidden={slideIndex !== i}
          />
        ))}
        <div className="absolute inset-0 bg-brand-navy/50 z-[2]" />

        {slideCount > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[4] rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 p-2.5 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[4] rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 p-2.5 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </>
        )}
      </div>

      {/* Content - Centered */}
      <div className="relative z-[3] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32 w-full text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8">
            <CheckCircle className="w-5 h-5 text-brand-teal" />
            <span className="text-white font-medium">Trusted by 500+ Organizations</span>
          </div>

          {/* Main Heading - No Italic */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
            <span className="block">Expertise Beyond</span>
            <span className="block text-brand-teal">Boundaries</span>
            <span className="block text-3xl sm:text-4xl md:text-5xl font-normal mt-4">for Your Business</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            We empower organizations to achieve excellence through innovative solutions and sustainable transformation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-brand-teal hover:bg-brand-teal/90 text-white text-lg h-14 px-8 rounded-full group"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-white/30 text-white hover:bg-white/10 text-lg h-14 px-8 rounded-full bg-transparent backdrop-blur-sm group"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Video
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 mt-14 pt-10 border-t border-white/20 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">15+</div>
              <div className="text-white/60 text-sm mt-1">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">500+</div>
              <div className="text-white/60 text-sm mt-1">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">50+</div>
              <div className="text-white/60 text-sm mt-1">Expert Team</div>
            </div>
          </div>

          {slideCount > 1 && (
            <div
              className="flex justify-center gap-2 mt-10"
              role="tablist"
              aria-label="Hero slides"
            >
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 focus:ring-offset-brand-navy/50 ${
                    slideIndex === i ? 'w-8 bg-brand-teal' : 'w-2.5 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Beautiful Shape Divider - Tilt */}
      <div className="absolute -bottom-1 left-0 right-0 overflow-hidden">
        <svg 
          className="relative block w-full h-16 sm:h-20" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M1200 120L0 16.48 0 0 1200 0 1200 120z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
