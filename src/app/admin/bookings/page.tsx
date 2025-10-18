'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OfficeBooking } from '@/types/office';
import { adminBookingApi } from '@/api/officeBooking';
import OfficeBookingsList from '@/components/admin/OfficeBookingsList';
import { useAlert } from '@/hooks/useAlert';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<OfficeBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const { showAlert } = useAlert();

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminBookingApi.getAllBookings();
        console.log('Admin bookings response:', response);
        setBookings(response.bookings || []);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to load bookings');
        showAlert({
          title: 'Error',
          message: 'Failed to load bookings. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [showAlert]);

  const handleBookingUpdate = () => {
    // Refresh bookings after an update
    const fetchBookings = async () => {
      try {
        const response = await adminBookingApi.getAllBookings();
        setBookings(response.bookings || []);
      } catch (err: any) {
        console.error('Error refreshing bookings:', err);
      }
    };
    fetchBookings();
  };

  const filterBookings = () => {
    if (filter === 'all') return bookings;
    return bookings.filter(booking => booking.status === filter);
  };

  const filteredBookings = filterBookings();

  const getBookingStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
    };
  };

  const stats = getBookingStats();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-navy-600 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading bookings...</p>
          </div>
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
              href="/admin/offices"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to Offices</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Office Bookings Management</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            Manage and approve office space bookings
          </p>
        </div>

        {/* Stats Grid */}
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
              <span className="text-xs sm:text-sm font-semibold text-gray-600">Pending Approval</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-yellow-100 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">Confirmed</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.confirmed}</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">Completed</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 mb-6 sm:mb-8 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="-mb-px flex flex-wrap sm:flex-nowrap space-x-2 sm:space-x-8 px-3 sm:px-6">
              {[
                { key: 'all', label: 'All Bookings', count: stats.total },
                { key: 'pending', label: 'Pending Approval', count: stats.pending },
                { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
                { key: 'completed', label: 'Completed', count: stats.completed },
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
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                    filter === tab.key ? 'bg-navy-100 text-navy-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Bookings List */}
          <div className="p-3 sm:p-6">
            <OfficeBookingsList 
              bookings={filteredBookings} 
              title={`${filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings`}
              onBookingUpdate={handleBookingUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
