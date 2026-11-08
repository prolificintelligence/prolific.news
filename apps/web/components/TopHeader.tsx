import React from 'react';
import Link from 'next/link';
import { Play, Search, User, Radio, Flame } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Politics', href: '/category/politics' },
  { name: 'U.S.', href: '/category/us' },
  { name: 'Opinion', href: '/category/opinion' },
  { name: 'Entertainment', href: '/category/entertainment' },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Lifestyle', href: '/category/lifestyle' },
  { name: 'Business', href: '/category/business' },
  { name: 'World', href: '/category/world' },
  { name: 'Tech', href: '/category/tech' },
  { name: 'Archive', href: '/archive' },
];

export function TopHeader() {
  return (
    <header className="w-full bg-[#002B49] text-white border-b border-[#001F35] shadow-sm sticky top-0 z-50">
      {/* Upper Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/images/prolific-logo-compact.svg"
              alt="Prolific News Network"
              className="h-10 md:h-12 w-auto object-contain transition group-hover:brightness-110 drop-shadow-md"
            />
          </Link>
        </div>

        {/* Action Controls & Live Video Link */}
        <div className="flex items-center gap-3">
          {/* Watch Live Pill */}
          <Link
            href="/watch"
            className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#B30000] text-white px-3.5 py-1.5 rounded font-headline font-bold text-xs tracking-wider uppercase transition shadow-sm"
          >
            <Radio className="w-4 h-4 animate-pulse text-white" />
            <span className="hidden sm:inline">Watch Live</span>
          </Link>

          {/* Prolific Plus Subscription Link (Fox Nation model) */}
          <Link
            href="/plus"
            className="flex items-center gap-1.5 bg-[#FFCC00] hover:bg-[#E6B800] text-[#002B49] px-3 py-1.5 rounded font-headline font-black text-xs tracking-wider uppercase transition"
          >
            <Flame className="w-3.5 h-3.5 fill-[#002B49]" />
            <span>Prolific Plus</span>
          </Link>

          {/* Search */}
          <Link
            href="/search"
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition"
            title="Search Prolific News"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* User Account */}
          <Link
            href="/login"
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition"
            title="User Profile"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Primary Category Navigation Bar */}
      <nav className="border-t border-[#003B66] bg-[#00233D] px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-6 text-xs font-headline font-bold uppercase tracking-wider">
          <div className="flex items-center gap-6 whitespace-nowrap">
            <Link href="/" className="text-white hover:text-[#FFCC00] transition">
              Home
            </Link>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <Link
            href="/live/presidential-election-briefing"
            className="flex items-center gap-1.5 text-[#FFCC00] hover:underline whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-[#FFCC00] animate-ping"></span>
            <span>Live Coverage</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
