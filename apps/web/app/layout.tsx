import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { MarketTicker } from '../components/MarketTicker';
import { TopHeader } from '../components/TopHeader';
import { BreakingBanner } from '../components/BreakingBanner';
import { FloatingMiniPlayer } from '../components/FloatingMiniPlayer';
import { PwaRegister } from '../components/PwaRegister';
import { getActiveBreakingAlert } from '../lib/news-service';

export const metadata: Metadata = {
  title: 'Prolific News Network | Breaking News, Latest News, Video & Live Coverage',
  description: 'Breaking news, live broadcast video streaming, investigative reporting, politics, and market coverage on Prolific News Network.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Prolific News Network',
  },
  openGraph: {
    title: 'Prolific News Network | 24/7 Digital & Broadcast News',
    description: 'High-density breaking news, real-time tickers, and live broadcast reports.',
    siteName: 'Prolific News Network',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breakingAlert = await getActiveBreakingAlert();

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#002B49" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Oswald:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white">
        <PwaRegister />
        <MarketTicker />
        <BreakingBanner initialAlert={breakingAlert} />
        <TopHeader />
        <div className="flex-1">
          {children}
        </div>
        <FloatingMiniPlayer />

        {/* Global Footer */}
        <footer className="bg-[#001A2C] text-gray-300 border-t-4 border-[#002B49] py-12 px-4 mt-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <Link href="/" className="inline-block">
                <img
                  src="/images/prolific-logo-full.svg"
                  alt="Prolific News Network - The World in View"
                  className="h-14 w-auto object-contain drop-shadow"
                />
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed">
                Prolific News Network is a 24/7 multimedia digital broadcast news platform delivering breaking news, in-depth investigative reports, live video, and financial updates.
              </p>
              <p className="text-[11px] text-gray-500">
                © {new Date().getFullYear()} Prolific News Network Media Inc. All rights reserved.
              </p>
            </div>

            <div>
              <h3 className="font-headline font-black text-xs uppercase tracking-widest text-[#FFCC00] mb-3">
                News Sections
              </h3>
              <ul className="space-y-1.5 text-xs">
                <li><a href="/category/politics" className="hover:text-white transition">Politics</a></li>
                <li><a href="/category/us" className="hover:text-white transition">U.S. News</a></li>
                <li><a href="/category/opinion" className="hover:text-white transition">Opinion</a></li>
                <li><a href="/category/entertainment" className="hover:text-white transition">Entertainment</a></li>
                <li><a href="/category/business" className="hover:text-white transition">Business & Markets</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-headline font-black text-xs uppercase tracking-widest text-[#FFCC00] mb-3">
                Shows & Features
              </h3>
              <ul className="space-y-1.5 text-xs">
                <li><a href="/watch" className="hover:text-white transition">Prolific Live Broadcast</a></li>
                <li><a href="/plus" className="hover:text-white transition">Prolific Plus (Commercial-Free)</a></li>
                <li><a href="/podcasts" className="hover:text-white transition">Audio Briefings & Podcasts</a></li>
                <li><a href="/newsletters" className="hover:text-white transition">Daily Newsletters</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-headline font-black text-xs uppercase tracking-widest text-[#FFCC00] mb-3">
                Apps & Alerts
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Never miss a breaking story. Download the Prolific News Network app or enable desktop push notifications.
              </p>
              <div className="flex gap-2">
                <button className="bg-[#002B49] hover:bg-[#003B66] text-white text-xs font-bold px-3 py-1.5 rounded transition border border-white/20">
                  iOS App
                </button>
                <button className="bg-[#002B49] hover:bg-[#003B66] text-white text-xs font-bold px-3 py-1.5 rounded transition border border-white/20">
                  Android App
                </button>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
