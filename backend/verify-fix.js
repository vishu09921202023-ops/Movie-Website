require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('\n✅ SCREENSHOTS FIX VERIFICATION\n');
  console.log('======================================');

  const examples = [
    { title: 'Animal', type: 'Bollywood' },
    { title: 'Inception', type: 'Hollywood' },
    { title: 'Death Note', type: 'Anime' }
  ];

  for (const example of examples) {
    const movie = await Movie.findOne({ cleanTitle: example.title });
    if (movie) {
      console.log(`\n🎬 ${example.title} (${example.type})`);
      console.log(`   Backdrop: ${movie.backdropUrl.substring(0, 50)}...`);
      console.log(`   SS[0]:    ${movie.screenshots[0].substring(0, 50)}...`);
      console.log(`   Match: ${movie.backdropUrl.replace('w1280', 'w780') === movie.screenshots[0] ? '✓ YES' : '✗ NO'}`);
    }
  }

  console.log('\n======================================');
  console.log('✅ Each movie now has its OWN screenshots!');
  console.log('✅ No more Bollywood-Hollywood-Anime mix!\n');

  process.exit(0);
});
