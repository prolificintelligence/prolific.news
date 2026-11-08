async function testUrl(url, expectedCategory) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    });
    const html = await res.text();
    const hasRawOl = html.includes('&lt;ol') || html.includes('<ol>');
    const hasRawFont = html.includes('&lt;font') || html.includes('<font');
    const hasCnn = /\bcnn\b/i.test(html) && !html.includes('EXCLUDE CNN');
    const hasBbc = /\bbbc\b/i.test(html) && !html.includes('EXCLUDE BBC');

    // Extract first h1 or h2 headline
    const hMatch = html.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
    const headline = hMatch ? hMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 70) : 'None';

    const hasMedia = html.includes('<img') || html.includes('url(');

    console.log(`[${res.status}] ${expectedCategory.padEnd(16)} | Clean: ${!hasRawOl && !hasRawFont ? 'YES' : 'NO '} | Media: ${hasMedia ? 'YES' : 'NO '} | No CNN/BBC: ${!hasCnn && !hasBbc ? 'YES' : 'NO '} | Headline: ${headline}`);
    return res.status === 200 && !hasRawOl && !hasRawFont;
  } catch (e) {
    console.log(`[FAIL] ${expectedCategory.padEnd(16)} | Error: ${e.message}`);
    return false;
  }
}

async function verifyAll() {
  console.log('=== Verifying Prolific News Network Across All 9 Categories & Key Portals ===\n');

  // 1. Home
  await testUrl('https://prolific.news', 'Homepage');

  // 2. All 9 Categories
  const categories = [
    'politics',
    'us',
    'opinion',
    'entertainment',
    'sports',
    'lifestyle',
    'business',
    'world',
    'tech',
  ];

  for (const cat of categories) {
    await testUrl(`https://prolific.news/category/${cat}`, `Category: ${cat}`);
  }

  // 3. Dynamic Article Reader Check
  console.log('\n=== Verifying Active Breaking Alert & Article Reader ===');
  const homeRes = await fetch('https://prolific.news', { cache: 'no-store' });
  const homeHtml = await homeRes.text();
  const artMatches = [...homeHtml.matchAll(/\/article\/([a-zA-Z0-9_-]+)/g)];
  if (artMatches.length > 0) {
    const slug = artMatches[0][1];
    await testUrl(`https://prolific.news/article/${slug}`, `Article: ${slug.slice(0, 20)}`);
  }

  // 4. Admin portals
  console.log('\n=== Verifying Newsroom Admin Endpoints ===');
  for (const path of ['', '/wire', '/articles']) {
    const url = 'https://admin.prolific.news' + path;
    const res = await fetch(url, { cache: 'no-store' });
    console.log(`[${res.status}] Admin ${path || '/dashboard'}`);
  }
}

verifyAll().catch(console.error);
