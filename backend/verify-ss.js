require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const m = await Movie.findOne({ cleanTitle: 'Inception' });
  console.log('Screenshots for Inception:', JSON.stringify(m.screenshots, null, 2));

  const withSS = await Movie.countDocuments({ screenshots: { $exists: true, $not: { $size: 0 } } });
  console.log('\nMovies with screenshots:', withSS);

  const total = await Movie.countDocuments();
  console.log('Total movies:', total);

  process.exit(0);
});
