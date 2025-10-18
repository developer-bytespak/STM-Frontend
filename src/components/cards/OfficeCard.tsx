'use client';

import { OfficeSpace } from '@/types/office';
import Badge from '@/components/ui/Badge';
import AmenityIcon from '@/components/ui/AmenityIcon';

// Professional SVG Icons
const LocationIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CapacityIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
  </svg>
);

const AreaIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 000 2h2a1 1 0 100-2H5zm4 0a1 1 0 000 2h2a1 1 0 100-2H9zm4 0a1 1 0 000 2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
  </svg>
);

const OfficeIcon = () => (
  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

interface OfficeCardProps {
  office: OfficeSpace;
  onEdit?: (office: OfficeSpace) => void;
  onDelete?: (officeId: string) => void;
  onViewBookings?: (officeId: string) => void;
  buttonText?: string; // Allow customizing the button text
}

const STATUS_COLORS = {
  available: 'bg-green-100 text-green-800 border-green-200',
  occupied: 'bg-blue-100 text-blue-800 border-blue-200',
  maintenance: 'bg-orange-100 text-orange-800 border-orange-200',
  booked: 'bg-purple-100 text-purple-800 border-purple-200',
};

// Removed TYPE_LABELS - no longer displaying office type on cards

export default function OfficeCard({ office, onEdit, onDelete, onViewBookings, buttonText }: OfficeCardProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
        {/* Enhanced Image Section */}
        <div className="relative h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-slate-700 via-navy-600 to-blue-700">
        {office.images && office.images.length > 0 ? (
          <img 
            src={office.images[0]} 
            alt={office.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/90">
            <OfficeIcon />
          </div>
        )}
        
        {/* Removed badges from image overlay */}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Enhanced Content Section - Flex container to push buttons to bottom */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Title & Rating - Fixed height */}
        <div className="flex items-start justify-between mb-2 sm:mb-3 min-h-[2.5rem] sm:min-h-[3.5rem]">
          <div className="flex-1 pr-1 sm:pr-2">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 leading-tight">{office.name}</h3>
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-gray-600">
              <LocationIcon />
              <span className="font-medium">{office.location.city}, {office.location.state}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-1.5 bg-yellow-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex-shrink-0">
            <StarIcon />
            <span className="text-xs font-bold text-gray-900">{office.rating}</span>
            <span className="text-xs text-gray-500 hidden sm:inline">({office.reviews})</span>
          </div>
        </div>

        {/* Status Badge - Moved down from image overlay */}
        <div className="mb-2 sm:mb-3">
          <Badge className={`${STATUS_COLORS[office.status]} border-0 shadow-sm text-xs`}>
            {office.status.charAt(0).toUpperCase() + office.status.slice(1)}
          </Badge>
        </div>

        {/* Description - Fixed height */}
        <div className="mb-2 sm:mb-3 min-h-[2rem] sm:min-h-[2.5rem]">
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{office.description}</p>
        </div>

        {/* Enhanced Details Grid - Fixed height */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 bg-blue-50 rounded-lg">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-blue-100 flex items-center justify-center">
              <CapacityIcon />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Capacity</p>
              <p className="text-xs font-bold text-gray-900">{office.capacity} people</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 bg-purple-50 rounded-lg">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-purple-100 flex items-center justify-center">
              <AreaIcon />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Area</p>
              <p className="text-xs font-bold text-gray-900">{office.area} sq ft</p>
            </div>
          </div>
        </div>

        {/* Enhanced Amenities - Fixed height */}
        <div className="mb-3 min-h-[1.5rem]">
          {/* COMMENTED OUT - Amenities */}
          {/* <div className="flex flex-wrap gap-1">
            {office.amenities.slice(0, 2).map((amenity) => (
              <span
                key={amenity.id}
                className="flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium"
                title={amenity.name}
              >
                <AmenityIcon iconType={amenity.icon} className="w-3 h-3" />
                {amenity.name}
              </span>
            ))}
            {office.amenities.length > 2 && (
              <span className="text-xs px-2 py-0.5 bg-navy-50 text-navy-600 rounded font-medium border border-navy-100">
                +{office.amenities.length - 2} more
              </span>
            )}
          </div> */}
        </div>

        {/* Enhanced Pricing - Fixed height */}
        <div className="border-t border-gray-100 pt-2 sm:pt-3 mb-2 sm:mb-3 min-h-[2.5rem] sm:min-h-[3rem]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Starting from</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-lg font-bold text-navy-600">
                  ${Number(office.pricing.hourly || office.pricing.daily).toFixed(Number(office.pricing.hourly || office.pricing.daily) % 1 === 0 ? 0 : 2)}
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  /{office.pricing.hourly ? 'hour' : 'day'}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                <CalendarIcon />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Bookings</p>
                  <p className="text-xs font-bold text-gray-900">{office.totalBookings}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Actions - Always at bottom */}
        <div className="flex gap-1 sm:gap-1.5 mt-auto pt-1 sm:pt-2">
          {onViewBookings && (
            <button
              onClick={() => onViewBookings(office.id)}
              className="flex-1 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-navy-50 text-navy-600 rounded hover:bg-navy-100 transition-all duration-200 text-xs font-semibold border border-navy-100 hover:border-navy-200"
            >
              <span className="hidden sm:inline">{buttonText || 'View Bookings'}</span>
              <span className="sm:hidden">View</span>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(office)}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-all duration-200 text-xs font-semibold border border-blue-100 hover:border-blue-200"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(office.id)}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-all duration-200 text-xs font-semibold border border-red-100 hover:border-red-200"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}