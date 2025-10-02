'use client';

import { useState, useEffect, useRef } from 'react';
import ProviderCard from '@/search/components/ProviderCard';
import providersData from '@/search/mocks/providers.json';
import servicesData from '@/search/mocks/services.json';

interface Service {
  category: string;
  subcategories: string[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredServices, setFilteredServices] = useState<string[]>([]);
  const [providers, setProviders] = useState<Array<typeof providersData[0]>>([]);
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
    
    setFilteredServices(matches.slice(0, 10));
    setShowSuggestions(matches.length > 0);
  };

  // Handle service selection
  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setSearchQuery(service);
    setShowSuggestions(false);
    
    // Filter providers based on selected service and location
    filterProviders(service, location);
  };

  // Filter providers based on service and location
  const filterProviders = (service: string, locationQuery: string) => {
    let filtered = providersData;

    // Filter by service
    if (service) {
      filtered = filtered.filter(provider =>
        provider.services?.some(s => 
          s.name.toLowerCase().includes(service.toLowerCase())
        ) ||
        provider.businessName?.toLowerCase().includes(service.toLowerCase()) ||
        provider.description?.toLowerCase().includes(service.toLowerCase())
      );
    }

    // Filter by location (zipcode or city)
    if (locationQuery.trim()) {
      filtered = filtered.filter(provider =>
        provider.address?.city?.toLowerCase().includes(locationQuery.toLowerCase()) ||
        provider.address?.zipCode?.includes(locationQuery.trim())
      );
    }
    
    setProviders(filtered);
  };

  // Handle location change
  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (selectedService) {
      filterProviders(selectedService, value);
    }
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find the Perfect Service Provider
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with trusted professionals in your area. From home repairs to business services, 
            we&apos;ve got you covered with quality-assured providers.
          </p>
        </div>

        {/* Search Bar with Typeahead */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
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
                placeholder="Type to search services (e.g., Plumber, Photographer, Tutor)"
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

            {/* Location Filter */}
            <div className="mt-6">
              <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Location (City or ZIP Code)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location-filter"
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  placeholder="Enter city or ZIP code (e.g., New York, 10001)"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Popular Services Quick Select */}
            <div className="mt-6">
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

        {/* Provider Results (Inline on Home Page) */}
        {selectedService && (
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Providers for &quot;{selectedService}&quot;
                {location && <span className="text-blue-600"> in {location}</span>}
              </h2>
              <p className="text-gray-600">
                Found {providers.length} {providers.length === 1 ? 'provider' : 'providers'}
                {location && ' in your area'}
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
                    We couldn&apos;t find any providers for &quot;{selectedService}&quot;
                    {location && ` in ${location}`}. 
                    {location ? ' Try a different location or service.' : ' Try searching for a different service.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Section - Show when no search results */}
        {!selectedService && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">10,000+</h3>
              <p className="text-gray-600">Verified Service Providers</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">50,000+</h3>
              <p className="text-gray-600">Completed Projects</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">4.9/5</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        )}
      </div>

      {/* Featured Services */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Services
            </h2>
            <p className="text-lg text-gray-600">
              Discover the most requested services in your area
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Plumbing', icon: '🔧', color: 'bg-blue-100 text-blue-600' },
              { name: 'Electrical', icon: '⚡', color: 'bg-yellow-100 text-yellow-600' },
              { name: 'HVAC', icon: '❄️', color: 'bg-cyan-100 text-cyan-600' },
              { name: 'Cleaning', icon: '🧹', color: 'bg-green-100 text-green-600' },
              { name: 'Painting', icon: '🎨', color: 'bg-purple-100 text-purple-600' },
              { name: 'Landscaping', icon: '🌱', color: 'bg-emerald-100 text-emerald-600' },
            ].map((service) => (
              <div
                key={service.name}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="text-center">
                  <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mx-auto mb-3 text-2xl`}>
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}