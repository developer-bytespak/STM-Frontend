import Link from 'next/link';

interface ProviderCardProps {
  provider: {
    id: string;
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
  index?: number;
}

export default function ProviderCard({ provider, onCallNow, index = 0 }: ProviderCardProps) {
  // Determine star color based on rating
  const getStarColor = (rating: number = 0) => {
    if (rating >= 5.0) return 'text-yellow-500'; // Bright yellow for perfect rating
    if (rating >= 4.5) return 'text-gray-400'; // Gold
    if (rating >= 4.0) // Light gold
    return 'text-gray-300'; // Gray for lower ratings
  };

  return (
    <Link href={`/providers/${provider.id}`}>
      <div
        className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all overflow-hidden animate-fade-in w-full max-w-4xl mx-auto cursor-pointer"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="p-5 flex items-center gap-6">
        {/* Left: Thumbnail/Image Placeholder */}
        <div className="flex-shrink-0">
          <div className="w-[200px] h-[140px] bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-500 rounded-lg overflow-hidden relative shadow-sm">
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

        {/* Middle: Service Name and Business Info */}
        <div className="flex-1 min-w-0">
          {/* Service Type with Star */}
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="text-base font-semibold text-blue-600">
              {provider.businessType || 'Service Provider'}
            </h4>
            <svg className={`w-5 h-5 ${getStarColor(provider.rating)} fill-current flex-shrink-0`} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          
          {/* Business Name - Underlined */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-blue-600 hover:text-blue-700 cursor-pointer underline underline-offset-2 decoration-blue-600">
              {provider.businessName || `${provider.firstName} ${provider.lastName}`}
            </h3>
          </div>

          {/* Business Details */}
          <ul className="space-y-1 text-sm text-gray-800">
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
        </div>

        {/* Right: Badge and Rating */}
        <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0 min-w-[100px]">
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
    </Link>
  );
}