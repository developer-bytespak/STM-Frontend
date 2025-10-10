'use client';

import React, { useState, useRef, useEffect } from 'react';
import { homepageApi } from '@/api/homepage';
import type { ServiceSearchResult, CategoryService } from '@/types/homepage';

interface ServiceSearchProps {
  onServiceSelect: (service: string, category?: string) => void;
  onClear: () => void;
  selectedService?: string;
  selectedCategory?: string;
}

export default function ServiceSearch({ 
  onServiceSelect, 
  onClear, 
  selectedService, 
  selectedCategory 
}: ServiceSearchProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGranularOptions, setShowGranularOptions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentCategory, setCurrentCategory] = useState('');
  const [searchResults, setSearchResults] = useState<ServiceSearchResult[]>([]);
  const [granularServices, setGranularServices] = useState<CategoryService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync query with selectedService prop
  useEffect(() => {
    setQuery(selectedService || '');
  }, [selectedService]);

  // Debounced service search
  useEffect(() => {
    if (query.length >= 3) {
      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await homepageApi.searchServices(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Service search error:', error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [query]);

  // Check for duplicate service names to show category
  const serviceCounts = new Map<string, number>();
  searchResults.forEach(result => {
    if (result.type === 'service' && result.name) {
      serviceCounts.set(result.name, (serviceCounts.get(result.name) || 0) + 1);
    }
  });

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowDropdown(value.length >= 3);
    setShowGranularOptions(false);
    setSelectedIndex(-1);
    
    if (value.length < 3) {
      setShowDropdown(false);
    }
  };

  // Handle service selection
  const handleServiceSelect = async (result: ServiceSearchResult) => {
    if (result.type === 'service') {
      // Direct service selection
      onServiceSelect(result.name!, result.category);
      setQuery(result.name!);
      setShowDropdown(false);
      setShowGranularOptions(false);
      setCurrentCategory('');
    } else {
      // Category selection - fetch granular services from API
      setQuery(result.category);
      setShowDropdown(false);
      setCurrentCategory(result.category);
      
      try {
        const categoryData = await homepageApi.getCategoryServices(result.category);
        
        if (categoryData.services.length > 1) {
          // Multiple services - show granular options
          setGranularServices(categoryData.services);
          setShowGranularOptions(true);
        } else if (categoryData.services.length === 1) {
          // Single service (standalone) - proceed directly
          onServiceSelect(categoryData.services[0].name, result.category);
          setShowGranularOptions(false);
          setCurrentCategory('');
        }
      } catch (error) {
        console.error('Error fetching category services:', error);
        // Fallback: treat category as service
        onServiceSelect(result.category, result.category);
        setShowGranularOptions(false);
        setCurrentCategory('');
      }
    }
  };

  // Handle granular service selection
  const handleGranularSelect = (service: CategoryService) => {
    onServiceSelect(service.name, currentCategory);
    setQuery(service.name);
    setShowGranularOptions(false);
    setCurrentCategory('');
    setGranularServices([]);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setShowDropdown(false);
    setShowGranularOptions(false);
    setSelectedIndex(-1);
    setCurrentCategory('');
    setSearchResults([]);
    setGranularServices([]);
    onClear(); // This will call handleClearAll in HierarchicalSearch
    inputRef.current?.focus();
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (query.length >= 3 && searchResults.length > 0) {
      // Show the dropdown instead of auto-selecting
      setShowDropdown(true);
      setSelectedIndex(-1);
    } else if (query.length >= 3) {
      // If no results but query is long enough, show message
      alert('No services found for your search. Please try a different term.');
    } else {
      // If query is too short
      alert('Please enter at least 3 characters to search.');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown && !showGranularOptions) return;

    const options = showGranularOptions 
      ? granularServices
      : searchResults;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (showGranularOptions) {
            handleGranularSelect(granularServices[selectedIndex]);
          } else {
            handleServiceSelect(searchResults[selectedIndex]);
          }
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setShowGranularOptions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setShowGranularOptions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // No need to group results anymore - backend already provides the right structure

  return (
    <div className="relative">
      {/* Service Search Input */}
      <div className="relative">
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
          ref={inputRef}
          type="text"
          placeholder="Search Service"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-20 py-4 text-lg text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent border-b-2 border-gray-300 focus:border-navy-600 transition-colors"
        />
        
        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-28 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        {/* Search Button */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-navy-600 text-white px-4 py-2 rounded-md hover:bg-navy-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Service Search Dropdown - Categories and Services */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{ 
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#D1D5DB #F3F4F6'
          }}
        >
          {isLoading ? (
            <div className="px-6 py-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-navy-600 mb-2"></div>
              <p className="text-sm">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}-${index}`}
                  type="button"
                  onClick={() => handleServiceSelect(result)}
                  className={`w-full text-left px-6 py-3 hover:bg-gray-100 transition-colors text-gray-900 border-b border-gray-100 last:border-b-0 ${
                    selectedIndex === index ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>
                      {result.type === 'service' && result.name
                        ? (serviceCounts.get(result.name)! > 1 
                            ? `${result.name} (${result.category})` 
                            : result.name)
                        : result.category}
                    </span>
                  </div>
                </button>
              ))}
              {/* Extra padding at bottom to ensure last item is fully visible */}
              <div className="h-2"></div>
            </>
          ) : query.length >= 3 ? (
            <div className="px-6 py-4 text-center text-gray-500 text-sm">
              No services found
            </div>
          ) : null}
        </div>
      )}

      {/* Granular Service Options - Below Search Bar */}
      {showGranularOptions && currentCategory && granularServices.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-3">
            Choose a specific service under <span className="font-semibold">{currentCategory}</span>:
          </div>
          <div className="flex flex-wrap gap-2">
            {granularServices.map((service, index) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleGranularSelect(service)}
                className={`px-4 py-2 rounded-full border-2 transition-all hover:shadow-md ${
                  selectedIndex === index 
                    ? 'border-navy-600 bg-navy-600 text-white' 
                    : 'border-gray-300 text-gray-700 hover:border-navy-500 hover:text-navy-600'
                }`}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
