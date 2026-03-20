'use client';

// Analytics stubs — no tracking active
export function trackPageView(_url: string) {}

export function trackArticleView(_params: {
  articleId: string;
  articleTitle: string;
  category?: string;
  author?: string;
}) {}

export function trackScrollDepth(_depth: number, _articleTitle?: string) {}

export function trackCategoryClick(_category: string) {}

export function trackLinkClick(_label: string, _destination: string) {}

export function trackSearch(_query: string) {}

export function trackEvent(_eventName: string, _params: Record<string, unknown> = {}) {}
