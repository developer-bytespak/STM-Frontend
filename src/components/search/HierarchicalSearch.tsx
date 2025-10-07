'use client';

import React, { useState, useRef, useEffect } from 'react';
import ServiceSearch from './ServiceSearch';
import CitySearch from './CitySearch';
import ResultsDisplay from './ResultsDisplay';
import { dummyProviders, filterProvidersByService, filterProvidersByZip } from '../../app/customer/data/dummyProviders';
import { Provider } from '@/types/provider';

type SearchStep = 'service' | 'location' | 'results';

interface HierarchicalSearchProps {
  onClear: () => void;
}

export default function HierarchicalSearch({ onClear }: HierarchicalSearchProps) {
  const [currentStep, setCurrentStep] = useState<SearchStep>('service');
  const [selectedService, setSelectedService] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasSelectedGranular = selectedService.length > 0;
  
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle service selection
  const handleServiceSelect = (service: string, category?: string) => {
    setSelectedService(service);
    setSelectedCategory(category || '');
    setCurrentStep('location');
  };

  // Handle location selection
  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setCurrentStep('results');
    searchProviders(selectedService, location);
  };

  // Search for providers
  const searchProviders = async (service: string, location: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter providers by service
      let filteredProviders = filterProvidersByService(dummyProviders, service);
      
      // Extract ZIP code from location string (e.g., "97302 - Salem, OR" -> "97302")
      const zipMatch = location.match(/^\d+/);
      if (zipMatch) {
        const zipCode = zipMatch[0];
        filteredProviders = filterProvidersByZip(filteredProviders, zipCode);
      }
      
      setProviders(filteredProviders);
    } catch (error) {
      console.error('Error searching providers:', error);
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clear all (from service search or results)
  const handleClearAll = () => {
    setCurrentStep('service');
    setSelectedService('');
    setSelectedCategory('');
    setSelectedLocation('');
    setProviders([]);
    onClear();
  };

  // Handle clear location only
  const handleClearLocation = () => {
    setSelectedLocation('');
    if (currentStep === 'results') {
      setCurrentStep('location');
      setProviders([]);
    }
  };

  // Handle get estimate
  const handleGetEstimate = () => {
    // In a real app, this would trigger an estimate request
    console.log('Getting estimate for:', selectedService, selectedLocation);
    alert('Estimate request submitted! You will receive a response within 1 hour.');
  };

  // Handle call now
  const handleCallNow = () => {
    // In a real app, this would initiate a call or show contact info
    console.log('Calling provider for:', selectedService, selectedLocation);
    alert('Calling 962-745-353...');
  };

  // Scroll to results when they appear
  useEffect(() => {
    if (currentStep === 'results' && resultsRef.current) {
      const headerEl = document.querySelector('header') as HTMLElement | null;
      const headerHeight = headerEl?.offsetHeight ?? 80;
      const rect = resultsRef.current.getBoundingClientRect();
      const offset = 24;
      const targetY = rect.top + window.scrollY - headerHeight - offset;
      window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
    }
  }, [currentStep]);

  return (
    <div className="w-full">
      {/* Search Section */}
      <div ref={searchRef} className="relative bg-gradient-to-r from-navy-600 via-navy-700 to-navy-800 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Find the right <span className="italic">service</span>
              <br />
              professional, right away
            </h1>
          </div>

          {/* Search Bars */}
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {/* Service Search */}
              <div className="bg-white rounded-lg shadow-2xl p-6 border border-gray-100">
                <ServiceSearch
                  onServiceSelect={handleServiceSelect}
                  onClear={handleClearAll}
                  selectedService={selectedService}
                  selectedCategory={selectedCategory}
                />
              </div>

              {/* Location Search - Always visible but disabled until granular chosen */}
              <div className="bg-white rounded-lg shadow-2xl p-6 border border-gray-100 animate-fade-in">
                <CitySearch
                  onLocationSelect={handleLocationSelect}
                  onClear={handleClearLocation}
                  selectedLocation={selectedLocation}
                  disabled={!hasSelectedGranular}
                />
                {!hasSelectedGranular && (
                  <p className="mt-2 text-xs text-gray-500">Select a specific service above to enable location.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section - only after location selected */}
      {currentStep === 'results' && (
        <div ref={resultsRef}>
          {isLoading ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mb-4"></div>
                <p className="text-gray-600">Searching for providers...</p>
              </div>
            </div>
          ) : (
            <ResultsDisplay
              service={selectedService}
              category={selectedCategory}
              location={selectedLocation}
              providers={providers}
              onClear={handleClearAll}
              onGetEstimate={handleGetEstimate}
              onCallNow={handleCallNow}
            />
          )}
        </div>
      )}
    </div>
  );
}
