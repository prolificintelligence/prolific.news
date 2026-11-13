import https from 'node:https';
import fs from 'node:fs';

const envWeb = fs.readFileSync('apps/web/.env.local', 'utf8');
const match = envWeb.match(/CRON_SECRET=([^\r\n]+)/);
if (!match) {
  console.error('CRON_SECRET not found in apps/web/.env.local');
  process.exit(1);
}
const secret = match[1].trim();

const options = {
  hostname: 'prolific.news',
  port: 443,
  path: '/api/cron/ingest?mode=tier1&social=0',
  method: 'GET',
  headers: {
    'User-Agent': 'Prolific-Ingest-Tester/1.0',
    Authorization: `Bearer ${secret}`,
  },
};

console.log('Sending authorized test request to https://prolific.news/api/cron/ingest...');
const start = Date.now();
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    const elapsed = Date.now() - start;
    console.log(`Response HTTP ${res.statusCode} in ${elapsed}ms:`);
    console.log(data);
  });
});

req.on('error', (err) => console.error('Request error:', err));
req.end();