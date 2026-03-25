require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

async function addMultipleScreenshots() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const allMovies = await Movie.find({});
    console.log(`Processing ${allMovies.length} movies...\n`);

    let updated = 0;

    for (const movie of allMovies) {
      const screenshots = [];

      // Add backdrop (w1280 is most reliable TMDB size)
      if (movie.backdropUrl) {
        // Keep original w1280
        screenshots.push(movie.backdropUrl);
      }

      // Add poster (w342 is most reliable TMDB size)
      if (movie.posterUrl) {
        // Keep original w342
        screenshots.push(movie.posterUrl);
      }

      // Add variations with different aspect ratios if available
      // TMDB backdrop variations (same backdrop different times)
      if (movie.backdropUrl) {
        // Add w500 version of same backdrop
        const backdrop500 = movie.backdropUrl.replace('w1280', 'w500');
        if (backdrop500 !== movie.backdropUrl) {
          screenshots.push(backdrop500);
        }
      }

      // Ensure we have at least some images
      if (screenshots.length > 0) {
        // Remove duplicates
        const uniqueSS = [...new Set(screenshots)];
        
        await Movie.updateOne(
          { _id: movie._id },
          { $set: { screenshots: uniqueSS } }
        );
        console.log(`✓ ${movie.cleanTitle} (${uniqueSS.length} images)`);
        updated++;
      }
    }

    console.log(`\n=== Complete ===`);
    console.log(`Updated: ${updated}/${allMovies.length}`);
    console.log(`\n✅ All movies have optimized screenshots!`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addMultipleScreenshots();
