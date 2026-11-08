import React from 'react';
import { MarketTickerItem } from '@prolific/types';

const EXTENDED_TICKERS: MarketTickerItem[] = [
  { symbol: 'DOW', name: 'Dow Jones', price: '43,910.28', change: '+248.12', percentChange: '+0.57%', isPositive: true },
  { symbol: 'S&P 500', name: 'S&P 500', price: '5,983.99', change: '+21.40', percentChange: '+0.36%', isPositive: true },
  { symbol: 'NASDAQ', name: 'Nasdaq Composite', price: '19,281.40', change: '-34.80', percentChange: '-0.18%', isPositive: false },
  { symbol: 'RUSSELL', name: 'Russell 2000', price: '2,392.15', change: '+18.20', percentChange: '+0.77%', isPositive: true },
  { symbol: 'CRUDE OIL', name: 'Crude Oil', price: '$71.24', change: '+0.88', percentChange: '+1.25%', isPositive: true },
  { symbol: 'BRENT', name: 'Brent Crude', price: '$75.60', change: '+0.92', percentChange: '+1.23%', isPositive: true },
  { symbol: 'GOLD', name: 'Gold Spot', price: '$2,735.40', change: '-12.10', percentChange: '-0.44%', isPositive: false },
  { symbol: 'SILVER', name: 'Silver Spot', price: '$33.85', change: '+0.42', percentChange: '+1.26%', isPositive: true },
  { symbol: '10-YR', name: '10-Yr Treasury', price: '4.42%', change: '+0.03', percentChange: '+0.68%', isPositive: true },
  { symbol: '2-YR', name: '2-Yr Treasury', price: '4.21%', change: '-0.01', percentChange: '-0.24%', isPositive: false },
  { symbol: 'BITCOIN', name: 'BTC/USD', price: '$68,450', change: '+1,240', percentChange: '+1.85%', isPositive: true },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: '1.0820', change: '-0.0015', percentChange: '-0.14%', isPositive: false },
];

export function MarketTicker() {
  // Duplicate array so continuous loop has zero gap or stutter
  const tickerLoop = [...EXTENDED_TICKERS, ...EXTENDED_TICKERS];

  return (
    <div className="w-full bg-[#001A2C] border-b border-[#003366] text-xs font-mono text-gray-200 py-1.5 px-2 select-none overflow-hidden relative flex items-center">
      {/* Fixed Sticky 'MARKETS' Badge */}
      <div className="z-20 bg-[#001A2C] pr-3 pl-2 py-0.5 flex items-center gap-2 font-bold text-[#FFCC00] uppercase tracking-wider text-[11px] shadow-[6px_0_12px_rgba(0,26,44,0.95)] flex-shrink-0 border-r border-[#003366]">
        <span className="inline-block w-2 h-2 rounded-full bg-[#FFCC00] animate-pulse"></span>
        <span>Markets</span>
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
