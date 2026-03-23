'use client';

import { useEffect, useState } from 'react';
import { movieAPI, adminAPI } from '@/lib/api';
import MovieGrid from '@/components/MovieGrid';
import QuickFilters from '@/components/QuickFilters';
import { Movie, SiteLink } from '@/lib/types';

export default function Home() {
  const [latest, setLatest] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Movie[]>([]);
  const [kdrama, setKdrama] = useState<Movie[]>([]);
  const [netflix, setNetflix] = useState<Movie[]>([]);
  const [amazon, setAmazon] = useState<Movie[]>([]);
  const [siteLinks, setSiteLinks] = useState<SiteLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          latestRes,
          trendingRes,
          animeRes,
          kdramaRes,
          netflixRes,
          amazonRes,
          linksRes,
        ] = await Promise.all([
          movieAPI.getMovies({ sort: 'latest', limit: 12 }),
          movieAPI.getTrending({ limit: 12 }),
          movieAPI.getMovies({ type: 'anime', limit: 12 }),
          movieAPI.getMovies({ type: 'kdrama', limit: 12 }),
          movieAPI.getMovies({ ott: 'netflix', limit: 12 }),
          movieAPI.getMovies({ ott: 'amazon', limit: 12 }),
          adminAPI.getSiteLinks(),
        ]);

        setLatest(latestRes.data.movies);
        setTrending(trendingRes.data.movies);
        setAnime(animeRes.data.movies);
        setKdrama(kdramaRes.data.movies);
        setNetflix(netflixRes.data.movies);
        setAmazon(amazonRes.data.movies);
        setSiteLinks(linksRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const Section = ({
    title,
    emoji,
    movies,
    href,
  }: {
    title: string;
    emoji: string;
    movies: Movie[];
    href: string;
  }) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {emoji} {title}
        </h2>
        <a href={href} className="text-red-500 hover:text-red-400 font-semibold">
          View All →
        </a>
      </div>
      <MovieGrid movies={movies} isLoading={loading} />
    </div>
  );

  return (
    <div>
      <QuickFilters links={siteLinks} />

      <Section title="Latest Releases" emoji="🔥" movies={latest} href="/browse" />
      <Section title="Trending Now" emoji="📈" movies={trending} href="/trending" />
      <Section title="Top Anime" emoji="🎌" movies={anime} href="/anime" />
      <Section title="K-Drama Picks" emoji="🇰🇷" movies={kdrama} href="/kdrama" />
      <Section title="Netflix Originals" emoji="📺" movies={netflix} href="/ott/netflix" />
      <Section title="Amazon Prime" emoji="📦" movies={amazon} href="/ott/amazon" />
    </div>
  );
}
