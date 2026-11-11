import fs from 'node:fs';
import crypto from 'node:crypto';
import { neon } from '../packages/db/node_modules/@neondatabase/serverless/index.mjs';
import { hashPassword, verifyPassword } from '../node_modules/.pnpm/@better-auth+utils@0.5.1/node_modules/@better-auth/utils/dist/password.node.mjs';

// 1. Read admin credentials
const adminCredsRaw = fs.readFileSync('D:/Projects/secrets/prolific-news-admin.md', 'utf8');
const lines = adminCredsRaw.split('\n').map(l => l.trim()).filter(Boolean);
let username = '';
let password = '';
for (const line of lines) {
  if (line.startsWith('ADMIN_USERNAME=')) {
    username = line.slice('ADMIN_USERNAME='.length).trim();
  } else if (line.startsWith('ADMIN_PASSWORD=')) {
    password = line.slice('ADMIN_PASSWORD='.length).trim();
  }
}

if (!username || !password) {
  throw new Error('Failed to parse ADMIN_USERNAME or ADMIN_PASSWORD from secrets file');
}

console.log(`Setting up admin user: ${username}`);

// 2. Hash password
const hashedPassword = await hashPassword(password);
const verification = await verifyPassword(hashedPassword, password);
if (!verification) {
  throw new Error('Hash self-verification failed!');
}
console.log('Password successfully hashed and verified with scrypt config (r=16, N=16384, p=1, dkLen=64).');

// 3. Connect to Neon Auth DB
const dbUrl = fs.readFileSync('D:/Projects/secrets/Prolific-Neon-DatabaseURL.md', 'utf8').trim();
const sql = neon(dbUrl);

// 4. Check user existence
const existingUsers = await sql`
  SELECT "id", "email" FROM neon_auth.user WHERE LOWER("email") = LOWER(${username})
`;

let targetUserId;
if (existingUsers.length > 0) {
  targetUserId = existingUsers[0].id;
  console.log(`User ${username} already exists with id ${targetUserId}. Updating password...`);
  
  await sql`
    UPDATE neon_auth.user
    SET "emailVerified" = true, "banned" = false, "updatedAt" = NOW()
    WHERE "id" = ${targetUserId}
  `;

  const existingAccount = await sql`
    SELECT "id" FROM neon_auth.account WHERE "userId" = ${targetUserId} AND "providerId" = 'credential'
  `;

  if (existingAccount.length > 0) {
    await sql`
      UPDATE neon_auth.account
      SET "password" = ${hashedPassword}, "updatedAt" = NOW()
      WHERE "id" = ${existingAccount[0].id}
    `;
    console.log('Existing account password updated.');
  } else {
    const newAccountId = crypto.randomUUID();
    await sql`
      INSERT INTO neon_auth.account ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
      VALUES (${newAccountId}, ${targetUserId}, 'credential', ${targetUserId}, ${hashedPassword}, NOW(), NOW())
    `;
    console.log('Inserted new credential account for existing user.');
  }
} else {
  targetUserId = crypto.randomUUID();
  console.log(`User ${username} does not exist. Creating with id ${targetUserId}...`);

  await sql`
    INSERT INTO neon_auth.user ("id", "name", "email", "emailVerified", "role", "banned", "createdAt", "updatedAt")
    VALUES (${targetUserId}, 'Prolific Intelligence', ${username}, true, 'user', false, NOW(), NOW())
  `;

  const accountId = crypto.randomUUID();
  await sql`
    INSERT INTO neon_auth.account ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
    VALUES (${accountId}, ${targetUserId}, 'credential', ${targetUserId}, ${hashedPassword}, NOW(), NOW())
  `;
  console.log('Inserted user and account records successfully.');
}

async function fetchWithRetry(url, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`Fetch attempt ${attempt} failed (${err.message}), retrying in 1s...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// 5. Test sign in against live endpoint
console.log('Testing sign-in against Neon Auth directly...');
const directRes = await fetchWithRetry('https://ep-falling-dew-ax8q855g.neonauth.c-4.us-east-2.aws.neon.tech/neondb/auth/sign-in/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://admin.prolific.news'
  },
  body: JSON.stringify({ email: username, password })
});
console.log(`Direct Neon Auth response status: ${directRes.status} ${directRes.statusText}`);
const directBody = await directRes.text();
console.log('Direct response (parsed):', directRes.ok ? 'Authentication SUCCESSFUL' : directBody);

console.log('\nTesting sign-in via https://admin.prolific.news/api/auth/sign-in/email...');
const adminRes = await fetchWithRetry('https://admin.prolific.news/api/auth/sign-in/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://admin.prolific.news'
  },
  body: JSON.stringify({ email: username, password })
});
console.log(`Admin endpoint response status: ${adminRes.status} ${adminRes.statusText}`);
const adminCookies = adminRes.headers.get('set-cookie');
console.log('Set-Cookie received:', !!adminCookies);
const adminBody = await adminRes.text();
console.log('Admin response (parsed):', adminRes.ok ? 'Admin Sign-In SUCCESSFUL' : adminBody);
