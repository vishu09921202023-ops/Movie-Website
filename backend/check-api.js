const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/movies/slug/inception',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const movie = JSON.parse(data);
    console.log('Movie Data from API:');
    console.log('===================');
    console.log('Title:', movie.title);
    console.log('Has screenshots:', !!movie.screenshots);
    console.log('Screenshots count:', movie.screenshots?.length || 0);
    if (movie.screenshots && movie.screenshots.length > 0) {
      console.log('First screenshot:', movie.screenshots[0]);
    } else {
      console.log('⚠️  NO SCREENSHOTS FOUND');
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.end();
