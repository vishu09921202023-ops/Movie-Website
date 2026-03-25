const https = require('https');
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

// Complete mapping of all 68 movies to their correct TMDB IDs
const movieMap = [
  // === MOVIES ===
  { cleanTitle: 'Peaky Blinders The Immortal Man', tmdbId: 875828, type: 'movie' },
  { cleanTitle: 'Dune Part Two', tmdbId: 693134, type: 'movie' },
  { cleanTitle: 'Oppenheimer', tmdbId: 872585, type: 'movie' },
  { cleanTitle: 'Barbie', tmdbId: 346698, type: 'movie' },
  { cleanTitle: 'Animal', tmdbId: 781732, type: 'movie' },
  { cleanTitle: 'Pathaan', tmdbId: 864692, type: 'movie' },
  { cleanTitle: 'Jawan', tmdbId: 872906, type: 'movie' },
  { cleanTitle: 'Dunki', tmdbId: 960876, type: 'movie' },
  { cleanTitle: 'Fighter', tmdbId: 784651, type: 'movie' },
  { cleanTitle: '12th Fail', tmdbId: 1163258, type: 'movie' },
  { cleanTitle: 'Stree 2', tmdbId: 1112426, type: 'movie' },
  { cleanTitle: 'The Batman', tmdbId: 414906, type: 'movie' },
  { cleanTitle: 'Spider-Man Across the Spider-Verse', tmdbId: 569094, type: 'movie' },
  { cleanTitle: 'John Wick Chapter 4', tmdbId: 603692, type: 'movie' },
  { cleanTitle: 'Inception', tmdbId: 27205, type: 'movie' },
  { cleanTitle: 'Interstellar', tmdbId: 157336, type: 'movie' },
  { cleanTitle: 'The Dark Knight', tmdbId: 155, type: 'movie' },
  { cleanTitle: 'Avengers Endgame', tmdbId: 299534, type: 'movie' },
  { cleanTitle: 'Deadpool and Wolverine', tmdbId: 533535, type: 'movie' },
  { cleanTitle: 'Godzilla x Kong The New Empire', tmdbId: 823464, type: 'movie' },
  { cleanTitle: 'Inside Out 2', tmdbId: 1022789, type: 'movie' },
  { cleanTitle: 'Furiosa A Mad Max Saga', tmdbId: 786892, type: 'movie' },
  { cleanTitle: 'Alien Romulus', tmdbId: 945961, type: 'movie' },
  { cleanTitle: 'Killers of the Flower Moon', tmdbId: 466420, type: 'movie' },
  { cleanTitle: 'Guardians of the Galaxy Vol 3', tmdbId: 447365, type: 'movie' },
  { cleanTitle: 'The Shawshank Redemption', tmdbId: 278, type: 'movie' },
  { cleanTitle: 'Fight Club', tmdbId: 550, type: 'movie' },
  { cleanTitle: 'Gladiator II', tmdbId: 558449, type: 'movie' },
  { cleanTitle: 'Joker Folie a Deux', tmdbId: 889737, type: 'movie' },
  { cleanTitle: 'Wicked', tmdbId: 402431, type: 'movie' },
  { cleanTitle: 'A Quiet Place Day One', tmdbId: 762441, type: 'movie' },
  { cleanTitle: 'Damsel', tmdbId: 763215, type: 'movie' },
  { cleanTitle: 'RRR', tmdbId: 579583, type: 'movie' },
  { cleanTitle: 'KGF Chapter 2', tmdbId: 818397, type: 'movie' },
  { cleanTitle: 'Pushpa 2 The Rule', tmdbId: 857598, type: 'movie' },
  { cleanTitle: 'Kalki 2898 AD', tmdbId: 801688, type: 'movie' },
  { cleanTitle: 'WWE WrestleMania 40', tmdbId: 1005578, type: 'movie' },
  { cleanTitle: 'Hello World Documentary', tmdbId: 582700, type: 'movie' },

  // === TV SHOWS (Anime) ===
  { cleanTitle: 'Jujutsu Kaisen Season 2', tmdbId: 95479, type: 'tv' },
  { cleanTitle: 'Naruto Shippuden Complete Series', tmdbId: 1735, type: 'tv' },
  { cleanTitle: 'Demon Slayer Kimetsu no Yaiba', tmdbId: 85937, type: 'tv' },
  { cleanTitle: 'Attack on Titan Complete Series', tmdbId: 1429, type: 'tv' },
  { cleanTitle: 'Spy x Family Anime', tmdbId: 120089, type: 'tv' },
  { cleanTitle: 'One Piece', tmdbId: 37854, type: 'tv' },
  { cleanTitle: 'Dragon Ball Super', tmdbId: 62715, type: 'tv' },
  { cleanTitle: 'My Hero Academia Season 7', tmdbId: 65930, type: 'tv' },
  { cleanTitle: 'Solo Leveling', tmdbId: 222160, type: 'tv' },
  { cleanTitle: 'Death Note', tmdbId: 13916, type: 'tv' },
  { cleanTitle: 'Chainsaw Man', tmdbId: 114410, type: 'tv' },
  { cleanTitle: 'Fullmetal Alchemist Brotherhood', tmdbId: 41536, type: 'tv' },

  // === TV SHOWS (K-Drama) ===
  { cleanTitle: 'Goblin', tmdbId: 67915, type: 'tv' },
  { cleanTitle: 'Descendants of the Sun', tmdbId: 62029, type: 'tv' },
  { cleanTitle: 'Crash Landing on You', tmdbId: 95396, type: 'tv' },
  { cleanTitle: 'All of Us Are Dead', tmdbId: 120168, type: 'tv' },
  { cleanTitle: 'Vincenzo', tmdbId: 119661, type: 'tv' },
  { cleanTitle: 'Extraordinary Attorney Woo', tmdbId: 197067, type: 'tv' },
  { cleanTitle: 'The Glory', tmdbId: 156902, type: 'tv' },

  // === TV SHOWS (Western Series) ===
  { cleanTitle: 'The Crown Season 5', tmdbId: 65494, type: 'tv' },
  { cleanTitle: 'The Witcher Season 3', tmdbId: 71912, type: 'tv' },
  { cleanTitle: 'Squid Game Season 2', tmdbId: 93405, type: 'tv' },
  { cleanTitle: 'Breaking Bad Complete Series', tmdbId: 1396, type: 'tv' },
  { cleanTitle: 'Money Heist', tmdbId: 71446, type: 'tv' },
  { cleanTitle: 'Wednesday Season 1', tmdbId: 119051, type: 'tv' },
  { cleanTitle: 'Stranger Things Season 4', tmdbId: 66732, type: 'tv' },
  { cleanTitle: 'The Last of Us Season 1', tmdbId: 100088, type: 'tv' },
  { cleanTitle: 'House of the Dragon Season 2', tmdbId: 94997, type: 'tv' },

  // === TV SHOWS (Documentary) ===
  { cleanTitle: 'Our Planet Season 2', tmdbId: 83880, type: 'tv' },
  { cleanTitle: 'Planet Earth III', tmdbId: 232791, type: 'tv' },
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = 'https://www.themoviedb.org' + loc;
        return fetchPage(loc).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractImages(html) {
  const posterMatch = html.match(/w600_and_h900_face\/([a-zA-Z0-9]+\.jpg)/);
  const poster = posterMatch ? posterMatch[1] : null;

  const backdropMatch = html.match(/w1066_and_h600_face\/([a-zA-Z0-9]+\.jpg)/);
  const backdrop = backdropMatch ? backdropMatch[1] : null;

  return { poster, backdrop };
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  await mongoose.connect('mongodb://localhost:27017/vegamovies');
  console.log('Connected to MongoDB');
  console.log(`Processing ${movieMap.length} movies...\n`);

  let success = 0, failed = 0, skipped = 0;
  const failures = [];

  for (let i = 0; i < movieMap.length; i++) {
    const movie = movieMap[i];
    const url = `https://www.themoviedb.org/${movie.type}/${movie.tmdbId}`;

    try {
      process.stdout.write(`[${i + 1}/${movieMap.length}] ${movie.cleanTitle}... `);
      const html = await fetchPage(url);
      const { poster, backdrop } = extractImages(html);

      if (poster && backdrop) {
        const posterUrl = `https://image.tmdb.org/t/p/w342/${poster}`;
        const backdropUrl = `https://image.tmdb.org/t/p/w1280/${backdrop}`;
        const screenshots = [
          `https://image.tmdb.org/t/p/w780/${backdrop}`,
          `https://image.tmdb.org/t/p/w780/${poster}`,
          `https://image.tmdb.org/t/p/w500/${backdrop}`,
          `https://image.tmdb.org/t/p/w500/${poster}`,
          `https://image.tmdb.org/t/p/w342/${backdrop}`
        ];

        const result = await Movie.updateOne(
          { cleanTitle: movie.cleanTitle },
          { $set: { posterUrl, backdropUrl, screenshots } }
        );

        if (result.matchedCount > 0) {
          console.log(`OK (poster=${poster}, backdrop=${backdrop})`);
          success++;
        } else {
          console.log(`SKIP - not found in DB`);
          skipped++;
        }
      } else if (poster) {
        // Only poster found, use poster for backdrop too
        const posterUrl = `https://image.tmdb.org/t/p/w342/${poster}`;
        const backdropUrl = `https://image.tmdb.org/t/p/w1280/${poster}`;
        const screenshots = [
          `https://image.tmdb.org/t/p/w780/${poster}`,
          `https://image.tmdb.org/t/p/w500/${poster}`,
          `https://image.tmdb.org/t/p/w342/${poster}`,
          `https://image.tmdb.org/t/p/w780/${poster}`,
          `https://image.tmdb.org/t/p/w500/${poster}`
        ];

        await Movie.updateOne(
          { cleanTitle: movie.cleanTitle },
          { $set: { posterUrl, backdropUrl, screenshots } }
        );
        console.log(`PARTIAL (poster only=${poster})`);
        success++;
      } else {
        console.log(`FAILED - could not extract images`);
        failures.push(movie.cleanTitle);
        failed++;
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      failures.push(movie.cleanTitle);
      failed++;
    }

    await sleep(800);
  }

  console.log(`\n========== RESULTS ==========`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
  if (failures.length > 0) {
    console.log(`\nFailed movies:`);
    failures.forEach(f => console.log(`  - ${f}`));
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
