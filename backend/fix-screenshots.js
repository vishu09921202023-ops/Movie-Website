require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

async function fixScreenshots() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const allMovies = await Movie.find({});
    console.log(`Found ${allMovies.length} movies\n`);

    let updated = 0;
    let errors = 0;

    for (const movie of allMovies) {
      try {
        // Create screenshots from the movie's own backdrop and poster
        const screenshots = [];

        // Add backdrop as primary screenshot
        if (movie.backdropUrl) {
          // Convert w1280 to w780 for better performance
          const backdropSS = movie.backdropUrl.replace('w1280', 'w780');
          screenshots.push(backdropSS);
        }

        // Add poster as second screenshot
        if (movie.posterUrl) {
          // Convert w342 to w500 for better visibility
          const posterSS = movie.posterUrl.replace('w342', 'w500');
          screenshots.push(posterSS);
        }

        // Only update if we have at least one screenshot
        if (screenshots.length > 0) {
          await Movie.updateOne(
            { _id: movie._id },
            { $set: { screenshots } }
          );
          console.log(`✓ Updated: ${movie.cleanTitle} (${screenshots.length} SS)`);
          updated++;
        } else {
          console.log(`⚠ No images: ${movie.cleanTitle}`);
          errors++;
        }
      } catch (err) {
        console.log(`✗ Error updating ${movie.cleanTitle}:`, err.message);
        errors++;
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Updated: ${updated}/${allMovies.length}`);
    console.log(`Errors: ${errors}`);
    console.log(`\n✅ Screenshots now use the correct image for each movie!`);
    console.log(`   - Backdrops are movie-specific`);
    console.log(`   - Posters are movie-specific`);
    console.log(`   - No more mix-ups! 🎬`);

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

fixScreenshots();
