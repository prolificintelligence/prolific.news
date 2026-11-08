import React from 'react';
import { Flame, Check, ShieldCheck, PlayCircle, Film, Sparkles } from 'lucide-react';

export default function PlusPage() {
  return (
    <div className="bg-[#001424] text-white min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FFCC00] text-[#002B49] font-headline font-black text-xs uppercase px-3 py-1 rounded-full tracking-wider">
            <Flame className="w-4 h-4 fill-[#002B49]" />
            Direct Consumer Streaming
          </div>
          <h1 className="font-headline font-black text-4xl md:text-6xl uppercase tracking-tight text-white leading-none">
            UNLIMITED ACCESS. <span className="text-[#FFCC00]">ZERO INTERRUPTIONS.</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-serif">
            Join Prolific Plus for exclusive investigative series, feature-length historical documentaries, and live commercial-free broadcast feeds.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-[#00233D] border border-gray-700 rounded-xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-headline font-black text-xl uppercase tracking-wider text-white">Monthly Pass</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-headline font-black text-4xl text-white">$5.99</span>
                <span className="text-gray-400 text-sm">/ month</span>
              </div>
              <p className="text-xs text-gray-300">Billed monthly. Cancel anytime with zero penalty.</p>
            </div>

            <ul className="space-y-3 text-xs text-gray-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                100% Ad-Free Reading & Video Experience
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                Commercial-Free Live Broadcast DVR
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                Full Access to Investigative Documentaries
              </li>
            </ul>

            <button className="w-full bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs uppercase py-3 rounded tracking-wider transition border border-white/20">
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Annual Plan (Best Value) */}
          <div className="bg-gradient-to-b from-[#002B49] to-[#001F35] border-2 border-[#FFCC00] rounded-xl p-8 space-y-6 flex flex-col justify-between relative shadow-2xl">
            <div className="absolute -top-3 right-6 bg-[#FFCC00] text-[#002B49] text-[10px] font-headline font-black uppercase px-3 py-0.5 rounded-full tracking-wider">
              Most Popular
            </div>

            <div className="space-y-3">
              <h3 className="font-headline font-black text-xl uppercase tracking-wider text-white">Annual Membership</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-headline font-black text-4xl text-[#FFCC00]">$64.99</span>
                <span className="text-gray-300 text-sm">/ year</span>
              </div>
              <p className="text-xs text-[#FFCC00]/90">Save 15% compared to monthly plan.</p>
            </div>

            <ul className="space-y-3 text-xs text-white">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                All Monthly Features Included
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                Priority Subscriber Comment Badging
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                Exclusive Invitations to Virtual Town Halls
              </li>
            </ul>

            <button className="w-full bg-[#FFCC00] hover:bg-[#E6B800] text-[#002B49] font-headline font-black text-xs uppercase py-3 rounded tracking-wider transition shadow-lg">
              Start 7-Day Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
