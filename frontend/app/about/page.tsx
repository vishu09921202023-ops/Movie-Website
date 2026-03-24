export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in-up">
      <h1 className="text-3xl lg:text-4xl font-black mb-8">
        About <span className="gradient-text">VN Movies HD</span>
      </h1>
      <div className="glass rounded-2xl border border-white/5 p-6 lg:p-8 space-y-6 text-gray-300 leading-relaxed">
        <p>
          VN Movies HD is a premier movie website dedicated to providing users with access to the latest Bollywood, Hollywood, and international films in various quality formats.
        </p>
        <h2 className="text-xl font-bold text-white">Our Mission</h2>
        <p>
          Our mission is to deliver the best movie-watching experience with high-quality content and a user-friendly interface. We strive to keep our users updated with the latest releases across multiple genres and platforms.
        </p>
        <h2 className="text-xl font-bold text-white">What We Offer</h2>
        <ul className="space-y-2 ml-1">
          {['Latest Bollywood and Hollywood movies', 'Anime and K-Drama series', 'Multiple quality options (480p, 720p, 1080p, 4K)', 'Trending and featured content', 'Curated collections and categories'].map((item) => (
            <li key={item} className="flex items-start gap-2"><span className="text-red-500 mt-1">&#9656;</span>{item}</li>
          ))}
        </ul>
        <h2 className="text-xl font-bold text-white">Disclaimer</h2>
        <p>
          We are an index site and do not host any content. All movies and shows are sourced from third-party providers. We do not produce, distribute, or own any of the content on our platform. Please support legal and official sources whenever possible.
        </p>
      </div>
    </div>
  );
}
