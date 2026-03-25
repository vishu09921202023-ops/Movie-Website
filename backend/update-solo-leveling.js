const mongoose = require('mongoose');
const Movie = require('./models/Movie');

mongoose.connect('mongodb://localhost:27017/vegamovies').then(async() => {
  const result = await Movie.updateOne(
    { title: /solo leveling/i },
    {
      $set: {
        screenshots: [
          'https://image.tmdb.org/t/p/w780/hGfEICSgwWyYC9ALkKq3pjfV6jE.jpg',
          'https://image.tmdb.org/t/p/w780/rC0PBShOwhAKLcuYNOi0q1RcVbe.jpg',
          'https://image.tmdb.org/t/p/w780/cFrwzFzOcXqKc0rn1GLraRkYjoz.jpg',
          'https://image.tmdb.org/t/p/w780/iuhMqKQMOfZN8vhvR6UIm4NZcbU.jpg'
        ]
      }
    }
  );
  console.log('Updated:', result.modifiedCount, 'document');
  
  const updated = await Movie.findOne({ title: /solo leveling/i }, 'screenshots');
  console.log('Verified new screenshots:');
  updated.screenshots.forEach((url, i) => console.log(`  ${i+1}. ${url.split('/').pop()}`));
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
