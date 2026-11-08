import https from 'node:https';

const ENDPOINTS = [
  'https://prolific-news-web.vercel.app',
  'https://prolific-news-web.vercel.app/watch',
  'https://prolific-news-web.vercel.app/for-you',
  'https://prolific-news-web.vercel.app/category/africa',
  'https://prolific-news-web.vercel.app/category/asia',
  'https://prolific-news-web.vercel.app/category/latam',
  'https://prolific-news-admin.vercel.app',
];

async function verify(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Prolific-Auditor/1.0' } }, (res) => {
      let len = 0;
      res.on('data', (c) => len += c.length);
      res.on('end', () => {
        resolve({ url, status: res.statusCode, bytes: len });
      });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function run() {
  console.log('--- VERIFYING LIVE PRODUCTION ENDPOINTS ---');
  for (const u of ENDPOINTS) {
    const res = await verify(u);
    if (res.status === 200) {
      console.log(`✅ [HTTP 200] ${res.url} (${res.bytes} bytes)`);
    } else {
      console.log(`❌ [HTTP ${res.status || res.error}] ${res.url}`);
    }
  }
}

run();
