import React from 'react';
import { Users, Tv, Radio, ShieldCheck, Globe, Calendar, Flame, Eye } from 'lucide-react';
import { LiveStreamPlayer } from '../../components/LiveStreamPlayer';

export const metadata = {
  title: 'Watch Live 24/7 — Prolific News Network',
  description: 'Stream Prolific News Network live 24/7. Continuous continuous broadcast coverage, global bureaus, and breaking news analysis.',
};

export default function WatchLivePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Live Stream Main Frame */}
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-[#002B49]">
        <div className="bg-[#001A2C] px-4 py-3 flex items-center justify-between text-white text-xs font-headline font-bold uppercase tracking-wider border-b border-[#003B66]">
          <div className="flex items-center gap-2">
            <span className="bg-[#CC0000] text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              ON AIR NOW
            </span>
            <span className="text-gray-200">PROLIFIC NEWS CHANNEL • 24/7 AUTONOMOUS CONTINUOUS BROADCAST</span>
          </div>
          <div className="flex items-center gap-4 text-[#FFCC00]">
            <span className="flex items-center gap-1.5 font-mono">
              <Users className="w-3.5 h-3.5 text-[#FFCC00]" />
              148,720 Active Streamers
            </span>
            <span className="hidden sm:inline text-xs text-gray-400">|</span>
            <span className="hidden sm:flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Feed
            </span>
          </div>
        </div>

        {/* Continuous Broadcast Player */}
        <div className="aspect-video w-full bg-black">
          <LiveStreamPlayer
            autoPlay={true}
            showChyron={true}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Bureau Grid & Live Coverage Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#002B49] text-white p-4 rounded border-t-4 border-[#CC0000] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#FFCC00] uppercase font-bold">Bureau A</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h4 className="font-headline font-black text-sm uppercase">Washington & Geneva</h4>
          <p className="text-[11px] text-gray-300">Policy Accords & Strategic Defense</p>
        </div>

        <div className="bg-[#002B49] text-white p-4 rounded border-t-4 border-[#FFCC00] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#FFCC00] uppercase font-bold">Bureau B</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h4 className="font-headline font-black text-sm uppercase">New York & London</h4>
          <p className="text-[11px] text-gray-300">Wall Street & Commodities</p>
        </div>

        <div className="bg-[#002B49] text-white p-4 rounded border-t-4 border-emerald-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#FFCC00] uppercase font-bold">Bureau C</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h4 className="font-headline font-black text-sm uppercase">Nairobi & Johannesburg</h4>
          <p className="text-[11px] text-gray-300">Trade Corridors & Tech Infrastructure</p>
        </div>

        <div className="bg-[#002B49] text-white p-4 rounded border-t-4 border-cyan-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#FFCC00] uppercase font-bold">Bureau D</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h4 className="font-headline font-black text-sm uppercase">Tokyo & Singapore</h4>
          <p className="text-[11px] text-gray-300">Semiconductors & Maritime Trade</p>
        </div>
      </div>

      {/* Broadcast Programming Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F8F9FA] border-t-4 border-[#002B49] p-5 rounded space-y-2 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#002B49]" />
            Midday Edition • 12:00 PM EST
          </span>
          <h3 className="font-headline font-black text-lg text-gray-900 uppercase">The Global Briefing</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            In-depth breakdown of midday diplomatic press conferences, corporate quarterly earnings, and regional security briefs.
          </p>
        </div>

        <div className="bg-[#F8F9FA] border-t-4 border-[#CC0000] p-5 rounded space-y-2 shadow-sm">
          <span className="text-[11px] font-bold text-[#CC0000] uppercase flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#CC0000]" />
            Afternoon Debate • 4:00 PM EST
          </span>
          <h3 className="font-headline font-black text-lg text-gray-900 uppercase">The Five at Five</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Fast-paced roundtable discussion debating the day’s top political controversies, economic shifts, and emerging global headlines.
          </p>
        </div>

        <div className="bg-[#F8F9FA] border-t-4 border-[#FFCC00] p-5 rounded space-y-2 shadow-sm">
          <span className="text-[11px] font-bold text-[#002B49] uppercase flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-[#002B49]" />
            Primetime • 8:00 PM EST
          </span>
          <h3 className="font-headline font-black text-lg text-gray-900 uppercase">Prolific Primetime Live</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            High-intensity interviews with lawmakers, industry leaders, and defense analysts covering consequential national developments.
          </p>
        </div>
      </div>
    </div>
  );
}
