'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OfficeSpace } from '@/types/office';
import { officeSpaceApi, transformOfficeSpace } from '@/api/officeBooking';
import OfficeCard from '@/components/cards/OfficeCard';
import OfficeBookingModal from '@/components/booking/OfficeBookingModal';
// COMMENTED OUT - Search/Filter functionality
// import Input from '@/components/ui/Input';
import { formatPrice } from '@/lib/pricingCalculator';
import { useAlert } from '@/hooks/useAlert';

export default function ProviderOfficeBookingPage() {
  const [offices, setOffices] = useState<OfficeSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState<OfficeSpace | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const { showAlert } = useAlert();

  // Load offices from API
  useEffect(() => {
    const loadOffices = async () => {
      try {
        setLoading(true);
        const response = await officeSpaceApi.getAvailableOffices();
        const transformedOffices = response.map(transformOfficeSpace);
        setOffices(transformedOffices);
      } catch (error) {
        console.error('Failed to load offices:', error);
        showAlert({
          title: 'Error',
          message: 'Failed to load office spaces. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadOffices();
  }, [showAlert]);

  // COMMENTED OUT - Advanced filtering and sorting
  // const handleFilter = () => {
  //   let filtered = [...offices];

  //   // Search filter
  //   if (searchQuery) {
  //     filtered = filtered.filter(office =>
  //       office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       office.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       office.description.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   }

  //   // Type filter
  //   if (typeFilter !== 'all') {
  //     filtered = filtered.filter(office => office.type === typeFilter);
  //   }

  //   // Sort
  //   filtered.sort((a, b) => {
  //     switch (sortBy) {
  //       case 'price':
  //         const aPrice = a.pricing.daily || a.pricing.hourly || 0;
  //         const bPrice = b.pricing.daily || b.pricing.hourly || 0;
  //         return aPrice - bPrice;
  //       case 'rating':
  //         return b.rating - a.rating;
  //       case 'capacity':
  //         return b.capacity - a.capacity;
  //       default:
  //         return 0;
  //     }
  //   });

  //   setFilteredOffices(filtered);
  // };

  // useEffect(() => {
  //   handleFilter();
  // }, [searchQuery, typeFilter, sortBy]);

  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  // const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setTypeFilter(e.target.value);
  // };

  // const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSortBy(e.target.value as any);
  // };

  const handleBookNow = (office: OfficeSpace) => {
    setSelectedOffice(office);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <Link
              href="/provider/dashboard"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Office Booking</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Book workspace and manage office reservations
              </p>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/provider/my-bookings"
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">My Bookings</span>
                <span className="sm:hidden">Bookings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Available Spaces</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{offices.length}</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Starting From</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {formatPrice(Math.min(...offices.map(o => o.pricing.daily || o.pricing.hourly || 0)))}
            </p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Cities</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {new Set(offices.map(o => o.location.city)).size}
            </p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Avg Rating</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {(offices.reduce((sum, o) => sum + o.rating, 0) / offices.length).toFixed(1)}
            </p>
          </div>
        </div>

        {/* COMMENTED OUT - Complex Pricing Info Banner */}
        {/* <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Pricing - Save More with Longer Bookings!</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">⏰ Hourly:</span>
                  <span className="font-semibold text-gray-900">Most flexible</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">📅 Daily:</span>
                  <span className="font-semibold text-green-700">Save up to 20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">📆 Weekly:</span>
                  <span className="font-semibold text-green-700">Save up to 35%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">🗓️ Monthly:</span>
                  <span className="font-semibold text-green-700">Save up to 50%</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* COMMENTED OUT - Filters and Search */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by name, city, or description..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            <select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="private_office">Private Office</option>
              <option value="shared_desk">Shared Desk</option>
              <option value="meeting_room">Meeting Room</option>
              <option value="conference_room">Conference Room</option>
              <option value="coworking_space">Coworking Space</option>
            </select>

            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
              <option value="capacity">Sort by Capacity</option>
            </select>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredOffices.length} of {offices.length} available office spaces
            </p>
          </div>
        </div> */}

        {/* SIMPLIFIED - Office Grid */}
        {loading ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-navy-600 mx-auto"></div>
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">Loading office spaces...</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Please wait while we fetch available offices
              </p>
            </div>
          </div>
        ) : offices.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-12">
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No offices available</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Check back later for available office spaces
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {offices.map((office) => (
              <OfficeCard
                key={office.id}
                office={office}
                onEdit={undefined}
                onDelete={undefined}
                onViewBookings={() => handleBookNow(office)}
                buttonText="Book Now"
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <OfficeBookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedOffice(null);
        }}
        office={selectedOffice}
        onSuccess={() => {
          console.log('Booking successful!');
          // TODO: Show success message, redirect to bookings page
        }}
      />
    </div>
  );
}