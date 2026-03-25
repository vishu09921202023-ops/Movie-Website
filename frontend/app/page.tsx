'use client';

import { useEffect, useState } from 'react';
import { movieAPI } from '@/lib/api';
import MovieGrid from '@/components/MovieGrid';
import QuickFilters from '@/components/QuickFilters';
import Link from 'next/link';
import { Movie, SiteLink } from '@/lib/types';

const SectionHeader = ({ title, icon, href }: { title: string; icon: React.ReactNode; href: string }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/20 to-red-800/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-lg shadow-red-900/10">
        {icon}
      </div>
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-white">{title}</h2>
        <div className="h-0.5 w-16 bg-gradient-to-r from-red-500 via-red-500/50 to-transparent mt-1 rounded-full" />
      </div>
    </div>
    <Link
      href={href}
      className="text-sm font-medium text-gray-400 hover:text-red-400 transition-all duration-300 flex items-center gap-1 group px-4 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
    >
      View All
      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </Link>
  </div>
);

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
        const [latestRes, trendingRes, animeRes, kdramaRes, netflixRes, amazonRes, linksRes] =
          await Promise.all([
            movieAPI.getMovies({ sort: 'latest', limit: 12 }),
            movieAPI.getTrending({ limit: 12 }),
            movieAPI.getMovies({ type: 'anime', limit: 12 }),
            movieAPI.getMovies({ type: 'kdrama', limit: 12 }),
            movieAPI.getMovies({ ott: 'netflix', limit: 12 }),
            movieAPI.getMovies({ ott: 'amazon', limit: 12 }),
            movieAPI.getSiteLinks(),
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

  const sections = [
    {
      title: 'Latest Releases',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>,
      movies: latest,
      href: '/browse',
    },
    {
      title: 'Trending Now',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>,
      movies: trending,
      href: '/trending',
    },
    {
      title: 'Top Anime',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
      movies: anime,
      href: '/anime',
    },
    {
      title: 'K-Drama Picks',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>,
      movies: kdrama,
      href: '/kdrama',
    },
    {
      title: 'Netflix Originals',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm-2-2V5h2v4h-2zM5 5v4h2V5H5zm-2 8v-2h2v2H3zm2 2v-2H3v2h2z" clipRule="evenodd" /></svg>,
      movies: netflix,
      href: '/ott/netflix',
    },
    {
      title: 'Amazon Prime',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" /></svg>,
      movies: amazon,
      href: '/ott/amazon',
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl mb-10 border border-white/5 animate-fade-in">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-[#0a0a14] to-purple-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(229,9,20,0.2),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(147,51,234,0.1),_transparent_50%)]" />
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(229,9,20,0.3), transparent, rgba(147,51,234,0.2))', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor', WebkitMaskComposite: 'xor', padding: '1px', borderRadius: 'inherit' }} />
        <div className="relative px-6 lg:px-10 py-12 lg:py-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 rounded-full bg-red-500" />
            <span className="text-red-400 text-xs font-semibold uppercase tracking-[0.2em]">Premium Movie Hub</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-4 leading-tight">
            <span className="gradient-text">VN Movies HD</span>
          </h1>
          <p className="text-gray-400 text-sm lg:text-base max-w-xl leading-relaxed mb-8">
            Your premium destination for Bollywood, Hollywood, Anime &amp; K-Drama. Stream and download in 4K, 1080p, and 720p quality.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/browse" className="btn-primary px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Browse All Movies
            </Link>
            <Link href="/trending" className="px-8 py-3 rounded-xl text-sm font-bold border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
              Trending Now
            </Link>
          </div>
          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-500 text-xs font-medium">4K Ultra HD</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="text-gray-500 text-xs font-medium">Multi Audio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '1s' }} />
              <span className="text-gray-500 text-xs font-medium">Latest Releases</span>
            </div>
          </div>
        </div>
      </div>

      <QuickFilters links={siteLinks} />

      {/* Sections */}
      <div className="space-y-14 mt-10">
        {sections.map((section) => (
          <section key={section.title} className="animate-fade-in-up">
            <SectionHeader title={section.title} icon={section.icon} href={section.href} />
            <MovieGrid movies={section.movies} isLoading={loading} />
          </section>
        ))}
      </div>
    </div>
  );
}
