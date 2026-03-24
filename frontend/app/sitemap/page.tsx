export default function Sitemap() {
  const currentYear = new Date().getFullYear();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vnmovieshd.com';

  const urls = [
    '/',
    '/browse',
    '/anime',
    '/kdrama',
    '/trending',
    '/search',
    '/disclaimer',
    '/dmca',
    '/about',
    '/contact',
    '/ott/netflix',
    '/ott/amazon',
    '/ott/apple',
    '/ott/hotstar',
    '/ott/disney',
    '/genre/action',
    '/genre/comedy',
    '/genre/drama',
    '/year/2024',
    '/year/2023',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${url === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '/' ? '1.0' : '0.8'}</priority>
  </url>
  `
    )
    .join('')}
</urlset>`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in-up">
      <h1 className="text-3xl lg:text-4xl font-black mb-8"><span className="gradient-text">Sitemap</span></h1>
      <div className="glass rounded-2xl border border-white/5 p-6 lg:p-8">
        <p className="text-gray-400 mb-5">All pages on VN Movies HD. Helps search engines index our content.</p>
        <ul className="space-y-2">
          {urls.map((url) => (
            <li key={url}>
              <a href={url} className="text-red-400 hover:text-red-300 text-sm transition-colors">
                {url === '/' ? 'Home' : url}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
