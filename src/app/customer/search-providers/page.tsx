'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import ProviderCard from '../components/ProviderCard';
import ProviderCardMinimal from '../components/ProviderCardMinimal';
import { dummyProviders, filterProvidersByZip, filterProvidersByService } from '../data/dummyProviders';
import { Provider } from '@/types/provider';

interface FilterChip {
  type: 'service' | 'location' | 'radius';
  label: string;
  value: string;
  editable?: boolean;
}

function SearchProvidersContent() {
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dummy data
    setProviders(dummyProviders);
    
    // Get search parameters from URL
    const service = searchParams.get('service') || '';
    const location = searchParams.get('location') || '';
    const radius = searchParams.get('radius') || '10';

    // Create filter chips
    const newFilters: FilterChip[] = [];
    if (service) {
      newFilters.push({ type: 'service', label: 'Service', value: service, editable: true });
    }
    if (location) {
      newFilters.push({ type: 'location', label: 'Location', value: location, editable: true });
    }
    if (radius) {
      newFilters.push({ type: 'radius', label: 'Radius', value: `${radius} miles`, editable: true });
    }
    setFilters(newFilters);

    // Filter providers based on search criteria
    let filtered = dummyProviders;
    
    if (location) {
      // Filter by ZIP code
      filtered = filterProvidersByZip(filtered, location);
    }
    
    if (service) {
      // Filter by service type
      filtered = filterProvidersByService(filtered, service);
    }

    setFilteredProviders(filtered);
    setLoading(false);
  }, [searchParams]);

  const handleFilterEdit = (type: FilterChip['type']) => {
    // For now, just show an alert. In a real app, this would open a modal or inline editor
    alert(`Edit ${type} filter - This would open an edit dialog`);
  };

  const handleFilterRemove = (type: FilterChip['type']) => {
    const newFilters = filters.filter(filter => filter.type !== type);
    setFilters(newFilters);
    
    // Re-filter providers without this filter
    let filtered = dummyProviders;
    
    newFilters.forEach(filter => {
      if (filter.type === 'location') {
        filtered = filterProvidersByZip(filtered, filter.value);
      } else if (filter.type === 'service') {
        filtered = filterProvidersByService(filtered, filter.value);
      }
    });
    
    setFilteredProviders(filtered);
  };

  const handleNewSearch = (searchData: { service: string; location: string; radius: number }) => {
    // Update URL with new search parameters
    const params = new URLSearchParams({
      service: searchData.service,
      location: searchData.location,
      radius: searchData.radius.toString()
    });
    window.history.pushState({}, '', `?${params.toString()}`);
    
    // Reload the page to trigger the useEffect
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Service Providers
        </h1>
        <p className="text-gray-600">
          {filteredProviders.length} providers found
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={handleNewSearch} />

      {/* Filter Chips */}
      {filters.length > 0 && (
        <FilterChips
          filters={filters}
          onEdit={handleFilterEdit}
          onRemove={handleFilterRemove}
        />
      )}

      {/* Results */}
      <div className="space-y-4">
        {filteredProviders.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Available Providers
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Sort by: 
                </span>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>Rating</option>
                  <option>Price</option>
                  <option>Distance</option>
                  <option>Availability</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredProviders.map((provider) => (
                <ProviderCardMinimal key={provider.id} provider={provider} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or expanding your search radius.
            </p>
            <button
              onClick={() => handleNewSearch({ service: '', location: '', radius: 25 })}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchProviders() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchProvidersContent />
    </Suspense>
  );
}