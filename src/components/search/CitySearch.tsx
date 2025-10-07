'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CitySearchProps {
  onLocationSelect: (location: string) => void;
  onClear: () => void;
  selectedLocation?: string;
  disabled?: boolean;
}

// Mock city/ZIP data - in a real app, this would come from an API
const LOCATION_SUGGESTIONS = [
  '97301 - Salem, OR',
  '97302 - Salem, OR',
  '97201 - Portland, OR',
  '97202 - Portland, OR',
  '75001 - Dallas, TX',
  '75002 - Dallas, TX',
];

export default function CitySearch({ 
  onLocationSelect, 
  onClear, 
  selectedLocation,
  disabled = false
}: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync query with selectedLocation prop
  useEffect(() => {
    setQuery(selectedLocation || '');
  }, [selectedLocation]);

  // Filter locations based on query
  const filteredLocations = !disabled && query.length >= 2 
    ? LOCATION_SUGGESTIONS.filter(location => 
        location.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10) // Limit to 10 results
    : [];

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
  const handleLocationSelect = (location: string) => {
    if (disabled) return;
    onLocationSelect(location);
    setQuery(location);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Handle clear
  const handleClear = () => {
    if (disabled) return;
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    onClear();
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredLocations.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleLocationSelect(filteredLocations[selectedIndex]);
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
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
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
          placeholder="Search Location"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`w-full pl-12 pr-20 py-4 text-lg text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent border-b-2 border-gray-300 focus:border-navy-600 transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
        />
        
        {/* Clear Button */}
        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-28 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Clear location search"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        {/* Search Button */}
        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-navy-600 text-white px-4 py-2 rounded-md hover:bg-navy-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Location Search Dropdown */}
      {showDropdown && filteredLocations.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        >
          {filteredLocations.map((location, index) => (
            <button
              key={location}
              type="button"
              onClick={() => handleLocationSelect(location)}
              className={`w-full text-left px-6 py-3 hover:bg-gray-100 transition-colors text-gray-900 border-b border-gray-100 last:border-b-0 ${
                selectedIndex === index ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{location}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
