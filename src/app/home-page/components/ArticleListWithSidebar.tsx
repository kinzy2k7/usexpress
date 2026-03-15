'use client';
import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { trackArticleView, trackCategoryClick, trackSearch } from '@/lib/analytics';

interface Article {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  alt: string;
}

const moreArticles: Article[] = [
{
  title: 'Insurance',
  excerpt: 'Discover peace of mind with EKTA: your ultimate travel insurance companion. Why EKTA is the travel insurance you need before your next journey.',
  date: '12 April 2024',
  category: 'Tips & News',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_102756a5a-1772238775891.png",
  alt: 'Travel insurance documents and passport on a wooden table'
},
{
  title: 'Hotels & Accommodations',
  excerpt: 'Unveiling the best hotel booking platforms for every traveler: Trip.com, SuperTravel, Hilton Honors via Points.com, and HotelLook.',
  date: '12 April 2024',
  category: 'Deals & Bookings',
  image: "https://images.unsplash.com/photo-1646991761123-d83ce47c30c9",
  alt: 'Luxurious hotel lobby with modern interior design and warm lighting'
},
{
  title: 'Flights',
  excerpt: 'Discover affordable flights with ease. A comprehensive guide to the best booking platforms and how to find the perfect deal.',
  date: '12 April 2024',
  category: 'Deals & Bookings',
  image: "https://images.unsplash.com/photo-1643615671736-a626e24e4876",
  alt: 'Commercial airplane flying above clouds at sunset'
},
{
  title: 'Car & Bike Rental',
  excerpt: 'Discover the ultimate guide to car and bike rentals for your next adventure. Whether exploring winding roads by car or feeling the wind on a bike.',
  date: '8 April 2024',
  category: 'Deals & Bookings',
  image: "https://images.unsplash.com/photo-1729119028736-78d1ea52dc86",
  alt: 'Rental car on a scenic coastal road with ocean views'
},
{
  title: '10 Underrated Travel Destinations You Should Visit',
  excerpt: 'While famous cities and tourist hotspots are often at the top of every travel bucket list, some of the world\'s most amazing places remain undiscovered.',
  date: '4 October 2024',
  category: 'Destinations',
  image: "https://images.unsplash.com/photo-1512049091220-bd3e73fcb409",
  alt: 'Hidden paradise beach with crystal clear water and palm trees'
}];


const archives = [
{ label: 'October 2024', count: 1 },
{ label: 'May 2024', count: 1 },
{ label: 'April 2024', count: 8 },
{ label: 'February 2024', count: 2 },
{ label: 'January 2024', count: 3 },
{ label: 'December 2023', count: 4 },
{ label: 'November 2023', count: 2 }];


export default function ArticleListWithSidebar() {
  const sectionRef = useRef<HTMLElement>(null);
  const [searchValue, setSearchValue] = React.useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const els = entry.target.querySelectorAll('.reveal-hidden');
            els.forEach((el, i) => {
              setTimeout(() => el.classList.add('revealed'), i * 80);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Spotlight
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

  const handleArticleClick = (article: Article) => {
    trackArticleView({
      articleId: article.title.toLowerCase().replace(/\s+/g, '-'),
      articleTitle: article.title,
      category: article.category,
      author: 'UsExpress',
    });
    trackCategoryClick(article.category);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      trackSearch(searchValue.trim());
    }
  };

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-12 lg:px-24 bg-[#080C0A]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* Main article list */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-10 reveal-hidden">
              <h2 className="font-serif text-3xl md:text-4xl font-light italic text-[#F0EDE8]">
                More <span className="not-italic font-normal text-accent">Articles</span>
              </h2>
              <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary-light font-600">
                Page 1 of 6
              </span>
            </div>

            <div className="space-y-6">
              {moreArticles.map((article, i) =>
              <article
                key={article.title}
                onClick={() => handleArticleClick(article)}
                className={`spotlight-card rounded-sm bg-[#0D1410] overflow-hidden group reveal-hidden cursor-pointer flex gap-0 md:gap-0 flex-col md:flex-row`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                
                  {/* Image */}
                  <div className="relative w-full md:w-56 flex-shrink-0 h-48 md:h-auto article-img-wrap">
                    <AppImage
                    src={article.image}
                    alt={article.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 224px" />
                  
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D1410]/20" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-between p-6 flex-1">
                    <div>
                      <span className="category-tag mb-3 inline-block">{article.category}</span>
                      <h3 className="font-serif text-xl font-light italic text-[#F0EDE8] leading-snug mb-3 group-hover:text-accent transition-colors duration-300">
                        {article.title}
                      </h3>
                      <p className="text-[#F0EDE8]/50 text-sm leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center gap-3 article-meta">
                        <span>{article.date}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>UsExpress</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>0 Comments</span>
                      </div>
                      <Link href="/home-page" className="read-more-link">
                        Read More
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2 mt-12 reveal-hidden">
              <span className="article-meta mr-2">Page 1 of 6</span>
              {[1, 2, '…', 6].map((page, i) =>
              <button
                key={i}
                className={`page-btn ${page === 1 ? 'active' : ''}`}>
                
                  {page}
                </button>
              )}
              <button className="page-btn flex items-center gap-1 px-3 w-auto">
                Next
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">

            {/* Search */}
            <div className="spotlight-card rounded-sm bg-[#0D1410] p-6 reveal-hidden">
              <h3 className="font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light mb-5">
                Search
              </h3>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search articles..."
                  className="search-input flex-1 rounded-sm px-4 py-2.5 text-sm" />
                
                <button type="submit" className="bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-sm transition-colors duration-200 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Archives */}
            <div className="spotlight-card rounded-sm bg-[#0D1410] p-6 reveal-hidden delay-100">
              <h3 className="font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light mb-5">
                Archives
              </h3>
              <ul className="space-y-1">
                {archives.map((archive) =>
                <li key={archive.label}>
                    <Link
                    href="/home-page"
                    className="flex items-center justify-between py-2.5 px-3 rounded-sm hover:bg-white/[0.04] transition-colors duration-200 group">
                    
                      <span className="font-sans text-sm text-[#F0EDE8]/60 group-hover:text-[#F0EDE8] transition-colors duration-200">
                        {archive.label}
                      </span>
                      <span className="font-sans text-xs text-primary-light font-500">
                        ({archive.count})
                      </span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Meta */}
            <div className="spotlight-card rounded-sm bg-[#0D1410] p-6 reveal-hidden delay-200">
              <h3 className="font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light mb-5">
                Meta
              </h3>
              <Link
                href="/home-page"
                className="flex items-center gap-2 font-sans text-sm text-[#F0EDE8]/60 hover:text-accent transition-colors duration-200">
                
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" />
                </svg>
                Log in
              </Link>
            </div>

            {/* Featured topics */}
            <div className="spotlight-card rounded-sm bg-[#0D1410] p-6 reveal-hidden delay-300">
              <h3 className="font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light mb-5">
                Popular Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Flights', 'Hotels', 'Insurance', 'SIM Cards', 'Car Rental', 'Tours', 'Trains', 'Airports'].map((tag) =>
                <Link
                  key={tag}
                  href="/home-page"
                  className="region-pill text-[10px]">
                  
                    {tag}
                  </Link>
                )}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </section>);

}