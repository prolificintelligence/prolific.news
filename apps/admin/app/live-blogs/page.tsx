'use client';

import React, { useState } from 'react';
import { Radio, Plus, CheckCircle2 } from 'lucide-react';

export default function LiveBlogsAdminPage() {
  const [blogs, setBlogs] = useState([
    {
      id: 'lb-1',
      title: 'SPECIAL COVERAGE: 2026 GENERAL ELECTIONS & BATTLEGROUND SENATE RACES',
      category: 'Politics',
      status: 'ACTIVE',
      updatesCount: 14,
      startedAt: 'Oct 26, 2026',
    },
    {
      id: 'lb-2',
      title: 'GLOBAL FINANCIAL MARKETS LIVE: COMMODITIES & TECH EARNINGS WATCH',
      category: 'Business',
      status: 'ACTIVE',
      updatesCount: 9,
      startedAt: 'Oct 26, 2026',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-wider text-[#002B49]">
            Live Blog Timeline Operations
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Manage minute-by-minute live blog coverage streams for breaking events and elections.
          </p>
        </div>

        <button className="bg-[#CC0000] hover:bg-[#B30000] text-white font-headline font-bold text-xs uppercase px-4 py-2 rounded tracking-wider transition flex items-center gap-1.5 shadow">
          <Plus className="w-4 h-4" />
          <span>Launch New Live Blog</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((b) => (
          <div key={b.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                {b.status}
              </span>
              <span className="text-[11px] font-bold uppercase text-gray-500">{b.category}</span>
            </div>

            <h3 className="font-headline font-black text-base text-gray-900 uppercase leading-snug">
              {b.title}
            </h3>

            <div className="text-xs text-gray-500 flex items-center justify-between pt-2 border-t border-gray-100">
              <span>{b.updatesCount} micro-updates published</span>
              <span>Started {b.startedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
