const https = require('https');

// Sample image URLs from TMDB
const testUrls = [
  'https://image.tmdb.org/t/p/w780/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',  // Inception backdrop
  'https://image.tmdb.org/t/p/w342/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',  // Inception poster
];

const testUrl = (url) => {
  return new Promise((resolve) => {
    const request = https.get(url, { method: 'HEAD' }, (res) => {
      resolve({ url, status: res.statusCode, ok: res.statusCode === 200 });
    });
    request.on('error', (e) => {
      resolve({ url, status: 'error', ok: false, error: e.message });
    });
  });
};

(async () => {
  console.log('Testing TMDB image URLs accessibility...\n');
  for (const url of testUrls) {
    const result = await testUrl(url);
    console.log(`${result.ok ? '✓' : '✗'} ${result.status}: ${url.substring(0, 80)}`);
  }
})();
