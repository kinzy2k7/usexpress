import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import '../styles/tailwind.css';
import { AuthProvider } from '@/contexts/AuthContext';
import AdterraBanner from '@/components/AdterraBanner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'UsExpress — Your Adventure Starts Here',
  description: 'Discover curated travel articles, destination guides, and practical tips for planning the perfect adventure anywhere in the world.',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://pl28947705.profitablecpmratenetwork.com/e8/3b/7c/e83b7cacb0460996530608093a9e92d3.js"></script>
      </head>
      <body>
        <Suspense fallback={null}>
          <AdterraBanner />
        </Suspense>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}