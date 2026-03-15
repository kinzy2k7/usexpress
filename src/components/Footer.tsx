import React from 'react';
import Link from 'next/link';
import AppImage from './ui/AppImage';

const footerLinks = [
{ label: 'Home', href: '/home-page' },
{ label: 'Destinations', href: '/home-page' },
{ label: 'Tips & News', href: '/home-page' },
{ label: 'Deals', href: '/home-page' }];


export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#080C0A]">
      {/* Top highlight */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo + copyright */}
          <div className="flex items-center gap-4">
            <AppImage
              src="https://img.rocket.new/generatedImages/rocket_gen_img_1cc587809-1773550619819.png"
              alt="UsExpress logo"
              width={100}
              height={28}
              className="object-contain opacity-70" />
            
            <span className="text-[11px] text-[#F0EDE8]/30 font-sans">
              © 2026 UsExpress
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-6 flex-wrap justify-center">
            {footerLinks?.map((link) =>
            <Link
              key={link?.label}
              href={link?.href}
              className="font-sans text-sm font-500 text-[#F0EDE8]/45 hover:text-[#F0EDE8] transition-colors duration-200">
              
                {link?.label}
              </Link>
            )}
          </nav>

          {/* Legal + social */}
          <div className="flex items-center gap-5">
            <Link href="/home-page" className="font-sans text-xs text-[#F0EDE8]/35 hover:text-[#F0EDE8]/70 transition-colors">
              Privacy
            </Link>
            <Link href="/home-page" className="font-sans text-xs text-[#F0EDE8]/35 hover:text-[#F0EDE8]/70 transition-colors">
              Terms
            </Link>
            {/* Social icons */}
            <div className="flex items-center gap-3 ml-2">
              <a href="#" aria-label="Twitter" className="text-[#F0EDE8]/35 hover:text-accent transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-[#F0EDE8]/35 hover:text-accent transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="text-[#F0EDE8]/35 hover:text-accent transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>);

}