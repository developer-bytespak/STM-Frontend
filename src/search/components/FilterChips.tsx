'use client';

interface FilterChip {
  type: 'service' | 'location' | 'radius';
  label: string;
  value: string;
  editable?: boolean;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onEdit: (type: FilterChip['type']) => void;
  onRemove: (type: FilterChip['type']) => void;
}

export default function FilterChips({ filters, onEdit, onRemove }: FilterChipsProps) {
  const getChipIcon = (type: FilterChip['type']) => {
    switch (type) {
      case 'service':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'location':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'radius':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getChipColor = (type: FilterChip['type']) => {
    switch (type) {
      case 'service':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'location':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'radius':
        return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
        <button
          onClick={() => filters.forEach(filter => onRemove(filter.type))}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Clear all
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <div
            key={index}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border text-sm font-medium transition-colors ${getChipColor(filter.type)}`}
          >
            {getChipIcon(filter.type)}
            <span>{filter.label}:</span>
            <span className="font-semibold">{filter.value}</span>
            
            {filter.editable && (
              <button
                onClick={() => onEdit(filter.type)}
                className="ml-1 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
                title="Edit filter"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            <button
              onClick={() => onRemove(filter.type)}
              className="ml-1 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
              title="Remove filter"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
