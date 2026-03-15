import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import '../styles/tailwind.css';
import { AuthProvider } from '@/contexts/AuthContext';
import GoogleAnalytics from '@/components/GoogleAnalytics';

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
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <AuthProvider>
          {children}
        </AuthProvider>
</body>
    </html>
  );
}