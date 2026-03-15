'use client';
import React from 'react';

interface ArticlePreviewProps {
  title: string;
  author: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  metaTitle: string;
  metaDescription: string;
  onClose: () => void;
}

export default function ArticlePreview({
  title, author, category, excerpt, content, image, metaTitle, metaDescription, onClose
}: ArticlePreviewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl bg-[#0D1410] border border-white/[0.1] rounded-xl shadow-2xl">
        {/* Preview Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] sticky top-0 bg-[#0D1410] z-10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
            <span className="text-sm font-sans text-[#F0EDE8]/60">Xem trước bài viết</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs text-[#F0EDE8]/50 hover:text-[#F0EDE8] transition-colors border border-white/[0.08] hover:border-white/[0.2] px-3 py-1.5 rounded-md font-sans"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Đóng
          </button>
        </div>

        {/* SEO Preview */}
        {(metaTitle || metaDescription) && (
          <div className="mx-6 mt-5 p-4 bg-white/[0.03] border border-white/[0.07] rounded-lg">
            <div className="text-xs font-sans font-600 uppercase tracking-wider text-[#F0EDE8]/30 mb-2">SEO Preview</div>
            <div className="text-[#4285F4] text-sm font-sans truncate">{metaTitle || title}</div>
            <div className="text-[#1A6B4A] text-xs font-sans mt-0.5">usexpress.com › {category?.toLowerCase()}</div>
            <div className="text-[#F0EDE8]/50 text-xs font-sans mt-1 line-clamp-2">{metaDescription || excerpt}</div>
          </div>
        )}

        {/* Article Content */}
        <article className="px-6 pb-8 pt-5">
          {/* Category */}
          <div className="mb-3">
            <span className="text-xs font-sans font-600 uppercase tracking-[0.12em] text-[#1A6B4A]">{category}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl md:text-3xl text-[#F0EDE8] leading-tight mb-4">
            {title || <span className="text-[#F0EDE8]/25 italic">Chưa có tiêu đề</span>}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1A6B4A]/20 flex items-center justify-center text-xs font-serif text-[#1A6B4A]">
                {author?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-sans text-[#F0EDE8]/60">{author || 'Tác giả'}</span>
            </div>
            <span className="text-[#F0EDE8]/20">·</span>
            <span className="text-xs font-sans text-[#F0EDE8]/40">
              {new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Thumbnail */}
          {image && (
            <div className="mb-6 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={title} className="w-full h-56 object-cover" />
            </div>
          )}

          {/* Excerpt */}
          {excerpt && (
            <p className="text-[#F0EDE8]/70 font-sans text-base leading-relaxed mb-5 italic border-l-2 border-[#1A6B4A]/40 pl-4">
              {excerpt}
            </p>
          )}

          {/* Content */}
          {content ? (
            <div
              className="prose-preview text-[#F0EDE8]/80 font-sans text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-[#F0EDE8]/25 italic font-sans text-sm">Chưa có nội dung bài viết...</p>
          )}
        </article>

        <style jsx global>{`
          .prose-preview h1 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0 0.4em; font-family: Georgia, serif; color: #F0EDE8; }
          .prose-preview h2 { font-size: 1.25em; font-weight: 700; margin: 0.7em 0 0.35em; font-family: Georgia, serif; color: #F0EDE8; }
          .prose-preview h3 { font-size: 1.1em; font-weight: 600; margin: 0.6em 0 0.3em; color: #F0EDE8; }
          .prose-preview p { margin: 0.6em 0; }
          .prose-preview strong, .prose-preview b { font-weight: 700; color: #F0EDE8; }
          .prose-preview em, .prose-preview i { font-style: italic; }
          .prose-preview ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
          .prose-preview ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
          .prose-preview li { margin: 0.25em 0; }
          .prose-preview blockquote { border-left: 3px solid #1A6B4A; padding: 0.5em 1em; margin: 0.75em 0; color: rgba(240,237,232,0.65); font-style: italic; background: rgba(26,107,74,0.08); border-radius: 0 6px 6px 0; }
          .prose-preview a { color: #1A6B4A; text-decoration: underline; }
          .prose-preview hr { border: none; border-top: 1px solid rgba(240,237,232,0.12); margin: 1em 0; }
          .prose-preview img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; display: block; }
        `}</style>
      </div>
    </div>
  );
}
