const http = require('http');

// Test if frontend is serving the updated page with img tags
const testFrontend = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/movie/inception', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasImgTag = data.includes('<img');
        const hasOnError = data.includes('onError');
        const hasScreenshots = data.includes('Screenshots');
        
        console.log('Frontend Test Results:');
        console.log('======================');
        console.log(`✅ Frontend accessible: ${res.statusCode === 200}`);
        console.log(`${hasImgTag ? '✅' : '❌'} Using <img> tags: ${hasImgTag}`);
        console.log(`${hasOnError ? '✅' : '❌'} Has onError handlers: ${hasOnError}`);
        console.log(`${hasScreenshots ? '✅' : '❌'} Has Screenshots section: ${hasScreenshots}`);
        
        resolve({ ok: hasImgTag && hasOnError && hasScreenshots });
      });
    }).on('error', (e) => {
      console.log('❌ Frontend not accessible:', e.message);
      resolve({ ok: false });
    });
  });
};

testFrontend().then(result => {
  process.exit(result.ok ? 0 : 1);
});
