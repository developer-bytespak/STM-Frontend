import ProviderCard from '@/search/components/ProviderCard';
import providersData from '@/search/mocks/providers.json';

interface ProviderResultsProps {
  selectedService: string;
  location: string;
  providers: Array<typeof providersData[0]>;
}

export default function ProviderResults({ selectedService, location, providers }: ProviderResultsProps) {
  if (!selectedService) return null;

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Providers for &quot;{selectedService}&quot;
          {location && <span className="text-blue-600"> in {location}</span>}
        </h2>
        <p className="text-gray-600">
          Found {providers.length} {providers.length === 1 ? 'provider' : 'providers'}
          {location && ' in your area'}
        </p>
      </div>

      {providers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No providers found</h3>
            <p className="mt-2 text-sm text-gray-500">
              We couldn&apos;t find any providers for &quot;{selectedService}&quot;
              {location && ` in ${location}`}. 
              {location ? ' Try a different location or service.' : ' Try searching for a different service.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

