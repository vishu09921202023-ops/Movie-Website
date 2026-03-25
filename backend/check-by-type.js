require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('\n📋 CHECKING IMAGE PATTERNS BY TYPE\n');

  const types = ['movie', 'anime', 'kdrama', 'series', 'documentary'];

  for (const type of types) {
    const movies = await Movie.find({ type }).limit(3);
    console.log(`\n${type.toUpperCase()}:`);
    movies.forEach(m => {
      console.log(`  ${m.cleanTitle}:`);
      console.log(`    Poster: ${m.posterUrl ? m.posterUrl.substring(0, 60) + '...' : 'MISSING'}`);
      console.log(`    Backdrop: ${m.backdropUrl ? m.backdropUrl.substring(0, 60) + '...' : 'MISSING'}`);
      console.log(`    SS Count: ${m.screenshots?.length || 0}`);
    });
  }

  process.exit(0);
});
