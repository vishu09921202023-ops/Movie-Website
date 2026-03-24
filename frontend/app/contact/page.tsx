export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in-up">
      <h1 className="text-3xl lg:text-4xl font-black mb-8">
        Contact <span className="gradient-text">Us</span>
      </h1>
      <div className="glass rounded-2xl border border-white/5 p-6 lg:p-8 space-y-6 text-gray-300 leading-relaxed">
        <p>
          Have questions, suggestions, or need to report copyright issues? We&apos;d love to hear from you!
        </p>
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-3">
          <h2 className="text-lg font-bold text-white">Contact Information</h2>
          <p><span className="text-gray-500">Email:</span> <span className="text-white">contact@vnmovieshd.com</span></p>
          <p><span className="text-gray-500">DMCA Notices:</span> <span className="text-white">dmca@vnmovieshd.com</span></p>
          <p><span className="text-gray-500">Telegram:</span> <span className="text-white">@vnmovieshd</span></p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-2">Response Time</h2>
          <p>We aim to respond to all inquiries within 48 hours. For DMCA notices, we will review and take appropriate action as per the Digital Millennium Copyright Act.</p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-2">Feedback &amp; Suggestions</h2>
          <p>We value your feedback and suggestions to improve our service. Feel free to reach out with any ideas or comments you may have.</p>
        </div>
      </div>
    </div>
  );
}
