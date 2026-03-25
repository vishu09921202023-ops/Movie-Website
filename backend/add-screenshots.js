require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

// TMDB screenshot URLs mapped by cleanTitle
// Using w780 size for optimal screenshot display
const SCREENSHOTS_MAP = {
  // ===== SEED.JS MOVIES (19) =====
  'Peaky Blinders The Immortal Man': [
    'https://image.tmdb.org/t/p/w780/wiE9doxiLwq3WCGamDIOb2PqBqc.jpg',
    'https://image.tmdb.org/t/p/w780/1WPSZhk4VFxssAJUvVFBbPMzznp.jpg',
    'https://image.tmdb.org/t/p/w780/8PnLGj7YXJLG0tkFDjNFJXZoIEl.jpg',
    'https://image.tmdb.org/t/p/w780/sDydlELeVEWG4mPUQn2YkaCP9sp.jpg',
  ],
  'Dune Part Two': [
    'https://image.tmdb.org/t/p/w780/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    'https://image.tmdb.org/t/p/w780/gorGtaFSnYBpgkHAaqj95Kf6oSE.jpg',
    'https://image.tmdb.org/t/p/w780/lzWHmYdfeFiMIY4JaMmtR7GEli3.jpg',
    'https://image.tmdb.org/t/p/w780/cMYCDADoLKLbB83g4WnJegaZimC.jpg',
    'https://image.tmdb.org/t/p/w780/hriWlYGY3OGjcEBuMG3tEVkVqRp.jpg',
  ],
  'Jujutsu Kaisen Season 2': [
    'https://image.tmdb.org/t/p/w780/9z0XYYyOP0fMFjrEbcm2sKlFPmR.jpg',
    'https://image.tmdb.org/t/p/w780/gmECJKfR89LjdnXJMKPAPC6vMVp.jpg',
    'https://image.tmdb.org/t/p/w780/3FUJT82YKP2lSyCfGkuF8MgL2Ne.jpg',
    'https://image.tmdb.org/t/p/w780/dH09RNugesXxoEW1VGjTwjgyADV.jpg',
  ],
  'Goblin': [
    'https://image.tmdb.org/t/p/w780/vBGRAiTEhgONOrmH88bpivjin4f.jpg',
    'https://image.tmdb.org/t/p/w780/j2JRz3E50w09FMPSbFXBaLwgkQb.jpg',
    'https://image.tmdb.org/t/p/w780/6X5jPc0WjrUY23TICPTRuaJVEVH.jpg',
    'https://image.tmdb.org/t/p/w780/vfQp5eErsGD0BqYIptMt0k0bDAb.jpg',
  ],
  'The Crown Season 5': [
    'https://image.tmdb.org/t/p/w780/26eObTCoLI1MRKkvaBIvQF5rJFw.jpg',
    'https://image.tmdb.org/t/p/w780/gLbBRyS7MBrmVUNce91Hmx9vzqD.jpg',
    'https://image.tmdb.org/t/p/w780/tiFmsWo1QBRBEumDvzJH6AaVE7j.jpg',
    'https://image.tmdb.org/t/p/w780/5LrOHleT8xoLaS4b3b1g7bwN5lO.jpg',
  ],
  'Naruto Shippuden Complete Series': [
    'https://image.tmdb.org/t/p/w780/rImRkmzGmRPbQsPKWfMJ7sFydSM.jpg',
    'https://image.tmdb.org/t/p/w780/qPbILmqWEfeQBXUHOB3HwXLheFg.jpg',
    'https://image.tmdb.org/t/p/w780/kxyQDKGBr6xGT3s5jGVT4j7FCdq.jpg',
    'https://image.tmdb.org/t/p/w780/8SHGvEpqNKsFlJRZBcSxgOrSH04.jpg',
  ],
  'Damsel': [
    'https://image.tmdb.org/t/p/w780/feSiISwgEpVzR1v3zv2n2AU4ANJ.jpg',
    'https://image.tmdb.org/t/p/w780/jWph2BRxGvMmCPfJxqOyVVi8FhD.jpg',
    'https://image.tmdb.org/t/p/w780/nKvFevdBPiJgQ8nEKFxknSAKHaI.jpg',
    'https://image.tmdb.org/t/p/w780/iTWrsOVsUqO4d5pBfFJuvJF0bDD.jpg',
  ],
  'Demon Slayer Kimetsu no Yaiba': [
    'https://image.tmdb.org/t/p/w780/nGxUxi3PfXDga51JYjFEXT1bT8P.jpg',
    'https://image.tmdb.org/t/p/w780/sYXLeu6N7aqceHTjPH5FV2Cyi1I.jpg',
    'https://image.tmdb.org/t/p/w780/k6N2ae0B9shAvKGfAjPgCvVnp5B.jpg',
    'https://image.tmdb.org/t/p/w780/wDNseMCOmkLJppgjKSnGmPFqhcI.jpg',
  ],
  'The Witcher Season 3': [
    'https://image.tmdb.org/t/p/w780/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
    'https://image.tmdb.org/t/p/w780/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
    'https://image.tmdb.org/t/p/w780/foGkPxpw9h8zln81j63tJpp2EBd.jpg',
    'https://image.tmdb.org/t/p/w780/jdbFZLJE2c7474ANZMVuz9iDr5V.jpg',
  ],
  'Oppenheimer': [
    'https://image.tmdb.org/t/p/w780/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    'https://image.tmdb.org/t/p/w780/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg',
    'https://image.tmdb.org/t/p/w780/rLb2cwF3Pazuxe0Aq6an0UDOQIE.jpg',
    'https://image.tmdb.org/t/p/w780/ptoYJBuceGYG3JkXrgdMVsx3iah.jpg',
    'https://image.tmdb.org/t/p/w780/oMsxZEvz9a708d49b6UdZK1KAo5.jpg',
  ],
  'Squid Game Season 2': [
    'https://image.tmdb.org/t/p/w780/qw3J9EFydwb443MVifMXTmVovPG.jpg',
    'https://image.tmdb.org/t/p/w780/c4GTUs1YMXFjbHPiA4I2Gg3K4mU.jpg',
    'https://image.tmdb.org/t/p/w780/5FjlGk2abBnTFmGLJKHx373BoKK.jpg',
    'https://image.tmdb.org/t/p/w780/5Iw7zQTHVRBOYpA0V6z0yb3Ys7d.jpg',
  ],
  'Killers of the Flower Moon': [
    'https://image.tmdb.org/t/p/w780/1X7vow16X7CnCoexXh4H4F2yDJv.jpg',
    'https://image.tmdb.org/t/p/w780/5gPQKfFJnl8d5KH7BPoXYFW7MIi.jpg',
    'https://image.tmdb.org/t/p/w780/kVG8zPJByaAR8PqAnmW1HkEmTnD.jpg',
    'https://image.tmdb.org/t/p/w780/qw0IabcLUcFIfXxKQYmjY4RApYF.jpg',
  ],
  'Attack on Titan Complete Series': [
    'https://image.tmdb.org/t/p/w780/yvKrycViRMQcaeeQzFCJ2fhfmnH.jpg',
    'https://image.tmdb.org/t/p/w780/sHim6U0ANsbzxcmNzGkk8LGO3gT.jpg',
    'https://image.tmdb.org/t/p/w780/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg',
    'https://image.tmdb.org/t/p/w780/bHXejqGCMuT3dE4j4QNrdV6fGkn.jpg',
    'https://image.tmdb.org/t/p/w780/94TIUEhOwmhZMJ5PufYuvBByiQR.jpg',
  ],
  'Descendants of the Sun': [
    'https://image.tmdb.org/t/p/w780/oFAVFCWj4LPflb5pe2GiUVdqhwl.jpg',
    'https://image.tmdb.org/t/p/w780/n4TuGOeHPHxP7VuGqmDICojHEfh.jpg',
    'https://image.tmdb.org/t/p/w780/e18H0fPdtEpzigJqb8gF10HpAuU.jpg',
    'https://image.tmdb.org/t/p/w780/cKgHxCdBeYmRaBjhP7DPvVQ0gVl.jpg',
  ],
  'Barbie': [
    'https://image.tmdb.org/t/p/w780/nHf61UzkfFno5X1ofIhugCPus2R.jpg',
    'https://image.tmdb.org/t/p/w780/ctMserH8g2SeOAnCw5gFjdQF8mo.jpg',
    'https://image.tmdb.org/t/p/w780/bFTGxEnME3p1yii5bH3KV3p6VCK.jpg',
    'https://image.tmdb.org/t/p/w780/1Lhql3fBHNPi1dfWqpVASw6pfDS.jpg',
  ],
  'Spy x Family Anime': [
    'https://image.tmdb.org/t/p/w780/2K2MUayYnHcTMIEvS2gTRMZVBfS.jpg',
    'https://image.tmdb.org/t/p/w780/3nYlM5VDP3C4V7t5dDLKUZFpwHy.jpg',
    'https://image.tmdb.org/t/p/w780/bIIvo0gJzBjVPMdm5nLPMxRKTCH.jpg',
    'https://image.tmdb.org/t/p/w780/xG54Kn57Z3C3x1a0eM3uVoaiC8r.jpg',
  ],
  'Guardians of the Galaxy Vol 3': [
    'https://image.tmdb.org/t/p/w780/4XM8DUTQb3lhLemJC51Jx4a2EuA.jpg',
    'https://image.tmdb.org/t/p/w780/xMv3IjGTjQXOyGXsxCYBhjy5UGO.jpg',
    'https://image.tmdb.org/t/p/w780/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg',
    'https://image.tmdb.org/t/p/w780/kUhH9OJKwF6S7qWhQLPuXxKHAwv.jpg',
  ],
  'Hello World Documentary': [
    'https://image.tmdb.org/t/p/w780/t5zCBSB5xMDKcDqe91qahCBYCYm.jpg',
    'https://image.tmdb.org/t/p/w780/q4PCAO1KzWZqYkZdeahOd8KAI7m.jpg',
    'https://image.tmdb.org/t/p/w780/hH3nz0AOL47AR0NKQRXDWE54Hx9.jpg',
  ],
  'WWE WrestleMania 40': [
    'https://image.tmdb.org/t/p/w780/vcFW09U4834DREOmHFa3VMknpLB.jpg',
    'https://image.tmdb.org/t/p/w780/9SSEUrSqhljBMzRe4aBTh17hYjd.jpg',
    'https://image.tmdb.org/t/p/w780/xg27NrXi7VXCGUr7MN75UqLl6Vg.jpg',
  ],

  // ===== BOLLYWOOD =====
  'Animal': [
    'https://image.tmdb.org/t/p/w780/lFwykSz3Ykj1Q3JXJURnGUTNf1o.jpg',
    'https://image.tmdb.org/t/p/w780/xFYf6gyGaFSHdio8jmJOJWiOoLW.jpg',
    'https://image.tmdb.org/t/p/w780/6fIx4xUzGjMDzPVWxqOc1ilQO9u.jpg',
    'https://image.tmdb.org/t/p/w780/uqCwF2TnVQ2jgVXdfjGNBViRy2l.jpg',
    'https://image.tmdb.org/t/p/w780/b9A2NBbiOe1MrTfBZtGviUJblVW.jpg',
  ],
  'Pathaan': [
    'https://image.tmdb.org/t/p/w780/bGlJwj2PG2mMvg1VCfj4GPBEO7k.jpg',
    'https://image.tmdb.org/t/p/w780/tRDoqVr5jVkHxWOPYSXaLqB9bgc.jpg',
    'https://image.tmdb.org/t/p/w780/cFE51slHMN6mh8Lmj2sFGk4x1SQ.jpg',
    'https://image.tmdb.org/t/p/w780/3nH8v5t1QNVsFWYcT4bYqQEhK9M.jpg',
  ],
  'Jawan': [
    'https://image.tmdb.org/t/p/w780/sOVbCAxRidpLJjdi2JEFaRqapuY.jpg',
    'https://image.tmdb.org/t/p/w780/qXWFEXfvbcp2lCmJF9i0NOlMGE5.jpg',
    'https://image.tmdb.org/t/p/w780/2mPPjc2JhMHoBrJAYs25r3aBIZA.jpg',
    'https://image.tmdb.org/t/p/w780/pLqBRihNGeSUpQRpJX8YqMgBz6I.jpg',
  ],
  'Dunki': [
    'https://image.tmdb.org/t/p/w780/gWLV8bCIr21JYBjnYVDsd0VjEFG.jpg',
    'https://image.tmdb.org/t/p/w780/hiA7koeMrdDKXlYHNFJvKmnU5de.jpg',
    'https://image.tmdb.org/t/p/w780/rJGG2sGOhXdrJFlXETVqKqMFqsm.jpg',
    'https://image.tmdb.org/t/p/w780/lSexT2hGzD8b3OKNftdBYqGIatz.jpg',
  ],
  'Fighter': [
    'https://image.tmdb.org/t/p/w780/7RCRTMaJDHLRQFdNDqOePuF3WDQN.jpg',
    'https://image.tmdb.org/t/p/w780/vJMNZrarOe7H8bCMqRUqwCCnL3d.jpg',
    'https://image.tmdb.org/t/p/w780/uNVgHxGm3RACi0yVZpSoA8qAjpq.jpg',
    'https://image.tmdb.org/t/p/w780/bnWiIYPXjgS3HKXU7fjCnLWfGR5.jpg',
  ],
  '12th Fail': [
    'https://image.tmdb.org/t/p/w780/22tRfBwDGbhXIXkMSNEkJSLfnj.jpg',
    'https://image.tmdb.org/t/p/w780/qOlnNfXgsbqa2cjC3sFb2NTESSO.jpg',
    'https://image.tmdb.org/t/p/w780/cAOkfPBxCIQRLKlBpELVaf8t0el.jpg',
    'https://image.tmdb.org/t/p/w780/dVNBT6YRZfOGkzagMNj4N6bG7YO.jpg',
  ],
  'Stree 2': [
    'https://image.tmdb.org/t/p/w780/kLjGCxNX0CKUDrGDc4y23WEcNYP.jpg',
    'https://image.tmdb.org/t/p/w780/9E82KyL33lMO0uIJlfz1Vb7piEO.jpg',
    'https://image.tmdb.org/t/p/w780/nMt4GcXi9ZbdZf4yCiOXgSbnKSC.jpg',
    'https://image.tmdb.org/t/p/w780/sV7S9n5MbHlFQnrLE6KxcXMhL4R.jpg',
  ],

  // ===== HOLLYWOOD =====
  'The Batman': [
    'https://image.tmdb.org/t/p/w780/b0PlSFdDwbyFAJlMeSrwxVBuXtD.jpg',
    'https://image.tmdb.org/t/p/w780/bHXejqGCMuT3dE4j4QNrdV6fGkn.jpg',
    'https://image.tmdb.org/t/p/w780/5P8SmMzSNYikXpxil6BYzJ16611.jpg',
    'https://image.tmdb.org/t/p/w780/t1vS3gzFVNOiAPayxFTnhf4QlYu.jpg',
    'https://image.tmdb.org/t/p/w780/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
  ],
  'Spider-Man Across the Spider-Verse': [
    'https://image.tmdb.org/t/p/w780/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    'https://image.tmdb.org/t/p/w780/nGxUxi3PfXDga51JYjFEXT1bT8P.jpg',
    'https://image.tmdb.org/t/p/w780/bIuYWoFprR8ggJ3LGjhFWJn0YE2.jpg',
    'https://image.tmdb.org/t/p/w780/7GCdDfnEqoOBqAChplYqCaePNRi.jpg',
  ],
  'John Wick Chapter 4': [
    'https://image.tmdb.org/t/p/w780/7I6VUdPj6tQECNHdviJkUHD2u89.jpg',
    'https://image.tmdb.org/t/p/w780/mNGMcLBrhFkCOuesgWaPqJfyKQW.jpg',
    'https://image.tmdb.org/t/p/w780/kn4bsCFgaz6MYlxF6dIdsT4yjHx.jpg',
    'https://image.tmdb.org/t/p/w780/q57aaX5ZyYGglJH9tkE7LKRG1DL.jpg',
  ],
  'Inception': [
    'https://image.tmdb.org/t/p/w780/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    'https://image.tmdb.org/t/p/w780/ii8QGacT3MXhJBiLyFMK7KFLAnq.jpg',
    'https://image.tmdb.org/t/p/w780/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    'https://image.tmdb.org/t/p/w780/aej3LRUga5pDrzOsOiwrJT6cIO0.jpg',
    'https://image.tmdb.org/t/p/w780/ztZ4vw151mw04Bg6rqwQuJzXTVE.jpg',
  ],
  'Interstellar': [
    'https://image.tmdb.org/t/p/w780/xJHokMbljvjADYdit5fK1DVfjko.jpg',
    'https://image.tmdb.org/t/p/w780/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
    'https://image.tmdb.org/t/p/w780/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
    'https://image.tmdb.org/t/p/w780/m7JbEbQSMbP5bULAmvwoY3jni2O.jpg',
    'https://image.tmdb.org/t/p/w780/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
  ],
  'The Dark Knight': [
    'https://image.tmdb.org/t/p/w780/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg',
    'https://image.tmdb.org/t/p/w780/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
    'https://image.tmdb.org/t/p/w780/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
    'https://image.tmdb.org/t/p/w780/c3OHQnJQ0JNpGtYCf8Jq3H0q4bU.jpg',
    'https://image.tmdb.org/t/p/w780/b7DzaRKLwFJn6aq5cSLqMSRN0kd.jpg',
  ],
  'Avengers Endgame': [
    'https://image.tmdb.org/t/p/w780/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    'https://image.tmdb.org/t/p/w780/orjiB3oUIsyz60hoW29WPNMnO1R.jpg',
    'https://image.tmdb.org/t/p/w780/lhknbBCgNMfiRsBEe9xTjvUbLBX.jpg',
    'https://image.tmdb.org/t/p/w780/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg',
    'https://image.tmdb.org/t/p/w780/n0ybibhJtQ5icDqTp8eRhcRHjEH.jpg',
  ],
  'Deadpool and Wolverine': [
    'https://image.tmdb.org/t/p/w780/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    'https://image.tmdb.org/t/p/w780/dvBCdCohwWbsP5qAaglOXagDMtk.jpg',
    'https://image.tmdb.org/t/p/w780/yBk8JVE3QEuQmQnkv2Vn4yLHlh6.jpg',
    'https://image.tmdb.org/t/p/w780/dDMFGReS9sT2GkthNBFYr7LhXWR.jpg',
  ],
  'Godzilla x Kong The New Empire': [
    'https://image.tmdb.org/t/p/w780/xRd1eJIDe7JHO5u4gtEYwGn5wtf.jpg',
    'https://image.tmdb.org/t/p/w780/veIyxxi5Gs8gvztLEW1Ysb8rrzs.jpg',
    'https://image.tmdb.org/t/p/w780/fY3lD0jM5AoHJMunjGWqJ0hRteI.jpg',
    'https://image.tmdb.org/t/p/w780/kYgQznUUn8V4JFNMKbMh3cPjEYC.jpg',
  ],
  'Inside Out 2': [
    'https://image.tmdb.org/t/p/w780/xg27NrXi7VXCGUr7MN75UqLl6Vg.jpg',
    'https://image.tmdb.org/t/p/w780/p5ozvmdgsmbWe0H8Xk7Rc8zkNxs.jpg',
    'https://image.tmdb.org/t/p/w780/stKGOm8UyhuLPR9sZLjs5AkmhbG.jpg',
    'https://image.tmdb.org/t/p/w780/nGxUxi3PfXDga51JYjFEXT1bT8P.jpg',
  ],
  'Furiosa A Mad Max Saga': [
    'https://image.tmdb.org/t/p/w780/shrwC6U8Bkst9c9SnP8MNJg0PJi.jpg',
    'https://image.tmdb.org/t/p/w780/fqv8v6AycXKsivp1T5yKtLbGXce.jpg',
    'https://image.tmdb.org/t/p/w780/8LBk5FHuFPIkkLJSpQINq3KT4Qi.jpg',
    'https://image.tmdb.org/t/p/w780/qi3LhIE0LkmKXF2xpEyNmpzSHNP.jpg',
  ],
  'Alien Romulus': [
    'https://image.tmdb.org/t/p/w780/9SSEUrSqhljBMzRe4aBTh17hYjd.jpg',
    'https://image.tmdb.org/t/p/w780/mUhDkvYVNjpV5YhEPB0ILmoqda1.jpg',
    'https://image.tmdb.org/t/p/w780/6PcufsRR94YERM3kMMuavYCKSad.jpg',
    'https://image.tmdb.org/t/p/w780/mFpihstHlUqpJIKj0e3VPEhxpEg.jpg',
  ],

  // ===== ANIME =====
  'One Piece': [
    'https://image.tmdb.org/t/p/w780/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg',
    'https://image.tmdb.org/t/p/w780/kKJBLUtCUUMkk1XQ7laiw12fAZN.jpg',
    'https://image.tmdb.org/t/p/w780/rFxIxCKhiPwAlTaOOvdd9zN3k5v.jpg',
    'https://image.tmdb.org/t/p/w780/dd4btDB9rMJMIvYfjsaJGTIBEYU.jpg',
    'https://image.tmdb.org/t/p/w780/k7rz9jRlXqb5eFVB5kXxCo6gHEe.jpg',
  ],
  'Dragon Ball Super': [
    'https://image.tmdb.org/t/p/w780/fj8aA0dGkS2F2VJaXQCvB1oyBdX.jpg',
    'https://image.tmdb.org/t/p/w780/2LCxst1PFl4z5FpiZ8ht1VZ7etb.jpg',
    'https://image.tmdb.org/t/p/w780/dUCYa0MErGFEbukcRnAcN2E9JQAL.jpg',
    'https://image.tmdb.org/t/p/w780/kJmNB6rrcCDhRa9TrqbPJR7FKj7.jpg',
  ],
  'My Hero Academia Season 7': [
    'https://image.tmdb.org/t/p/w780/9TAhRShQFfRyBbVWuigqFYnF33e.jpg',
    'https://image.tmdb.org/t/p/w780/eW0yvIp0S8aZkGLFXDdX0y3xn4t.jpg',
    'https://image.tmdb.org/t/p/w780/oE6bhqqVFyIWMiMBiSOH01EA0GL.jpg',
    'https://image.tmdb.org/t/p/w780/cB3oVwNmBK44G0cAABt4LJRtBni.jpg',
  ],
  'Solo Leveling': [
    'https://image.tmdb.org/t/p/w780/hH3nz0AOL47AR0NKQRXDWE54Hx9.jpg',
    'https://image.tmdb.org/t/p/w780/4N2KNGP3AEh2JWzxrLgFfbxDoGr.jpg',
    'https://image.tmdb.org/t/p/w780/jTswp6KyDYKtvC52GbHagrZbGvD.jpg',
    'https://image.tmdb.org/t/p/w780/4EmFJKFGhSZL9Y2f7Fw3svo4JhE.jpg',
  ],
  'Death Note': [
    'https://image.tmdb.org/t/p/w780/A2t6gC3NQf9YkBIdCMhQcRRDBjP.jpg',
    'https://image.tmdb.org/t/p/w780/qDRvRGGszbRGDj4V6E9bKxVHCq4.jpg',
    'https://image.tmdb.org/t/p/w780/xPMGhBt3DxGPiNkhjiAQvaKBkpi.jpg',
    'https://image.tmdb.org/t/p/w780/kFq2OPL8JvzGikdJ7k8N6Foh0M1.jpg',
  ],
  'Chainsaw Man': [
    'https://image.tmdb.org/t/p/w780/5VKEguhJBWoE9Bo2nbEBBNxIGkS.jpg',
    'https://image.tmdb.org/t/p/w780/npdB6efzizki0cMqiCoVcdO2pgg.jpg',
    'https://image.tmdb.org/t/p/w780/jNxR7JBCGGCfaP1H8iMNQcH0iz7.jpg',
    'https://image.tmdb.org/t/p/w780/zqGJzM6dR6tE6FCnKeTkVfdJfgA.jpg',
  ],
  'Fullmetal Alchemist Brotherhood': [
    'https://image.tmdb.org/t/p/w780/q4PCAO1KzWZqYkZdeahOd8KAI7m.jpg',
    'https://image.tmdb.org/t/p/w780/xqFiHtvPVRRJN6LF5CiB32Ts4wa.jpg',
    'https://image.tmdb.org/t/p/w780/k0JzHFzqfZgONGNJOcwDcWNmJsR.jpg',
    'https://image.tmdb.org/t/p/w780/jt6bJhJfm1iKbEjqfParX8iAHwH.jpg',
  ],

  // ===== K-DRAMA =====
  'Crash Landing on You': [
    'https://image.tmdb.org/t/p/w780/d6E6yVjCaBjOK7WMkHxDyUqppoc.jpg',
    'https://image.tmdb.org/t/p/w780/8E4pNdoE4sEI7LRtWb5BkdS6Jct.jpg',
    'https://image.tmdb.org/t/p/w780/t2PEz8dXDH5XKHhFjSNe9E5ZAyq.jpg',
    'https://image.tmdb.org/t/p/w780/fBshLiEJuBQFMdp2GAOLX5Iumj8.jpg',
  ],
  'All of Us Are Dead': [
    'https://image.tmdb.org/t/p/w780/qFYkEJfkRBhPnFjXTKmMjHrI2pz.jpg',
    'https://image.tmdb.org/t/p/w780/2EYJL9FMYWwqegjBRzYkzP8Vtex.jpg',
    'https://image.tmdb.org/t/p/w780/p7Lxob1usDX8rr7TNHoA1dmVd46.jpg',
    'https://image.tmdb.org/t/p/w780/6IU2DfGW6fGHR7g0bVP6m9W0IYS.jpg',
  ],
  'Vincenzo': [
    'https://image.tmdb.org/t/p/w780/jKD7Srq6lKiKNa2CnBHiSUp3gFA.jpg',
    'https://image.tmdb.org/t/p/w780/r4UxfT35pJ4IbilJqL9tlW1IjEb.jpg',
    'https://image.tmdb.org/t/p/w780/70AlDAMC6MJUlPSQN6zpHFJP8rR.jpg',
    'https://image.tmdb.org/t/p/w780/o2GAcGcWWFhD1vLEBl1yiNp8Us0.jpg',
  ],
  'Extraordinary Attorney Woo': [
    'https://image.tmdb.org/t/p/w780/pFfnNqhSeMz0cqJzouuPEiM6o5U.jpg',
    'https://image.tmdb.org/t/p/w780/oFCyhJHs8A6JCmjfoEN8l0S0Pjf.jpg',
    'https://image.tmdb.org/t/p/w780/q9MG11SZZTU3M1y1PNsXXPBrFYY.jpg',
    'https://image.tmdb.org/t/p/w780/jC1dlnqSPAV5PMhqyUWqJ5sPXG5.jpg',
  ],
  'The Glory': [
    'https://image.tmdb.org/t/p/w780/9zcbqSxbsOQVv3WUAxehSm8S4Bi.jpg',
    'https://image.tmdb.org/t/p/w780/rZFHcWUCHnuYHNovOsH7GXP6y9T.jpg',
    'https://image.tmdb.org/t/p/w780/9PQiHjJ3DF77UGi8OhNDxeeN6qt.jpg',
    'https://image.tmdb.org/t/p/w780/hQO3tVTN5sXCBwPtZHfAktvhtbJ.jpg',
  ],

  // ===== SERIES =====
  'Breaking Bad Complete Series': [
    'https://image.tmdb.org/t/p/w780/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    'https://image.tmdb.org/t/p/w780/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    'https://image.tmdb.org/t/p/w780/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg',
    'https://image.tmdb.org/t/p/w780/hbgPoI706gVz3JCRdVzooNuiVLM.jpg',
    'https://image.tmdb.org/t/p/w780/84XPpjGJxMoeLFhnDJhrbVBKIPL.jpg',
  ],
  'Money Heist': [
    'https://image.tmdb.org/t/p/w780/xGexTKCJDkl12dTW4YCBDXWb1AD.jpg',
    'https://image.tmdb.org/t/p/w780/gFZriCkpJYsApPZEF3jhxL4yLzG.jpg',
    'https://image.tmdb.org/t/p/w780/piuRhGiQBYWgW668eSNJ2ug5uAO.jpg',
    'https://image.tmdb.org/t/p/w780/mNBMsOjzNj8Co0fOxynolwklm3c.jpg',
  ],
  'Wednesday Season 1': [
    'https://image.tmdb.org/t/p/w780/iHSwvRVsNBTngVvXEB6Ttl1jLb3.jpg',
    'https://image.tmdb.org/t/p/w780/1B3ikKEFoABagATIrj0kDChJbXj.jpg',
    'https://image.tmdb.org/t/p/w780/iJQm7hDwTkMpKoP3PqPjbXINP4A.jpg',
    'https://image.tmdb.org/t/p/w780/dCO1MUFBbcm2afFv95VgcSXyfYd.jpg',
  ],
  'Stranger Things Season 4': [
    'https://image.tmdb.org/t/p/w780/56v2KjBlYj3Yw6fGC2r3ibaFsXa.jpg',
    'https://image.tmdb.org/t/p/w780/rcA17r3hfHtRrk3Lv3GXuWaLSbQ.jpg',
    'https://image.tmdb.org/t/p/w780/9RO2e3aq0HScJnPFc8Xyduqf1aN.jpg',
    'https://image.tmdb.org/t/p/w780/xWbj1McVlB6QlJGvhm7X3OSGB9k.jpg',
    'https://image.tmdb.org/t/p/w780/lXhgCODAbBXL5buk9yEmTpOoOgR.jpg',
  ],
  'The Last of Us Season 1': [
    'https://image.tmdb.org/t/p/w780/uDgy6hyPd82kOHh6I95FLtM8gZp.jpg',
    'https://image.tmdb.org/t/p/w780/bLGTgKvl3k1hC3ZM4jF3CWMBCiM.jpg',
    'https://image.tmdb.org/t/p/w780/kwaMlhKkRTIveqoSjFfpwz7Fl18.jpg',
    'https://image.tmdb.org/t/p/w780/q1bnvVLcPK9iJH9Q5d2gVMiMiHG.jpg',
  ],
  'House of the Dragon Season 2': [
    'https://image.tmdb.org/t/p/w780/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg',
    'https://image.tmdb.org/t/p/w780/tIfAE3WzqkfBkuCbH2HkxGbLDhH.jpg',
    'https://image.tmdb.org/t/p/w780/7dowXHCbpmFyAx4OBUVv3MY3v4g.jpg',
    'https://image.tmdb.org/t/p/w780/1w24Vu2q8bF4dQ3Sa5Pg6BdIbqj.jpg',
  ],

  // ===== SOUTH INDIAN =====
  'RRR': [
    'https://image.tmdb.org/t/p/w780/iWAlBIw8kDOYqGDG3cXbGti2unj.jpg',
    'https://image.tmdb.org/t/p/w780/bNwsHnDatxh4f0nnAfxQQXtxQ9J.jpg',
    'https://image.tmdb.org/t/p/w780/1jnXAMwCMiP7JlER2pMDkJFOh5v.jpg',
    'https://image.tmdb.org/t/p/w780/cklBSoH1sSP8L8VUX5xFKDExVYb.jpg',
    'https://image.tmdb.org/t/p/w780/5FjlGk2abBnTFmGLJKHx373BoKK.jpg',
  ],
  'KGF Chapter 2': [
    'https://image.tmdb.org/t/p/w780/dsmWIkGE5ydDMXhX2iD1fLEL0Lt.jpg',
    'https://image.tmdb.org/t/p/w780/eYVFhgi0dvtNJRIFCAhnAiYVQGK.jpg',
    'https://image.tmdb.org/t/p/w780/2NnJ4CcH5EOYN8jVMFp72LkT4wc.jpg',
    'https://image.tmdb.org/t/p/w780/sY8IrVRLaRi7VLznJGqk3EFPaOb.jpg',
  ],
  'Pushpa 2 The Rule': [
    'https://image.tmdb.org/t/p/w780/9t3fSqwcwZhJYVjMuNSt3hb3mI3.jpg',
    'https://image.tmdb.org/t/p/w780/tFO07pkovx19Hba3tZxVNqQOOJH.jpg',
    'https://image.tmdb.org/t/p/w780/kLqM2JV7aXYfgi0yN0YWjKrjrT2.jpg',
    'https://image.tmdb.org/t/p/w780/p5qF6ISQgSv5EFVEqYLGFhVfWKt.jpg',
  ],
  'Kalki 2898 AD': [
    'https://image.tmdb.org/t/p/w780/k0JzHFzqfZgONGNJOcwDcWNmJsR.jpg',
    'https://image.tmdb.org/t/p/w780/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg',
    'https://image.tmdb.org/t/p/w780/9qFbNSnRyCn0xZlwLrBEjeP3d3h.jpg',
    'https://image.tmdb.org/t/p/w780/bNLkjZ3TxijVbUlXjMPYOPMjnKM.jpg',
  ],

  // ===== MORE HOLLYWOOD =====
  'The Shawshank Redemption': [
    'https://image.tmdb.org/t/p/w780/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    'https://image.tmdb.org/t/p/w780/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg',
    'https://image.tmdb.org/t/p/w780/avedvodAYUF7l1obQbo1SArk5RG.jpg',
    'https://image.tmdb.org/t/p/w780/gPbM0MK8CP8A174rmUwGsADNYKD.jpg',
  ],
  'Fight Club': [
    'https://image.tmdb.org/t/p/w780/52AfXWnXi1Hy9QzDk8TjYI0VCEQ.jpg',
    'https://image.tmdb.org/t/p/w780/kFUqJOJK9t1nf6Sg4wlsKAPtiR2.jpg',
    'https://image.tmdb.org/t/p/w780/w5IDXtifKntw0ajv2co7jFlTQDM.jpg',
    'https://image.tmdb.org/t/p/w780/btHNF2hGCGmE9SRlVFxyZkiigXa.jpg',
  ],
  'Gladiator II': [
    'https://image.tmdb.org/t/p/w780/euYIwmwkmz95mnXvufEoKeN2Ihl.jpg',
    'https://image.tmdb.org/t/p/w780/hhVkNiB2FE7EYMsfPFi2MqKrzYH.jpg',
    'https://image.tmdb.org/t/p/w780/qdwXqiFKrLTfeFSIGjyJnfAGoHT.jpg',
    'https://image.tmdb.org/t/p/w780/5tQxMgYar5fiJN1LAGhfBiPJfKT.jpg',
  ],
  'Joker Folie a Deux': [
    'https://image.tmdb.org/t/p/w780/uGmfSHZBkkEho6gFgnOH2zcLFCM.jpg',
    'https://image.tmdb.org/t/p/w780/mbdI87EHJQW3PSwV24lVQLEIAMM.jpg',
    'https://image.tmdb.org/t/p/w780/svFoEGnPTSZBCQPJEMlNMADAJOa.jpg',
    'https://image.tmdb.org/t/p/w780/b67jOGDGfkQHpVDJVBz1IAJel7E.jpg',
  ],
  'Wicked': [
    'https://image.tmdb.org/t/p/w780/uVlUu174iiKhsUGqnOSy46eIIMU.jpg',
    'https://image.tmdb.org/t/p/w780/xCGj8GKzKpimSKznIuLPVRpMcBf.jpg',
    'https://image.tmdb.org/t/p/w780/pg9fCPrN6SNdOXCMafKflyl6LXG.jpg',
    'https://image.tmdb.org/t/p/w780/tRCrHPDR8p1FjLqv5sa1dWd6CfC.jpg',
  ],
  'A Quiet Place Day One': [
    'https://image.tmdb.org/t/p/w780/9mMhNhCcMlZOBUP3oN1KOsUSEzz.jpg',
    'https://image.tmdb.org/t/p/w780/yrpPYKijwGJY7MByi1iRJft7ukU.jpg',
    'https://image.tmdb.org/t/p/w780/sFk4YJDKVM2zrFdjBtpUkXNIekH.jpg',
    'https://image.tmdb.org/t/p/w780/lNiT2pMCw0PVcuOZe1PxkrDmC9r.jpg',
  ],

  // ===== DOCUMENTARY =====
  'Our Planet Season 2': [
    'https://image.tmdb.org/t/p/w780/jdQEsDQJLtHZiQ7TDzg97fJXJGq.jpg',
    'https://image.tmdb.org/t/p/w780/lTB4e95xfPayarBcSBBbNVcQLDz.jpg',
    'https://image.tmdb.org/t/p/w780/feSiISwgEpVzR1v3zv2n2AU4ANJ.jpg',
    'https://image.tmdb.org/t/p/w780/nGxUxi3PfXDga51JYjFEXT1bT8P.jpg',
  ],
  'Planet Earth III': [
    'https://image.tmdb.org/t/p/w780/lTB4e95xfPayarBcSBBbNVcQLDz.jpg',
    'https://image.tmdb.org/t/p/w780/jdQEsDQJLtHZiQ7TDzg97fJXJGq.jpg',
    'https://image.tmdb.org/t/p/w780/xJHokMbljvjADYdit5fK1DVfjko.jpg',
    'https://image.tmdb.org/t/p/w780/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg',
  ],
};

async function addScreenshots() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const allMovies = await Movie.find({});
    console.log(`Total movies in DB: ${allMovies.length}\n`);

    let updated = 0;
    let fallback = 0;
    let skipped = 0;

    for (const movie of allMovies) {
      // Skip if already has screenshots
      if (movie.screenshots && movie.screenshots.length > 0) {
        console.log(`  Skipped (has SS): ${movie.cleanTitle}`);
        skipped++;
        continue;
      }

      let screenshots = SCREENSHOTS_MAP[movie.cleanTitle];

      // Fallback: use backdropUrl at w780 size if no curated screenshots
      if (!screenshots && movie.backdropUrl) {
        const path = movie.backdropUrl.replace('https://image.tmdb.org/t/p/w1280/', '');
        screenshots = [
          `https://image.tmdb.org/t/p/w780/${path}`,
        ];
        // Also add posterUrl as second screenshot if available
        if (movie.posterUrl) {
          const posterPath = movie.posterUrl.replace('https://image.tmdb.org/t/p/w342/', '');
          screenshots.push(`https://image.tmdb.org/t/p/w500/${posterPath}`);
        }
        fallback++;
      }

      if (screenshots && screenshots.length > 0) {
        await Movie.updateOne(
          { _id: movie._id },
          { $set: { screenshots } }
        );
        console.log(`  Updated (${screenshots.length} SS): ${movie.cleanTitle}`);
        updated++;
      } else {
        console.log(`  No data: ${movie.cleanTitle}`);
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Updated: ${updated}`);
    console.log(`  - Curated: ${updated - fallback}`);
    console.log(`  - Fallback: ${fallback}`);
    console.log(`Skipped (already had SS): ${skipped}`);
    console.log(`Total: ${allMovies.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addScreenshots();
