'use client';
import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

interface Article {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  alt: string;
  slug: string;
}

const articles: Article[] = [
{
  title: '10 Surprising Things That Could Trigger a Bag Search at the Airport',
  excerpt: 'Navigating airport security can be a stressful part of air travel. Some items may come as a complete surprise.',
  date: '27 May 2024',
  category: 'Tips & News',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a6ac8229-1766817619420.png",
  alt: 'Airport security conveyor belt with luggage being scanned',
  slug: '/home-page'
},
{
  title: 'Transfers & Airport Services',
  excerpt: 'Streamline your journey with the ultimate guide to transfers and airport services.',
  date: '13 April 2024',
  category: 'Deals & Bookings',
  image: "https://images.unsplash.com/photo-1687103156419-5fa92670ae6c",
  alt: 'Airport terminal with passengers walking through transfer area',
  slug: '/home-page'
},
{
  title: 'Trains & Buses',
  excerpt: 'Unveiling the charm of train and bus travel — the ultimate scenic route experience.',
  date: '13 April 2024',
  category: 'Tips & News',
  image: "https://images.unsplash.com/photo-1513407387750-61f3db81524b",
  alt: 'Scenic train journey through mountains and countryside',
  slug: '/home-page'
},
{
  title: 'Tours & Activities',
  excerpt: 'Discover the world through unique tours and activities. Choose the perfect platform for your adventure.',
  date: '13 April 2024',
  category: 'Destinations',
  image: "https://images.unsplash.com/photo-1729710084309-bae14fe6e60c",
  alt: 'Group of tourists on a guided tour exploring ancient ruins',
  slug: '/home-page'
},
{
  title: 'International SIM Options',
  excerpt: 'Traveling abroad? Staying connected shouldn\'t be a challenge. Airalo vs. Drimsim compared.',
  date: '12 April 2024',
  category: 'Tips & News',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1265ee4d2-1772214566785.png",
  alt: 'Smartphone with international SIM card on a travel map',
  slug: '/home-page'
}];


export default function ArticleBentoGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

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
      { threshold: 0.1 }
    );
    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  // Spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>('.spotlight-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-[#080C0A] bg-grid">
      <div className="max-w-[1440px] mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between mb-14 reveal-hidden">
          <div>
            <span className="block font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light mb-3">
              Latest Articles
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-light italic text-[#F0EDE8]">
              Stories Worth <span className="not-italic font-normal text-accent">Reading</span>
            </h2>
          </div>
          <Link href="/home-page" className="hidden md:flex read-more-link">
            View All Articles
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Bento grid — asymmetric layout */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-auto">

          {/* Card 1 — large, spans 7 cols, 2 rows */}
          <div className="lg:col-span-7 lg:row-span-2 spotlight-card rounded-sm overflow-hidden group reveal-hidden cursor-pointer">
            <div className="relative h-72 md:h-96 lg:h-full min-h-[380px] article-img-wrap">
              <AppImage
                src={articles[0].image}
                alt={articles[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#080C0A] via-[#080C0A]/30 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="category-tag mb-4 w-fit">{articles[0].category}</span>
                <h3 className="font-serif text-2xl md:text-3xl font-light italic text-[#F0EDE8] leading-tight mb-3 group-hover:text-accent transition-colors duration-300">
                  {articles[0].title}
                </h3>
                <p className="text-[#F0EDE8]/55 text-sm leading-relaxed mb-5 max-w-md">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="article-meta">{articles[0].date}</span>
                  <Link href={articles[0].slug} className="read-more-link">
                    Read More
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 — spans 5 cols */}
          <div className="lg:col-span-5 spotlight-card rounded-sm overflow-hidden group reveal-hidden delay-100 cursor-pointer bg-[#0D1410]">
            <div className="relative h-52 article-img-wrap">
              <AppImage
                src={articles[1].image}
                alt={articles[1].alt}
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 768px) 100vw, 40vw" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1410] to-transparent" />
            </div>
            <div className="p-6">
              <span className="category-tag mb-3 inline-block">{articles[1].category}</span>
              <h3 className="font-serif text-xl font-light italic text-[#F0EDE8] leading-tight mb-2 group-hover:text-accent transition-colors duration-300">
                {articles[1].title}
              </h3>
              <p className="text-[#F0EDE8]/50 text-sm leading-relaxed mb-4 line-clamp-2">
                {articles[1].excerpt}
              </p>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="article-meta">{articles[1].date}</span>
                <Link href={articles[1].slug} className="read-more-link">
                  Read More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3 — spans 5 cols */}
          <div className="lg:col-span-5 spotlight-card rounded-sm overflow-hidden group reveal-hidden delay-200 cursor-pointer bg-[#0D1410]">
            <div className="relative h-52 article-img-wrap">
              <AppImage
                src={articles[2].image}
                alt={articles[2].alt}
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 768px) 100vw, 40vw" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1410] to-transparent" />
            </div>
            <div className="p-6">
              <span className="category-tag mb-3 inline-block">{articles[2].category}</span>
              <h3 className="font-serif text-xl font-light italic text-[#F0EDE8] leading-tight mb-2 group-hover:text-accent transition-colors duration-300">
                {articles[2].title}
              </h3>
              <p className="text-[#F0EDE8]/50 text-sm leading-relaxed mb-4 line-clamp-2">
                {articles[2].excerpt}
              </p>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="article-meta">{articles[2].date}</span>
                <Link href={articles[2].slug} className="read-more-link">
                  Read More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Cards 4 & 5 — horizontal mini cards */}
          <div className="lg:col-span-6 spotlight-card rounded-sm overflow-hidden group reveal-hidden delay-300 cursor-pointer bg-[#0D1410] flex">
            <div className="relative w-40 flex-shrink-0 article-img-wrap">
              <AppImage
                src={articles[3].image}
                alt={articles[3].alt}
                fill
                className="object-cover"
                sizes="160px" />
              
            </div>
            <div className="p-5 flex flex-col justify-between flex-1">
              <div>
                <span className="category-tag mb-2 inline-block">{articles[3].category}</span>
                <h3 className="font-serif text-base font-light italic text-[#F0EDE8] leading-snug mb-2 group-hover:text-accent transition-colors duration-300">
                  {articles[3].title}
                </h3>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="article-meta">{articles[3].date}</span>
                <Link href={articles[3].slug} className="read-more-link">
                  Read
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 spotlight-card rounded-sm overflow-hidden group reveal-hidden delay-400 cursor-pointer bg-[#0D1410] flex">
            <div className="relative w-40 flex-shrink-0 article-img-wrap">
              <AppImage
                src={articles[4].image}
                alt={articles[4].alt}
                fill
                className="object-cover"
                sizes="160px" />
              
            </div>
            <div className="p-5 flex flex-col justify-between flex-1">
              <div>
                <span className="category-tag mb-2 inline-block">{articles[4].category}</span>
                <h3 className="font-serif text-base font-light italic text-[#F0EDE8] leading-snug mb-2 group-hover:text-accent transition-colors duration-300">
                  {articles[4].title}
                </h3>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="article-meta">{articles[4].date}</span>
                <Link href={articles[4].slug} className="read-more-link">
                  Read
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>);

}