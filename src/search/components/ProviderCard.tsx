import Link from 'next/link';

interface Provider {
  id: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
  isAvailable?: boolean;
  services?: Array<{
    name: string;
  }>;
  address?: {
    city?: string;
    zipCode?: string;
  };
}

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link href={`/providers/${provider.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6">
        {/* Provider Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {provider.firstName?.[0]}{provider.lastName?.[0]}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {provider.businessName || `${provider.firstName} ${provider.lastName}`}
              </h3>
              <p className="text-sm text-gray-600">
                {provider.services?.[0]?.name || 'Service Provider'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">
                {provider.rating?.toFixed(1) || '4.5'}
              </span>
              <span className="text-xs text-gray-500">
                ({provider.reviewCount || 24} reviews)
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {provider.address?.zipCode || 'N/A'} • {provider.address?.city || 'City'}
            </div>
          </div>
        </div>

        {/* Description */}
        {provider.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {provider.description}
          </p>
        )}

        {/* Services & Pricing */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {provider.services?.slice(0, 3).map((service, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
              >
                {service.name}
              </span>
            ))}
            {provider.services && provider.services.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{provider.services.length - 3} more
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              ${provider.hourlyRate || 50}/hr
            </div>
            <div className="text-xs text-gray-500">Starting rate</div>
          </div>
        </div>

        {/* Availability */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${provider.isAvailable ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-600">
                {provider.isAvailable ? 'Available now' : 'Currently busy'}
              </span>
            </div>
            <div className="text-sm text-blue-600 font-medium">
              View Profile →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
