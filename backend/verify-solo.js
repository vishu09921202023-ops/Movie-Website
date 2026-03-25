const mongoose = require('mongoose');
const Movie = require('./models/Movie');

mongoose.connect('mongodb://localhost:27017/vegamovies').then(async() => {
  const solo = await Movie.findOne({title: /solo leveling/i}, 'title screenshots');
  console.log('Solo Leveling Screenshots:');
  solo.screenshots.forEach((s, i) => {
    console.log(`${i+1}. ${s.split('/').pop()}`);
  });
  mongoose.disconnect();
});
