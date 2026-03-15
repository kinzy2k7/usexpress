'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const regions = [
  { name: 'Africa', icon: '🌍' },
  { name: 'Americas', icon: '🌎' },
  { name: 'Asia', icon: '🌏' },
  { name: 'Australia & Oceania', icon: '🦘' },
  { name: 'Europe', icon: '🏰' },
  { name: 'France', icon: '🗼' },
  { name: 'Italy', icon: '🍕' },
  { name: 'India & Himalayas', icon: '🏔️' },
  { name: 'North Africa & Middle East', icon: '🕌' },
  { name: 'The Islands', icon: '🏝️' },
  { name: 'UAE', icon: '🏙️' },
];

const categories = [
  { name: 'Destinations', href: '/home-page' },
  { name: 'Deals & Bookings', href: '/home-page' },
  { name: 'Tips & News', href: '/home-page' },
  { name: 'Shop', href: '/home-page' },
];

export default function RegionStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const els = entry.target.querySelectorAll('.reveal-hidden');
            els.forEach((el, i) => {
              setTimeout(() => el.classList.add('revealed'), i * 60);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 border-t border-b border-white/[0.06] bg-[#0D1410] overflow-hidden"
    >
      {/* Subtle green glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        {/* Category nav */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-12 pb-8 border-b border-white/[0.06] reveal-hidden">
          {categories?.map((cat) => (
            <Link
              key={cat?.name}
              href={cat?.href}
              className="font-sans text-sm font-500 text-[#F0EDE8]/60 hover:text-accent transition-colors duration-200 tracking-wide"
            >
              {cat?.name}
            </Link>
          ))}
          <div className="ml-auto">
            <span className="font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light">
              Browse by Region
            </span>
          </div>
        </div>

        {/* Region pills */}
        <div className="flex flex-wrap gap-2.5">
          {regions?.map((region, i) => (
            <Link
              key={region?.name}
              href="/home-page"
              className={`region-pill reveal-hidden`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <span className="mr-1.5">{region?.icon}</span>
              {region?.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}