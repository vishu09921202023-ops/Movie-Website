const mongoose = require('mongoose');
const Movie = require('./models/Movie');

mongoose.connect('mongodb://localhost:27017/vegamovies').then(async () => {
  const fma = await Movie.findOne({ title: /fullmetal/i }, 'title cleanTitle');
  const pe = await Movie.findOne({ title: /planet earth/i }, 'title cleanTitle');
  console.log('FMA cleanTitle:', JSON.stringify(fma?.cleanTitle));
  console.log('PE cleanTitle:', JSON.stringify(pe?.cleanTitle));
  
  // Also try the update directly by title regex
  const fmaUpdate = await Movie.updateOne(
    { title: /fullmetal/i },
    {
      posterUrl: 'https://image.tmdb.org/t/p/w342/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/A6tMQAo6t6eRFCPhsrShmxZLqFB.jpg',
      screenshots: [
        'https://image.tmdb.org/t/p/w780/A6tMQAo6t6eRFCPhsrShmxZLqFB.jpg',
        'https://image.tmdb.org/t/p/w780/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg',
        'https://image.tmdb.org/t/p/w500/A6tMQAo6t6eRFCPhsrShmxZLqFB.jpg',
        'https://image.tmdb.org/t/p/w500/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg',
        'https://image.tmdb.org/t/p/w342/A6tMQAo6t6eRFCPhsrShmxZLqFB.jpg'
      ]
    }
  );
  console.log('FMA updated:', fmaUpdate.modifiedCount);

  const peUpdate = await Movie.updateOne(
    { title: /planet earth/i },
    {
      posterUrl: 'https://image.tmdb.org/t/p/w342/hNwJPvA0SaFGKLW2oExiHFNDpNs.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/3TOUvY2NZx8r31UHA3CQdRAY271.jpg',
      screenshots: [
        'https://image.tmdb.org/t/p/w780/3TOUvY2NZx8r31UHA3CQdRAY271.jpg',
        'https://image.tmdb.org/t/p/w780/hNwJPvA0SaFGKLW2oExiHFNDpNs.jpg',
        'https://image.tmdb.org/t/p/w500/3TOUvY2NZx8r31UHA3CQdRAY271.jpg',
        'https://image.tmdb.org/t/p/w500/hNwJPvA0SaFGKLW2oExiHFNDpNs.jpg',
        'https://image.tmdb.org/t/p/w342/3TOUvY2NZx8r31UHA3CQdRAY271.jpg'
      ]
    }
  );
  console.log('PE updated:', peUpdate.modifiedCount);

  // Verify
  const fmaV = await Movie.findOne({ title: /fullmetal/i }, 'posterUrl backdropUrl');
  const peV = await Movie.findOne({ title: /planet earth/i }, 'posterUrl backdropUrl');
  console.log('FMA verified:', fmaV?.posterUrl);
  console.log('PE verified:', peV?.posterUrl);

  await mongoose.disconnect();
  process.exit(0);
});
