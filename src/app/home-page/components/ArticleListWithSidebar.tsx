'use client';
import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { trackArticleView, trackSearch } from '@/lib/analytics';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  created_at: string;
  category: string;
  image: string;
  slug: string;
  author: string;
  views: number;
}

const ITEMS_PER_PAGE = 6;

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch { return ''; }
};

const archives = [
  { label: 'October 2024', count: 1 },
  { label: 'May 2024', count: 1 },
  { label: 'April 2024', count: 8 },
  { label: 'February 2024', count: 2 },
  { label: 'January 2024', count: 3 },
  { label: 'December 2023', count: 4 },
  { label: 'November 2023', count: 2 },
];

export default function ArticleListWithSidebar() {
  const sectionRef = useRef<HTMLElement>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    const supabase = createClient();
    setLoading(true);

    let query = supabase
      .from('articles')
      .select('id, title, excerpt, created_at, category, image, slug, author, views', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

    if (searchQuery.trim()) {
      query = query.ilike('title', `%${searchQuery.trim()}%`);
    }

    query.then(({ data, count }) => {
      if (data) setArticles(data);
      if (count !== null) setTotal(count);
      setLoading(false);
    });
  }, [page, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const els = entry.target.querySelectorAll('.reveal-hidden');
            els.forEach((el, i) => setTimeout(() => el.classList.add('revealed'), i * 80));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) trackSearch(searchValue.trim());
    setSearchQuery(searchValue);
    setPage(1);
  };

  const articleLink = (a: Article) => a.slug ? `/bai-viet/${a.slug}` : '#';

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
              {totalPages > 0 && (
                <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary-light font-600">
                  Page {page} of {totalPages}
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-16 text-[#F0EDE8]/30 font-sans text-sm">Đang tải...</div>
            ) : articles.length === 0 ? (
              <div className="text-center py-16 text-[#F0EDE8]/30 font-sans text-sm">
                {searchQuery ? `Không tìm thấy bài viết nào cho "${searchQuery}".` : 'Chưa có bài viết nào.'}
              </div>
            ) : (
              <div className="space-y-6">
                {articles.map((article, i) => (
                  <Link
                    key={article.id}
                    href={articleLink(article)}
                    onClick={() => trackArticleView({ articleId: article.id, articleTitle: article.title, category: article.category, author: article.author })}
                    className="spotlight-card rounded-sm bg-[#0D1410] overflow-hidden group reveal-hidden flex flex-col md:flex-row block"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="relative w-full md:w-56 flex-shrink-0 h-48 md:h-auto article-img-wrap">
                      <AppImage
                        src={article.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 224px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D1410]/20" />
                    </div>
                    <div className="flex flex-col justify-between p-6 flex-1">
                      <div>
                        <span className="category-tag mb-3 inline-block">{article.category}</span>
                        <h3 className="font-serif text-xl font-light italic text-[#F0EDE8] leading-snug mb-3 group-hover:text-accent transition-colors duration-300">
                          {article.title}
                        </h3>
                        <p className="text-[#F0EDE8]/50 text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
                      </div>
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
                        <div className="flex items-center gap-3 article-meta">
                          <span>{formatDate(article.created_at)}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span>{article.author}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span>👁 {(article.views || 0).toLocaleString()}</span>
                        </div>
                        <span className="read-more-link">
                          Read More
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Adterra Native Banner */}
            <div className="my-10">
              <script async={true} data-cfasync="false" src="https://pl28947740.profitablecpmratenetwork.com/437909299f4e12dae182bd31bf5322f4/invoke.js"></script>
              <div id="container-437909299f4e12dae182bd31bf5322f4"></div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2 mt-12 reveal-hidden flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="page-btn flex items-center gap-1 px-3 w-auto disabled:opacity-30"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`page-btn ${p === page ? 'active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="page-btn flex items-center gap-1 px-3 w-auto disabled:opacity-30"
                >
                  Next
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">

            {/* Search */}
            <div className="spotlight-card rounded-sm bg-[#0D1410] p-6 reveal-hidden">
              <h3 className="font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light mb-5">Search</h3>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search articles..."
                  className="search-input flex-1 rounded-sm px-4 py-2.5 text-sm"
                />
                <button type="submit" className="bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-sm transition-colors duration-200 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Archives */}
            <div className="spotlight-card rounded-sm bg-[#0D1410] p-6 reveal-hidden delay-100">
              <h3 className="font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light mb-5">Archives</h3>
              <ul className="space-y-1">
                {archives.map((archive) => (
                  <li key={archive.label}>
                    <button
                      onClick={() => { setSearchQuery(''); setPage(1); }}
                      className="flex items-center justify-between w-full py-2.5 px-3 rounded-sm hover:bg-white/[0.04] transition-colors duration-200 group"
                    >
                      <span className="font-sans text-sm text-[#F0EDE8]/60 group-hover:text-[#F0EDE8] transition-colors duration-200">{archive.label}</span>
                      <span className="font-sans text-xs text-primary-light font-500">({archive.count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Meta */}
            <div className="spotlight-card rounded-sm bg-[#0D1410] p-6 reveal-hidden delay-200">
              <h3 className="font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light mb-5">Meta</h3>
              <Link href="/login" className="flex items-center gap-2 font-sans text-sm text-[#F0EDE8]/60 hover:text-accent transition-colors duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" />
                </svg>
                Log in
              </Link>
            </div>

            {/* Popular Topics */}
            <div className="spotlight-card rounded-sm bg-[#0D1410] p-6 reveal-hidden delay-300">
              <h3 className="font-sans text-[10px] font-600 tracking-[0.25em] uppercase text-primary-light mb-5">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                {['Flights', 'Hotels', 'Insurance', 'SIM Cards', 'Car Rental', 'Tours', 'Trains', 'Airports'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); setPage(1); }}
                    className="region-pill text-[10px]"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </section>
  );
}
