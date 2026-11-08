import React from 'react';
import { Sparkles, Sliders, Mail, Globe, Radio, ShieldCheck, ChevronRight } from 'lucide-react';
import { getLeadAndFeaturedArticles } from '../../lib/news-service';
import { PersonalizedNewsWidget } from '../../components/PersonalizedNewsWidget';
import Link from 'next/link';

export const metadata = {
  title: 'For You — Personalized News Delivered To You | Prolific News Network',
  description: 'Customize your Prolific News Network coverage. Select regional bureaus, policy beats, and receive your personalized morning executive brief.',
};

export const revalidate = 60;

export default async function ForYouPage() {
  const { leadArticle, centerArticles } = await getLeadAndFeaturedArticles();
  const allArticles = [leadArticle, ...centerArticles].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b-4 border-[#002B49] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-[#CC0000] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded flex items-center gap-1.5 shadow">
            <Sparkles className="w-3.5 h-3.5 text-[#FFCC00]" />
            Smart Desk
          </span>
          <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
            Autonomous Personalization v2.0
          </span>
        </div>
        <h1 className="font-headline font-black text-3xl md:text-5xl text-[#002B49] uppercase tracking-tight">
          Personalized News Delivered To You
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-3xl leading-relaxed">
          Tailor the Prolific News Network wire to your exact beat, industry focus, and regional corridors.
          High-value intelligence is ranked dynamically using our editorial and algorithmic weighting engine.
        </p>
      </div>

      {/* Interactive Personalized Engine Widget */}
      <PersonalizedNewsWidget articles={allArticles} mode="inline" />

      {/* Regional Focus Highlights (Africa, Asia, Latin America) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
          <h2 className="font-headline font-black text-xl text-[#002B49] uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#CC0000]" />
            Regional Desks & Emerging Corridors
          </h2>
          <span className="text-xs font-bold text-gray-500 uppercase">Expanded Coverage</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Africa Bureau Card */}
          <div className="bg-[#F8F9FA] border-t-4 border-[#002B49] rounded p-5 space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#CC0000] uppercase tracking-widest">
                Continental Desk
              </span>
              <h3 className="font-headline font-black text-lg text-gray-900 uppercase">
                Africa Trade & Innovation
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Coverage of AfCFTA tariff harmonisation, renewable microgrids, fintech hubs in Lagos and Nairobi, and pan-African infrastructure.
              </p>
            </div>
            <Link
              href="/category/africa"
              className="text-xs font-headline font-bold text-[#002B49] hover:text-[#CC0000] uppercase tracking-wider flex items-center gap-1 pt-2 border-t border-gray-200"
            >
              <span>Explore Africa Desk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Asia Bureau Card */}
          <div className="bg-[#F8F9FA] border-t-4 border-[#CC0000] rounded p-5 space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#CC0000] uppercase tracking-widest">
                Asia-Pacific Bureau
              </span>
              <h3 className="font-headline font-black text-lg text-gray-900 uppercase">
                Asia Markets & Technology
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Real-time reporting on semiconductor supply corridors, ASEAN economic treaties, central bank rate movements, and maritime shipping lines.
              </p>
            </div>
            <Link
              href="/category/asia"
              className="text-xs font-headline font-bold text-[#002B49] hover:text-[#CC0000] uppercase tracking-wider flex items-center gap-1 pt-2 border-t border-gray-200"
            >
              <span>Explore Asia Desk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Latin America Bureau Card */}
          <div className="bg-[#F8F9FA] border-t-4 border-[#FFCC00] rounded p-5 space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#002B49] uppercase tracking-widest">
                Americas Bureau
              </span>
              <h3 className="font-headline font-black text-lg text-gray-900 uppercase">
                Latin America Governance & Resources
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                In-depth dispatches covering lithium and copper mining treaties, Mercosur negotiations, agricultural exports, and sovereign energy grids.
              </p>
            </div>
            <Link
              href="/category/latam"
              className="text-xs font-headline font-bold text-[#002B49] hover:text-[#CC0000] uppercase tracking-wider flex items-center gap-1 pt-2 border-t border-gray-200"
            >
              <span>Explore Latin America Desk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
