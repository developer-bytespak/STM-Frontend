'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ServiceSearch from './ServiceSearch';
import CitySearch from './CitySearch';
import ResultsDisplay from './ResultsDisplay';
import { homepageApi } from '@/api/homepage';
import type { HomepageProvider } from '@/types/homepage';
import { useAlert } from '@/hooks/useAlert';

type SearchStep = 'service' | 'location' | 'results';

interface HierarchicalSearchProps {
  onClear: () => void;
}

export default function HierarchicalSearch({ onClear }: HierarchicalSearchProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  
  const [currentStep, setCurrentStep] = useState<SearchStep>('service');
  const [selectedService, setSelectedService] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [providers, setProviders] = useState<HomepageProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSelectedGranular = selectedService.length > 0;
  
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Restore state from URL on mount
  useEffect(() => {
    if (!isInitialized) {
      const service = searchParams.get('service');
      const category = searchParams.get('category');
      const location = searchParams.get('location');
      
      if (service && location) {
        setSelectedService(service);
        setSelectedCategory(category || '');
        setSelectedLocation(location);
        setCurrentStep('results');
        searchProviders(service, location);
      } else if (service) {
        setSelectedService(service);
        setSelectedCategory(category || '');
        setCurrentStep('location');
      } else {
        // If no service, make sure location is also cleared
        setSelectedLocation('');
        setCurrentStep('service');
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized, searchParams]);

  // Clear location when service is cleared
  useEffect(() => {
    if (!selectedService && selectedLocation) {
      setSelectedLocation('');
      setCurrentStep('service');
    }
  }, [selectedService, selectedLocation]);

  // Update URL when search state changes
  const updateURL = (service?: string, category?: string, location?: string) => {
    const params = new URLSearchParams();
    if (service) params.set('service', service);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    
    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    router.replace(newUrl, { scroll: false });
  };

  // Handle service selection
  const handleServiceSelect = (service: string, category?: string) => {
    setSelectedService(service);
    setSelectedCategory(category || '');
    setCurrentStep('location');
    updateURL(service, category || '', '');
  };

  // Handle location selection
  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setCurrentStep('results');
    updateURL(selectedService, selectedCategory, location);
    searchProviders(selectedService, location);
  };

  // Search for providers
  const searchProviders = async (service: string, location: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract ZIP code from location string (e.g., "97302" or "97302 - Salem, OR" -> "97302")
      const zipMatch = location.match(/^\d+/);
      const zipCode = zipMatch ? zipMatch[0] : location;
      
      // Call API
      const result = await homepageApi.searchProviders({
        service,
        zipcode: zipCode,
      });
      
      setProviders(result.providers);
    } catch (error) {
      console.error('Error searching providers:', error);
      setError(error instanceof Error ? error.message : 'Failed to search providers');
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
    setSelectedLocation(''); // Clear location when service is cleared
    setProviders([]);
    setError(null);
    router.replace('/', { scroll: false });
    onClear();
  };

  // Handle clear location only
  const handleClearLocation = () => {
    setSelectedLocation('');
    if (currentStep === 'results') {
      setCurrentStep('location');
      setProviders([]);
    }
    updateURL(selectedService, selectedCategory, '');
  };

  // Handle get estimate
  const handleGetEstimate = () => {
    showAlert({
      title: 'Coming Soon',
      message: 'Automated quote generation is currently under development. This feature will be available soon!',
      type: 'info'
    });
  };

  // Handle call now - Now handled directly by ProviderCard component
  const handleCallNow = () => {
    // Voice calling is now handled directly by the VoiceCallModal in ProviderCard
    // No need to show "Coming Soon" alert anymore
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
      <div ref={searchRef} className="relative bg-gradient-to-r from-navy-600 via-navy-700 to-navy-800 overflow-visible min-h-[600px] sm:min-h-[700px] md:min-h-[800px] flex items-center lg:items-start lg:pt-24">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight px-2">
              Find the right <span className="italic">service</span>
              <br className="hidden xs:block" />
              <span className="xs:hidden"> </span>
              professional, right away
            </h1>
          </div>

          {/* Search Bars */}
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4 sm:space-y-6">
              {/* Service Search */}
              <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100">
                <ServiceSearch
                  onServiceSelect={handleServiceSelect}
                  onClear={handleClearAll}
                  selectedService={selectedService}
                  selectedCategory={selectedCategory}
                />
              </div>

              {/* Location Search - Always visible but disabled until granular chosen */}
              <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100 animate-fade-in">
                <CitySearch
                  onLocationSelect={handleLocationSelect}
                  onClear={handleClearLocation}
                  selectedLocation={selectedLocation}
                  disabled={!hasSelectedGranular}
                />
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
          ) : error ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={handleClearAll}
                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Start New Search
                  </button>
                </div>
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
      
      {/* Alert Modal */}
      <AlertComponent />
    </div>
  );
}
