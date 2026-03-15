'use client';
import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { trackArticleView, trackCategoryClick } from '@/lib/analytics';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = sectionRef?.current?.querySelectorAll('.reveal-hidden');
    if (!els) return;
    const timer = setTimeout(() => {
      els?.forEach((el, i) => {
        setTimeout(() => el?.classList?.add('revealed'), i * 120);
      });
    }, 100);
    // Track hero article view on mount
    trackArticleView({
      articleId: '10-underrated-travel-destinations',
      articleTitle: '10 Underrated Travel Destinations You Should Visit',
      category: 'Destinations',
      author: 'UsExpress',
    });
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src="https://images.unsplash.com/photo-1633341441612-89bbcc2cd501"
          alt="Aerial view of a stunning underrated travel destination with turquoise water and lush greenery"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw" />
        
        {/* Cinematic overlay */}
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080C0A] via-transparent to-[#080C0A]/40" />
      </div>

      {/* Beam lines */}
      <div className="absolute inset-0 pointer-events-none z-10 flex justify-between px-8 md:px-24">
        <div className="relative w-px h-full bg-white/[0.03] overflow-hidden">
          <div className="beam beam-1" />
        </div>
        <div className="relative w-px h-full bg-white/[0.03] overflow-hidden hidden md:block">
          <div className="beam beam-2" />
        </div>
        <div className="relative w-px h-full bg-white/[0.03] overflow-hidden">
          <div className="beam beam-3" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-[1440px] mx-auto w-full px-6 md:px-12 lg:px-24 pb-20 pt-40">
        <div className="max-w-3xl">
          {/* Category tag */}
          <div className="reveal-hidden mb-6">
            <span
              className="category-tag cursor-pointer"
              onClick={() => trackCategoryClick('Destinations')}>
              Destinations
            </span>
          </div>

          {/* Headline */}
          <h1 className="reveal-hidden font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-light italic leading-[1.05] tracking-tight text-[#F0EDE8] mb-6">
            10 Underrated Travel{' '}
            <span className="not-italic font-normal text-accent">
              Destinations
            </span>{' '}
            You Should Visit
          </h1>

          {/* Excerpt */}
          <p className="reveal-hidden delay-100 text-[#F0EDE8]/65 text-lg font-light leading-relaxed max-w-xl mb-8">
            While famous cities and tourist hotspots top every bucket list, some of
            the world&apos;s most amazing places remain beautifully undiscovered.
          </p>

          {/* Meta */}
          <div className="reveal-hidden delay-200 flex flex-wrap items-center gap-4 mb-10 article-meta">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              4 October 2024
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>By UsExpress</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>0 Comments</span>
          </div>

          {/* CTA */}
          <div className="reveal-hidden delay-300 flex items-center gap-6">
            <Link
              href="/home-page"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary-light text-white font-sans font-semibold text-sm tracking-wide px-7 py-3.5 rounded-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(26,107,74,0.4)]">
              
              Read Article
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/home-page" className="read-more-link">
              <span>Explore All</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 md:right-24 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#F0EDE8]" />
          <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-[#F0EDE8] rotate-90 origin-center mt-2">
            Scroll
          </span>
        </div>
      </div>

      {/* Bottom fade into bg */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080C0A] to-transparent z-10" />
    </section>);

}