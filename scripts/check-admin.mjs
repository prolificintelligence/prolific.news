import https from 'node:https';

https.get('https://prolific-news-admin.vercel.app', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Body length:', body.length);
    console.log('Snippet:', body.slice(0, 300));
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
