import Link from 'next/link';

interface EmptyStateProps {
  searchTerm?: string;
  location?: string;
}

export default function EmptyState({ searchTerm, location }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No providers found
        </h3>
        
        <p className="text-gray-600 mb-6">
          {searchTerm && location ? (
            <>
              We couldn&apos;t find any providers for <strong>&quot;{searchTerm}&quot;</strong> in <strong>&quot;{location}&quot;</strong>.
            </>
          ) : searchTerm ? (
            <>
              We couldn&apos;t find any providers for <strong>&quot;{searchTerm}&quot;</strong>.
            </>
          ) : (
            'We couldn&apos;t find any providers matching your criteria.'
          )}
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Try adjusting your search criteria:
          </p>
          
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Expand your search radius</li>
            <li>• Try different service keywords</li>
            <li>• Check nearby cities or ZIP codes</li>
            <li>• Use more general terms</li>
          </ul>
          
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              New Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
