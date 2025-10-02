'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import providersData from '@/search/mocks/providers.json';

interface Provider {
  id: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
  isAvailable?: boolean;
  services?: Array<{
    name: string;
    description: string;
    basePrice: number;
    duration: number;
  }>;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  isVerified?: boolean;
  certifications?: string[];
  experience?: string;
}

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find provider by ID
    const foundProvider = providersData.find(p => p.id === params.id);
    setProvider(foundProvider || null);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h2>
        <p className="text-gray-600 mb-6">The provider you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/search')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>

          {/* Provider Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-3xl">
                    {provider.firstName?.[0]}{provider.lastName?.[0]}
                  </span>
                </div>
                
                {/* Basic Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {provider.businessName || `${provider.firstName} ${provider.lastName}`}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3">
                    Professional Service Provider
                  </p>
                  <div className="flex items-center space-x-4">
                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                      <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xl font-bold text-gray-900">
                        {provider.rating?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="text-gray-500">
                        ({provider.reviewCount || 0} reviews)
                      </span>
                    </div>
                    
                    {/* Availability */}
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${provider.isAvailable ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className="text-gray-700 font-medium">
                        {provider.isAvailable ? 'Available Now' : 'Currently Busy'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                Book Now
              </button>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">contact@example.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700">
                  {provider.address?.city}, {provider.address?.state} {provider.address?.zipCode}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">
                  {provider.description || 'No description available.'}
                </p>
              </div>

              {/* Experience & Certifications */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Experience & Credentials</h2>
                <div className="space-y-4">
                  {provider.experience && (
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <h3 className="font-semibold text-gray-900">Experience</h3>
                        <p className="text-gray-700">{provider.experience}</p>
                      </div>
                    </div>
                  )}
                  
                  {provider.certifications && provider.certifications.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Certifications</h3>
                        <ul className="space-y-1">
                          {provider.certifications.map((cert, index) => (
                            <li key={index} className="text-gray-700 flex items-center">
                              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Services Offered */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
                <div className="space-y-4">
                  {provider.services && provider.services.length > 0 ? (
                    provider.services.map((service, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
                          <span className="text-xl font-bold text-blue-600">${service.basePrice}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service.duration} minutes
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No services listed.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Hourly Rate</h3>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    ${provider.hourlyRate || 'N/A'}
                    <span className="text-lg text-gray-500">/hr</span>
                  </div>
                  <p className="text-sm text-gray-600">Starting rate</p>
                </div>
              </div>

              {/* Verification Badge */}
              {provider.isVerified && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-green-900">Verified Provider</h4>
                      <p className="text-sm text-green-700">Background checked</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Send Message
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
