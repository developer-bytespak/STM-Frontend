'use client';

import { useState, useEffect, useRef } from 'react';
import HeroSection from './HeroSection';
import SearchSection from './SearchSection';
import ProviderResults from './ProviderResults';
import StatsSection from './StatsSection';
import FeaturedServices from './FeaturedServices';
import providersData from '@/search/mocks/providers.json';
import servicesData from '@/search/mocks/services.json';

interface Service {
  category: string;
  subcategories: string[];
}

export default function HomePage() {
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
        <HeroSection />

        <SearchSection
          searchQuery={searchQuery}
          location={location}
          showSuggestions={showSuggestions}
          filteredServices={filteredServices}
          highlightedIndex={highlightedIndex}
          onSearchChange={handleSearchChange}
          onLocationChange={handleLocationChange}
          onServiceSelect={handleServiceSelect}
          onKeyDown={handleKeyDown}
          searchInputRef={searchInputRef}
          suggestionsRef={suggestionsRef}
        />

        <ProviderResults
          selectedService={selectedService}
          location={location}
          providers={providers}
        />

        {!selectedService && <StatsSection />}
      </div>

      <FeaturedServices />
    </div>
  );
}

