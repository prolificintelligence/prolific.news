import crypto from 'node:crypto';
import { createDb, wireItems, articles, breakingAlerts, lt, eq, sql, desc, and, or, ilike, inArray } from '@prolific/db';

export interface WireArticle {
  id: string;
  slug: string;
  source: string;
  title: string;
  link: string;
  summary: string;
  category: string;
  mediaUrl: string;
  pubDate: string;
  timeAgo?: string;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  Politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&w=1200&q=80',
  ],
  US: [
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1200&q=80',
  ],
  Opinion: [
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  ],
  Entertainment: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1200&q=80',
  ],
  Sports: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  ],
  Lifestyle: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  ],
  Business: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  ],
  World: [
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  ],
  Tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
  ],
  Africa: [
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80',
  ],
  Asia: [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80',
  ],
  LatAm: [
    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544989164-31dc3c645987?auto=format&fit=crop&w=1200&q=80',
  ],
  General: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
  ],
};

const KEYWORD_IMAGE_POOL: Array<{ keywords: string[]; url: string }> = [
  { keywords: ['oil', 'crude', 'opec', 'petroleum', 'pipeline', 'refinery'], url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['solar', 'renewable', 'wind', 'grid', 'electricity', 'power plant'], url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['chip', 'semiconductor', 'nvidia', 'ai ', 'artificial intelligence', 'quantum'], url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['space', 'nasa', 'rocket', 'orbit', 'satellite', 'moon', 'mars'], url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['court', 'supreme', 'judge', 'lawsuit', 'trial', 'justice', 'legal'], url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['military', 'pentagon', 'navy', 'defense', 'missile', 'nato', 'troops', 'army'], url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['shipping', 'maritime', 'port', 'cargo', 'tariff', 'export', 'supply chain'], url: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['bank', 'fed ', 'federal reserve', 'inflation', 'interest rate', 'treasury', 'bond'], url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['bitcoin', 'crypto', 'blockchain', 'digital currency'], url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['hospital', 'medical', 'vaccine', 'health', 'fda', 'clinical', 'virus'], url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['airline', 'flight', 'aviation', 'airport', 'boeing', 'airbus'], url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80' },
];

function getRandomImage(category: string, seed: number, title = ''): string {
  if (title) {
    const lower = title.toLowerCase();
    for (const entry of KEYWORD_IMAGE_POOL) {
      if (entry.keywords.some((kw) => lower.includes(kw))) {
        return entry.url;
      }
    }
  }
  const list = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.General;
  return list[seed % list.length];
}

function calculateTimeAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return 'Recently';
  }
}

export function decodeHtmlEntities(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export function stripHtml(raw: string): string {
  if (!raw) return '';
  const decoded = decodeHtmlEntities(raw);
  return decoded
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanHeadline(rawTitle: string, fallbackSource: string = 'Wire Services'): {
  title: string;
  source: string;
} {
  const clean = stripHtml(rawTitle);
  const lastDash = clean.lastIndexOf(' - ');
  if (lastDash > 15) {
    const title = clean.slice(0, lastDash).trim();
    const source = clean.slice(lastDash + 3).trim();
    return { title: title || clean, source: source || fallbackSource };
  }
  return { title: clean, source: fallbackSource };
}

export function cleanOrGenerateSummary(
  rawDesc: string,
  headline: string,
  source: string,
  category: string
): string {
  const clean = stripHtml(rawDesc);
  const isGoogleNewsList =
    clean.includes('&nbsp;') ||
    clean.toLowerCase().includes('view full coverage') ||
    clean.length < 25 ||
    (clean.match(/ - /g) || []).length >= 2;

  if (!isGoogleNewsList && clean.length >= 35) {
    const sentences = clean.split(/(?<=[.!?])\s+/);
    if (sentences.length > 0 && sentences[0].length >= 30) {
      return sentences.slice(0, 2).join(' ').trim();
    }
    return clean.slice(0, 240).trim() + '...';
  }

  const categoryContexts: Record<string, string> = {
    Politics: 'Fast-moving legislative and executive policy developments continue to unfold.',
    US: 'Law enforcement, municipal, and state authorities are responding to newly confirmed reports.',
    Business: 'Financial markets and global commercial institutions are pricing in significant new developments.',
    World: 'Diplomatic envoys and international observers are closely monitoring fast-moving border developments.',
    Tech: 'Industry leaders and regulatory analysts are assessing newly disclosed architectural updates.',
    Sports: 'Franchise representatives and sports analysts are breaking down game-changing performance metrics.',
    Entertainment: 'Studio executives, artists, and media critics are reviewing major cultural announcements.',
    Opinion: 'Leading policy scholars and editorial columnists provide nuanced analysis of the situation.',
    Lifestyle: 'Trends across modern travel, architecture, luxury design, and wellness continue to evolve.',
    Africa: 'Economic corridors, continental trade, and regional leadership conferences report fast-moving developments.',
    Asia: 'Supply chain monitors and Asia-Pacific financial hubs are assessing major regional policy shifts.',
    LatAm: 'Resource partnerships, macroeconomic updates, and diplomatic talks advance across South and Central America.',
    General: 'Verified dispatches indicate significant breaking events now developing across key sectors.',
  };

  const context = categoryContexts[category] || categoryContexts.General;
  return `${context} Detailed investigation is underway with live updates via Prolific News Network correspondents.`;
}

export function extractMediaUrl(block: string): string {
  const imgMatch = block.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];

  const enclosureMatch = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\/[^"']+["']/i);
  if (enclosureMatch && enclosureMatch[1]) return enclosureMatch[1];

  const mediaContentMatch = block.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaContentMatch && mediaContentMatch[1]) return mediaContentMatch[1];

  const mediaThumbMatch = block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (mediaThumbMatch && mediaThumbMatch[1]) return mediaThumbMatch[1];

  return '';
}

export function slugify(title: string, idSuffix?: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
    .replace(/-+$/, '');
  const suffix = idSuffix || crypto.randomBytes(3).toString('hex');
  return `${base || 'news-dispatch'}-${suffix}`;
}

export function toHeadlineCase(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  const lowercaseWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'via', 'with'
  ]);
  const acronyms = new Set([
    'US', 'USA', 'UK', 'EU', 'UN', 'NATO', 'AI', 'CEO', 'CFO', 'CTO', 'GDP', 'IMF', 'WHO', 'SEC', 'FDA', 'DOJ', 'FBI', 'PNN', 'OPEC', 'UAE', 'G7', 'G20', 'BRICS', 'NASA', 'ETF', 'IPO', 'EV', 'ESG', 'COVID'
  ]);

  const words = trimmed.split(/\s+/);
  return words
    .map((word, index) => {
      const match = word.match(/^([^\w]*)([\w'-]+)([^\w]*)$/);
      if (!match) return word;
      const [, prefix, core, suffix] = match;
      const coreUpper = core.toUpperCase();
      if (acronyms.has(coreUpper)) {
        return `${prefix}${coreUpper}${suffix}`;
      }
      const coreLower = core.toLowerCase();
      if (index > 0 && index < words.length - 1 && lowercaseWords.has(coreLower)) {
        return `${prefix}${coreLower}${suffix}`;
      }
      const capitalized = coreLower.charAt(0).toUpperCase() + coreLower.slice(1);
      return `${prefix}${capitalized}${suffix}`;
    })
    .join(' ');
}

export interface EnrichedArticleContent {
  title: string;
  subtitle: string;
  keyDevelopments: string[];
  content: string;
  readTimeMinutes: number;
}

export async function enrichArticleContent(
  rawTitle: string,
  rawSummary: string,
  source: string,
  category: string,
  geoRegion: string,
  sourceLink: string
): Promise<EnrichedArticleContent> {
  const headline = toHeadlineCase(rawTitle);
  const cleanSummary = rawSummary.trim();
  const openRouterKey = (process.env.OPENROUTER_API_KEY || '').trim();

  if (openRouterKey) {
    try {
      const prompt = `You are a senior wire editor for Prolific News Network. Write an objective, high-depth news dispatch based on this report:
Headline: ${rawTitle}
Source: ${source}
Desk: ${category}
Region: ${geoRegion}
Lead Wire Summary: ${cleanSummary}

Output ONLY valid JSON matching this schema:
{
  "title": "Headline in clean title case (do NOT use all uppercase)",
  "keyDevelopments": [
    "Key development 1 (succinct, fact-based)",
    "Key development 2",
    "Key development 3"
  ],
  "contextAnalysis": "Two thorough paragraphs analyzing the market or geopolitical context, regulatory reactions, and strategic outlook for this story.",
  "readTimeMinutes": 3
}`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://prolific.news',
          'X-Title': 'Prolific News Network',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const data: any = await res.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const developments = Array.isArray(parsed.keyDevelopments) && parsed.keyDevelopments.length > 0
            ? parsed.keyDevelopments.slice(0, 4)
            : [
                `Primary reporting confirmed by ${source}.`,
                `Cross-border monitoring active across ${geoRegion}.`,
                `Market and policy indicators remain under review.`,
              ];

          const analysisText = typeof parsed.contextAnalysis === 'string' && parsed.contextAnalysis.length > 80
            ? parsed.contextAnalysis
            : `The latest developments reported by ${source} reflect ongoing shifts across ${category.toLowerCase()} sectors in ${geoRegion}. Policy analysts and industry observers are closely monitoring subsequent announcements to assess sustained market equilibrium.\n\nInternational desks are tracking stakeholder reactions as official statements and operational adjustments emerge throughout the session.`;

          const analysisHtml = analysisText
            .split('\n\n')
            .filter((p: string) => p.trim())
            .map((p: string) => `<p class="text-base text-gray-700 leading-relaxed font-sans mb-4">${p.trim()}</p>`)
            .join('');

          const content = `<p class="text-xl font-serif text-gray-900 leading-relaxed font-semibold mb-6">${cleanSummary}</p>
<div class="prose max-w-none mb-6">
  ${analysisHtml}
</div>
<div class="p-4 bg-gray-50 border-l-4 border-[#002B49] rounded text-xs text-gray-600">
  <span class="font-bold text-gray-900">Source Attribution:</span> Original reporting compiled from <a href="${sourceLink}" target="_blank" rel="noopener noreferrer" class="font-medium text-[#002B49] underline hover:text-[#CC0000]">${source}</a>. Prolific News Network independently reviews wire transmissions for multi-regional distribution.
</div>`;

          return {
            title: parsed.title ? toHeadlineCase(parsed.title) : headline,
            subtitle: cleanSummary,
            keyDevelopments: developments,
            content,
            readTimeMinutes: Number(parsed.readTimeMinutes) || 3,
          };
        }
      }
    } catch {
      // Graceful fallback below
    }
  }

  // High-depth structured editorial fallback
  const developments = [
    `Primary reporting published by ${source}.`,
    `Intelligence desk monitoring regional implications across ${geoRegion}.`,
    `Sector indicators across ${category} remain subject to evolving policy and trade updates.`,
  ];

  const content = `<p class="text-xl font-serif text-gray-900 leading-relaxed font-semibold mb-6">${cleanSummary}</p>
<div class="prose max-w-none text-gray-700 leading-relaxed font-sans space-y-4 mb-6">
  <p class="text-base leading-relaxed">
    Reporting from <strong class="text-gray-900">${source}</strong> highlights significant momentum within the <span class="font-medium text-gray-900">${category}</span> sector. Analysts in the <span class="font-medium text-gray-900">${geoRegion}</span> regional corridor note that the underlying dynamics carry broader strategic implications for institutional decision-makers and regional commerce.
  </p>
  <p class="text-base leading-relaxed">
    As cross-border trade and policy frameworks continue to adapt, subsequent briefings from official agencies and regulatory bodies are expected to clarify long-term impacts. Prolific News Network maintains continuous monitoring of this developing story across our 24/7 autonomous dispatch channels.
  </p>
</div>
<div class="p-4 bg-gray-50 border-l-4 border-[#002B49] rounded text-xs text-gray-600">
  <span class="font-bold text-gray-900">Source Attribution:</span> Original reporting provided by <a href="${sourceLink}" target="_blank" rel="noopener noreferrer" class="font-medium text-[#002B49] underline hover:text-[#CC0000]">${source}</a>. Prolific News Network curates and synthesizes verified wire feeds for global publication.
</div>`;

  return {
    title: headline,
    subtitle: cleanSummary,
    keyDevelopments: developments,
    content,
    readTimeMinutes: 3,
  };
}

export function computeValueScore(
  title: string,
  summary: string,
  source: string,
  category: string,
  tier: 1 | 2 | 3,
  pubDate: Date | null
): { valueScore: number; priorityTier: number; geoRegion: string } {
  // 1. Priority Tier Score (Weight: 40%)
  const tierScore = tier === 1 ? 100 : tier === 2 ? 75 : 55;

  // 2. Recency Decay Score (Weight: 30%)
  let recencyScore = 50;
  if (pubDate) {
    const ageHours = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
    if (ageHours <= 2) recencyScore = 100;
    else if (ageHours <= 6) recencyScore = 85;
    else if (ageHours <= 12) recencyScore = 70;
    else if (ageHours <= 24) recencyScore = 50;
    else recencyScore = 30;
  }

  // 3. Impact & Verification Weight (Weight: 30%)
  let impactScore = 60;
  const combinedText = `${title} ${summary}`.toUpperCase();
  const highImpactKeywords = [
    'BREAKING', 'URGENT', 'CRISIS', 'SUMMIT', 'CEASEFIRE', 'RATE CUT', 'INFLATION',
    'SANCTIONS', 'PRESIDENTIAL', 'ELECTION', 'HISTORIC', 'SURGE', 'INVESTIGATION',
    'DISASTER', 'MERGER', 'TREATY', 'PENTAGON', 'SECURITY COUNCIL', 'ACCORD', 'EXPLOSION',
    'TREASURY', 'STIMULUS', 'WAR', 'TRADE DEAL', 'ALLIANCE'
  ];
  for (const kw of highImpactKeywords) {
    if (combinedText.includes(kw)) {
      impactScore = Math.min(100, impactScore + 20);
      break;
    }
  }

  // Source Credibility boost
  const topSources = ['Reuters', 'Associated Press', 'Nikkei Asia', 'AllAfrica', 'UN News', 'SCMP', 'Bloomberg', 'BBC', 'MercoPress'];
  if (topSources.some(s => source.includes(s))) {
    impactScore = Math.min(100, impactScore + 15);
  }

  // Geographic region detection
  let geoRegion = 'Global';
  const catLower = category.toLowerCase();
  if (catLower.includes('africa')) geoRegion = 'Africa';
  else if (catLower.includes('asia')) geoRegion = 'Asia';
  else if (catLower.includes('latam') || catLower.includes('latin')) geoRegion = 'LatinAmerica';
  else if (catLower.includes('us')) geoRegion = 'US';

  const valueScore = Math.round(tierScore * 0.40 + recencyScore * 0.30 + impactScore * 0.30);
  return { valueScore, priorityTier: tier, geoRegion };
}

export async function fetchLiveRssFeed(
  feedUrl: string,
  category: string,
  fallbackSource: string
): Promise<WireArticle[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'ProlificNews-WireHarvester/2.0 (+https://prolific.news)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      console.warn(`[Wire] Feed returned HTTP ${res.status}: ${feedUrl}`);
      return [];
    }

    const xml = await res.text();
    const items: WireArticle[] = [];
    const itemRegex = /<(?:item|entry)(?:[\s>][\s\S]*?<\/(?:item|entry)>|[\s\S]*?$)/gi;
    const matches = xml.match(itemRegex) || [];

    for (let i = 0; i < Math.min(matches.length, 25); i++) {
      const block = matches[i];
      const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch =
        block.match(/<link[^>]*href=["']([^"']+)["']/i) ||
        block.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const descMatch =
        block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) ||
        block.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i) ||
        block.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i);
      const pubDateMatch =
        block.match(/<pubDate[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i) ||
        block.match(/<updated[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/updated>/i) ||
        block.match(/<dc:date[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/dc:date>/i);

      const rawTitle = titleMatch ? titleMatch[1].trim() : '';
      if (!rawTitle) continue;

      const { title, source } = cleanHeadline(rawTitle, fallbackSource);
      let link = linkMatch ? linkMatch[1].trim() : '';
      if (link.startsWith('<![CDATA[')) {
        link = link.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
      }
      if (!link) continue;

      const rawDesc = descMatch ? descMatch[1].trim() : '';
      const summary = cleanOrGenerateSummary(rawDesc, title, source, category);

      let pubDate = new Date();
      if (pubDateMatch && pubDateMatch[1]) {
        const parsed = new Date(pubDateMatch[1].trim());
        const now = Date.now();
        if (!isNaN(parsed.getTime()) && parsed.getTime() <= now + 60 * 60 * 1000) {
          pubDate = parsed;
        }
      }

      let mediaUrl = extractMediaUrl(block);
      if (!mediaUrl) {
        const seed = Math.abs(title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
        mediaUrl = getRandomImage(category, seed, title);
      }

      const idHash = crypto.createHash('md5').update(`${title}|${link}`).digest('hex').slice(0, 16);
      const wireId = `wire-${idHash}`;
      const slug = slugify(title, idHash.slice(0, 8));

      items.push({
        id: wireId,
        slug,
        source,
        title,
        link,
        summary,
        category,
        mediaUrl,
        pubDate: pubDate.toISOString(),
        timeAgo: calculateTimeAgo(pubDate.toISOString()),
      });
    }

    return items;
  } catch (err) {
    console.error(`[Wire] Error fetching feed from ${feedUrl}:`, err);
    return [];
  }
}

export interface FeedConfig {
  url: string;
  category: string;
  source: string;
  tier: 1 | 2 | 3;
}

export const FEED_REGISTRY: FeedConfig[] = [
  // Tier 1: High Velocity Breaking, Politics, Business & Emerging Global Hubs
  { url: 'https://news.google.com/rss/search?q=source:%22Associated%20Press%22+politics&hl=en-US&gl=US&ceid=US:en', category: 'Politics', source: 'Associated Press', tier: 1 },
  { url: 'https://moxie.foxnews.com/google-publisher/politics.xml', category: 'Politics', source: 'Fox News Politics', tier: 1 },
  { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', category: 'Politics', source: 'BBC North America', tier: 1 },
  { url: 'https://moxie.foxbusiness.com/google-publisher/markets.xml', category: 'Business', source: 'Fox Business', tier: 1 },
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', category: 'Business', source: 'CNBC Finance', tier: 1 },
  { url: 'https://news.google.com/rss/search?q=source:%22Reuters%22+business&hl=en-US&gl=US&ceid=US:en', category: 'Business', source: 'Reuters', tier: 1 },
  { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', category: 'General', source: 'Prolific Wire Desk', tier: 1 },

  // Tier 1 Regional: Africa, Asia & Latin America Primary Wires
  { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', category: 'Africa', source: 'AllAfrica Global', tier: 1 },
  { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', category: 'Africa', source: 'BBC Africa Desk', tier: 1 },
  { url: 'https://news.google.com/rss/search?q=when:24h+Africa+business+OR+politics&hl=en&gl=US&ceid=US:en', category: 'Africa', source: 'Africa Wire Desk', tier: 1 },
  { url: 'https://www.scmp.com/rss/91/feed', category: 'Asia', source: 'South China Morning Post', tier: 1 },
  { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', category: 'Asia', source: 'BBC Asia Desk', tier: 1 },
  { url: 'https://asia.nikkei.com/rss/feed/nar', category: 'Asia', source: 'Nikkei Asia', tier: 1 },
  { url: 'https://news.google.com/rss/search?q=when:24h+Asia+markets+OR+diplomacy&hl=en&gl=US&ceid=US:en', category: 'Asia', source: 'Asia-Pacific Wire', tier: 1 },
  { url: 'https://en.mercopress.com/rss', category: 'LatAm', source: 'MercoPress', tier: 1 },
  { url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', category: 'LatAm', source: 'BBC Latin America', tier: 1 },
  { url: 'https://news.google.com/rss/search?q=when:24h+Latin+America+markets+OR+governance&hl=en&gl=US&ceid=US:en', category: 'LatAm', source: 'Latin America Wire', tier: 1 },

  // Tier 2: Global & Core (Cadence: 30 min) - U.S., World, Sports, Entertainment & Regional Bureaus
  { url: 'https://moxie.foxnews.com/google-publisher/us.xml', category: 'US', source: 'Fox News U.S.', tier: 2 },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'World', source: 'BBC World Service', tier: 2 },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'World', source: 'Al Jazeera Global', tier: 2 },
  { url: 'https://moxie.foxnews.com/google-publisher/world.xml', category: 'World', source: 'Fox World', tier: 2 },
  { url: 'https://news.google.com/rss/search?q=source:%22Reuters%22+world&hl=en-US&gl=US&ceid=US:en', category: 'World', source: 'Reuters', tier: 2 },
  { url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', category: 'World', source: 'UN News', tier: 2 },
  { url: 'https://news.google.com/rss/search?q=source:%22Premium%20Times%22+OR+source:%22Daily%20Nation%22+OR+source:%22News24%22&hl=en&gl=US&ceid=US:en', category: 'Africa', source: 'Pan-Africa Bureau', tier: 2 },
  { url: 'https://news.google.com/rss/search?q=source:%22The%20Straits%20Times%22+OR+source:%22Channel%20News%20Asia%22&hl=en&gl=US&ceid=US:en', category: 'Asia', source: 'Southeast Asia Desk', tier: 2 },
  { url: 'https://news.google.com/rss/search?q=source:%22Buenos%20Aires%20Times%22+OR+source:%22Rio%20Times%22&hl=en&gl=US&ceid=US:en', category: 'LatAm', source: 'South America Bureau', tier: 2 },
  { url: 'https://moxie.foxnews.com/google-publisher/sports.xml', category: 'Sports', source: 'Fox Sports', tier: 2 },
  { url: 'https://www.espn.com/espn/rss/news', category: 'Sports', source: 'ESPN', tier: 2 },
  { url: 'https://moxie.foxnews.com/google-publisher/entertainment.xml', category: 'Entertainment', source: 'Fox Entertainment', tier: 2 },

  // Tier 3: Thought Leadership, Tech, Science, Opinion, Lifestyle
  { url: 'https://moxie.foxnews.com/google-publisher/opinion.xml', category: 'Opinion', source: 'Fox News Opinion', tier: 3 },
  { url: 'https://theconversation.com/global/articles.atom', category: 'Opinion', source: 'The Conversation', tier: 3 },
  { url: 'https://techcrunch.com/feed/', category: 'Tech', source: 'TechCrunch', tier: 3 },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Tech', source: 'Ars Technica', tier: 3 },
  { url: 'https://moxie.foxnews.com/google-publisher/tech.xml', category: 'Tech', source: 'Fox Tech', tier: 3 },
  { url: 'https://www.nasa.gov/news-release/feed/', category: 'Tech', source: 'NASA', tier: 3 },
  { url: 'https://moxie.foxnews.com/google-publisher/lifestyle.xml', category: 'Lifestyle', source: 'Fox Lifestyle', tier: 3 },
  { url: 'https://moxie.foxnews.com/google-publisher/travel.xml', category: 'Lifestyle', source: 'Fox Travel', tier: 3 },
];

async function fetchAndDeduplicateFeeds(configs: FeedConfig[]): Promise<WireArticle[]> {
  const promises = configs.map((f) => fetchLiveRssFeed(f.url, f.category, f.source));
  const results = await Promise.allSettled(promises);
  const allArticles: WireArticle[] = [];

  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      allArticles.push(...r.value);
    }
  }

  const seen = new Set<string>();
  return allArticles.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function pullTieredNewsFeed(tier: 1 | 2 | 3): Promise<WireArticle[]> {
  const configs = FEED_REGISTRY.filter((f) => f.tier === tier);
  return await fetchAndDeduplicateFeeds(configs);
}

export async function pullCategoryNewsFeed(category: string): Promise<WireArticle[]> {
  const normalized = category.toLowerCase();
  const configs = FEED_REGISTRY.filter((f) => f.category.toLowerCase() === normalized);
  return await fetchAndDeduplicateFeeds(configs.length > 0 ? configs : FEED_REGISTRY.filter((f) => f.tier === 1));
}

export async function pullRealNewsFeed(): Promise<WireArticle[]> {
  return await fetchAndDeduplicateFeeds(FEED_REGISTRY);
}

async function insertWireArticles(wireNews: WireArticle[]): Promise<number> {
  if (wireNews.length === 0) return 0;
  const db = createDb();
  let insertedCount = 0;

  const valuesToInsert = wireNews.map((item) => {
    const { valueScore, geoRegion } = computeValueScore(
      item.title,
      item.summary,
      item.source,
      item.category,
      1,
      new Date(item.pubDate)
    );
    return {
      id: item.id,
      slug: item.slug,
      source: item.source,
      title: item.title,
      link: item.link,
      summary: item.summary,
      category: item.category,
      mediaUrl: item.mediaUrl,
      valueScore,
      geoRegion,
      pubDate: new Date(item.pubDate),
      stagedAsDraft: false,
      isArchived: false,
    };
  });

  try {
    await db.insert(wireItems).values(valuesToInsert).onConflictDoNothing();
    insertedCount = valuesToInsert.length;
  } catch (err) {
    console.warn('[Wire] Bulk insert fallback to individual insert:', err);
    for (const val of valuesToInsert) {
      try {
        await db.insert(wireItems).values(val).onConflictDoNothing();
        insertedCount++;
      } catch {
        // ignore unique conflict
      }
    }
  }

  return insertedCount;
}

export const CATEGORY_ID_MAP: Record<string, string> = {
  politics: 'cat-politics',
  us: 'cat-us',
  opinion: 'cat-opinion',
  entertainment: 'cat-entertainment',
  sports: 'cat-sports',
  lifestyle: 'cat-lifestyle',
  business: 'cat-business',
  world: 'cat-world',
  tech: 'cat-tech',
  africa: 'cat-africa',
  asia: 'cat-asia',
  latam: 'cat-latam',
};

export const CATEGORY_SLUGS = [
  'politics',
  'us',
  'opinion',
  'entertainment',
  'sports',
  'lifestyle',
  'business',
  'world',
  'tech',
  'africa',
  'asia',
  'latam',
];

export async function revalidateEdge(paths?: string[]): Promise<void> {
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://prolific.news';
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    console.warn('[Revalidate] REVALIDATION_SECRET not set; skipping edge purge');
    return;
  }
  // Only purge the homepage by default; category/archive pages refresh via ISR (revalidate = 300)
  const targets = paths && paths.length ? paths : ['/'];
  await Promise.allSettled(
    targets.map((path) =>
      fetch(`${webUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, secret }),
        signal: AbortSignal.timeout(5000),
      })
    )
  );
}

export async function autoPromoteFreshWireItems(
  perCategory = 3,
  maxTotal = 3
): Promise<{ promoted: number; byCategory: Record<string, number> }> {
  const db = createDb();
  const rows = await db
    .select()
    .from(wireItems)
    .where(eq(wireItems.isArchived, false))
    .orderBy(desc(wireItems.pubDate))
    .limit(300);

  const taken: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let promoted = 0;
  const now = Date.now();

  let highestScore = 0;
  let topCandidateId = '';

  const selected: Array<{
    row: (typeof rows)[number];
    articleId: string;
    categoryId: string;
    title: string;
    summary: string;
    slug: string;
    valueScore: number;
    priorityTier: number;
    geoRegion: string;
  }> = [];

  for (const r of rows) {
    const categoryId = CATEGORY_ID_MAP[(r.category || '').toLowerCase()];
    if (!categoryId) continue;
    if ((taken[categoryId] || 0) >= perCategory) continue;
    if (r.pubDate && r.pubDate.getTime() > now + 60 * 60 * 1000) continue;
    taken[categoryId] = (taken[categoryId] || 0) + 1;

    const title = stripHtml(r.title);
    const summary = stripHtml(r.summary || '') || cleanOrGenerateSummary('', title, r.source, r.category);
    const slug = r.slug || slugify(title, r.id.replace('wire-', ''));
    const articleId = `art-${r.id.replace('wire-', '')}`;

    // Compute value score and tier
    const { valueScore, priorityTier, geoRegion } = computeValueScore(
      title,
      summary,
      r.source,
      r.category,
      1,
      r.pubDate
    );

    if (valueScore > highestScore) {
      highestScore = valueScore;
      topCandidateId = articleId;
    }

    selected.push({
      row: r,
      articleId,
      categoryId,
      title,
      summary,
      slug,
      valueScore,
      priorityTier,
      geoRegion,
    });
  }

  // Deduplicate BEFORE calling enrichArticleContent() so we never run LLM calls for already-published articles
  const candidateIds = selected.map((s) => s.articleId);
  const existingRows = candidateIds.length
    ? await db
        .select({ id: articles.id, isLeadHero: articles.isLeadHero })
        .from(articles)
        .where(inArray(articles.id, candidateIds))
    : [];
  const existingIds = new Set(existingRows.map((e) => e.id));
  const currentHeroIsTop = existingRows.some((e) => e.id === topCandidateId && e.isLeadHero);

  const toInsert = selected.filter((s) => !existingIds.has(s.articleId));
  // Sort candidate promotions by valueScore descending so highest-impact/breaking stories are promoted first
  toInsert.sort((a, b) => b.valueScore - a.valueScore);
  const cappedToInsert = toInsert.slice(0, maxTotal);

  // Process genuinely new articles in small bounded parallel batches (max 3 concurrent LLM enrichments)
  const BATCH_SIZE = 3;
  for (let i = 0; i < cappedToInsert.length; i += BATCH_SIZE) {
    const batch = cappedToInsert.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map(async (item) => {
        const { row: r, articleId, categoryId, title, summary, slug, valueScore, priorityTier, geoRegion } = item;
        const enriched = await enrichArticleContent(
          title,
          summary,
          r.source,
          r.category,
          geoRegion,
          r.link
        );

        try {
          const inserted = await db
            .insert(articles)
            .values({
              id: articleId,
              slug,
              title: enriched.title,
              subtitle: enriched.subtitle,
              keyDevelopments: enriched.keyDevelopments,
              content: enriched.content,
              categoryId,
              tags: [r.category, r.source, geoRegion],
              authorId: 'auth-ed-board',
              leadMediaType: 'IMAGE',
              leadMediaUrl: r.mediaUrl,
              leadMediaCaption: `${enriched.title} — via ${r.source}.`,
              isLeadHero: false,
              // "Breaking" is an editorial decision and is never inferred from the score.
              isBreaking: false,
              status: 'PUBLISHED',
              readTimeMinutes: enriched.readTimeMinutes,
              valueScore,
              priorityTier,
              geoRegion,
              publishedAt: r.pubDate || new Date(),
            })
            .onConflictDoNothing()
            .returning({ id: articles.id });

          if (inserted.length > 0) {
            promoted++;
            byCategory[categoryId] = (byCategory[categoryId] || 0) + 1;
          }
        } catch (err) {
          console.warn('[AutoPromote] insert failed for', r.id, err);
        }
      })
    );
  }

  // Promote single highest value score article to isLeadHero = true (only when hero actually changed)
  if (topCandidateId && highestScore >= 80 && !currentHeroIsTop) {
    try {
      await db.update(articles).set({ isLeadHero: false }).where(eq(articles.isLeadHero, true));
      await db.update(articles).set({ isLeadHero: true }).where(eq(articles.id, topCandidateId));
    } catch (err) {
      console.warn('[AutoPromote] lead hero update failed:', err);
    }
  }

  // Freshness guard: breaking alerts auto-expire after 6 hours
  try {
    await db
      .update(breakingAlerts)
      .set({ active: false })
      .where(and(eq(breakingAlerts.active, true), lt(breakingAlerts.publishedAt, new Date(now - 6 * 60 * 60 * 1000))));
  } catch (err) {
    console.warn('[AutoPromote] alert expiry failed:', err);
  }

  return { promoted, byCategory };
}

export async function ingestFeedsToNeonDb(tier?: 1 | 2 | 3): Promise<{ inserted: number; total: number }> {
  const wireNews = tier ? await pullTieredNewsFeed(tier) : await pullRealNewsFeed();
  const inserted = await insertWireArticles(wireNews);
  return { inserted, total: wireNews.length };
}

export async function promoteAndRevalidateWireItems(
  perCategory = 3
): Promise<{ promoted: number; byCategory: Record<string, number> }> {
  const result = await autoPromoteFreshWireItems(perCategory);
  if (result.promoted > 0) {
    await revalidateEdge();
  }
  return result;
}

export async function syncTieredFeedsToNeonDb(tier: 1 | 2 | 3): Promise<{ inserted: number; total: number; tier: number; promoted: number }> {
  const wireNews = await pullTieredNewsFeed(tier);
  const inserted = await insertWireArticles(wireNews);
  let promoted = 0;
  try {
    const maxPromote = tier === 1 ? 2 : 1;
    ({ promoted } = await autoPromoteFreshWireItems(tier === 1 ? 2 : 1, maxPromote));
    if (promoted > 0) {
      await revalidateEdge();
    }
  } catch (err) {
    console.error('[AutoPromote] failed:', err);
  }
  return { inserted, total: wireNews.length, tier, promoted };
}

export async function syncCategoryFeedToNeonDb(category: string): Promise<{ inserted: number; total: number; category: string }> {
  const wireNews = await pullCategoryNewsFeed(category);
  const inserted = await insertWireArticles(wireNews);
  return { inserted, total: wireNews.length, category };
}

export async function syncWireFeedsToNeonDb(): Promise<{ inserted: number; total: number; promoted: number }> {
  console.log('[Wire] Pulling feeds across all 12 categories...');
  const allNews = await pullRealNewsFeed();
  console.log(`[Wire] Fetched and deduplicated ${allNews.length} wire articles`);

  const inserted = await insertWireArticles(allNews);
  console.log(`[Wire] Inserted ${inserted} new items into Neon DB`);

  let promoted = 0;
  try {
    const promoResult = await autoPromoteFreshWireItems(2, 3);
    promoted = promoResult.promoted;
    console.log(`[Wire] Auto-promoted ${promoted} fresh articles across categories:`, promoResult.byCategory);
    if (promoted > 0) {
      await revalidateEdge();
    }
  } catch (err) {
    console.error('[Wire] Auto-promote step failed:', err);
  }

  return { inserted, total: allNews.length, promoted };
}

export async function archiveOldContent(options: {
  wireRetentionDays?: number;
  articleRetentionDays?: number;
} = {}): Promise<{ archivedWireCount: number; archivedArticleCount: number }> {
  const wireDays = options.wireRetentionDays ?? 14;
  const articleDays = options.articleRetentionDays ?? 30;
  const db = createDb();
  const now = new Date();

  const wireCutoff = new Date(now.getTime() - wireDays * 24 * 60 * 60 * 1000);
  const articleCutoff = new Date(now.getTime() - articleDays * 24 * 60 * 60 * 1000);

  let archivedWireCount = 0;
  let archivedArticleCount = 0;

  try {
    const wireRes = await db
      .update(wireItems)
      .set({ isArchived: true, archivedAt: now })
      .where(and(eq(wireItems.isArchived, false), lt(wireItems.pubDate, wireCutoff)))
      .returning({ id: wireItems.id });
    archivedWireCount = wireRes.length;
  } catch (err) {
    console.error('[Archive] wire items archival failed:', err);
  }

  try {
    const artRes = await db
      .update(articles)
      .set({ status: 'ARCHIVED', archivedAt: now })
      .where(and(eq(articles.status, 'PUBLISHED'), lt(articles.publishedAt, articleCutoff)))
      .returning({ id: articles.id });
    archivedArticleCount = artRes.length;
  } catch (err) {
    console.error('[Archive] articles archival failed:', err);
  }

  return { archivedWireCount, archivedArticleCount };
}

export async function promoteWireItemToArticle(
  item: WireArticle,
  options: { isLeadHero?: boolean; isBreaking?: boolean; authorId?: string } = {}
): Promise<{ success: boolean; articleId: string; slug: string }> {
  const db = createDb();
  const title = stripHtml(item.title);
  const summary = stripHtml(item.summary || '') || cleanOrGenerateSummary('', title, item.source, item.category);
  const slug = item.slug || slugify(title, item.id.replace('wire-', ''));
  const categoryId = CATEGORY_ID_MAP[(item.category || '').toLowerCase()] || 'cat-world';
  const articleId = `art-${item.id.replace('wire-', '')}`;
  const label = item.category.toUpperCase();

  const { valueScore, priorityTier, geoRegion } = computeValueScore(
    title,
    summary,
    item.source,
    item.category,
    1,
    item.pubDate ? new Date(item.pubDate) : new Date()
  );

  const enriched = await enrichArticleContent(
    title,
    summary,
    item.source,
    item.category,
    geoRegion,
    item.link
  );

  await db
    .insert(articles)
    .values({
      id: articleId,
      slug,
      title: enriched.title,
      subtitle: enriched.subtitle,
      keyDevelopments: enriched.keyDevelopments,
      content: enriched.content,
      categoryId,
      tags: [item.category, item.source, geoRegion],
      authorId: options.authorId || 'auth-ed-board',
      leadMediaType: 'IMAGE',
      leadMediaUrl: item.mediaUrl,
      leadMediaCaption: `${enriched.title} — via ${item.source}.`,
      isLeadHero: options.isLeadHero ?? false,
      isBreaking: options.isBreaking ?? false,
      status: 'PUBLISHED',
      readTimeMinutes: enriched.readTimeMinutes,
      valueScore,
      priorityTier,
      geoRegion,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    })
    .onConflictDoUpdate({
      target: articles.slug,
      set: {
        title: enriched.title,
        subtitle: enriched.subtitle,
        keyDevelopments: enriched.keyDevelopments,
        content: enriched.content,
        isLeadHero: options.isLeadHero ?? false,
        isBreaking: options.isBreaking ?? false,
        valueScore,
        priorityTier,
        geoRegion,
      },
    });

  if (options.isLeadHero) {
    await db.update(articles).set({ isLeadHero: false });
    await db.update(articles).set({ isLeadHero: true }).where(eq(articles.id, articleId));
  }

  await revalidateEdge();

  return { success: true, articleId, slug };
}
