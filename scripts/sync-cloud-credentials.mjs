import fs from 'node:fs';

const token = fs.readFileSync('D:/Projects/secrets/Prolific-Intelligence-Vercel.md', 'utf8').trim();
const teamId = 'team_gqrZowpHHbERjgyu6YxjWwq3';

const secrets = fs.readFileSync('D:/Projects/secrets/prolific-new-socials.md', 'utf8');
const envVars = {};
for (const line of secrets.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    envVars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

// Ensure clean verified values
if (envVars.BLUESKY_HANDLE === 'prolificnews.bsky.socia') {
  envVars.BLUESKY_HANDLE = 'prolificnews.bsky.social';
}
if (envVars.NEXT_PUBLIC_MASTODON_URL === 'https://mastodon.social/@prolificnews' && envVars.MASTODON_INSTANCE_URL === 'https://social.vivaldi.net') {
  envVars.NEXT_PUBLIC_MASTODON_URL = 'https://social.vivaldi.net/@prolificnews';
}

if (fs.existsSync('D:/Projects/secrets/prolific-engines- openrouter-kk.md')) {
  envVars.OPENROUTER_API_KEY = fs.readFileSync('D:/Projects/secrets/prolific-engines- openrouter-kk.md', 'utf8').trim();
}
if (fs.existsSync('D:/Projects/secrets/prolific-mailsending-resend.md')) {
  envVars.RESEND_API_KEY = fs.readFileSync('D:/Projects/secrets/prolific-mailsending-resend.md', 'utf8').trim();
}

function updateLocalEnvFile(filePath) {
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  }
  const lines = content.split('\n');
  const existingKeys = new Set();
  const updatedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        if (key in envVars) {
          updatedLines.push(`${key}=${envVars[key]}`);
          existingKeys.add(key);
          continue;
        }
      }
    }
    updatedLines.push(line);
  }

  for (const [key, val] of Object.entries(envVars)) {
    if (!existingKeys.has(key)) {
      updatedLines.push(`${key}=${val}`);
    }
  }

  fs.writeFileSync(filePath, updatedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n', 'utf8');
  console.log(`Updated local file: ${filePath}`);
}

async function syncToVercel(projectId, projectName) {
  console.log(`\n--- Syncing to Vercel project: ${projectName} (${projectId}) ---`);
  
  // 1. Fetch existing env vars
  const getRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await getRes.json();
  const existingMap = new Map();
  for (const item of (data.envs || [])) {
    existingMap.set(item.key, item.id);
  }

  const targets = ['production', 'preview', 'development'];

  for (const [key, val] of Object.entries(envVars)) {
    if (existingMap.has(key)) {
      const envId = existingMap.get(key);
      const patchRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${envId}?teamId=${teamId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: val,
          target: targets
        })
      });
      if (patchRes.ok) {
        console.log(`  Updated ${key} on Vercel`);
      } else {
        const err = await patchRes.json();
        console.error(`  Failed to patch ${key}:`, err);
      }
    } else {
      const postRes = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key,
          value: val,
          type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
          target: targets
        })
      });
      if (postRes.ok) {
        console.log(`  Created ${key} on Vercel`);
      } else {
        const err = await postRes.json();
        console.error(`  Failed to create ${key}:`, err);
      }
    }
  }
}

async function run() {
  updateLocalEnvFile('apps/web/.env.local');
  updateLocalEnvFile('apps/admin/.env.local');
  updateLocalEnvFile('.env');

  await syncToVercel('prj_MThocIQeynpwaRaCBPd7wQcztaKU', 'prolific-news-web');
  await syncToVercel('prj_CcmTCF2ksxdfz5P9vAhdsaGOqSr4', 'prolific-news-admin');
  console.log('\nAll cloud credentials successfully synchronized!');
}

run().catch(console.error);
