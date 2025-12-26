'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OfficeBooking } from '@/types/office';
import { bookingApi } from '@/api/officeBooking';
import Badge from '@/components/ui/Badge';
import BookingStatusIcon from '@/components/ui/BookingStatusIcon';
import CardListSkeleton from '@/components/ui/CardListSkeleton';
import { formatPrice } from '@/lib/pricingCalculator';
import { useAlert } from '@/hooks/useAlert';
import CancelBookingModal from '@/components/modals/CancelBookingModal';

export default function ProviderMyBookingsPage() {
  const [bookings, setBookings] = useState<OfficeBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'past'>('all');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<OfficeBooking | null>(null);
  const { showAlert } = useAlert();

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await bookingApi.getMyBookings();
        console.log('Bookings response:', response);
        setBookings(response.bookings || []);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to load bookings');
        showAlert({
          title: 'Error',
          message: 'Failed to load your bookings. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [showAlert]);

  const STATUS_COLORS = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const PAYMENT_STATUS_COLORS = {
    pending: 'bg-orange-50 text-orange-700 border-orange-200',
    paid: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filterBookings = () => {
    const now = new Date();
    
    return bookings.filter(booking => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      
      switch (filter) {
        case 'upcoming':
          return startDate > now && booking.status === 'confirmed';
        case 'active':
          return startDate <= now && endDate >= now && booking.status === 'confirmed';
        case 'past':
          return endDate < now || booking.status === 'completed';
        default:
          return true;
      }
    });
  };

  const filteredBookings = filterBookings();

  const getBookingStats = () => {
    const now = new Date();
    return {
      total: bookings.length,
      upcoming: bookings.filter(b => new Date(b.startDate) > now && b.status === 'confirmed').length,
      active: bookings.filter(b => {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        return start <= now && end >= now && b.status === 'confirmed';
      }).length,
      totalSpent: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalAmount, 0),
    };
  };

  const stats = getBookingStats();

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setCancelModalOpen(true);
    }
  };

  const handleConfirmCancel = async (bookingId: string) => {
    try {
      console.log('Cancelling booking:', bookingId);
      
      // Call the real API to cancel the booking
      const cancelledBooking = await bookingApi.cancelBooking(bookingId);
      
      // Update the local state with the cancelled booking
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? cancelledBooking
            : booking
        )
      );
      
      showAlert({
        title: 'Booking Cancelled',
        message: 'Your booking has been successfully cancelled.',
        type: 'success'
      });
      
      // Trigger a refresh of bookings to get updated data
      const response = await bookingApi.getMyBookings();
      setBookings(response.bookings || []);
    } catch (error: any) {
      console.error('Cancellation error:', error);
      showAlert({
        title: 'Cancellation Failed',
        message: error.message || 'Failed to cancel booking. Please try again.',
        type: 'error'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <CardListSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="text-center py-8 sm:py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg max-w-md mx-auto">
              <p className="font-semibold text-sm sm:text-base">Error Loading Bookings</p>
              <p className="text-xs sm:text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <span className="text-sm sm:text-base">Back to Dashboard</span>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">My Office Bookings</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Manage your office space reservations
              </p>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/provider/office-booking"
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm sm:text-base">Book New Office</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">Total Bookings</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">Upcoming</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
                <BookingStatusIcon status="upcoming" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.upcoming}</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">Active Now</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center">
                <BookingStatusIcon status="active" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.active}</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">Total Spent</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{formatPrice(stats.totalSpent)}</p>
          </div>
        </div>

        {/* Enhanced Filter Tabs */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 mb-6 sm:mb-8 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="-mb-px flex flex-wrap sm:flex-nowrap space-x-2 sm:space-x-8 px-3 sm:px-6">
              {[
                { key: 'all', label: 'All Bookings', icon: 'all' },
                { key: 'upcoming', label: 'Upcoming', icon: 'upcoming' },
                { key: 'active', label: 'Active Now', icon: 'active' },
                { key: 'past', label: 'Past', icon: 'completed' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`${
                    filter === tab.key
                      ? 'border-navy-500 text-navy-600 bg-navy-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  } whitespace-nowrap py-2 sm:py-4 px-2 sm:px-3 border-b-2 font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center gap-1 sm:gap-2 rounded-t-lg flex-1 sm:flex-none justify-center`}
                >
                  <BookingStatusIcon status={tab.icon as any} className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Bookings List */}
          <div className="p-3 sm:p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No bookings found</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  {filter === 'all' ? 'You haven\'t made any bookings yet' : `No ${filter} bookings`}
                </p>
                <div className="mt-4 sm:mt-6">
                  <Link
                    href="/provider/office-booking"
                    className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-navy-600 hover:bg-navy-700"
                  >
                    Browse Office Spaces
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredBookings.map((booking) => {
                  const startDate = new Date(booking.startDate);
                  const endDate = new Date(booking.endDate);
                  const now = new Date();
                  const isActive = startDate <= now && endDate >= now && booking.status === 'confirmed';
                  const isUpcoming = startDate > now && booking.status === 'confirmed';

                  return (
                    <div
                      key={booking.id}
                      className={`border-2 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all duration-300 ${
                        isActive
                          ? 'border-emerald-300 bg-emerald-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-navy-300 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Office Name */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{booking.officeName}</h3>
                            <div className="flex gap-2">
                              {isActive && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                                  <BookingStatusIcon status="active" className="w-3 h-3" />
                                  <span className="text-xs sm:text-sm">Active Now</span>
                                </Badge>
                              )}
                              {isUpcoming && (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                                  <BookingStatusIcon status="upcoming" className="w-3 h-3" />
                                  <span className="text-xs sm:text-sm">Upcoming</span>
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Dates */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Check-in</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">{formatDate(booking.startDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Check-out</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">{formatDate(booking.endDate)}</p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4">
                            <div>
                              <span className="text-gray-600">Duration: </span>
                              <span className="font-semibold text-gray-900">
                                {booking.duration} {booking.durationType === 'daily' ? 'day' : booking.durationType.replace('ly', '')}
                                {booking.duration > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="hidden sm:block">
                              <span className="text-gray-600">Booking ID: </span>
                              <span className="font-mono text-xs font-semibold text-gray-900">
                                {booking.id}
                              </span>
                            </div>
                          </div>

                          {/* Special Requests */}
                          {booking.specialRequests && (
                            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">Special Requests:</p>
                              <p className="text-xs sm:text-sm text-gray-900">{booking.specialRequests}</p>
                            </div>
                          )}
                        </div>

                        {/* Right Side - Price & Status */}
                        <div className="flex flex-col sm:flex-row lg:flex-col lg:items-end gap-3 sm:gap-4 lg:gap-3 w-full sm:w-auto min-w-0">
                          <div className="text-left lg:text-right flex-1 lg:flex-none">
                            <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Total Amount</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-navy-600">
                              {formatPrice(booking.totalAmount)}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row lg:flex-col gap-1 sm:gap-2 lg:gap-2">
                            <Badge className={`${STATUS_COLORS[booking.status]} border flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-center text-xs sm:text-sm`}>
                              <BookingStatusIcon status={booking.status} className="w-3 h-3" />
                              <span className="text-xs sm:text-sm">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                            </Badge>
                            <Badge className={`${PAYMENT_STATUS_COLORS[booking.paymentStatus]} border flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-center text-xs sm:text-sm`}>
                              <BookingStatusIcon status={booking.paymentStatus} className="w-3 h-3" />
                              <span className="text-xs sm:text-sm">{booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</span>
                            </Badge>
                          </div>

                          {/* Actions */}
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="w-full sm:w-auto mt-1 sm:mt-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <span className="text-xs sm:text-sm">Cancel Booking</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleConfirmCancel}
        booking={selectedBooking}
      />
    </div>
  );
}

