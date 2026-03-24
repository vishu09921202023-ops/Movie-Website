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
      <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />

      <div className="bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                  <span className="text-white font-black text-xs">VN</span>
                </div>
                <span className="text-lg font-black">
                  <span className="text-red-500">VN</span> Movies <span className="text-red-500">HD</span>
                </span>
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
