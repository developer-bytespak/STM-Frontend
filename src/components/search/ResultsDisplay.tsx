'use client';

import React from 'react';
import ProviderCard from '@/components/cards/ProviderCard';
import type { HomepageProvider } from '@/types/homepage';

interface ResultsDisplayProps {
  service: string;
  category?: string;
  location: string;
  providers: HomepageProvider[];
  image?: string;
  onClear: () => void;
  onGetEstimate: () => void;
  onCallNow: () => void;
}

// Transform HomepageProvider to ProviderCard format
function transformProviderForCard(provider: HomepageProvider, searchedService?: string) {
  // Extract city and state from location string (e.g., "Dallas, TX" -> {city: "Dallas", state: "TX"})
  const locationParts = provider.location.split(',').map(s => s.trim());
  const city = locationParts[0] || '';
  const state = locationParts[1] || '';
  
  // Split ownerName into first and last name
  const nameParts = provider.ownerName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  // Get the first service area as ZIP code
  const zipCode = provider.serviceAreas[0] || '';
  
  // Find the service that matches what user searched for
  const searchedServiceObj = provider.services.find(s => s.name === searchedService);
  
  // Use searched service name if found, otherwise fall back to first service's category
  // If no services available, use 'Service Provider' as fallback
  const displayService = searchedServiceObj?.name || 
    provider.services[0]?.category || 
    'Service Provider';
  
  return {
    id: provider.id.toString(),
    slug: provider.slug,  // Pass slug from HomepageProvider
    businessName: provider.businessName,
    businessType: displayService, // Show searched service name instead of category
    firstName,
    lastName,
    rating: provider.rating,
    reviewCount: provider.totalJobs, // Using totalJobs as reviewCount for now
    description: provider.description,
    experience: `${provider.experience} years`, // Convert number to string with "years"
    address: {
      zipCode,
      city,
      state,
    },
    hourlyRate: provider.priceRange.min, // Using min price as hourly rate
  };
}

export default function ResultsDisplay({
  service,
  category,
  location,
  providers,
  onClear,
  onGetEstimate,
  onCallNow
}: ResultsDisplayProps) {
  // Build search params string for provider links
  const searchParamsString = React.useMemo(() => {
    const params = new URLSearchParams();
    if (service) params.set('service', service);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    return params.toString();
  }, [service, category, location]);

  // Transform providers for ProviderCard
  const transformedProviders = React.useMemo(() => {
    return providers.map(provider => transformProviderForCard(provider, service));
  }, [providers, service]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
      {/* Search Summary with Clear Option */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Search Results</h2>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-navy-50 text-navy-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full w-fit">
              <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">&ldquo;{service}&rdquo;</span>
              <span className="text-xs sm:text-sm text-gray-500">in</span>
              <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">&ldquo;{location}&rdquo;</span>
            </div>
          </div>
          {/* Clear Search Button - Only shown after both service and location are selected */}
          <button
            onClick={onClear}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-black text-white text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors w-full sm:w-auto cursor-pointer"
          >
            Clear Search
          </button>
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          {providers.length} provider{providers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Provider Cards */}
      {providers.length > 0 ? (
        <>
          {/* Success Message - Before Cards */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-green-800 mb-1">
                  Great News! We have vetted service providers in your area.
                </h3>
                <p className="text-xs sm:text-sm text-green-700">
                  By taking action on any provider card below, you are guaranteed to get a reasonable offer or talk to a pro within 1 hour.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            {transformedProviders.map((provider, index) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onCallNow={onCallNow}
                onGetEstimate={onGetEstimate}
                index={index}
                searchParams={searchParamsString}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 md:p-16 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No providers found</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
            We couldn&apos;t find any providers matching your search. Try different keywords or browse our popular services.
          </p>
          <button
            onClick={onClear}
            className="bg-navy-600 text-white px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-navy-700 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
