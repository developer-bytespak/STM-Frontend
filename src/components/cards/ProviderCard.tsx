import Link from 'next/link';

interface ProviderCardProps {
  provider: {
    id: string;
    slug?: string;  // SEO-friendly slug for URL
    businessName?: string;
    businessType?: string;
    firstName: string;
    lastName: string;
    rating?: number;
    reviewCount?: number;
    description?: string;
    experience?: string;
    address?: {
      zipCode: string;
      city: string;
      state: string;
    };
    hourlyRate?: number;
    image?: string; // Optional image URL
  };
  onCallNow?: () => void;
  onGetEstimate?: () => void;
  index?: number;
  searchParams?: string;
}

export default function ProviderCard({ provider, onCallNow, onGetEstimate, index = 0, searchParams }: ProviderCardProps) {
  // Determine star color based on rating
  const getStarColor = (rating: number = 0) => {
    if (rating >= 5.0) return 'text-yellow-500'; // Bright yellow for perfect rating
    if (rating >= 4.5) return 'text-yellow-400'; // Gold
    if (rating >= 4.0) return 'text-yellow-300'; // Light gold
    return 'text-gray-300'; // Gray for lower ratings
  };

  // Use slug if available, otherwise fallback to id-based URL
  const baseUrl = provider.slug ? `/${provider.slug}` : `/providers/${provider.id}`;
  const providerUrl = searchParams 
    ? `${baseUrl}?${searchParams}`
    : baseUrl;

  return (
    <Link href={providerUrl}>
      <div
        className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all overflow-hidden animate-fade-in w-full max-w-4xl mx-auto cursor-pointer"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        {/* Left: Thumbnail/Image Placeholder */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <div className="w-full h-[160px] sm:w-[200px] sm:h-[140px] bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-500 rounded-lg overflow-hidden relative shadow-sm">
            {/* Background Image */}
            {provider.image && (
              <img 
                src={provider.image} 
                alt={provider.businessName || 'Provider'} 
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Play Button Overlay */}
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <button className="flex items-center justify-center w-14 h-14 bg-white rounded-full hover:scale-110 transition-transform shadow-lg">
                <svg className="w-6 h-6 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            </div> */}
          </div>
        </div>

        {/* Content Wrapper - flex on mobile to show rating inline */}
        <div className="flex-1 min-w-0 w-full sm:flex sm:gap-6">
          {/* Middle: Service Name and Business Info */}
          <div className="flex-1 min-w-0">
            {/* Service Type with Star and Mobile Rating */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-semibold text-blue-600">
                  {provider.businessType || 'Service Provider'}
                </h4>
                {/* Small indicator to show this is the searched service */}
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-green-600 font-medium">Available</span>
                </div>
                <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${getStarColor(provider.rating)} fill-current flex-shrink-0`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              {/* Rating - visible only on mobile */}
              <div className="sm:hidden text-3xl font-bold text-blue-600">
                {provider.rating || '5.0'}
              </div>
            </div>
            
            {/* Business Name - Underlined */}
            <div className="mb-2 sm:mb-3">
              <h3 className="text-base sm:text-lg font-bold text-blue-600 hover:text-blue-700 cursor-pointer underline underline-offset-2 decoration-blue-600">
                {provider.businessName || `${provider.firstName} ${provider.lastName}`}
              </h3>
            </div>

            {/* Business Details */}
            <ul className="space-y-1 text-xs sm:text-sm text-gray-800 mb-3 sm:mb-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                <span>{provider.experience || '5+'} in Business</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                <span>Google Rating {provider.rating || '5.0'} ({provider.reviewCount || 0} Reviews)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                <span>100% within hour response rate</span>
              </li>
            </ul>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onGetEstimate?.();
                }}
                className="bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="truncate">Get Automated Estimate</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCallNow?.();
                }}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="truncate">Call Person Now</span>
              </button>
            </div>
          </div>

          {/* Right: Badge and Rating - visible only on desktop */}
          <div className="hidden sm:flex flex-col items-center justify-center gap-2 flex-shrink-0 min-w-[100px]">
            {/* On Top Badge */}
            <div className="bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded border border-gray-200">
              logo
            </div>
            
            {/* Rating */}
            <div className="text-5xl font-bold text-blue-600">
              {provider.rating || '5.0'}
            </div>
          </div>
        </div>
      </div>
      </div>
    </Link>
  );
}