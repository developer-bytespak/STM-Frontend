'use client';

import React from 'react';
import ProviderCard from '@/components/cards/ProviderCard';

interface Provider {
  id: string;
  businessName?: string;
  businessType?: string;
  firstName: string;
  lastName: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  experience?: string;
  address?: {
    zipCode: string;
    city: string;
    state: string;
  };
  hourlyRate?: number;
}

interface ResultsDisplayProps {
  service: string;
  category?: string;
  location: string;
  providers: Provider[];
  image?: string;
  onClear: () => void;
  onGetEstimate: () => void;
  onCallNow: () => void;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      {/* Search Summary with Clear Option */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
            <div className="flex items-center gap-2 bg-navy-50 text-navy-700 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">&ldquo;{service}&rdquo;</span>
              <span className="text-sm text-gray-500">in</span>
              <span className="text-sm font-medium">&ldquo;{location}&rdquo;</span>
            </div>
          </div>
          {/* Clear Search Button - Only shown after both service and location are selected */}
          <button
            onClick={onClear}
            className="inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Clear Search
          </button>
        </div>
        <p className="text-gray-600">
          {providers.length} provider{providers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Provider Cards */}
      {providers.length > 0 ? (
        <>
          <div className="flex flex-col gap-4 mb-6">
            {providers.map((provider, index) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onCallNow={onCallNow}
                index={index}
                searchParams={searchParamsString}
              />
            ))}
          </div>

          {/* Success Message - After Cards */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-green-800 mb-1">
                  Great News! We have vetted service providers in your area.
                </h3>
                <p className="text-sm text-green-700">
                  By taking action below, you are guaranteed to get a reasonable offer or talk to a pro within 1 hour.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action Buttons - After Cards */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
            <button
              onClick={onGetEstimate}
              className="flex-1 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Get Automated Estimate
            </button>
            
            <button
              onClick={onCallNow}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Person Now - 962-745-353
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No providers found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We couldn&apos;t find any providers matching your search. Try different keywords or browse our popular services.
          </p>
          <button
            onClick={onClear}
            className="bg-navy-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-700 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
