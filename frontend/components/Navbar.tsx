'use client';

import { useState } from 'react';
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

  return (
    <div className="relative group" onMouseLeave={() => setIsOpen(false)}>
      <button
        className="text-white hover:text-gray-300 font-semibold flex items-center gap-1"
        onMouseEnter={() => setIsOpen(true)}
      >
        {label} ▾
      </button>
      {isOpen && (
        <div
          className="absolute left-0 mt-0 w-48 bg-gray-900 border border-gray-700 rounded shadow-lg z-50 max-h-96 overflow-y-auto"
          onMouseLeave={() => setIsOpen(false)}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-white hover:bg-gray-800 text-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-black text-red-500">
            VEGAMOVIES<span className="text-white"> 3.0</span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            <DropdownMenu label="OTT" items={DROPDOWNS.ott} />
            <DropdownMenu label="Genre" items={DROPDOWNS.genre} />
            <DropdownMenu label="By Year" items={DROPDOWNS.year} />
            <DropdownMenu label="By Qualities" items={DROPDOWNS.quality} />
            <Link href="/anime" className="text-white font-bold hover:text-gray-300">
              Anime
            </Link>
            <Link href="/kdrama" className="text-white font-bold hover:text-gray-300">
              K-Drama
            </Link>
            <Link href="/browse?isAdult=true" className="text-red-500 font-bold hover:text-red-400">
              Adult
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex">
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 w-48"
            />
          </form>
        </div>
      </div>
    </nav>
  );
}
