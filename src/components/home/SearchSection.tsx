'use client';

interface SearchSectionProps {
  searchQuery: string;
  location: string;
  showSuggestions: boolean;
  filteredServices: string[];
  highlightedIndex: number;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onServiceSelect: (service: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  suggestionsRef: React.RefObject<HTMLDivElement | null>;
}

export default function SearchSection({
  searchQuery,
  location,
  showSuggestions,
  filteredServices,
  highlightedIndex,
  onSearchChange,
  onLocationChange,
  onServiceSelect,
  onKeyDown,
  searchInputRef,
  suggestionsRef,
}: SearchSectionProps) {
  return (
    <div className="max-w-4xl mx-auto mb-16">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
        <label htmlFor="service-search" className="block text-sm font-medium text-gray-700 mb-2">
          What service do you need?
        </label>
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            id="service-search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => {
              if (filteredServices.length > 0) {
                // Parent will handle this via state
              }
            }}
            placeholder="Type to search services (e.g., Plumber, Photographer, Tutor)"
            className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-lg"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Typeahead Suggestions Dropdown */}
          {showSuggestions && filteredServices.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto"
            >
              {filteredServices.map((service, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onServiceSelect(service)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                    index === highlightedIndex ? 'bg-blue-50' : ''
                  } ${
                    index === 0 ? 'rounded-t-xl' : ''
                  } ${
                    index === filteredServices.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-gray-900 font-medium">{service}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location Filter */}
        <div className="mt-6">
          <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Location (City or ZIP Code)
          </label>
          <div className="relative">
            <input
              type="text"
              id="location-filter"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Enter city or ZIP code (e.g., New York, 10001)"
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Popular Services Quick Select */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Popular services:</p>
          <div className="flex flex-wrap gap-2">
            {['Plumber', 'Electrician', 'HVAC', 'Interior Cleaning / Janitorial', 'Photographer', 'Tutor / Coach', 'Handyman', 'Carpenter'].map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => onServiceSelect(service)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-full hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors"
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

