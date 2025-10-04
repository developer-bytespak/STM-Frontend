'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BookingModal from '@/components/booking/BookingModal';
import { dummyProviders } from '@/app/customer/data/dummyProviders';
import { useAuth } from '@/hooks/useAuth';

export default function ProviderProfile() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Find provider by ID
  const provider = dummyProviders.find(p => p.id === params.id);

  const handleBookNowClick = () => {
    // Check if user is authenticated and is a customer
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (user?.role !== 'customer') {
      alert('Only customers can book services. Please sign up as a customer.');
      return;
    }

    setShowBookingModal(true);
  };

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
          <Link href="/" className="text-navy-600 hover:text-navy-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-navy-600 hover:text-navy-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Results
          </button>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-navy-500 to-navy-700 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {provider.firstName[0]}{provider.lastName[0]}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {provider.businessName}
              </h1>
              <p className="text-lg text-gray-600 mb-3">{provider.businessType}</p>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold text-gray-900">{provider.rating}</span>
                  <span className="text-gray-500 ml-1">({provider.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{provider.experience}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{provider.address?.city}, {provider.address?.state}</span>
                </div>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              onClick={handleBookNowClick}
              className="bg-navy-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-navy-700 transition-colors text-lg"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{provider.description}</p>
            </div>

            {/* Services */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Services Offered</h2>
              <div className="space-y-4">
                {provider.services.map(service => (
                  <div key={service.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                      <span className="text-navy-600 font-semibold">${service.basePrice}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Duration: ~{service.duration} minutes
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {provider.certifications && provider.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.certifications.map((cert, idx) => (
                    <span key={idx} className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Hourly Rate</p>
                  <p className="text-lg font-semibold text-navy-600">${provider.hourlyRate}/hr</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className="text-lg font-semibold">
                    {provider.isAvailable ? (
                      <span className="text-green-600">Available Now</span>
                    ) : (
                      <span className="text-red-600">Currently Unavailable</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            {provider.workingHours && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Working Hours</h3>
                <div className="space-y-2">
                  {Object.entries(provider.workingHours).map(([day, schedule]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-600">{day}</span>
                      <span className="text-gray-900">
                        {schedule.isWorking 
                          ? `${schedule.startTime} - ${schedule.endTime}`
                          : 'Closed'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact CTA */}
            <div className="bg-navy-50 border-2 border-navy-200 rounded-lg p-6 text-center">
              <h3 className="font-bold text-navy-900 mb-2">Ready to get started?</h3>
              <p className="text-sm text-navy-700 mb-4">
                Book a service and chat with {provider.firstName} directly
              </p>
              <button
                onClick={handleBookNowClick}
                className="w-full bg-navy-600 text-white py-3 rounded-lg font-semibold hover:bg-navy-700 transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        providerId={provider.id}
        providerName={provider.businessName || `${provider.firstName} ${provider.lastName}`}
        serviceType={provider.businessType || 'General Service'}
      />

      {/* Authentication Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-600">
                Please log in or sign up as a customer to book this service and start chatting with the provider.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full bg-navy-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-navy-700 transition-colors text-center"
              >
                Log In
              </Link>
              
              <Link
                href="/customer/signup"
                className="block w-full bg-white border-2 border-navy-600 text-navy-600 py-3 px-4 rounded-lg font-semibold hover:bg-navy-50 transition-colors text-center"
              >
                Sign Up as Customer
              </Link>

              <button
                onClick={() => setShowAuthPrompt(false)}
                className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
