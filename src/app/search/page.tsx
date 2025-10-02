'use client';

import { useState, useEffect, useRef } from 'react';
import ProviderCard from '@/search/components/ProviderCard';
import providersData from '@/search/mocks/providers.json';
import servicesData from '@/search/mocks/services.json';

interface Service {
  category: string;
  subcategories: string[];
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredServices, setFilteredServices] = useState<string[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Flatten services list for search
  const allServices = servicesData.flatMap((service: Service) => [
    service.category,
    ...service.subcategories
  ]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setHighlightedIndex(-1);
    
    if (value.trim().length === 0) {
      setFilteredServices([]);
      setShowSuggestions(false);
      return;
    }

    // Filter services that match the query
    const matches = allServices.filter(service =>
      service.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredServices(matches.slice(0, 10)); // Limit to 10 suggestions
    setShowSuggestions(matches.length > 0);
  };

  // Handle service selection
  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setSearchQuery(service);
    setShowSuggestions(false);
    
    // Filter providers based on selected service
    const filtered = providersData.filter(provider =>
      provider.services?.some(s => 
        s.name.toLowerCase().includes(service.toLowerCase())
      ) ||
      provider.businessName?.toLowerCase().includes(service.toLowerCase()) ||
      provider.description?.toLowerCase().includes(service.toLowerCase())
    );
    
    setProviders(filtered);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredServices.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredServices.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredServices.length) {
          handleServiceSelect(filteredServices[highlightedIndex]);
        } else if (filteredServices.length > 0) {
          handleServiceSelect(filteredServices[0]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Service Providers
          </h1>
          <p className="text-gray-600">
            Search for professionals and services in your area
          </p>
        </div>

        {/* Search Bar with Typeahead */}
        <div className="mb-8 relative">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label htmlFor="service-search" className="block text-sm font-medium text-gray-700 mb-2">
              What service do you need?
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                id="service-search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (filteredServices.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Type to search services (e.g., Plumber, Photographer, Tutor...)"
                className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-lg"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Typeahead Suggestions Dropdown */}
              {showSuggestions && filteredServices.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto"
                >
                  {filteredServices.map((service, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleServiceSelect(service)}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                        index === highlightedIndex ? 'bg-blue-50' : ''
                      } ${
                        index === 0 ? 'rounded-t-xl' : ''
                      } ${
                        index === filteredServices.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-gray-900 font-medium">{service}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Popular Services Quick Select */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Popular services:</p>
              <div className="flex flex-wrap gap-2">
                {['Plumber', 'Electrician', 'HVAC', 'Interior Cleaning / Janitorial', 'Photographer', 'Tutor / Coach', 'Handyman', 'Carpenter'].map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleServiceSelect(service)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-full hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors"
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Provider Results (Inline) */}
        {selectedService && (
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Providers for "{selectedService}"
              </h2>
              <p className="text-gray-600">
                Found {providers.length} {providers.length === 1 ? 'provider' : 'providers'}
              </p>
            </div>

            {providers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No providers found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    We couldn't find any providers for "{selectedService}". Try searching for a different service.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State - No Search Yet */}
        {!selectedService && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Start Your Search</h3>
              <p className="mt-2 text-sm text-gray-500">
                Type in the search bar above or click on a popular service to find providers
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
