export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p>
          Have questions, suggestions, or need to report copyright issues? We'd love to hear from you! Please use the information below to get in touch.
        </p>
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
          <p><strong>Email:</strong> contact@vegamovies.com</p>
          <p><strong>DMCA Notices:</strong> dmca@vegamovies.com</p>
          <p><strong>Telegram:</strong> @vegamovies</p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Response Time</h2>
          <p>
            We aim to respond to all inquiries within 48 hours. For DMCA notices, we will review and take appropriate action as per the Digital Millennium Copyright Act.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Feedback & Suggestions</h2>
          <p>
            We value your feedback and suggestions to improve our service. Feel free to reach out with any ideas or comments you may have.
          </p>
        </div>
      </div>
    </div>
  );
}
