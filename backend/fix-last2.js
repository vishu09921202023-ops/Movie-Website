const mongoose = require('mongoose');
const Movie = require('./models/Movie');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/vegamovies');
  
  const r1 = await Movie.updateOne(
    { cleanTitle: 'Fullmetal Alchemist Brotherhood' },
    { $set: { screenshots: [
      'https://image.tmdb.org/t/p/w780/2UG177tWHy7xRmMKWJHB7nAUmKd.jpg',
      'https://image.tmdb.org/t/p/w780/97cicAYWu4cc0TyXJoDQiMmWI2t.jpg',
      'https://image.tmdb.org/t/p/w780/AeqxVdwiioEcm2OuhNsphcFWn3K.jpg',
      'https://image.tmdb.org/t/p/w780/qOyARkfwp6imzDtdz1RMVgg1EyF.jpg'
    ]}}
  );
  console.log('FMA Brotherhood:', r1.modifiedCount ? 'UPDATED' : 'NOT FOUND');

  const r2 = await Movie.updateOne(
    { cleanTitle: 'Planet Earth III' },
    { $set: { screenshots: [
      'https://image.tmdb.org/t/p/w780/sH7qXaPxunZEGnaXX4asRzzfCng.jpg',
      'https://image.tmdb.org/t/p/w780/rlNpKFJPzESFGS52ug23T0M8Lq0.jpg',
      'https://image.tmdb.org/t/p/w780/qrdlvNvRsMu1CMqbf6FtomI9pjl.jpg',
      'https://image.tmdb.org/t/p/w780/q4P2IhzolaIwqtkO2MxcH081a4z.jpg'
    ]}}
  );
  console.log('Planet Earth III:', r2.modifiedCount ? 'UPDATED' : 'NOT FOUND');

  await mongoose.disconnect();
}
main();
