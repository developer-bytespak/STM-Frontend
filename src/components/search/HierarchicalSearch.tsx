'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ServiceSearch from './ServiceSearch';
import CitySearch from './CitySearch';
import ResultsDisplay from './ResultsDisplay';
import SmartSearchForm, { type SmartSearchFormValues, type SmartSearchInitialValues } from './SmartSearchForm';
import { homepageApi } from '@/api/homepage';
import { generateProviderSlug } from '@/lib/slug';
import type { HomepageProvider } from '@/types/homepage';
import { useAlert } from '@/hooks/useAlert';

/** Smart Search API provider shape */
interface SmartProvider {
  id: number;
  businessName: string;
  ownerName: string;
  rating: number;
  totalJobs: number;
  minPrice: number;
  maxPrice: number;
  serviceAreas: string[];
}

/** Context for Smart Search used to build display and profile links */
interface SmartSearchContext {
  serviceId: number;
  serviceName: string;
  zipcode: string;
  budget: number;
  projectSizeSqft?: number;
}

type SearchStep = 'service' | 'location' | 'results';
type SmartSearchMode = null | 'form' | 'results';

interface HierarchicalSearchProps {
  onClear: () => void;
}

/** Transform Smart Search API providers to HomepageProvider for same design as normal flow */
function smartProvidersToHomepage(
  smartProviders: SmartProvider[],
  context: SmartSearchContext
): HomepageProvider[] {
  return smartProviders.map((p) => ({
    id: p.id,
    businessName: p.businessName,
    slug: generateProviderSlug(p.businessName, p.id),
    ownerName: p.ownerName,
    rating: p.rating,
    totalJobs: p.totalJobs,
    experience: 0,
    description: '',
    location: p.serviceAreas[0] || context.zipcode,
    phoneNumber: '',
    priceRange: { min: p.minPrice, max: p.maxPrice },
    services: [{ id: context.serviceId, name: context.serviceName, category: '' }],
    serviceAreas: p.serviceAreas,
    logoUrl: undefined,
    bannerUrl: undefined,
  }));
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

  // Smart Search state
  const [smartSearchMode, setSmartSearchMode] = useState<SmartSearchMode>(null);
  const [smartProviders, setSmartProviders] = useState<SmartProvider[]>([]);
  const [smartTotalMatches, setSmartTotalMatches] = useState(0);
  const [smartServiceName, setSmartServiceName] = useState('');
  const [smartContext, setSmartContext] = useState<SmartSearchContext | null>(null);
  const [smartLoading, setSmartLoading] = useState(false);
  const [smartError, setSmartError] = useState<string | null>(null);
  /** Persist Smart Search form so it stays when coming back from results or after reload */
  const [smartFormInitial, setSmartFormInitial] = useState<SmartSearchInitialValues | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const smartResultsRef = useRef<HTMLDivElement>(null);

  // Restore state from URL on mount (normal search + Smart Search)
  useEffect(() => {
    if (!isInitialized) {
      const smart = searchParams.get('smart');
      if (smart === '1') {
        const service = searchParams.get('service');
        const location = searchParams.get('location');
        const budgetParam = searchParams.get('budget');
        const projectParam = searchParams.get('projectSize');
        const category = searchParams.get('category');
        setSmartSearchMode('form');
        if (service || location || budgetParam || projectParam) {
          setSmartFormInitial({
            selectedService: service || '',
            selectedCategory: category || '',
            selectedLocation: location || '',
            budget: budgetParam || '',
            projectSizeSqft: projectParam || '',
          });
        }
      } else {
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
          setSelectedLocation('');
          setCurrentStep('service');
        }
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

  // Smart Search: submit form (persist form values so they stay when coming back from results / reload)
  const handleSmartSearchSubmit = async (values: SmartSearchFormValues) => {
    if (values.serviceId === '') return;
    setSmartLoading(true);
    setSmartError(null);
    setSmartProviders([]);
    try {
      const serviceId = values.serviceId as number;
      const budget = parseFloat(values.budget);
      const projectSizeSqft = values.projectSizeSqft.trim() ? parseFloat(values.projectSizeSqft) : undefined;
      const res = await homepageApi.getSmartProviders({
        serviceId,
        zipcode: values.zipcode.trim(),
        budget,
        projectSizeSqft,
      });
      const serviceName = values.serviceName?.trim() || '';
      setSmartServiceName(serviceName);
      setSmartContext({
        serviceId,
        serviceName,
        zipcode: values.zipcode.trim(),
        budget,
        projectSizeSqft,
      });
      setSmartProviders(res.providers);
      setSmartTotalMatches(res.totalMatches);
      setSmartSearchMode('results');
      // Persist form values so when user clicks "Clear Search" or reloads, form stays filled (same as normal flow)
      setSmartFormInitial({
        selectedService: serviceName,
        selectedCategory: values.category ?? '',
        selectedLocation: values.locationDisplay ?? values.zipcode,
        budget: values.budget,
        projectSizeSqft: values.projectSizeSqft,
      });
      // Update URL so reload keeps Smart Search state
      const params = new URLSearchParams();
      params.set('smart', '1');
      params.set('service', serviceName);
      params.set('location', values.locationDisplay ?? values.zipcode);
      params.set('budget', values.budget);
      if (values.projectSizeSqft.trim()) params.set('projectSize', values.projectSizeSqft);
      if (values.category) params.set('category', values.category);
      router.replace(`/?${params.toString()}`, { scroll: false });
      if (smartResultsRef.current) {
        smartResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Smart search error:', err);
      setSmartError(err instanceof Error ? err.message : 'Failed to find providers');
      setSmartProviders([]);
    } finally {
      setSmartLoading(false);
    }
  };

  // Smart Search results as HomepageProvider[] (used when showing results and when form is open with previous results)
  const smartResultsAsHomepage = useMemo(() => {
    if (!smartContext || smartProviders.length === 0) return [];
    return smartProvidersToHomepage(smartProviders, smartContext);
  }, [smartContext, smartProviders]);

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

          {/* Search Bars or Smart Search Form */}
          <div className="max-w-3xl mx-auto">
            {smartSearchMode === 'form' ? (
              <SmartSearchForm
                onSubmit={handleSmartSearchSubmit}
                onBack={() => {
                  setSmartSearchMode(null);
                  router.replace('/', { scroll: false });
                }}
                isSubmitting={smartLoading}
                initialValues={smartFormInitial ?? undefined}
              />
            ) : (
              <>
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
                {/* Smart Search entry */}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSmartSearchMode('form');
                      // Pre-fill form from current normal search if we don't have saved Smart Search values yet
                      setSmartFormInitial((prev) =>
                        prev ? prev : {
                          selectedService,
                          selectedCategory,
                          selectedLocation,
                          budget: '',
                          projectSizeSqft: '',
                        }
                      );
                      const params = new URLSearchParams();
                      params.set('smart', '1');
                      if (selectedService) params.set('service', selectedService);
                      if (selectedCategory) params.set('category', selectedCategory);
                      if (selectedLocation) params.set('location', selectedLocation);
                      router.replace(`/?${params.toString()}`, { scroll: false });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-white/90 hover:text-white text-sm font-medium underline underline-offset-2"
                  >
                    Get best matches
                  </button>
                  <span className="text-white/70 text-sm ml-1"> (Smart Search by budget)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Smart Search results – show below form when form is open, or alone when in results mode (so form never covers providers) */}
      {smartContext && (smartSearchMode === 'results' || smartSearchMode === 'form') && (
        <div ref={smartResultsRef}>
          {smartError && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700 mb-2">{smartError}</p>
                <button
                  type="button"
                  onClick={() => setSmartSearchMode('form')}
                  className="text-red-600 font-medium underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
          {!smartError && smartResultsAsHomepage.length > 0 && (
            <ResultsDisplay
              service={smartServiceName}
              category=""
              location={smartContext.zipcode}
              providers={smartResultsAsHomepage}
              onClear={() => {
                setSmartSearchMode('form');
                setSmartProviders([]);
                setSmartContext(null);
                setSmartError(null);
              }}
              onGetEstimate={handleGetEstimate}
              onCallNow={handleCallNow}
            />
          )}
          {!smartError && smartResultsAsHomepage.length === 0 && smartSearchMode === 'results' && (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
              <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 md:p-16 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No providers match your criteria</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
                  Try increasing your budget or changing the zipcode to find providers in your area.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSmartSearchMode('form');
                    setSmartProviders([]);
                    setSmartContext(null);
                  }}
                  className="bg-navy-600 text-white px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-navy-700 transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
