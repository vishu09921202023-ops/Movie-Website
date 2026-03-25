const http = require('http');

const options = { hostname: 'localhost', port: 5000, path: '/api/movies?limit=1', method: 'GET' };
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log('Status:', res.statusCode);
    console.log('Total movies:', parsed.total || parsed.movies?.length || 'unknown');
    console.log('First movie title:', parsed.movies?.[0]?.title || 'none');
    process.exit(0);
  });
});
req.on('error', (e) => { console.error('API ERROR:', e.message); process.exit(1); });
req.end();
