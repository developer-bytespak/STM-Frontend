'use client';

import React, { useState, useRef, useEffect } from 'react';
import { homepageApi } from '@/api/homepage';
import type { LocationResult } from '@/types/homepage';

interface CitySearchProps {
  onLocationSelect: (location: string) => void;
  onClear: () => void;
  selectedLocation?: string;
  disabled?: boolean;
}

export default function CitySearch({ 
  onLocationSelect, 
  onClear, 
  selectedLocation,
  disabled = false
}: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync query with selectedLocation prop
  useEffect(() => {
    setQuery(selectedLocation || '');
  }, [selectedLocation]);

  // Clear query when component is disabled (when service is cleared)
  useEffect(() => {
    if (disabled && query) {
      setQuery('');
      setShowDropdown(false);
      setSelectedIndex(-1);
      setLocationResults([]);
    }
  }, [disabled, query]);

  // Debounced location search
  useEffect(() => {
    if (!disabled && query.length >= 2) {
      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await homepageApi.searchLocations(query, 10);
          
          // Remove duplicates - prefer formatted addresses over raw ZIP codes
          const uniqueResults = new Map();
          
          results.forEach(location => {
            const zipCode = location.zipCode;
            
            // If we haven't seen this ZIP code yet, add it
            if (!uniqueResults.has(zipCode)) {
              uniqueResults.set(zipCode, location);
            } else {
              // If we already have this ZIP, prefer the formatted version
              const existing = uniqueResults.get(zipCode);
              const currentHasFormat = location.formattedAddress.includes(' - ') && location.formattedAddress.includes(',');
              const existingHasFormat = existing.formattedAddress.includes(' - ') && existing.formattedAddress.includes(',');
              
              // Replace if current is formatted and existing is not
              if (currentHasFormat && !existingHasFormat) {
                uniqueResults.set(zipCode, location);
              }
            }
          });
          
          setLocationResults(Array.from(uniqueResults.values()));
        } catch (error) {
          console.error('Location search error:', error);
          setLocationResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      setLocationResults([]);
    }
  }, [query, disabled]);

  // Handle input change
  const handleInputChange = (value: string) => {
    if (disabled) return;
    setQuery(value);
    setShowDropdown(value.length >= 2);
    setSelectedIndex(-1);
    
    if (value.length < 2) {
      setShowDropdown(false);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: LocationResult) => {
    if (disabled) return;
    // Pass formatted address to parent component
    onLocationSelect(location.formattedAddress);
    setQuery(location.formattedAddress);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Handle clear
  const handleClear = () => {
    if (disabled) return;
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    setLocationResults([]);
    onClear();
    inputRef.current?.focus();
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (disabled) return;
    
    if (query.length >= 2 && locationResults.length > 0) {
      // Show the dropdown instead of auto-selecting
      setShowDropdown(true);
      setSelectedIndex(-1);
    } else if (query.length >= 2) {
      // If no results but query is long enough, show message
      alert('No locations found for your search. Please try a different term.');
    } else {
      // If query is too short
      alert('Please enter at least 2 characters to search.');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < locationResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && locationResults[selectedIndex]) {
          handleLocationSelect(locationResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
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
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Location Search Input */}
      <div className="relative">
        <svg 
          className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
          />
        </svg>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter Zip Code"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 text-base sm:text-lg text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent border-b-2 border-gray-300 focus:border-navy-600 transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
        />
        
        {/* Clear Button */}
        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 sm:right-28 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1"
            aria-label="Clear location search"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        {/* Search Button */}
        <button
          type="button"
          onClick={handleSearchClick}
          disabled={disabled}
          className={`absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-navy-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-md hover:bg-navy-700 transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          Search
        </button>
      </div>

      {/* Location Search Dropdown */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[250px] sm:max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{ 
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#D1D5DB #F3F4F6'
          }}
        >
          {isLoading ? (
            <div className="px-4 sm:px-6 py-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-navy-600 mb-2"></div>
              <p className="text-sm">Searching locations...</p>
            </div>
          ) : locationResults.length > 0 ? (
            <>
              {locationResults.map((location, index) => (
                <button
                  key={location.zipCode}
                  type="button"
                  onClick={() => handleLocationSelect(location)}
                  className={`w-full text-left px-4 sm:px-6 py-3 hover:bg-gray-100 transition-colors text-gray-900 border-b border-gray-100 last:border-b-0 ${
                    selectedIndex === index ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm sm:text-base truncate">{location.formattedAddress}</span>
                  </div>
                </button>
              ))}
              {/* Extra padding at bottom to ensure last item is fully visible */}
              <div className="h-2"></div>
            </>
          ) : query.length >= 2 ? (
            <div className="px-4 sm:px-6 py-4 text-center text-gray-500 text-sm">
              No locations found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
