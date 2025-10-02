'use client';

interface SortBarProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  resultCount: number;
}

export default function SortBar({ sortBy, onSortChange, resultCount }: SortBarProps) {
  const sortOptions = [
    { value: 'best_match', label: 'Best match', default: true },
    { value: 'top_rated', label: 'Top rated' },
    { value: 'nearest', label: 'Nearest' },
    { value: 'most_reviewed', label: 'Most reviewed' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {resultCount} providers found
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
