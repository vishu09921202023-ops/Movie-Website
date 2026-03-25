const mongoose = require('mongoose');
const Movie = require('./models/Movie');

mongoose.connect('mongodb://localhost:27017/vegamovies').then(async () => {
  const fma = await Movie.findOne({ title: /fullmetal/i }, 'title posterUrl backdropUrl');
  const pe = await Movie.findOne({ title: /planet earth/i }, 'title posterUrl backdropUrl');
  const result = 'FMA: ' + JSON.stringify(fma) + '\nPE: ' + JSON.stringify(pe);
  require('fs').writeFileSync(__dirname + '/verify-result.txt', result);
  console.log('Written to verify-result.txt');
  console.log(result);
  mongoose.disconnect();
});
