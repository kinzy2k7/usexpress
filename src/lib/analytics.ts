'use client';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function trackPageView(url: string) {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'page_view', {
    page_path: url,
    send_to: GA_MEASUREMENT_ID,
  });
}

// Track article view with article metadata
export function trackArticleView(params: {
  articleId: string;
  articleTitle: string;
  category?: string;
  author?: string;
}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'article_view', {
    event_category: 'engagement',
    article_id: params.articleId,
    article_title: params.articleTitle,
    article_category: params.category || 'uncategorized',
    article_author: params.author || 'unknown',
  });
}

// Track reader engagement (scroll depth, time on page)
export function trackScrollDepth(depth: number, articleTitle?: string) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'scroll_depth', {
    event_category: 'engagement',
    scroll_percentage: depth,
    article_title: articleTitle || '',
  });
}

// Track category click / popularity
export function trackCategoryClick(category: string) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'category_click', {
    event_category: 'navigation',
    category_name: category,
  });
}

// Track outbound / internal link clicks
export function trackLinkClick(label: string, destination: string) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'link_click', {
    event_category: 'engagement',
    link_label: label,
    link_destination: destination,
  });
}

// Track search queries
export function trackSearch(query: string) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'search', {
    search_term: query,
  });
}

// Generic event tracker
export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, params);
}
