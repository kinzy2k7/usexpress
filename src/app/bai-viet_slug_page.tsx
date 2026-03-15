import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt, meta_title, meta_description, image')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!data) return { title: 'Bài viết không tồn tại' };

  return {
    title: data.meta_title || data.title,
    description: data.meta_description || data.excerpt,
    openGraph: {
      title: data.meta_title || data.title,
      description: data.meta_description || data.excerpt,
      images: data.image ? [data.image] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!article) notFound();

  // Increment views
  await supabase
    .from('articles')
    .update({ views: (article.views || 0) + 1 })
    .eq('id', article.id);

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        day: 'numeric', month: 'long', year: 'numeric',
      }).format(new Date(iso));
    } catch { return iso.split('T')[0]; }
  };

  return (
    <main className="min-h-screen bg-[#080C0A] text-[#F0EDE8]">
      <Header />

      {/* Hero image */}
      <div className="relative h-[60vh] min-h-[400px] w-full mt-0">
        {article.image ? (
          <>
            <AppImage
              src={article.image}
              alt={article.title}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080C0A] via-[#080C0A]/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#0D1410]" />
        )}
      </div>

      {/* Article content */}
      <div className="max-w-3xl mx-auto px-6 -mt-32 relative z-10 pb-24">
        {/* Category */}
        <div className="mb-4">
          <span className="category-tag">{article.category}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-5xl font-light italic text-[#F0EDE8] leading-tight mb-6">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-white/[0.08] article-meta">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1A6B4A]/20 flex items-center justify-center text-sm font-serif text-[#1A6B4A]">
              {article.author?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="text-sm text-[#F0EDE8]/70">{article.author}</span>
          </div>
          <span className="text-[#F0EDE8]/20">·</span>
          <span>{formatDate(article.created_at)}</span>
          <span className="text-[#F0EDE8]/20">·</span>
          <span>👁 {(article.views || 0).toLocaleString()} lượt xem</span>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-[#F0EDE8]/70 text-lg font-light leading-relaxed mb-8 italic border-l-2 border-[#1A6B4A]/40 pl-4">
            {article.excerpt}
          </p>
        )}

        {/* Content */}
        {article.content ? (
          <div
            className="article-body text-[#F0EDE8]/80 font-sans text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <p className="text-[#F0EDE8]/30 italic">Bài viết chưa có nội dung.</p>
        )}

        {/* Back */}
        <div className="mt-16 pt-8 border-t border-white/[0.08]">
          <Link href="/home-page" className="read-more-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Quay lại trang chủ
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .article-body h1 { font-size: 1.6em; font-weight: 700; margin: 0.75em 0 0.4em; font-family: Georgia, serif; color: #F0EDE8; }
        .article-body h2 { font-size: 1.35em; font-weight: 700; margin: 0.7em 0 0.35em; font-family: Georgia, serif; color: #F0EDE8; }
        .article-body h3 { font-size: 1.15em; font-weight: 600; margin: 0.6em 0 0.3em; color: #F0EDE8; }
        .article-body p { margin: 0.75em 0; }
        .article-body strong, .article-body b { font-weight: 700; color: #F0EDE8; }
        .article-body em, .article-body i { font-style: italic; }
        .article-body ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .article-body ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .article-body li { margin: 0.3em 0; }
        .article-body blockquote { border-left: 3px solid #1A6B4A; padding: 0.5em 1em; margin: 1em 0; color: rgba(240,237,232,0.65); font-style: italic; background: rgba(26,107,74,0.08); border-radius: 0 6px 6px 0; }
        .article-body a { color: #2A8B62; text-decoration: underline; }
        .article-body hr { border: none; border-top: 1px solid rgba(240,237,232,0.12); margin: 1.5em 0; }
        .article-body img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; display: block; }
      `}</style>

      <Footer />
    </main>
  );
}
