import Link from 'next/link';
import { Provider } from '@/types/provider';

interface ProviderCardMinimalProps {
  provider: Provider;
}

export default function ProviderCardMinimal({ provider }: ProviderCardMinimalProps) {
  return (
    <Link 
      href={`/customer/providers/${provider.id}`}
      className="block"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 p-4 cursor-pointer">
        <div className="flex items-center space-x-4">
          {/* Profile Picture/Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">
                {provider.firstName?.[0]}{provider.lastName?.[0]}
              </span>
            </div>
          </div>

          {/* Provider Info */}
          <div className="flex-grow min-w-0">
            {/* Name */}
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {provider.businessName || `${provider.firstName} ${provider.lastName}`}
            </h3>
            
            {/* Business Type */}
            <p className="text-sm text-gray-600 mb-2">
              {provider.businessType || 'Service Provider'}
            </p>

            {/* Rating & Experience */}
            <div className="flex items-center space-x-4">
              {/* Rating */}
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">
                  {provider.rating?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-xs text-gray-500">
                  ({provider.reviewCount || 0})
                </span>
              </div>

              {/* Experience */}
              {provider.experience && (
                <>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{provider.experience}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Arrow Icon */}
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

