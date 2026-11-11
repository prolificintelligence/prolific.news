import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Newspaper, Radio, Flame, ShieldAlert, FileText, Settings, Sparkles, Share2, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getAdminSession } from '../lib/auth/server';
import { SignOutButton } from '../components/SignOutButton';

export const metadata: Metadata = {
  title: 'Prolific Newsroom Cockpit | Editorial Publishing CMS',
  description: 'Enterprise newsroom management, breaking news banner alerts, live blogs, and AI publishing copilot.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Unauthenticated: render only the bare page (the sign-in form). Middleware already blocks everything else.
  if (!session.ok && session.status === 401) {
    return (
      <html lang="en">
        <head>
          <meta name="theme-color" content="#002B49" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen bg-[#F3F4F6] p-6">{children}</body>
      </html>
    );
  }

  // Authenticated but not on the admin allowlist
  if (!session.ok) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6">
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow p-8 text-center space-y-4">
            <h1 className="font-black text-xl uppercase tracking-wider text-[#CC0000]">Access Denied</h1>
            <p className="text-sm text-gray-700">This account is not authorized to use the Prolific Newsroom Cockpit.</p>
            <SignOutButton />
          </div>
        </body>
      </html>
    );
  }

  return (

    <html lang="en">
      <head>
        <meta name="theme-color" content="#002B49" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F3F4F6]">
        {/* Newsroom Admin Navigation Bar */}
        <header className="bg-[#002B49] text-white border-b border-[#001F35] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/images/prolific-logo-compact.svg"
                alt="Prolific News Network"
                className="h-8 md:h-9 w-auto object-contain drop-shadow"
              />
              <span className="font-headline font-bold text-xs tracking-wider uppercase text-gray-300 border-l border-white/20 pl-3 hidden sm:inline-block">
                Newsroom Cockpit
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-xs font-headline font-bold uppercase tracking-wider text-gray-300">
              <Link href="/" className="hover:text-white transition flex items-center gap-1.5 text-[#FFCC00]">
                <FileText className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <Link href="/articles" className="hover:text-white transition flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5" />
                <span>Articles</span>
              </Link>
              <Link href="/live-blogs" className="hover:text-white transition flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                <span>Live Blogs</span>
              </Link>
              <Link href="/wire" className="hover:text-white transition flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFCC00]" />
                <span>Wire & AI Ingest</span>
              </Link>
              <Link href="/social" className="hover:text-white transition flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Social Syndication</span>
              </Link>
              <Link href="/analytics" className="hover:text-white transition flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Audience & Analytics</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-full font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Neon DB: Connected
            </span>
            <div className="flex items-center gap-3">
              <span className="font-bold text-white" title={session.user.email}>{session.user.name || session.user.email}</span>
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
