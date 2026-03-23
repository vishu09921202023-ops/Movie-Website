'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-green-500 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-400 text-sm mb-6">
          Vegamovies - Download Bollywood and Hollywood Movies 720p, 1080p and 2160p 4K © 2020. All Rights
          Reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <a href="/" className="text-gray-300 hover:text-white">
            HOME
          </a>
          <span className="text-gray-600">|</span>
          <a href="/disclaimer" className="text-gray-300 hover:text-white">
            Disclaimer
          </a>
          <span className="text-gray-600">|</span>
          <a href="/dmca" className="text-gray-300 hover:text-white">
            DMCA
          </a>
          <span className="text-gray-600">|</span>
          <a href="/about" className="text-gray-300 hover:text-white">
            About Us
          </a>
          <span className="text-gray-600">|</span>
          <a href="/contact" className="text-gray-300 hover:text-white">
            Contact Us
          </a>
          <span className="text-gray-600">|</span>
          <a href="/sitemap" className="text-gray-300 hover:text-white">
            Sitemap
          </a>
        </div>
      </div>
    </footer>
  );
}
