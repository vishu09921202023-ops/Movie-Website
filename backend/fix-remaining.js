const mongoose = require('mongoose');
const Movie = require('./models/Movie');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/vegamovies');

  const fma = await Movie.updateOne(
    { cleanTitle: 'Fullmetal Alchemist Brotherhood' },
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
  console.log('FMA Brotherhood:', fma.modifiedCount, 'modified');

  const pe = await Movie.updateOne(
    { cleanTitle: 'Planet Earth III' },
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
  console.log('Planet Earth III:', pe.modifiedCount, 'modified');

  // Verify
  const fmaCheck = await Movie.findOne({ cleanTitle: 'Fullmetal Alchemist Brotherhood' }, 'posterUrl');
  const peCheck = await Movie.findOne({ cleanTitle: 'Planet Earth III' }, 'posterUrl');
  console.log('FMA poster verified:', fmaCheck?.posterUrl);
  console.log('PE3 poster verified:', peCheck?.posterUrl);

  await mongoose.disconnect();
  process.exit(0);
}

main();
