'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BookingModal from '@/components/booking/BookingModal';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import Footer from '@/components/layout/Footer';
import { useChat } from '@/contexts/ChatContext';
import { homepageApi } from '@/api/homepage';
import { extractProviderIdFromSlug } from '@/lib/slug';
import type { ProviderDetail, ProviderService } from '@/types/homepage';

function ProviderPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { conversations, openConversation } = useChat();
  
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [backUrl, setBackUrl] = useState('/');

  const slug = params.slug as string;
  const searchedService = searchParams.get('service');
  const searchedCategory = searchParams.get('category');
  const searchedLocation = searchParams.get('location');

  // Debug logging
  console.log('Provider Page Debug:', {
    searchedService,
    searchedCategory,
    searchedLocation,
    slug
  });

  // Extract provider ID from slug for conversation check
  const providerId = extractProviderIdFromSlug(slug);
  const existingConversation = conversations.find(
    conv => conv.providerId === providerId?.toString()
  );

  // Fetch provider data
  useEffect(() => {
    async function fetchProvider() {
      if (!slug) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await homepageApi.getProviderBySlug(slug);
        setProvider(data);
      } catch (err) {
        console.error('Error fetching provider:', err);
        setError(err instanceof Error ? err.message : 'Failed to load provider');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProvider();
  }, [slug]);

  // Build back URL with search parameters
  useEffect(() => {
    const service = searchParams.get('service');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    
    if (service || category || location) {
      const params = new URLSearchParams();
      if (service) params.set('service', service);
      if (category) params.set('category', category);
      if (location) params.set('location', location);
      setBackUrl(`/?${params.toString()}`);
    }
  }, [searchParams]);

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

    // If conversation exists, open it; otherwise show booking modal
    if (existingConversation) {
      openConversation(existingConversation.id);
    } else {
      setShowBookingModal(true);
    }
  };

  // Separate active and inactive services
  const activeServices = provider?.services.filter(s => s.isActive !== false) || [];
  const inactiveServices = provider?.services.filter(s => s.isActive === false) || [];
  
  // Find the searched service - prioritize exact name match over category match
  const searchedServiceObj = activeServices.find(s => s.name === searchedService) ||
    activeServices.find(s => s.category === searchedCategory);

  // Check if searched service is inactive
  const isSearchedServiceInactive = searchedService && 
    inactiveServices.some(s => s.name === searchedService);

  // Sort services to show searched service first
  const sortedServices = [...activeServices].sort((a, b) => {
    // First priority: exact service name match
    const aIsExactMatch = a.name === searchedService;
    const bIsExactMatch = b.name === searchedService;
    
    if (aIsExactMatch && !bIsExactMatch) return -1;
    if (bIsExactMatch && !aIsExactMatch) return 1;
    
    // Second priority: category match (only if no exact name match)
    if (!searchedService || (a.name !== searchedService && b.name !== searchedService)) {
      const aIsCategoryMatch = a.category === searchedCategory;
      const bIsCategoryMatch = b.category === searchedCategory;
      
      if (aIsCategoryMatch && !bIsCategoryMatch) return -1;
      if (bIsCategoryMatch && !aIsCategoryMatch) return 1;
    }
    
    // Keep original order for everything else
    return 0;
  });

  // Debug logging for services
  console.log('Services Debug:', {
    activeServices: activeServices.map(s => ({ name: s.name, category: s.category })),
    sortedServices: sortedServices.map(s => ({ name: s.name, category: s.category })),
    searchedService,
    searchedCategory,
    searchedServiceObj: searchedServiceObj ? { name: searchedServiceObj.name, category: searchedServiceObj.category } : null
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AuthenticatedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mb-4"></div>
            <p className="text-gray-600">Loading provider details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error or not found state
  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AuthenticatedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The provider you are looking for does not exist.'}</p>
            <Link href="/" className="text-navy-600 hover:text-navy-700 font-semibold">
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if provider has no active services
  const hasNoActiveServices = activeServices.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <AuthenticatedHeader />
      
      {/* Provider Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push(backUrl)}
            className="flex items-center text-navy-600 hover:text-navy-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {searchedService && searchedLocation 
              ? `Back to ${searchedService} results in ${searchedLocation}`
              : 'Back to Results'
            }
          </button>

          {/* Inactive Service Warning */}
          {isSearchedServiceInactive && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Service Currently Unavailable</h3>
                  <p className="text-sm text-yellow-800">
                    The service &quot;{searchedService}&quot; is currently inactive. Please check other available services below or contact the provider directly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Active Services Warning */}
          {hasNoActiveServices && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1">Provider Currently Unavailable</h3>
                  <p className="text-sm text-orange-800">
                    This provider is not currently accepting bookings. Please check back later or browse other providers.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-navy-500 to-navy-700 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {provider.ownerName.split(' ').map(n => n[0]).join('')}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {provider.businessName}
              </h1>
              {searchedServiceObj && (
                <p className="text-lg text-gray-600 mb-3">{searchedServiceObj.category}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold text-gray-900">{provider.rating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">({provider.totalJobs} reviews)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{provider.experience} years experience</span>
                </div>
                {provider.address && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {provider.address.city}, {provider.address.state}
                      {provider.address.zipCode ? `, ${provider.address.zipCode}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Book Now / Open Chat Button */}
            {!hasNoActiveServices && (
              <button
                onClick={handleBookNowClick}
                className={`${
                  existingConversation 
                    ? 'bg-blue-800 hover:bg-blue-900' 
                    : 'bg-navy-600 hover:bg-navy-700'
                } text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg flex items-center gap-2`}
              >
                {existingConversation ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Open Chat
                  </>
                ) : (
                  'Book Now'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex-1">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Services Offered
              </h2>
              
              {sortedServices.length > 0 ? (
                <div className="space-y-4">
                  {sortedServices.map((service, index) => {
                    const isExactMatch = service.name === searchedService;
                    const isCategoryMatch = service.category === searchedCategory && !searchedService;
                    const isSearched = isExactMatch || isCategoryMatch;
                    
                    return (
                      <div 
                        key={service.id} 
                        className={`border-b border-gray-200 pb-4 last:border-b-0 ${
                          isSearched ? 'bg-blue-50 -mx-6 px-6 py-4 rounded-lg' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                              {isSearched && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                  {isExactMatch ? 'You searched for this' : 'Related to your search'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{service.category}</p>
                          </div>
                          {provider.priceRange && (
                            <span className="text-navy-600 font-semibold">
                              ${provider.priceRange.min} - ${provider.priceRange.max}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No services currently available</p>
              )}
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
                {provider.priceRange && (
                  <div>
                    <p className="text-sm text-gray-500">Price Range</p>
                    <p className="text-lg font-semibold text-navy-600">
                      ${provider.priceRange.min} - ${provider.priceRange.max}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className="text-lg font-semibold">
                    {provider.isAvailable && !hasNoActiveServices ? (
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
            {!hasNoActiveServices && (
              <div className="bg-navy-50 border-2 border-navy-200 rounded-lg p-6 text-center">
                <h3 className="font-bold text-navy-900 mb-2">
                  {existingConversation ? 'Continue your conversation' : 'Ready to get started?'}
                </h3>
                <p className="text-sm text-navy-700 mb-4">
                  {existingConversation 
                    ? `Continue chatting with ${provider.ownerName.split(' ')[0]}`
                    : `Book a service and chat with ${provider.ownerName.split(' ')[0]} directly`
                  }
                </p>
                <button
                  onClick={handleBookNowClick}
                  className={`w-full ${
                    existingConversation 
                      ? 'bg-blue-800 hover:bg-blue-900' 
                      : 'bg-navy-600 hover:bg-navy-700'
                  } text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2`}
                >
                  {existingConversation ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Open Chat
                    </>
                  ) : (
                    'Book Now'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Booking Modal */}
      {provider && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          providerId={provider.id.toString()}
          providerName={provider.businessName || provider.ownerName}
          serviceType={searchedServiceObj?.name || activeServices[0]?.name || 'General Service'}
        />
      )}

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
                href={`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`}
                className="block w-full bg-navy-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-navy-700 transition-colors text-center"
              >
                Log In
              </Link>
              
              <Link
                href="/register"
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

export default function ProviderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AuthenticatedHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ProviderPageContent />
    </Suspense>
  );
}

