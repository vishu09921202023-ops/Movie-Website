export default function Sitemap() {
  const currentYear = new Date().getFullYear();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vegamovies.com';

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
    <div>
      <h1 className="text-4xl font-bold mb-6">Sitemap</h1>
      <div className="bg-gray-900 p-6 rounded-lg">
        <p className="text-gray-300 mb-4">
          Below is a list of all pages on the Vegamovies website. This sitemap helps search engines index our content.
        </p>
        <ul className="space-y-2 text-blue-400">
          {urls.map((url) => (
            <li key={url}>
              <a href={url} className="hover:underline">
                {url === '/' ? 'Home' : url}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
