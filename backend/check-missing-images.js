require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('\n🔍 CHECKING FOR MISSING IMAGES\n');
  console.log('======================================');

  // Find movies without backdrop
  const noBackdrop = await Movie.find({ backdropUrl: { $in: [null, '', undefined] } });
  console.log(`\n❌ Movies without backdrop (${noBackdrop.length}):`);
  noBackdrop.forEach(m => console.log(`   - ${m.cleanTitle} (${m.type})`));

  // Find movies without poster
  const noPoster = await Movie.find({ posterUrl: { $in: [null, '', undefined] } });
  console.log(`\n❌ Movies without poster (${noPoster.length}):`);
  noPoster.forEach(m => console.log(`   - ${m.cleanTitle} (${m.type})`));

  // Find movies with empty screenshots
  const noSS = await Movie.find({ $or: [{ screenshots: [] }, { screenshots: { $exists: false } }] });
  console.log(`\n❌ Movies with no screenshots (${noSS.length}):`);
  noSS.forEach(m => console.log(`   - ${m.cleanTitle} (${m.type})`));

  // Check if screenshots array is properly populated
  const allMovies = await Movie.find({});
  let withSS = 0, withoutSS = 0;
  allMovies.forEach(m => {
    if (m.screenshots && m.screenshots.length > 0) withSS++;
    else withoutSS++;
  });

  console.log(`\n📊 Screenshot status:`);
  console.log(`   With SS: ${withSS}`);
  console.log(`   Without SS: ${withoutSS}`);
  console.log(`   Total: ${allMovies.length}`);

  process.exit(0);
});
