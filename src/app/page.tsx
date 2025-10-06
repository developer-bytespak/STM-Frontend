'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { dummyProviders, filterProvidersByService, filterProvidersByZip } from './customer/data/dummyProviders';
import { Provider } from '@/types/provider';
import { SERVICE_CATEGORIES } from '@/constants/services';

export default function Home() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [baseProviders, setBaseProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterZip, setFilterZip] = useState('');
  const [filterMinRating, setFilterMinRating] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement | null>(null);
  const filtersButtonRef = useRef<HTMLButtonElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showFilters) return;
      const target = event.target as Node;
      if (filtersRef.current && filtersRef.current.contains(target)) return;
      if (filtersButtonRef.current && filtersButtonRef.current.contains(target)) return;
      setShowFilters(false);
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowFilters(false);
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showFilters]);

  useEffect(() => {
    if (hasSearched) {
      // Scroll to results smoothly with offset for fixed header
      if (resultsRef.current) {
        const headerEl = document.querySelector('header') as HTMLElement | null;
        const headerHeight = headerEl?.offsetHeight ?? 80; // fallback offset
        const rect = resultsRef.current.getBoundingClientRect();
        const offset = 24; // small gap below header (tuned to avoid blue peeking)
        const targetY = rect.top + window.scrollY - headerHeight - offset; // align with slight margin
        window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
      }
    }
  }, [hasSearched]);

  const scrollToResults = () => {
    if (!resultsRef.current) return;
    const headerEl = document.querySelector('header') as HTMLElement | null;
    const headerHeight = headerEl?.offsetHeight ?? 80;
    const rect = resultsRef.current.getBoundingClientRect();
    const offset = 24; // small gap below header (tuned to avoid blue peeking)
    const targetY = rect.top + window.scrollY - headerHeight - offset;
    window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
  };

  const scrollToSearch = () => {
    if (!searchRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const headerEl = document.querySelector('header') as HTMLElement | null;
    const headerHeight = headerEl?.offsetHeight ?? 80;
    const rect = searchRef.current.getBoundingClientRect();
    const targetY = rect.top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
  };
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const userRole = isAuthenticated && user?.role ? user.role : undefined;
  // Handle both user.name and user.firstName + user.lastName formats
  const userName = isAuthenticated && user 
    ? (user.name || `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim())
    : undefined;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setHasSearched(true);
    setShowDropdown(false);
    const results = filterProvidersByService(dummyProviders, searchQuery.trim());
    setBaseProviders(results);
    setFilterZip('');
    setFilterMinRating('');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setFilteredProviders(results);
    // Ensure scroll always happens after search
    setTimeout(scrollToResults, 0);
  };

  const handleServiceClick = (serviceName: string) => {
    setSearchQuery(serviceName);
    setHasSearched(true);
    setShowDropdown(false);
    const filtered = filterProvidersByService(dummyProviders, serviceName);
    setBaseProviders(filtered);
    setFilterZip('');
    setFilterMinRating('');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setFilteredProviders(filtered);
    setTimeout(scrollToResults, 0);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(value.trim().length > 0);
    setHasSearched(false);
  };

  const handleSuggestionClick = (serviceName: string) => {
    setSearchQuery(serviceName);
    setShowDropdown(false);
    setHasSearched(true);
    const filtered = filterProvidersByService(dummyProviders, serviceName);
    setFilteredProviders(filtered);
    setTimeout(scrollToResults, 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilterZip('');
    setFilterMinRating('');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setHasSearched(false);
    setBaseProviders([]);
    setFilteredProviders([]);
    setShowDropdown(false);
    setShowFilters(false);
    setTimeout(scrollToSearch, 0);
  };

  const applyFilters = () => {
    let results = baseProviders;
    if (filterZip.trim()) {
      results = filterProvidersByZip(results, filterZip.trim());
    }
    if (filterMinRating.trim()) {
      const minRating = parseFloat(filterMinRating);
      if (!Number.isNaN(minRating)) {
        results = results.filter((p) => (p.rating ?? 0) >= minRating);
      }
    }
    if (filterPriceMin.trim()) {
      const minPrice = parseFloat(filterPriceMin);
      if (!Number.isNaN(minPrice)) {
        results = results.filter((p) => (p.hourlyRate ?? 0) >= minPrice);
      }
    }
    if (filterPriceMax.trim()) {
      const maxPrice = parseFloat(filterPriceMax);
      if (!Number.isNaN(maxPrice)) {
        results = results.filter((p) => (p.hourlyRate ?? 0) <= maxPrice);
      }
    }
    setFilteredProviders(results);
  };

  const clearFilters = () => {
    setFilterZip('');
    setFilterMinRating('');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setFilteredProviders(baseProviders);
  };

  // Popular service suggestions - actual services available on the platform
  const allServices = [
    { name: 'Plumbing', id: 'suggestion-plumbing' },
    { name: 'Electrical', id: 'suggestion-electrical' },
    { name: 'HVAC', id: 'suggestion-hvac' },
    { name: 'Cleaning', id: 'suggestion-cleaning' },
    { name: 'Painting', id: 'suggestion-painting' },
    { name: 'Carpentry', id: 'suggestion-carpentry' },
    { name: 'Handyman', id: 'suggestion-handyman' },
    { name: 'Landscaping', id: 'suggestion-landscaping' }
  ];

  // Filter services based on search query
  const filteredSuggestions = searchQuery.trim()
    ? allServices.filter(service => 
        service.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      )
    : allServices;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header 
        userRole={userRole} 
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Hero Section with Search */}
      <div ref={searchRef} className="relative bg-gradient-to-r from-navy-600 via-navy-700 to-navy-800 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Find the right <span className="italic">service</span>
              <br />
              professional, right away
            </h1>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-stretch bg-white rounded-lg shadow-2xl overflow-hidden">
                <div className="relative flex-1">
                  <svg 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for any service..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 text-lg text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#1e40af] text-white px-10 py-4 font-semibold hover:bg-[#1e3a8a] transition-colors flex items-center gap-2"
                  style={{ backgroundColor: '#1e40af' }}
                >
                  Search
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                  {filteredSuggestions.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleSuggestionClick(service.name)}
                      className="w-full text-left px-6 py-3 hover:bg-gray-100 transition-colors text-gray-900 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>{service.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Service Suggestions Pills - Always visible */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {allServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceClick(service.name)}
                    className="px-4 py-2 rounded-full border-2 border-white text-white text-sm font-medium hover:bg-white hover:text-navy-600 transition-all"
                  >
                    {service.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Section */}
      {hasSearched && (
        <div ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            {/* Search Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                  {searchQuery && (
                    <div className="flex items-center gap-2 bg-navy-50 text-navy-700 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium">&quot;{searchQuery}&quot;</span>
                      <button 
                        onClick={clearSearch} 
                        className="hover:bg-navy-100 rounded-full p-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative flex items-center gap-3">
                  <button
                    ref={filtersButtonRef}
                    onClick={() => setShowFilters((v) => !v)}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {showFilters ? 'Hide filters' : 'Filters'}
                  </button>
                  {showFilters && (
                    <div
                      ref={filtersRef}
                      className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-20"
                      style={{ width: '48rem', maxWidth: '90vw' }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-1">Zip code</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="e.g. 75001"
                            value={filterZip}
                            onChange={(e) => setFilterZip(e.target.value.replace(/\\D/g, '').slice(0, 10))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Min rating</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            placeholder="e.g. 4.5"
                            value={filterMinRating}
                            onChange={(e) => setFilterMinRating(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Min hourly ($)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 50"
                            value={filterPriceMin}
                            onChange={(e) => setFilterPriceMin(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Max hourly ($)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 120"
                            value={filterPriceMax}
                            onChange={(e) => setFilterPriceMax(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex gap-3 justify-end">
                        <button onClick={clearFilters} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700">Clear filters</button>
                        <button onClick={applyFilters} className="px-4 py-2 rounded-md bg-navy-600 text-white hover:bg-navy-700">Apply filters</button>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={clearSearch}
                    className="text-sm text-navy-600 hover:text-navy-700 font-medium underline"
                  >
                    Clear search
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-2">
                {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Provider Cards */}
            {filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="block bg-white rounded-lg border border-gray-200 hover:border-navy-500 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/customer/providers/${provider.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/customer/providers/${provider.id}`);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Provider Card */}
                    <div className="p-6">
                      {/* Avatar */}
                      <div className="flex items-center mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-navy-500 to-navy-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {provider.firstName[0]}{provider.lastName[0]}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                            {provider.businessName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">{provider.businessType}</p>
                        </div>
                      </div>
                      
                      {/* Rating and Zip */}
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-semibold text-gray-900">{provider.rating}</span>
                          <span className="text-gray-500 ml-1">({provider.reviewCount})</span>
                        </div>
                        {provider.address?.zipCode && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{provider.address.zipCode}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {provider.description}
                      </p>

                      {/* Experience Badge */}
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-navy-50 text-navy-700 text-xs font-medium mb-4">
                        {provider.experience}
                      </div>

                      {/* Visit Profile Button */}
                      <Link
                        href={`/customer/providers/${provider.id}`}
                        className="block w-full text-center bg-navy-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-navy-700 transition-colors"
                      >
                        Visit Profile
                      </Link>
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
                  onClick={clearSearch}
                  className="bg-navy-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-700 transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                  <span className="text-navy-600 font-bold text-sm">STM</span>
                </div>
                <h3 className="text-xl font-bold">ServiceProStars</h3>
              </div>
              <p className="text-gray-300">
                Connecting customers with trusted service providers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/customer/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Find Providers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Providers</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/serviceprovider/signup" className="hover:text-white transition-colors">Join as Provider</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/provider/dashboard" className="hover:text-white transition-colors">Provider Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-navy-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 ServiceProStars. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}