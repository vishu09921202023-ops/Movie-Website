export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">About Vegamovies</h1>
      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p>
          Vegamovies is a premier movie website dedicated to providing users with access to the latest Bollywood, Hollywood, and international films in various quality formats.
        </p>
        <h2 className="text-2xl font-bold text-white">Our Mission</h2>
        <p>
          Our mission is to deliver the best movie-watching experience with high-quality content and user-friendly interface. We strive to keep our users updated with the latest releases across multiple genres
          and platforms.
        </p>
        <h2 className="text-2xl font-bold text-white">What We Offer</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Latest Bollywood and Hollywood movies</li>
          <li>Anime and K-Drama series</li>
          <li>Multiple quality options (480p, 720p, 1080p, 4K)</li>
          <li>Trending and featured content</li>
          <li>Curated collections and categories</li>
        </ul>
        <h2 className="text-2xl font-bold text-white">Disclaimer</h2>
        <p>
          We are an index site and do not host any content. All movies and shows are sourced from third-party providers. We do not produce, distribute, or own any of the content on our platform. Please support
          legal and official sources whenever possible.
        </p>
      </div>
    </div>
  );
}
