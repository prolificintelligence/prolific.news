import https from 'node:https';

const BASE_URL = 'https://prolific.news';
const VERCEL_URL = 'https://prolific-news-web.vercel.app';

function request(url, options = {}, postData = null) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Prolific-Commerce-Verifier/1.0',
        ...(options.headers || {})
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function run() {
  console.log('=== COMMERCE AUDIT & IMPLEMENTATION VERIFICATION ===\n');
  let allPassed = true;

  // 1. Verify /plus redirect to /watch
  console.log('1. Testing /plus deprecation redirect...');
  const resPlus = await request(`${VERCEL_URL}/plus`);
  if ((resPlus.status === 307 || resPlus.status === 308) && resPlus.headers.location?.includes('/watch')) {
    console.log(`✅ /plus returned HTTP ${resPlus.status} redirecting to ${resPlus.headers.location}`);
  } else {
    console.log(`❌ /plus redirect failed: HTTP ${resPlus.status}`, resPlus.headers.location);
    allPassed = false;
  }

  // 2. Verify /advertise grounded pricing
  console.log('\n2. Testing /advertise content & pricing...');
  const resAdv = await request(`${VERCEL_URL}/advertise`);
  if (resAdv.status === 200) {
    const has350 = resAdv.data.includes('$350');
    const hasDesk = resAdv.data.includes('Emerging Markets Desk Partner');
    const hasFlagship = resAdv.data.includes('$650');
    const hasMail = resAdv.data.includes('partnerships@prolific.news');
    const noOld2500 = !resAdv.data.includes('$2,500/week');
    if (has350 && hasDesk && hasFlagship && hasMail && noOld2500) {
      console.log('✅ /advertise correctly renders grounded B2B desk underwriting ($350/mo, $650/mo) and stripped vanity $2,500/wk');
    } else {
      console.log(`❌ /advertise content checks failed: 350=${has350}, desk=${hasDesk}, flagship=${hasFlagship}, mail=${hasMail}, no2500=${noOld2500}`);
      allPassed = false;
    }
  } else {
    console.log(`❌ /advertise returned HTTP ${resAdv.status}`);
    allPassed = false;
  }

  // 3. Verify /submit-press-release tiers & compliance
  console.log('\n3. Testing /submit-press-release tiers & Google compliance...');
  const resWire = await request(`${VERCEL_URL}/submit-press-release`);
  if (resWire.status === 200) {
    const has79 = resWire.data.includes('$79');
    const has149 = resWire.data.includes('$149');
    const has399 = resWire.data.includes('$399');
    const hasSponsored = resWire.data.includes('rel=&quot;sponsored&quot;') || resWire.data.includes('rel="sponsored"');
    const noDoFollow = !resWire.data.includes('DoFollow') && !resWire.data.includes('dofollow');
    if (has79 && has149 && has399 && hasSponsored && noDoFollow) {
      console.log('✅ /submit-press-release correctly displays $79 / $149 / $399 tiers, rel="sponsored" notice, and zero DoFollow claims');
    } else {
      console.log(`❌ /submit-press-release check failed: 79=${has79}, 149=${has149}, 399=${has399}, sponsored=${hasSponsored}, noDoFollow=${noDoFollow}`);
      allPassed = false;
    }
  } else {
    console.log(`❌ /submit-press-release returned HTTP ${resWire.status}`);
    allPassed = false;
  }

  // 4. Test anti-spam API filter (gambling/casino)
  console.log('\n4. Testing /api/press-release spam rejection (casino/gambling)...');
  const spamBody = {
    headline: 'Top Online Casino and Best Slots for Real Money',
    companyName: 'Casino Royale Ltd',
    contactEmail: 'seo@casinopump.fake',
    category: 'Business',
    packageId: 'standard',
    summary: 'Best online casino platform offering huge cryptocurrency deposit bonuses.',
    content: ('Online casino slots gambling crypto token presale buy now with big bonus on our website and win real money jackpot every single day. '.repeat(15))
  };
  const resSpam = await request(`${VERCEL_URL}/api/press-release`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify(spamBody));

  if (resSpam.status === 422) {
    console.log(`✅ Spam payload rejected with HTTP 422: ${resSpam.data}`);
  } else {
    console.log(`❌ Expected HTTP 422 for spam submission, got HTTP ${resSpam.status}: ${resSpam.data}`);
    allPassed = false;
  }

  // 5. Test word count validation (< 200 words)
  console.log('\n5. Testing /api/press-release minimum word count (<200 words)...');
  const shortBody = {
    headline: 'Short Clean Announcement Title',
    companyName: 'Acme Enterprise Solutions',
    contactEmail: 'press@acme-enterprise.example',
    category: 'Tech',
    packageId: 'standard',
    summary: 'Acme announces new enterprise cloud workflow capabilities.',
    content: 'This is a short announcement that clearly has fewer than two hundred words in total.'
  };
  const resShort = await request(`${VERCEL_URL}/api/press-release`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify(shortBody));

  if (resShort.status === 400 && resShort.data.includes('200 words')) {
    console.log(`✅ Short payload rejected with HTTP 400: ${resShort.data}`);
  } else {
    console.log(`❌ Expected HTTP 400 with 200 words error for short submission, got HTTP ${resShort.status}: ${resShort.data}`);
    allPassed = false;
  }

  // 6. Test sitemap.xml
  console.log('\n6. Testing /sitemap.xml...');
  const resSitemap = await request(`${VERCEL_URL}/sitemap.xml`);
  if (resSitemap.status === 200) {
    const hasWire = resSitemap.data.includes('submit-press-release');
    const hasAdv = resSitemap.data.includes('advertise');
    const noPlus = !resSitemap.data.includes('/plus<');
    if (hasWire && hasAdv && noPlus) {
      console.log('✅ sitemap.xml includes /submit-press-release and /advertise, excludes /plus');
    } else {
      console.log(`❌ sitemap.xml failed checks: hasWire=${hasWire}, hasAdv=${hasAdv}, noPlus=${noPlus}`);
      allPassed = false;
    }
  } else {
    console.log(`❌ sitemap.xml returned HTTP ${resSitemap.status}`);
    allPassed = false;
  }

  console.log(`\n=== OVERALL COMMERCE VERIFICATION RESULT: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'} ===`);
}

run();