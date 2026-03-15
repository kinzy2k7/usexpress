'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ExploreMoreCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const els = entry.target.querySelectorAll('.reveal-hidden');
            els.forEach((el, i) => {
              setTimeout(() => el.classList.add('revealed'), i * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-6 md:px-12 lg:px-24 overflow-hidden bg-[#0D1410] border-t border-white/[0.06]"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/15 blur-[100px] rounded-full" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
      <div className="max-w-[1440px] mx-auto relative z-10 text-center">
        {/* Eyebrow */}
        <div className="reveal-hidden mb-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 font-sans text-[10px] font-600 tracking-[0.2em] uppercase text-primary-light">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Your Adventure Awaits
          </span>
        </div>

        {/* Headline */}
        <h2 className="reveal-hidden delay-100 font-serif text-4xl md:text-6xl lg:text-7xl font-light italic text-[#F0EDE8] leading-[1.05] mb-6 max-w-4xl mx-auto">
          Your 2-day adventure{' '}
          <span className="not-italic font-normal text-accent">starts here.</span>
        </h2>

        {/* Sub */}
        <p className="reveal-hidden delay-200 font-sans text-lg text-[#F0EDE8]/55 font-light leading-relaxed max-w-xl mx-auto mb-12">
          Explore hundreds of curated travel guides, destination tips, and practical advice
          for planning the perfect weekend escape.
        </p>

        {/* CTAs */}
        <div className="reveal-hidden delay-300 flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            href="/home-page"
            className="inline-flex items-center gap-3 bg-primary hover:bg-primary-light text-white font-sans font-600 text-sm tracking-wide px-8 py-4 rounded-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(26,107,74,0.45)]"
          >
            Browse All Articles
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Spin border secondary button */}
          <div className="spin-border-btn">
            <Link
              href="/home-page"
              className="relative z-10 inline-flex items-center gap-3 bg-[#0D1410] hover:bg-[#111814] text-[#F0EDE8]/80 hover:text-[#F0EDE8] font-sans font-500 text-sm tracking-wide px-8 py-4 rounded-sm transition-all duration-300"
            >
              Explore Destinations
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="reveal-hidden delay-400 mt-20 pt-10 border-t border-white/[0.06] grid grid-cols-3 gap-8 max-w-md mx-auto">
          {[
            { value: '60+', label: 'Articles Published' },
            { value: '11', label: 'Regions Covered' },
            { value: '4', label: 'Languages' },
          ]?.map((stat) => (
            <div key={stat?.label} className="text-center">
              <div className="font-serif text-3xl font-light italic text-accent mb-1">
                {stat?.value}
              </div>
              <div className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#F0EDE8]/40">
                {stat?.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}