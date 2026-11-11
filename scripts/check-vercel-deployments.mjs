import https from 'node:https';

import fs from 'node:fs';

let VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
if (!VERCEL_TOKEN && fs.existsSync('D:/Projects/secrets/Prolific-Intelligence-Vercel.md')) {
  VERCEL_TOKEN = fs.readFileSync('D:/Projects/secrets/Prolific-Intelligence-Vercel.md', 'utf8').trim();
}
const TEAM_ID = 'team_gqrZowpHHbERjgyu6YxjWwq3';
const CLOUDFLARE_IP = '64.239.109.129';

function vercelRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const fullPath = path.includes('?') ? `${path}&teamId=${TEAM_ID}` : `${path}?teamId=${TEAM_ID}`;
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: fullPath,
      method,
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
        Host: 'api.vercel.com',
      },
      lookup: (h, opts, cb) => {
        if (opts && opts.all) {
          cb(null, [{ address: CLOUDFLARE_IP, family: 4 }]);
        } else {
          cb(null, CLOUDFLARE_IP, 4);
        }
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function check() {
  console.log('Fetching latest Vercel deployments...');
  const res = await vercelRequest('/v6/deployments?limit=10');
  if (res.status !== 200) {
    console.error('Error fetching deployments:', res.status, res.body);
    return;
  }

  const deps = res.body.deployments || [];
  console.log(`Found ${deps.length} recent deployments:`);
  for (const d of deps) {
    console.log(`- Project: ${d.name} | State: ${d.state} | URL: https://${d.url} | Created: ${new Date(d.createdAt).toLocaleTimeString()}`);
  }
}

check().catch(console.error);
