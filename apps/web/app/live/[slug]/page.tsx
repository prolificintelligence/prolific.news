'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, RefreshCw, Pin, Clock, Share2 } from 'lucide-react';
import { LiveBlogUpdate } from '@prolific/types';

const INITIAL_UPDATES: LiveBlogUpdate[] = [
  {
    id: 'up-1',
    blogId: 'presidential-election-briefing',
    timestamp: '11:42 AM EST',
    title: 'Joint Security Briefing Confirms High Voter Participation Across Key Metros',
    content: 'Federal election monitors and state officials report peaceful voting conditions with record-setting morning lines in major municipal hubs.',
    authorName: 'Sarah Lin, Chief Political Analyst',
    isPinned: true,
  },
  {
    id: 'up-2',
    blogId: 'presidential-election-briefing',
    timestamp: '11:15 AM EST',
    title: 'Court Denies Emergency Injunction in Sunbelt Voting Hours Dispute',
    content: 'The appellate panel unanimously upheld existing precinct operation hours, ensuring all voters in line by 7:00 PM will cast valid ballots.',
    authorName: 'Legal Bureau, Prolific Washington Bureau',
  },
  {
    id: 'up-3',
    blogId: 'presidential-election-briefing',
    timestamp: '10:48 AM EST',
    title: 'Financial Futures Fluctuate as Turnout Estimates Circulate',
    content: 'Equity futures pared early losses following the release of midday economic confidence indices.',
    authorName: 'Market Desk',
  },
];

export default function LiveBlogPage() {
  const [updates, setUpdates] = useState<LiveBlogUpdate[]>(INITIAL_UPDATES);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        socket?.send(JSON.stringify({ action: 'subscribe', channel: 'live-blog:presidential-election-briefing' }));
      };
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.data) {
            setUpdates((prev) => [payload.data, ...prev]);
            setHasNewUpdates(true);
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // WS fallback
    }

    return () => {
      socket?.close();
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Live Blog Banner Header */}
      <div className="bg-[#002B49] text-white p-6 rounded shadow-lg border-l-8 border-[#CC0000] space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-[#CC0000] text-white text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded flex items-center gap-1.5 shadow">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Live Blog
          </span>
          <span className="text-xs text-gray-300 font-bold uppercase">Continuous Real-Time Coverage</span>
        </div>

        <h1 className="font-headline font-black text-2xl md:text-4xl uppercase leading-tight tracking-tight">
          Special Live Coverage: Nationwide Election Developments & Analysis
        </h1>

        <p className="text-sm text-gray-300 font-serif">
          Minute-by-minute updates, exit polling analysis, and legal rulings from Prolific News reporters in Washington and battleground states.
        </p>

        <div className="flex items-center gap-4 pt-2 text-xs text-gray-300 border-t border-[#003B66]">
          <span>Edited by Prolific News Digital Newsroom</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[#FFCC00]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#CC0000]" />
            Live Updates Active
          </span>
        </div>
      </div>

      {/* New Updates Banner */}
      {hasNewUpdates && (
        <div className="my-4">
          <button
            onClick={() => setHasNewUpdates(false)}
            className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-headline font-bold text-xs uppercase py-2.5 rounded shadow flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>New updates received — Click to refresh top of feed</span>
          </button>
        </div>
      )}

      {/* Timeline Stream */}
      <div className="mt-8 relative border-l-2 border-gray-200 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8">
        {updates.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline Dot */}
            <div className={`absolute -left-[31px] md:-left-[39px] top-1 w-4 h-4 rounded-full border-2 border-white shadow ${item.isPinned ? 'bg-[#CC0000]' : 'bg-[#002B49]'}`} />

            <div className={`p-5 rounded border ${item.isPinned ? 'bg-[#F8F9FA] border-[#002B49] shadow-sm' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2 font-bold">
                  {item.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[#CC0000] text-[10px] font-black uppercase">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.timestamp}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#002B49]">{item.authorName}</span>
              </div>

              <h2 className="font-headline font-black text-lg md:text-xl text-gray-900 uppercase leading-snug mb-2">
                {item.title}
              </h2>

              <p className="text-sm text-gray-800 font-serif leading-relaxed">
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
