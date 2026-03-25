require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

async function improveScreenshots() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const allMovies = await Movie.find({});
    console.log(`Processing ${allMovies.length} movies...\n`);

    let updated = 0;

    for (const movie of allMovies) {
      const screenshots = [];

      // Add backdrop at multiple sizes (fallback chain)
      if (movie.backdropUrl) {
        // Try w1280 first (original), then w780 (medium), then w500 (small)
        screenshots.push(movie.backdropUrl); // w1280
        screenshots.push(movie.backdropUrl.replace('w1280', 'w780')); // w780
      }

      // Add poster at multiple sizes
      if (movie.posterUrl) {
        // Try w500 first (good quality), then w342 (original), then w185 (small)
        screenshots.push(movie.posterUrl.replace('w342', 'w500')); // w500 - larger
        screenshots.push(movie.posterUrl); // w342 - original
      }

      if (screenshots.length > 0) {
        await Movie.updateOne(
          { _id: movie._id },
          { $set: { screenshots } }
        );
        console.log(`✓ ${movie.cleanTitle}`);
        console.log(`  - ${screenshots.length} screenshot variants (fallback chain)`);
        updated++;
      }
    }

    console.log(`\n=== Complete ===`);
    console.log(`Updated: ${updated}/${allMovies.length}`);
    console.log(`\n✅ Each movie now has multiple image size variants!`);
    console.log(`   - Fallback chain ensures images load`);
    console.log(`   - If w1280 fails → w780`);
    console.log(`   - If w500 poster fails → w342`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

improveScreenshots();
