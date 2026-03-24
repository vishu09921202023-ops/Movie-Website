'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DropdownItem {
  label: string;
  href: string;
}

interface DropdownMenuProps {
  label: string;
  items: DropdownItem[];
}

const DROPDOWNS = {
  ott: [
    { label: 'Anime Series', href: '/anime' },
    { label: 'Apple TV+', href: '/ott/apple' },
    { label: 'Amazon Prime', href: '/ott/amazon' },
    { label: 'miniTV', href: '/ott/minitv' },
    { label: 'Netflix', href: '/ott/netflix' },
    { label: 'Jio HotStar', href: '/ott/hotstar' },
    { label: 'Disney+', href: '/ott/disney' },
    { label: 'Turkish', href: '/ott/turkish' },
    { label: 'Chinese', href: '/ott/chinese' },
    { label: 'Discovery+', href: '/ott/discovery' },
    { label: 'WWE Shows', href: '/ott/wwe' },
  ] as DropdownItem[],
  genre: [
    { label: 'Action', href: '/browse?genre=Action' },
    { label: 'Adventure', href: '/browse?genre=Adventure' },
    { label: 'Animation', href: '/browse?genre=Animation' },
    { label: 'Biography', href: '/browse?genre=Biography' },
    { label: 'Comedy', href: '/browse?genre=Comedy' },
    { label: 'Crime', href: '/browse?genre=Crime' },
    { label: 'Documentary', href: '/browse?genre=Documentary' },
    { label: 'Drama', href: '/browse?genre=Drama' },
    { label: 'Family', href: '/browse?genre=Family' },
    { label: 'Fantasy', href: '/browse?genre=Fantasy' },
    { label: 'History', href: '/browse?genre=History' },
    { label: 'Horror', href: '/browse?genre=Horror' },
    { label: 'Mystery', href: '/browse?genre=Mystery' },
    { label: 'Romance', href: '/browse?genre=Romance' },
    { label: 'Sci-Fi', href: '/browse?genre=Sci-Fi' },
    { label: 'Science Fiction', href: '/browse?genre=Science+Fiction' },
    { label: 'Thriller', href: '/browse?genre=Thriller' },
    { label: 'War', href: '/browse?genre=War' },
    { label: 'Western', href: '/browse?genre=Western' },
  ] as DropdownItem[],
  year: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013].map((y) => ({
    label: y.toString(),
    href: `/browse?year=${y}`,
  })) as DropdownItem[],
  quality: [
    { label: '2160p 4K', href: '/browse?quality=2160p' },
    { label: '60Fps', href: '/browse?quality=60fps' },
    { label: '1080p', href: '/browse?quality=1080p' },
    { label: '720p', href: '/browse?quality=720p' },
    { label: '480p', href: '/browse?quality=480p' },
  ] as DropdownItem[],
};

const DropdownMenu = ({ label, items }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();

  const open = () => { clearTimeout(timeout.current); setIsOpen(true); };
  const close = () => { timeout.current = setTimeout(() => setIsOpen(false), 150); };

  return (
    <div className="relative" onMouseEnter={open} onMouseLeave={close}>
      <button className="nav-link font-medium flex items-center gap-1 py-2 text-sm tracking-wide uppercase">
        {label}
        <svg className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div className={`absolute left-0 top-full pt-1 z-50 transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-75 pointer-events-none'}`}>
        <div className="w-52 glass rounded-xl border border-white/10 shadow-2xl shadow-black/50 max-h-80 overflow-y-auto py-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 text-sm transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'glass shadow-lg shadow-black/30 border-b border-white/5' : 'bg-transparent border-b border-white/5'}`}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/40 group-hover:shadow-red-600/50 transition-shadow duration-300">
              <span className="text-white font-black text-sm">VN</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight">
                <span className="text-red-500">VN</span>
                <span className="text-white"> Movies</span>
                <span className="text-red-500"> HD</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5">
            <DropdownMenu label="OTT" items={DROPDOWNS.ott} />
            <DropdownMenu label="Genre" items={DROPDOWNS.genre} />
            <DropdownMenu label="Year" items={DROPDOWNS.year} />
            <DropdownMenu label="Quality" items={DROPDOWNS.quality} />
            <Link href="/anime" className="nav-link font-medium text-sm tracking-wide uppercase py-2">Anime</Link>
            <Link href="/kdrama" className="nav-link font-medium text-sm tracking-wide uppercase py-2">K-Drama</Link>
            <Link href="/trending" className="nav-link font-medium text-sm tracking-wide uppercase py-2">Trending</Link>
          </div>

          {/* Search + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2 rounded-xl text-sm w-44 focus:w-64 transition-all duration-300 focus:outline-none focus:border-red-500/50 focus:bg-white/10 placeholder-gray-500"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </form>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-white transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-0.5 bg-white transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-400 ease-out overflow-hidden ${mobileOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="glass border-t border-white/5 px-4 py-4 space-y-1">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-red-500/50"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </form>
          {[
            { label: 'Home', href: '/' },
            { label: 'Anime', href: '/anime' },
            { label: 'K-Drama', href: '/kdrama' },
            { label: 'Trending', href: '/trending' },
            { label: 'Browse All', href: '/browse' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === item.href ? 'bg-red-600/20 text-red-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
