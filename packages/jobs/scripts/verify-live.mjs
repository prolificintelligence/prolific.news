async function verify() {
  console.log('Testing live endpoints...');

  // 1. Web Portal
  const webRes = await fetch('https://prolific.news', { cache: 'no-store' });
  const webHtml = await webRes.text();
  console.log('prolific-news-web HTTP Status:', webRes.status, 'HTML length:', webHtml.length);
  const match = webHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  console.log('Homepage Lead Headline:', match ? match[1].replace(/<[^>]+>/g, '').trim() : 'N/A');

  // 2. Admin Portal & APIs
  const adminRes = await fetch('https://admin.prolific.news', { cache: 'no-store' });
  console.log('prolific-news-admin HTTP Status:', adminRes.status);

  const wireApi = await fetch('https://admin.prolific.news/api/wire', { cache: 'no-store' });
  const wireData = await wireApi.json();
  console.log('Admin /api/wire Status:', wireApi.status, 'Items count:', wireData.items ? wireData.items.length : 0);

  const artApi = await fetch('https://admin.prolific.news/api/articles', { cache: 'no-store' });
  const artData = await artApi.json();
  console.log('Admin /api/articles Status:', artApi.status, 'Articles count:', artData.articles ? artData.articles.length : 0);

  const alertApi = await fetch('https://admin.prolific.news/api/alerts', { cache: 'no-store' });
  const alertData = await alertApi.json();
  console.log('Admin /api/alerts Status:', alertApi.status, 'Active alert:', alertData.alert?.headline);
}

verify().catch(console.error);
