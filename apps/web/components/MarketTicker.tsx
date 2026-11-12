'use client';

import React, { useEffect, useState } from 'react';
import { MarketTickerItem } from '@prolific/types';

const INITIAL_TICKERS: MarketTickerItem[] = [
  { symbol: 'DOW', name: 'Dow Jones', price: '43,910.28', change: '+248.12', percentChange: '+0.57%', isPositive: true },
  { symbol: 'S&P 500', name: 'S&P 500', price: '5,983.99', change: '+21.40', percentChange: '+0.36%', isPositive: true },
  { symbol: 'NASDAQ', name: 'Nasdaq Composite', price: '19,281.40', change: '-34.80', percentChange: '-0.18%', isPositive: false },
  { symbol: 'BITCOIN', name: 'BTC/USD', price: '$73,910', change: '+850', percentChange: '+1.15%', isPositive: true },
  { symbol: 'ETHEREUM', name: 'ETH/USD', price: '$2,058', change: '-32.50', percentChange: '-1.55%', isPositive: false },
  { symbol: 'SOLANA', name: 'SOL/USD', price: '$83.70', change: '-1.40', percentChange: '-1.65%', isPositive: false },
  { symbol: 'CRUDE OIL', name: 'Crude Oil', price: '$71.24', change: '+0.88', percentChange: '+1.25%', isPositive: true },
  { symbol: 'BRENT', name: 'Brent Crude', price: '$75.60', change: '+0.92', percentChange: '+1.23%', isPositive: true },
  { symbol: 'GOLD', name: 'Gold Spot', price: '$2,735.40', change: '-12.10', percentChange: '-0.44%', isPositive: false },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: '1.1186', change: '+0.0012', percentChange: '+0.11%', isPositive: true },
  { symbol: 'GBP/USD', name: 'British Pound / USD', price: '1.3366', change: '+0.0024', percentChange: '+0.18%', isPositive: true },
  { symbol: '10-YR', name: '10-Yr Treasury', price: '4.42%', change: '+0.03', percentChange: '+0.68%', isPositive: true },
];

export function MarketTicker() {
  const [tickers, setTickers] = useState<MarketTickerItem[]>(INITIAL_TICKERS);

  useEffect(() => {
    let mounted = true;
    const fetchMarkets = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      try {
        const res = await fetch('/api/live/ticker');
        const data = await res.json();
        if (mounted && data.success && Array.isArray(data.markets) && data.markets.length > 0) {
          setTickers(data.markets);
        }
      } catch {
        // Fallback to initial
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 180000); // 3m refresh (aligned with CDN cache)
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Duplicate array so continuous loop has zero gap or stutter
  const tickerLoop = [...tickers, ...tickers];

  return (
    <div className="w-full bg-[#001A2C] border-b border-[#003366] text-xs font-mono text-gray-200 py-1.5 px-2 select-none overflow-hidden relative flex items-center">
      {/* Fixed Sticky 'MARKETS' Badge */}
      <div className="z-20 bg-[#001A2C] pr-3 pl-2 py-0.5 flex items-center gap-2 font-bold text-[#FFCC00] uppercase tracking-wider text-[11px] shadow-[6px_0_12px_rgba(0,26,44,0.95)] flex-shrink-0 border-r border-[#003366]">
        <span className="inline-block w-2 h-2 rounded-full bg-[#FFCC00] animate-pulse"></span>
        <span>Markets Live</span>
      </div>

      {/* Scrolling Track Container */}
      <div className="overflow-hidden relative flex-1 flex items-center">
        {/* Left-to-Right Continuous Marquee Ribbon */}
        <div className="animate-ticker-ltr flex items-center gap-8 whitespace-nowrap pl-4">
          {tickerLoop.map((t, idx) => (
            <div key={`${t.symbol}-${idx}`} className="flex items-center gap-1.5 flex-shrink-0 cursor-default">
              <span className="font-bold text-white tracking-wide">{t.symbol}</span>
              <span className="text-gray-300">{t.price}</span>
              <span
                className={`font-semibold flex items-center gap-0.5 ${
                  t.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span>{t.isPositive ? '▲' : '▼'}</span>
                <span>{t.change}</span>
                <span>({t.percentChange})</span>
              </span>
              <span className="text-gray-600 ml-2">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
