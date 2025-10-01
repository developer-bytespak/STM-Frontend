'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  onSearch?: (searchData: SearchData) => void;
}

interface SearchData {
  service: string;
  location: string;
  radius: number;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const router = useRouter();
  const [searchData, setSearchData] = useState<SearchData>({
    service: '',
    location: '',
    radius: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call the onSearch callback if provided
    if (onSearch) {
      onSearch(searchData);
    } else {
      // Default behavior: navigate to search providers with query params
      const params = new URLSearchParams({
        service: searchData.service,
        location: searchData.location,
        radius: searchData.radius.toString()
      });
      router.push(`/customer/search-providers?${params.toString()}`);
    }
  };

  const handleInputChange = (field: keyof SearchData, value: string | number) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const popularServices = [
    'Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Painting', 
    'Carpentry', 'Landscaping', 'Moving', 'Pet Care', 'Tutoring'
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Find the Perfect Service Provider
          </h2>
          <p className="text-gray-600">
            Discover skilled professionals in your area
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Input */}
          <div className="relative">
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
              What service do you need?
            </label>
            <div className="relative">
              <input
                type="text"
                id="service"
                value={searchData.service}
                onChange={(e) => handleInputChange('service', e.target.value)}
                placeholder="e.g., Plumbing, Electrical, Cleaning..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Popular Services Tags */}
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Popular services:</p>
              <div className="flex flex-wrap gap-2">
                {popularServices.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleInputChange('service', service)}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-full hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors shadow-sm"
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Input */}
            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location / ZIP Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  value={searchData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter city, ZIP code, or address"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Radius Selector */}
            <div>
              <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius
              </label>
              <div className="relative">
                <select
                  id="radius"
                  value={searchData.radius}
                  onChange={(e) => handleInputChange('radius', parseInt(e.target.value))}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value={5}>5 miles</option>
                  <option value={10}>10 miles</option>
                  <option value={15}>15 miles</option>
                  <option value={25}>25 miles</option>
                  <option value={50}>50 miles</option>
                  <option value={100}>100+ miles</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search Providers</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
