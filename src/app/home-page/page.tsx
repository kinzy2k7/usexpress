import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import ArticleBentoGrid from './components/ArticleBentoGrid';
import RegionStrip from './components/RegionStrip';
import ArticleListWithSidebar from './components/ArticleListWithSidebar';
import ExploreMoreCTA from './components/ExploreMoreCTA';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080C0A] text-[#F0EDE8] overflow-x-hidden">
      <Header />
      <HeroSection />
      <ArticleBentoGrid />
      <RegionStrip />
      <ArticleListWithSidebar />
      <ExploreMoreCTA />
      <Footer />
    </main>
  );
}