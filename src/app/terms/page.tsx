'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center mb-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
            <p className="mt-2 text-gray-600">Last updated: January 2025</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using ConnectAgain, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do 
              not use this service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">Permission is granted to temporarily download one copy of ConnectAgain for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Service Description</h2>
            <p className="text-gray-700 mb-6">
              ConnectAgain is a platform that connects customers with service providers. We facilitate 
              the booking and management of various home and business services. We do not provide the 
              services directly but act as an intermediary between customers and service providers.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Accounts</h2>
            <p className="text-gray-700 mb-4">When you create an account with us, you must provide information that is:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Accurate, complete, and current at all times</li>
              <li>Not misleading or fraudulent</li>
              <li>In compliance with all applicable laws</li>
            </ul>
            <p className="text-gray-700 mb-6">
              You are responsible for safeguarding the password and for all activities that occur under 
              your account. You must notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Service Provider Obligations</h2>
            <p className="text-gray-700 mb-4">Service providers using our platform agree to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Provide accurate information about their services and qualifications</li>
              <li>Maintain appropriate licenses and insurance</li>
              <li>Deliver services as described and agreed upon</li>
              <li>Treat customers with respect and professionalism</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Customer Obligations</h2>
            <p className="text-gray-700 mb-4">Customers using our platform agree to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Provide accurate information about service requirements</li>
              <li>Pay for services as agreed upon</li>
              <li>Treat service providers with respect</li>
              <li>Provide access to service locations as needed</li>
              <li>Communicate clearly about expectations and requirements</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payment Terms</h2>
            <p className="text-gray-700 mb-6">
              Payment for services is processed through our secure payment system. Service providers 
              receive payment after successful completion of services, minus applicable platform fees. 
              All prices are subject to change without notice.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cancellation and Refunds</h2>
            <p className="text-gray-700 mb-6">
              Cancellation policies vary by service type and provider. Refunds are processed according 
              to our refund policy and are subject to approval. We reserve the right to modify our 
              cancellation and refund policies at any time.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">You may not use our service:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              In no event shall ConnectAgain, nor its directors, employees, partners, agents, suppliers, 
              or affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
              damages, including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses, resulting from your use of the service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimer</h2>
            <p className="text-gray-700 mb-6">
              The information on this website is provided on an &quot;as is&quot; basis. To the fullest extent 
              permitted by law, this Company excludes all representations, warranties, conditions and 
              terms relating to our website and the use of this website.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These terms and conditions are governed by and construed in accordance with the laws of 
              the United States and you irrevocably submit to the exclusive jurisdiction of the courts 
              in that state or location.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will try to provide at least 30 days notice prior to any new 
              terms taking effect.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms & Conditions, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@ConnectAgain.com<br />
                <strong>Phone:</strong> 1-800-SERVICE-1<br />
                <strong>Address:</strong> 123 Service Street, Tech City, TC 12345
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
