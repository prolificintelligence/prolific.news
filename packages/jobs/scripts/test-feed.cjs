const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'ProlificNews-WireHarvester/2.0 (+https://prolific.news)'
      },
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function test() {
  console.log('Testing Fox News Politics feed...');
  const res = await fetchUrl('https://moxie.foxnews.com/google-publisher/politics.xml');
  console.log('Status:', res.status);
  const match = res.data.match(/<pubDate>([^<]+)<\/pubDate>/g);
  if (match) {
    console.log('Sample pubDates:', match.slice(0, 3));
  } else {
    console.log('No pubDates found');
  }
}

test().catch(console.error);
