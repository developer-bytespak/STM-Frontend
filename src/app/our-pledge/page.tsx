'use client';

import Link from 'next/link';

export default function OurPledgePage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Our Pledge</h1>
            <p className="mt-2 text-gray-600">Our commitment to excellence and trust</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-navy-600 to-blue-700 rounded-xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">ConnectAgain Pledge</h2>
          <p className="text-lg opacity-90">
            We are committed to creating a trusted platform that connects customers with exceptional 
            service providers, fostering a community built on quality, reliability, and mutual respect.
          </p>
        </div>

        {/* Customer Pledge */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Our Pledge to Customers</h2>
          </div>
          
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-gray-700">
                We vet every service provider to ensure they meet our high standards of quality, 
                professionalism, and reliability. Every provider is background-checked and verified.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-700">
                No hidden fees, no surprise charges. You&apos;ll see the exact cost upfront, including 
                all taxes and platform fees, so you can make informed decisions.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Support</h3>
              <p className="text-gray-700">
                Our dedicated support team is here to help 24/7. Whether you need assistance with 
                booking, have questions about a service, or need to resolve an issue, we&apos;re just a click away.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Satisfaction Guarantee</h3>
              <p className="text-gray-700">
                If you&apos;re not completely satisfied with a service, we&apos;ll work with you to make it right. 
                Your satisfaction is our top priority, and we stand behind every service booked through our platform.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-gray-700">
                Your personal information and payment details are protected with bank-level security. 
                We use industry-standard encryption and never share your data without your consent.
              </p>
            </div>
          </div>
        </div>

        {/* Service Provider Pledge */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Our Pledge to Service Providers</h2>
          </div>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fair Opportunities</h3>
              <p className="text-gray-700">
                We provide equal opportunities for all qualified service providers. Our platform 
                connects you with customers who need your services, helping you grow your business.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Payments</h3>
              <p className="text-gray-700">
                Get paid quickly and fairly. We process payments within 24-48 hours of job completion, 
                with clear breakdowns of all fees and deductions.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Support</h3>
              <p className="text-gray-700">
                Our provider support team helps you succeed. From profile optimization to dispute 
                resolution, we&apos;re here to support your business growth.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing & Visibility</h3>
              <p className="text-gray-700">
                We promote your services through our marketing channels and help you build a strong 
                reputation through our review and rating system.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
              <p className="text-gray-700">
                You control your schedule. Accept jobs that fit your availability, set your own rates, 
                and manage your business the way that works best for you.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Continuous Improvement</h3>
              <p className="text-gray-700">
                We regularly update our platform based on your feedback. Your success is our success, 
                and we&apos;re committed to making our platform better for all service providers.
              </p>
            </div>
          </div>
        </div>

        {/* Community Pledge */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Our Community Pledge</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Building Trust</h3>
              <p className="text-gray-700">
                We foster a community where trust is built through transparency, quality service delivery, 
                and mutual respect between all members.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Continuous Innovation</h3>
              <p className="text-gray-700">
                We continuously improve our platform based on feedback from our community, ensuring 
                we meet the evolving needs of customers and service providers.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Social Responsibility</h3>
              <p className="text-gray-700">
                We are committed to supporting local businesses and contributing positively to the 
                communities we serve.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Accessibility</h3>
              <p className="text-gray-700">
                We strive to make our platform accessible to everyone, regardless of background, 
                ensuring equal opportunities for all.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions About Our Pledge?</h2>
          <p className="text-gray-700 mb-6">
            We&apos;re here to answer any questions you may have about our commitments and how we uphold them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-navy-600 text-white px-6 py-3 rounded-lg hover:bg-navy-700 transition-colors font-medium"
            >
              Contact Us
            </Link>
            <Link
              href="/"
              className="border border-navy-600 text-navy-600 px-6 py-3 rounded-lg hover:bg-navy-50 transition-colors font-medium"
            >
              Explore Services
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
