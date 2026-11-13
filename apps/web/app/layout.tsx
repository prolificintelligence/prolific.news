import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import './globals.css';
import { MarketTicker } from '../components/MarketTicker';
import { TopHeader } from '../components/TopHeader';
import { BreakingBanner } from '../components/BreakingBanner';
import { FloatingMiniPlayer } from '../components/FloatingMiniPlayer';
import { PwaRegister } from '../components/PwaRegister';
import { SocialLinks } from '../components/SocialLinks';
import { SOCIAL_LINKS } from '../lib/site';
import { Analytics } from '@vercel/analytics/next';
import { TelemetryTracker } from '../components/TelemetryTracker';
import { getActiveBreakingAlert } from '../lib/news-service';

export const metadata: Metadata = {
  metadataBase: new URL('https://prolific.news'),
  title: {
    default: 'Prolific News Network (PNN) | 24/7 Global Breaking News, Markets & Regional Bureaus',
    template: '%s | Prolific News Network',
  },
  description:
    '24/7 global broadcast news, algorithmic high-impact reporting, Wall Street market intelligence, and regional bureaus across U.S., World, Africa, Asia, and Latin America on Prolific News Network (PNN).',
  keywords: [
    'Prolific News Network',
    'PNN',
    'prolific.news',
    'breaking news',
    'live news broadcast',
    'global markets',
    'Africa news',
    'Asia news',
    'Latin America news',
    'geopolitics',
  ],
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://prolific.news',
    types: {
      'application/rss+xml': 'https://prolific.news/feed.xml',
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
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
    title: 'Prolific News Network (PNN) | 24/7 Digital & Broadcast News',
    description:
      'High-density breaking news, real-time market tickers, regional Africa/Asia/LatAm bureaus, and 24/7 live broadcast reports.',
    url: 'https://prolific.news',
    siteName: 'Prolific News Network',
    images: [
      {
        url: 'https://prolific.news/api/og?title=Prolific%20News%20Network%20%E2%80%94%2024%2F7%20Global%20Broadcast%20%26%20Market%20Intelligence&category=GLOBAL%20NETWORK',
        width: 1200,
        height: 630,
        alt: 'Prolific News Network (PNN)',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@prolificnews',
    creator: '@prolificnews',
    title: 'Prolific News Network (PNN) | 24/7 Global Broadcast & Wire',
    description:
      'Verified breaking news, global market intelligence, and regional reporting across 6 continents.',
    images: [
      'https://prolific.news/api/og?title=Prolific%20News%20Network%20%E2%80%94%2024%2F7%20Global%20Broadcast%20%26%20Market%20Intelligence&category=GLOBAL%20NETWORK',
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-NVBXDQWX';
  const breakingAlert = await getActiveBreakingAlert();

  const orgJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      name: 'Prolific News Network',
      alternateName: 'PNN',
      url: 'https://prolific.news',
      logo: {
        '@type': 'ImageObject',
        url: 'https://prolific.news/images/prolific-logo-full.svg',
        width: 340,
        height: 76,
      },
      sameAs: SOCIAL_LINKS.map((s) => s.url),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Prolific News Network',
      alternateName: 'PNN',
      url: 'https://prolific.news',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://prolific.news/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#002B49" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Prolific News Network RSS 2.0 Feed"
          href="https://prolific.news/feed.xml"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Oswald:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        {gtmId && (
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`,
            }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-white">
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <PwaRegister />
        <MarketTicker />
        <BreakingBanner initialAlert={breakingAlert} />
        <TopHeader />
        <div className="flex-1">
          {children}
        </div>
        <FloatingMiniPlayer />
        <TelemetryTracker />
        <Analytics />

        {/* Global Footer */}
        <footer className="bg-[#001A2C] text-gray-300 border-t-4 border-[#002B49] py-12 px-4 mt-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-3">
              <Link href="/" className="inline-block">
                <img
                  src="/images/prolific-logo-full.svg"
                  alt="Prolific News Network - PNN"
                  className="h-14 w-auto object-contain drop-shadow"
                />
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                Prolific News Network (PNN) is a 24/7 multimedia digital broadcast news platform delivering verified breaking dispatches, algorithmic high-value news curation, regional coverage across Africa, Asia, and Latin America, and global financial intelligence.
              </p>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <SocialLinks className="text-[11px] font-bold px-2.5 py-1 rounded" />
                <a
                  href="/feed.xml"
                  className="bg-[#002B49] text-[#FFCC00] text-[11px] font-bold px-2.5 py-1 rounded border border-white/15 hover:opacity-90 transition"
                >
                  RSS
                </a>
              </div>
              <p className="text-[11px] text-gray-500 pt-1">
                © {new Date().getFullYear()} Prolific News Network Media Inc. All rights reserved.
              </p>
            </div>

            <div>
              <h3 className="font-headline font-black text-xs uppercase tracking-widest text-[#FFCC00] mb-3">
                Global & Regional Desks
              </h3>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/category/politics" className="hover:text-white transition">Politics & Policy</Link></li>
                <li><Link href="/category/us" className="hover:text-white transition">U.S. Bureau</Link></li>
                <li><Link href="/category/world" className="hover:text-white transition">World & Geopolitics</Link></li>
                <li><Link href="/category/africa" className="hover:text-white transition text-cyan-300">Africa Bureau</Link></li>
                <li><Link href="/category/asia" className="hover:text-white transition text-cyan-300">Asia-Pacific Bureau</Link></li>
                <li><Link href="/category/latam" className="hover:text-white transition text-cyan-300">Latin America Bureau</Link></li>
                <li><Link href="/category/business" className="hover:text-white transition">Business & Markets</Link></li>
                <li><Link href="/category/tech" className="hover:text-white transition">Technology & AI</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-headline font-black text-xs uppercase tracking-widest text-[#FFCC00] mb-3">
                Broadcast & Features
              </h3>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/watch" className="hover:text-white transition">24/7 Live Broadcast</Link></li>
                <li><Link href="/for-you" className="hover:text-white transition">For You (Personalized Digest)</Link></li>
                <li><Link href="/search" className="hover:text-white transition">Search News Index</Link></li>
                <li><Link href="/archive" className="hover:text-white transition">Newsroom Archive</Link></li>
                <li><Link href="/submit-press-release" className="hover:text-white transition text-[#FFCC00] font-semibold">Submit Commercial Wire ($79)</Link></li>
                <li><Link href="/advertise" className="hover:text-white transition text-[#FFCC00] font-semibold">Desk Sponsorships ($350/mo)</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-headline font-black text-xs uppercase tracking-widest text-[#FFCC00] mb-3">
                Syndication & Corporate
              </h3>
              <ul className="space-y-1.5 text-xs">
                <li><a href="/feed.xml" className="hover:text-white transition">RSS 2.0 Syndication Feed</a></li>
                <li><a href="/news-sitemap.xml" className="hover:text-white transition">Google News Sitemap</a></li>
                <li><a href="/sitemap.xml" className="hover:text-white transition">XML Site Index</a></li>
                <li><Link href="/about" className="hover:text-white transition">About Prolific News</Link></li>
                <li><Link href="/editorial-policy" className="hover:text-white transition">Editorial Policy & Corrections</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact & Press Tips</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
