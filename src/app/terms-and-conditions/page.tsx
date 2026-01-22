export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-600 to-navy-700 rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Terms and Conditions</h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-navy-900 border-b-2 border-navy-100 pb-2">1. Service Agreement</h2>
            <p className="leading-relaxed text-gray-700">
              By submitting a quote request through ServiceProStars, you agree to engage with service 
              providers through our platform. This platform facilitates connections between customers 
              and qualified service providers for various home and professional services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-navy-900 border-b-2 border-navy-100 pb-2">2. Quote Requests</h2>
            <p className="leading-relaxed text-gray-700 mb-3">
              Quote requests submitted through our platform are non-binding inquiries. Service providers 
              will review your request and provide pricing estimates based on the information you provide.
            </p>
            <p className="leading-relaxed text-gray-700">
              Final pricing may vary based on actual service requirements, site visits, and additional 
              factors discovered during consultation with the provider. You are under no obligation to 
              accept any quote provided.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-navy-900 border-b-2 border-navy-100 pb-2">3. User Responsibilities</h2>
            <p className="leading-relaxed text-gray-700 mb-3">
              You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide accurate and complete information in your quote requests</li>
              <li>Communicate in good faith with service providers</li>
              <li>Upload only relevant images related to your service request</li>
              <li>Respect the intellectual property rights of service providers</li>
              <li>Maintain appropriate and professional communication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-navy-900 border-b-2 border-navy-100 pb-2">4. Image Uploads</h2>
            <p className="leading-relaxed text-gray-700 mb-3">
              When uploading images to support your quote request:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Images must be relevant to the service you are requesting</li>
              <li>You retain ownership of uploaded images but grant ServiceProStars and connected providers 
                  a license to view and use them for quote preparation purposes</li>
              <li>Do not upload images containing personal information, inappropriate content, or copyrighted 
                  material you don&apos;t have rights to use</li>
              <li>Maximum file size is 5MB per image</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-navy-900 border-b-2 border-navy-100 pb-2">5. Privacy and Data</h2>
            <p className="leading-relaxed text-gray-700">
              Your information, including contact details and uploaded images, will be shared with relevant 
              service providers to facilitate quote delivery and service coordination. We are committed to 
              protecting your privacy and use your data only for these purposes. For more information, 
              please review our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-navy-900 border-b-2 border-navy-100 pb-2">6. Service Provider Relationship</h2>
            <p className="leading-relaxed text-gray-700">
              ServiceProStars acts as a platform connecting customers with independent service providers. 
              Service providers are independent contractors and not employees or agents of ServiceProStars. 
              All service agreements, pricing, and work performance are between you and the service provider directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-navy-900 border-b-2 border-navy-100 pb-2">7. Payment and Pricing</h2>
            <p className="leading-relaxed text-gray-700">
              All payments are processed directly between you and the service provider unless otherwise specified. 
              The budget you provide in your quote request is an estimate and does not constitute a binding price. 
              Final pricing will be agreed upon between you and the service provider.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-navy-900 border-b-2 border-navy-100 pb-2">8. Limitation of Liability</h2>
            <p className="leading-relaxed text-gray-700 mb-3">
              ServiceProStars provides a platform for connecting customers with service providers but is not 
              liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>The quality, safety, or legality of services provided</li>
              <li>The accuracy of quotes or service provider information</li>
              <li>Any damages, injuries, or losses arising from services rendered</li>
              <li>Disputes between customers and service providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-navy-900 border-b-2 border-navy-100 pb-2">9. Modifications</h2>
            <p className="leading-relaxed text-gray-700">
              ServiceProStars reserves the right to modify these terms at any time. Continued use of the 
              platform after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-navy-900 border-b-2 border-navy-100 pb-2">10. Contact</h2>
            <p className="leading-relaxed text-gray-700">
              For questions about these terms or our services, please contact us through our support channels.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block text-navy-600 hover:text-navy-700 font-semibold transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
