'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { BreakingAlert } from '@prolific/types';
import { trackTelemetryEvent } from './TelemetryTracker';

interface BreakingBannerProps {
  initialAlert?: BreakingAlert | null;
}

export function BreakingBanner({ initialAlert }: BreakingBannerProps) {
  const [alert, setAlert] = useState<BreakingAlert | null>(
    initialAlert ?? {
      id: 'default-alert-live',
      headline: 'PROLIFIC NEWS NETWORK LIVE: SPECIAL BROADCAST COVERAGE STREAMING 24/7',
      url: '/watch',
      urgency: 'SPECIAL_REPORT',
      active: true,
      publishedAt: new Date().toISOString(),
    }
  );

  useEffect(() => {
    // 1. Edge-cached polling for updates only when tab is visible (3-minute cadence)
    const pollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      try {
        const res = await fetch('/api/live/ticker');
        if (res.ok) {
          const data = await res.json();
          if (data && 'breakingAlert' in data) {
            setAlert(data.breakingAlert ?? null);
          }
        }
      } catch {
        // network silent ignore
      }
    }, 180000);

    // 2. Connect to VPS WebSocket gateway if configured
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    let socket: WebSocket | null = null;

    if (wsUrl) {
      try {
        socket = new WebSocket(wsUrl);
        socket.onopen = () => {
          socket?.send(JSON.stringify({ action: 'subscribe', channel: 'breaking-alerts' }));
        };
        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.channel === 'breaking-alerts' && payload.data) {
              setAlert(payload.data);
            }
          } catch {
            // ignore parsing error
          }
        };
      } catch {
        // WS unavailable
      }
    }

    return () => {
      clearInterval(pollInterval);
      socket?.close();
    };
  }, []);

  if (!alert || !alert.active) return null;

  return (
    <div className="w-full bg-[#CC0000] text-white border-b-2 border-[#990000] shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded text-[11px] font-black tracking-widest uppercase border border-white/20">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            {alert.urgency}
          </span>
          <Link
            href={alert.url}
            onClick={() =>
              trackTelemetryEvent('ticker_click', null, {
                placement: 'breaking_banner',
                url: alert.url,
                urgency: alert.urgency,
              })
            }
            className="font-headline font-black text-sm md:text-base tracking-wide hover:underline uppercase leading-tight line-clamp-1"
          >
            {alert.headline}
          </Link>
        </div>
        <Link
          href={alert.url}
          onClick={() =>
            trackTelemetryEvent('ticker_click', null, {
              placement: 'breaking_banner_cta',
              url: alert.url,
              urgency: alert.urgency,
            })
          }
          className="hidden lg:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white/90 hover:text-white whitespace-nowrap bg-black/20 hover:bg-black/30 px-3 py-1 rounded transition"
        >
          <span>Full Coverage</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
