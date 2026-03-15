'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';


const navLinks = [
{ label: 'Home', href: '/home-page' },
{ label: 'Destinations', href: '/home-page' },
{ label: 'Deals & Bookings', href: '/home-page' },
{ label: 'Tips & News', href: '/home-page' },
{ label: 'Shop', href: '/home-page' }];


const languages = [
{ code: 'EN', label: 'English' },
{ code: 'FR', label: 'Français' },
{ code: 'IT', label: 'Italiano' },
{ code: 'ES', label: 'Español' }];


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('EN');
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ?
      'nav-blur border-b border-white/[0.06] py-3' :
      'bg-transparent py-5'}`
      }>
      
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/home-page" className="flex-shrink-0 flex items-center gap-3">
          <span className="font-serif text-xl text-[#F0EDE8] tracking-wide">
            UsExpress
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) =>
          <Link
            key={link.label}
            href={link.href}
            className="font-sans text-sm font-500 text-[#F0EDE8]/65 hover:text-[#F0EDE8] transition-colors duration-200 tracking-wide relative group">
            
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
            </Link>
          )}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-4">

          {/* Language switcher */}
          <div ref={langRef} className="relative hidden md:block">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 font-sans text-xs font-600 tracking-[0.1em] uppercase text-[#F0EDE8]/60 hover:text-[#F0EDE8] transition-colors duration-200 px-2 py-1">
              
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {activeLang}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {langOpen &&
            <div className="lang-dropdown">
                {languages.map((lang) =>
              <button
                key={lang.code}
                onClick={() => {setActiveLang(lang.code);setLangOpen(false);}}
                className={`w-full text-left px-4 py-2.5 font-sans text-sm transition-colors duration-150 flex items-center justify-between ${
                activeLang === lang.code ?
                'text-accent bg-primary/10' : 'text-[#F0EDE8]/60 hover:text-[#F0EDE8] hover:bg-white/[0.04]'}`
                }>
                
                    {lang.label}
                    {activeLang === lang.code &&
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                }
                  </button>
              )}
              </div>
            }
          </div>

          {/* Cart */}
          <Link href="/home-page" className="hidden md:flex items-center text-[#F0EDE8]/60 hover:text-[#F0EDE8] transition-colors duration-200 relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
            </svg>
          </Link>

          {/* My Account */}
          <Link
            href="/login"
            className="hidden md:inline-flex items-center gap-2 font-sans text-xs font-600 tracking-[0.08em] uppercase text-[#F0EDE8]/60 hover:text-[#F0EDE8] border border-white/[0.12] hover:border-primary/50 px-4 py-2 rounded-sm transition-all duration-200">
            
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Login
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-[#F0EDE8]/70 hover:text-[#F0EDE8] transition-colors p-1"
            aria-label="Toggle mobile menu">
            
            {mobileOpen ?
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg> :

            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen &&
      <div className="lg:hidden nav-blur border-t border-white/[0.06] px-6 py-6 space-y-4">
          {navLinks.map((link) =>
        <Link
          key={link.label}
          href={link.href}
          onClick={() => setMobileOpen(false)}
          className="block font-sans text-base font-500 text-[#F0EDE8]/70 hover:text-[#F0EDE8] py-2 border-b border-white/[0.05] transition-colors">
          
              {link.label}
            </Link>
        )}
          <div className="flex items-center gap-3 pt-2">
            {languages.map((lang) =>
          <button
            key={lang.code}
            onClick={() => setActiveLang(lang.code)}
            className={`font-sans text-xs font-600 tracking-widest uppercase px-3 py-1.5 rounded-sm border transition-all ${
            activeLang === lang.code ?
            'border-primary bg-primary/20 text-accent' : 'border-white/10 text-[#F0EDE8]/50 hover:border-white/20'}`
            }>
            
                {lang.code}
              </button>
          )}
          </div>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 font-sans text-sm font-600 tracking-[0.08em] uppercase text-[#F0EDE8]/70 hover:text-[#F0EDE8] border border-white/[0.12] hover:border-primary/50 px-4 py-2.5 rounded-sm transition-all duration-200 w-full justify-center mt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Login
          </Link>
        </div>
      }
    </header>);

}