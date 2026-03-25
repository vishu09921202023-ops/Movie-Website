'use client';

import Link from 'next/link';

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Browse', href: '/browse' },
  { label: 'Trending', href: '/trending' },
  { label: 'Anime', href: '/anime' },
  { label: 'K-Drama', href: '/kdrama' },
];

const legalLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'DMCA', href: '/dmca' },
  { label: 'Sitemap', href: '/sitemap' },
];

export default function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
      <div className="h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent mt-px" />

      <div className="bg-[#0a0a0f]/90 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-red-600/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:shadow-red-600/40 transition-all duration-300">
                  <span className="text-white font-black text-xs">VN</span>
                </div>
                <div>
                  <span className="text-lg font-black">
                    <span className="text-red-500">VN</span> Movies <span className="text-red-500">HD</span>
                  </span>
                  <p className="text-[9px] text-gray-600 tracking-[0.15em] uppercase">Premium Movies Hub</p>
                </div>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                Your ultimate destination for Bollywood, Hollywood, Anime, and K-Drama movies in HD quality.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-2.5">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-white/5">
            <p className="text-center text-gray-600 text-xs">
              © {new Date().getFullYear()} VN Movies HD. All Rights Reserved. For educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
