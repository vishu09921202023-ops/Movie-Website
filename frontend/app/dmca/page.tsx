export default function DMCA() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in-up">
      <h1 className="text-3xl lg:text-4xl font-black mb-8">
        <span className="gradient-text">DMCA</span>
      </h1>
      <div className="glass rounded-2xl border border-white/5 p-6 lg:p-8 space-y-5 text-gray-300 leading-relaxed">
        <p>
          VN Movies HD respects the intellectual property rights of others. If you believe that your copyrighted work has been posted on this website without authorization, you may submit a DMCA takedown notice to us.
        </p>
        <h2 className="text-xl font-bold text-white">How to Report Copyright Infringement</h2>
        <p>To file a DMCA takedown notice, please provide the following:</p>
        <ul className="space-y-2 ml-1">
          {['Your name and contact information', 'The copyrighted work being infringed', 'The location of the infringing material', 'A statement that you believe the use is unauthorized', 'A statement that the information in the notice is accurate', 'Your physical or electronic signature'].map((item) => (
            <li key={item} className="flex items-start gap-2"><span className="text-red-500 mt-1">&#9656;</span>{item}</li>
          ))}
        </ul>
        <p>
          Please send your DMCA notice to our email address (available on the Contact Us page). We will promptly investigate and remove any infringing content.
        </p>
        <p className="text-amber-400/80 text-sm">
          Note: False DMCA notices may result in legal action against you. Ensure your claim is valid before submitting.
        </p>
      </div>
    </div>
  );
}
