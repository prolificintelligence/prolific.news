import https from 'node:https';
import fs from 'node:fs';
import sodium from 'libsodium-wrappers';

const GITHUB_TOKEN = fs.readFileSync('D:/Projects/secrets/Prolific-Intelligence-GitHub.md', 'utf8').trim();
const envWeb = fs.readFileSync('apps/web/.env.local', 'utf8');

const cronMatch = envWeb.match(/CRON_SECRET=([^\r\n]+)/);
if (!cronMatch) {
  console.error('CRON_SECRET not found in apps/web/.env.local');
  process.exit(1);
}
const CRON_SECRET = cronMatch[1].trim();

const REPO = 'prolificintelligence/prolific.news';

function githubRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'User-Agent': 'Node-Secret-Sync',
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function uploadSecret(name, value) {
  await sodium.ready;
  console.log(`Fetching public key for ${REPO}...`);
  const pkRes = await githubRequest(`/repos/${REPO}/actions/secrets/public-key`);
  if (pkRes.status !== 200) {
    throw new Error(`Failed to get public key: ${pkRes.status} ${JSON.stringify(pkRes.body)}`);
  }

  const { key_id, key } = pkRes.body;
  const messageBytes = sodium.from_string(value);
  const keyBytes = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
  const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);
  const encrypted_value = sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);

  console.log(`Uploading secret ${name} to ${REPO}...`);
  const putRes = await githubRequest(`/repos/${REPO}/actions/secrets/${name}`, 'PUT', {
    encrypted_value,
    key_id,
  });

  if (putRes.status === 201 || putRes.status === 204) {
    console.log(`✅ Successfully uploaded secret ${name} to GitHub!`);
  } else {
    console.error(`❌ Failed to upload secret ${name}:`, putRes.status, putRes.body);
  }
}

async function main() {
  await uploadSecret('CRON_SECRET', CRON_SECRET);
}

main().catch(console.error);