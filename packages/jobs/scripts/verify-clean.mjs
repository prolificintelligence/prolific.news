async function verifyHtml() {
  console.log('Fetching live homepage...');
  const res = await fetch('https://prolific.news', { cache: 'no-store' });
  const html = await res.text();

  const hasRawOl = html.includes('&lt;ol') || html.includes('<ol>');
  const hasRawFont = html.includes('&lt;font') || html.includes('<font');
  const hasGoogleRedirect = html.includes('news.google.com/rss/articles/');

  console.log('--- Verification Checklist ---');
  console.log('Has raw <ol> tags in body:', hasRawOl);
  console.log('Has raw <font> tags in body:', hasRawFont);
  console.log('Has leaked google redirect URLs in prose:', hasGoogleRedirect);

  // Extract Lead Headline
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const headline = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'N/A';
  console.log('Lead Headline:', headline);

  // Find first article link
  const artLinkMatch = html.match(/\/article\/([a-zA-Z0-9_-]+)/);
  if (artLinkMatch) {
    const slug = artLinkMatch[1];
    console.log('\nTesting article reader page: /article/' + slug);
    const artRes = await fetch('https://prolific.news/article/' + slug, { cache: 'no-store' });
    const artHtml = await artRes.text();
    console.log('Article page HTTP status:', artRes.status);
    console.log('Article has raw <ol>:', artHtml.includes('&lt;ol') || artHtml.includes('<ol>'));
    console.log('Article has raw <font>:', artHtml.includes('&lt;font') || artHtml.includes('<font'));
  }
}

verifyHtml().catch(console.error);
