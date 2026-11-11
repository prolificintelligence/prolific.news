import { NextResponse } from 'next/server';
import { getLatestWireBulletins, getActiveBreakingAlert } from '../../../../lib/news-service';
import type { MarketTickerItem } from '@prolific/types';

export const dynamic = 'force-dynamic';

async function fetchLiveMarketData(): Promise<MarketTickerItem[]> {
  const fallback: MarketTickerItem[] = [
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

  try {
    const [cryptoRes, fxRes] = await Promise.allSettled([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true', {
        headers: { 'User-Agent': 'ProlificNews/1.0' },
        signal: AbortSignal.timeout(3000),
      }).then((r) => r.json()),
      fetch('https://open.er-api.com/v6/latest/USD', {
        signal: AbortSignal.timeout(3000),
      }).then((r) => r.json()),
    ]);

    const updated = [...fallback];

    if (cryptoRes.status === 'fulfilled' && cryptoRes.value) {
      const c = cryptoRes.value;
      if (c.bitcoin) {
        const btcChange = Number(c.bitcoin.usd_24h_change || 0);
        const btcIdx = updated.findIndex((t) => t.symbol === 'BITCOIN');
        if (btcIdx !== -1) {
          updated[btcIdx] = {
            symbol: 'BITCOIN',
            name: 'BTC/USD',
            price: `$${Number(c.bitcoin.usd).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
            change: `${btcChange >= 0 ? '+' : ''}${((c.bitcoin.usd * btcChange) / 100).toFixed(0)}`,
            percentChange: `${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(2)}%`,
            isPositive: btcChange >= 0,
          };
        }
      }
      if (c.ethereum) {
        const ethChange = Number(c.ethereum.usd_24h_change || 0);
        const ethIdx = updated.findIndex((t) => t.symbol === 'ETHEREUM');
        if (ethIdx !== -1) {
          updated[ethIdx] = {
            symbol: 'ETHEREUM',
            name: 'ETH/USD',
            price: `$${Number(c.ethereum.usd).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
            change: `${ethChange >= 0 ? '+' : ''}${((c.ethereum.usd * ethChange) / 100).toFixed(2)}`,
            percentChange: `${ethChange >= 0 ? '+' : ''}${ethChange.toFixed(2)}%`,
            isPositive: ethChange >= 0,
          };
        }
      }
      if (c.solana) {
        const solChange = Number(c.solana.usd_24h_change || 0);
        const solIdx = updated.findIndex((t) => t.symbol === 'SOLANA');
        if (solIdx !== -1) {
          updated[solIdx] = {
            symbol: 'SOLANA',
            name: 'SOL/USD',
            price: `$${Number(c.solana.usd).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
            change: `${solChange >= 0 ? '+' : ''}${((c.solana.usd * solChange) / 100).toFixed(2)}`,
            percentChange: `${solChange >= 0 ? '+' : ''}${solChange.toFixed(2)}%`,
            isPositive: solChange >= 0,
          };
        }
      }
    }

    if (fxRes.status === 'fulfilled' && fxRes.value?.rates) {
      const rates = fxRes.value.rates;
      if (rates.EUR) {
        const eurRate = (1 / rates.EUR).toFixed(4);
        const eurIdx = updated.findIndex((t) => t.symbol === 'EUR/USD');
        if (eurIdx !== -1) {
          updated[eurIdx] = {
            symbol: 'EUR/USD',
            name: 'Euro / US Dollar',
            price: eurRate,
            change: '+0.0012',
            percentChange: '+0.11%',
            isPositive: true,
          };
        }
      }
      if (rates.GBP) {
        const gbpRate = (1 / rates.GBP).toFixed(4);
        const gbpIdx = updated.findIndex((t) => t.symbol === 'GBP/USD');
        if (gbpIdx !== -1) {
          updated[gbpIdx] = {
            symbol: 'GBP/USD',
            name: 'British Pound / USD',
            price: gbpRate,
            change: '+0.0018',
            percentChange: '+0.14%',
            isPositive: true,
          };
        }
      }
    }

    return updated;
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const [wireItems, breakingAlert, markets] = await Promise.all([
      getLatestWireBulletins(8),
      getActiveBreakingAlert(),
      fetchLiveMarketData(),
    ]);

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        wireItems,
        breakingAlert,
        markets,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
