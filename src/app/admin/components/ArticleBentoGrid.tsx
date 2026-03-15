'use client';
import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  created_at: string;
  category: string;
  image: string;
  slug: string;
  author: string;
}

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch { return ''; }
};

export default function ArticleBentoGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('articles')
      .select('id, title, excerpt, created_at, category, image, slug, author')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setArticles(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const els = entry.target.querySelectorAll('.reveal-hidden');
            els.forEach((el, i) => setTimeout(() => el.classList.add('revealed'), i * 100));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [articles]);

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

  const articleLink = (a: Article) => a.slug ? `/bai-viet/${a.slug}` : '#';

  if (loading) {
    return (
      <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-[#080C0A] bg-grid">
        <div className="max-w-[1440px] mx-auto text-center text-[#F0EDE8]/30 font-sans text-sm py-20">Đang tải bài viết...</div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-[#080C0A] bg-grid">
        <div className="max-w-[1440px] mx-auto text-center text-[#F0EDE8]/30 font-sans text-sm py-20">Chưa có bài viết nào được đăng.</div>
      </section>
    );
  }

  return (
    <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-[#080C0A] bg-grid">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-14 reveal-hidden">
          <div>
            <span className="block font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light mb-3">Latest Articles</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light italic text-[#F0EDE8]">
              Stories Worth <span className="not-italic font-normal text-accent">Reading</span>
            </h2>
          </div>
          <Link href="/home-page" className="hidden md:flex read-more-link">
            View All Articles
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-auto">

          {articles[0] && (
            <Link href={articleLink(articles[0])} className="lg:col-span-7 lg:row-span-2 spotlight-card rounded-sm overflow-hidden group reveal-hidden cursor-pointer block">
              <div className="relative h-72 md:h-96 lg:h-full min-h-[380px] article-img-wrap">
                <AppImage src={articles[0].image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'} alt={articles[0].title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 60vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080C0A] via-[#080C0A]/30 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <span className="category-tag mb-4 w-fit">{articles[0].category}</span>
                  <h3 className="font-serif text-2xl md:text-3xl font-light italic text-[#F0EDE8] leading-tight mb-3 group-hover:text-accent transition-colors duration-300">{articles[0].title}</h3>
                  <p className="text-[#F0EDE8]/55 text-sm leading-relaxed mb-5 max-w-md line-clamp-2">{articles[0].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="article-meta">{formatDate(articles[0].created_at)}</span>
                    <span className="read-more-link">Read More <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {articles[1] && (
            <Link href={articleLink(articles[1])} className="lg:col-span-5 spotlight-card rounded-sm overflow-hidden group reveal-hidden delay-100 cursor-pointer bg-[#0D1410] block">
              <div className="relative h-52 article-img-wrap">
                <AppImage src={articles[1].image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'} alt={articles[1].title} fill className="object-cover opacity-80" sizes="40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1410] to-transparent" />
              </div>
              <div className="p-6">
                <span className="category-tag mb-3 inline-block">{articles[1].category}</span>
                <h3 className="font-serif text-xl font-light italic text-[#F0EDE8] leading-tight mb-2 group-hover:text-accent transition-colors duration-300">{articles[1].title}</h3>
                <p className="text-[#F0EDE8]/50 text-sm leading-relaxed mb-4 line-clamp-2">{articles[1].excerpt}</p>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="article-meta">{formatDate(articles[1].created_at)}</span>
                  <span className="read-more-link">Read More <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span>
                </div>
              </div>
            </Link>
          )}

          {articles[2] && (
            <Link href={articleLink(articles[2])} className="lg:col-span-5 spotlight-card rounded-sm overflow-hidden group reveal-hidden delay-200 cursor-pointer bg-[#0D1410] block">
              <div className="relative h-52 article-img-wrap">
                <AppImage src={articles[2].image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'} alt={articles[2].title} fill className="object-cover opacity-80" sizes="40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1410] to-transparent" />
              </div>
              <div className="p-6">
                <span className="category-tag mb-3 inline-block">{articles[2].category}</span>
                <h3 className="font-serif text-xl font-light italic text-[#F0EDE8] leading-tight mb-2 group-hover:text-accent transition-colors duration-300">{articles[2].title}</h3>
                <p className="text-[#F0EDE8]/50 text-sm leading-relaxed mb-4 line-clamp-2">{articles[2].excerpt}</p>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="article-meta">{formatDate(articles[2].created_at)}</span>
                  <span className="read-more-link">Read More <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span>
                </div>
              </div>
            </Link>
          )}

          {articles[3] && (
            <Link href={articleLink(articles[3])} className="lg:col-span-6 spotlight-card rounded-sm overflow-hidden group reveal-hidden delay-300 cursor-pointer bg-[#0D1410] flex block">
              <div className="relative w-40 flex-shrink-0 article-img-wrap">
                <AppImage src={articles[3].image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'} alt={articles[3].title} fill className="object-cover" sizes="160px" />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <span className="category-tag mb-2 inline-block">{articles[3].category}</span>
                  <h3 className="font-serif text-base font-light italic text-[#F0EDE8] leading-snug mb-2 group-hover:text-accent transition-colors duration-300 line-clamp-2">{articles[3].title}</h3>
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="article-meta">{formatDate(articles[3].created_at)}</span>
                  <span className="read-more-link">Read <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span>
                </div>
              </div>
            </Link>
          )}

          {articles[4] && (
            <Link href={articleLink(articles[4])} className="lg:col-span-6 spotlight-card rounded-sm overflow-hidden group reveal-hidden delay-400 cursor-pointer bg-[#0D1410] flex block">
              <div className="relative w-40 flex-shrink-0 article-img-wrap">
                <AppImage src={articles[4].image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'} alt={articles[4].title} fill className="object-cover" sizes="160px" />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <span className="category-tag mb-2 inline-block">{articles[4].category}</span>
                  <h3 className="font-serif text-base font-light italic text-[#F0EDE8] leading-snug mb-2 group-hover:text-accent transition-colors duration-300 line-clamp-2">{articles[4].title}</h3>
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="article-meta">{formatDate(articles[4].created_at)}</span>
                  <span className="read-more-link">Read <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span>
                </div>
              </div>
            </Link>
          )}

        </div>
      </div>
    </section>
  );
}
