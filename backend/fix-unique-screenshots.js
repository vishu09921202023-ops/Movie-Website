const https = require('https');
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

// Complete mapping of all 68 movies to their correct TMDB IDs
const movieMap = [
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
  { cleanTitle: 'Fullmetal Alchemist Brotherhood', tmdbId: 31911, type: 'tv' },
  { cleanTitle: 'Goblin', tmdbId: 67915, type: 'tv' },
  { cleanTitle: 'Descendants of the Sun', tmdbId: 62029, type: 'tv' },
  { cleanTitle: 'Crash Landing on You', tmdbId: 95396, type: 'tv' },
  { cleanTitle: 'All of Us Are Dead', tmdbId: 120168, type: 'tv' },
  { cleanTitle: 'Vincenzo', tmdbId: 119661, type: 'tv' },
  { cleanTitle: 'Extraordinary Attorney Woo', tmdbId: 197067, type: 'tv' },
  { cleanTitle: 'The Glory', tmdbId: 156902, type: 'tv' },
  { cleanTitle: 'The Crown Season 5', tmdbId: 65494, type: 'tv' },
  { cleanTitle: 'The Witcher Season 3', tmdbId: 71912, type: 'tv' },
  { cleanTitle: 'Squid Game Season 2', tmdbId: 93405, type: 'tv' },
  { cleanTitle: 'Breaking Bad Complete Series', tmdbId: 1396, type: 'tv' },
  { cleanTitle: 'Money Heist', tmdbId: 71446, type: 'tv' },
  { cleanTitle: 'Wednesday Season 1', tmdbId: 119051, type: 'tv' },
  { cleanTitle: 'Stranger Things Season 4', tmdbId: 66732, type: 'tv' },
  { cleanTitle: 'The Last of Us Season 1', tmdbId: 100088, type: 'tv' },
  { cleanTitle: 'House of the Dragon Season 2', tmdbId: 94997, type: 'tv' },
  { cleanTitle: 'Our Planet Season 2', tmdbId: 83880, type: 'tv' },
  { cleanTitle: 'Planet Earth III', tmdbId: 116156, type: 'tv' },
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
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function extractBackdropHashes(tmdbId, type) {
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  
  // Fetch the backdrops images page which lists multiple unique backdrop images
  const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}/images/backdrops`;
  const html = await fetchPage(url);
  
  // Extract all unique image hashes from various TMDB image URL patterns
  const patterns = [
    /\/t\/p\/original\/([a-zA-Z0-9]+\.jpg)/g,
    /\/t\/p\/w500_and_h282_face\/([a-zA-Z0-9]+\.jpg)/g,
    /\/t\/p\/w250_and_h141_face\/([a-zA-Z0-9]+\.jpg)/g,
    /\/t\/p\/w1920_and_h800_multi_faces\/([a-zA-Z0-9]+\.jpg)/g,
    /\/t\/p\/w1066_and_h600_face\/([a-zA-Z0-9]+\.jpg)/g,
    /\/t\/p\/w780\/([a-zA-Z0-9]+\.jpg)/g,
    /\/t\/p\/w1280\/([a-zA-Z0-9]+\.jpg)/g,
  ];
  
  const hashes = new Set();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      hashes.add(match[1]);
    }
  }
  
  return [...hashes];
}

async function main() {
  await mongoose.connect('mongodb://localhost:27017/vegamovies');
  console.log('Connected to MongoDB');
  
  let success = 0, failed = 0;
  
  for (let i = 0; i < movieMap.length; i++) {
    const entry = movieMap[i];
    const label = `[${i + 1}/${movieMap.length}] ${entry.cleanTitle}`;
    
    try {
      // Get the movie's current poster/backdrop from DB
      const dbMovie = await Movie.findOne({ cleanTitle: entry.cleanTitle }, 'posterUrl backdropUrl');
      if (!dbMovie) {
        console.log(`${label}... NOT FOUND in DB`);
        failed++;
        continue;
      }
      
      // Extract current poster and backdrop hashes to exclude them
      const posterHash = dbMovie.posterUrl?.match(/\/([a-zA-Z0-9]+\.jpg)$/)?.[1];
      const backdropHash = dbMovie.backdropUrl?.match(/\/([a-zA-Z0-9]+\.jpg)$/)?.[1];
      
      // Fetch backdrop images from TMDB
      const allHashes = await extractBackdropHashes(entry.tmdbId, entry.type);
      await sleep(400);
      
      // Filter out poster and main backdrop to get truly different images
      const uniqueHashes = allHashes.filter(h => h !== posterHash && h !== backdropHash);
      
      // Build screenshots array: prefer unique images, fall back to backdrop if needed
      let screenshots = [];
      
      if (uniqueHashes.length >= 4) {
        // Best case: 4 completely different backdrop images
        screenshots = uniqueHashes.slice(0, 4).map(h => `https://image.tmdb.org/t/p/w780/${h}`);
      } else if (uniqueHashes.length >= 2) {
        // Add what we have plus backdrop
        screenshots = uniqueHashes.slice(0, 3).map(h => `https://image.tmdb.org/t/p/w780/${h}`);
        if (backdropHash) screenshots.push(`https://image.tmdb.org/t/p/w780/${backdropHash}`);
        screenshots = screenshots.slice(0, 4);
      } else if (allHashes.length >= 4) {
        // Use all hashes including poster/backdrop
        screenshots = allHashes.slice(0, 4).map(h => `https://image.tmdb.org/t/p/w780/${h}`);
      } else {
        // Last resort: use whatever we have
        const fallback = new Set();
        allHashes.forEach(h => fallback.add(h));
        if (backdropHash) fallback.add(backdropHash);
        if (posterHash) fallback.add(posterHash);
        screenshots = [...fallback].slice(0, 4).map(h => `https://image.tmdb.org/t/p/w780/${h}`);
      }
      
      if (screenshots.length >= 2) {
        await Movie.updateOne(
          { cleanTitle: entry.cleanTitle },
          { $set: { screenshots } }
        );
        console.log(`${label}... OK (${screenshots.length} unique screenshots from ${allHashes.length} found)`);
        success++;
      } else {
        console.log(`${label}... FAILED (only ${screenshots.length} images found)`);
        failed++;
      }
      
    } catch (e) {
      console.log(`${label}... ERROR: ${e.message}`);
      failed++;
    }
  }
  
  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
  await mongoose.disconnect();
  process.exit(0);
}

main();
