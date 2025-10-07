'use client';

import React from 'react';

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
  };
  hourlyRate?: number;
}

interface ResultsDisplayProps {
  service: string;
  category?: string;
  location: string;
  providers: Provider[];
  onClear: () => void;
  onGetEstimate: () => void;
  onCallNow: () => void;
}

export default function ResultsDisplay({
  service,
  location,
  providers,
  onClear,
  onGetEstimate,
  onCallNow
}: ResultsDisplayProps) {
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

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 animate-fade-in">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Great News! We have vetted service providers in your area.
            </h3>
            <p className="text-green-700">
              By taking action below, you are guaranteed to get a reasonable offer or talk to a pro within 1 hour.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in">
        <button
          onClick={onGetEstimate}
          className="flex-1 bg-navy-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-navy-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Get Automated Estimate
        </button>
        
        <button
          onClick={onCallNow}
          className="flex-1 bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Person Now - 962-745-353
        </button>
      </div>

      {/* Provider Cards */}
      {providers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider, index) => (
            <div
              key={provider.id}
              className="bg-white rounded-lg border border-gray-200 hover:border-navy-500 hover:shadow-lg transition-all overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6">
                {/* Provider Header */}
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-navy-500 to-navy-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {provider.firstName[0]}{provider.lastName[0]}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {provider.businessName || `${provider.firstName} ${provider.lastName}`}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{provider.businessType || 'Service Provider'}</p>
                  </div>
                </div>
                
                {/* Rating and Experience */}
                <div className="flex items-center justify-between mb-3 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-gray-900">{provider.rating || 'N/A'}</span>
                    <span className="text-gray-500 ml-1">({provider.reviewCount || 0} Reviews)</span>
                  </div>
                  <div className="text-gray-600">
                    {provider.experience || 'Experienced'}
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {provider.description || 'Professional service provider with quality workmanship.'}
                </p>

                {/* Additional Info */}
                <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{provider.address?.zipCode}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Google Rating {provider.rating || 'N/A'} ({provider.reviewCount || 0} Reviews)</span>
                  </div>
                </div>

                {/* Video Play Button */}
                <div className="flex items-center justify-center mb-4">
                  <button className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Call Button */}
                <button
                  onClick={onCallNow}
                  className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Person Now - 962-745-353
                </button>
              </div>
            </div>
          ))}
        </div>
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
