'use client';

import { useState } from 'react';
import { OfficeBooking } from '@/types/office';
import Badge from '@/components/ui/Badge';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { adminBookingApi } from '@/api/officeBooking';
import { useAlert } from '@/hooks/useAlert';

interface OfficeBookingsListProps {
  bookings: OfficeBooking[];
  title?: string;
  onBookingUpdate?: () => void;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

const PAYMENT_STATUS_COLORS = {
  pending: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function OfficeBookingsList({ bookings, title = 'Recent Bookings', onBookingUpdate }: OfficeBookingsListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'complete';
    bookingId: string;
    bookingName: string;
  }>({
    isOpen: false,
    type: 'confirm',
    bookingId: '',
    bookingName: ''
  });
  const { showAlert } = useAlert();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const openConfirmationModal = (type: 'confirm' | 'complete', bookingId: string, bookingName: string) => {
    setConfirmationModal({
      isOpen: true,
      type,
      bookingId,
      bookingName
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      type: 'confirm',
      bookingId: '',
      bookingName: ''
    });
  };

  const handleConfirmBooking = async () => {
    const { bookingId } = confirmationModal;
    try {
      setLoading(bookingId);
      await adminBookingApi.confirmBooking(bookingId);
      showAlert({
        title: 'Success',
        message: 'Booking confirmed successfully!',
        type: 'success'
      });
      onBookingUpdate?.();
      closeConfirmationModal();
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'Failed to confirm booking. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCompleteBooking = async () => {
    const { bookingId } = confirmationModal;
    try {
      setLoading(bookingId);
      await adminBookingApi.completeBooking(bookingId);
      showAlert({
        title: 'Success',
        message: 'Booking marked as completed!',
        type: 'success'
      });
      onBookingUpdate?.();
      closeConfirmationModal();
    } catch (error: any) {
      console.error('Error completing booking:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'Failed to complete booking. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <Badge className="bg-navy-100 text-navy-800">
            {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Office
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 font-medium">No bookings found</p>
                  </div>
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.providerName}</div>
                      <div className="text-sm text-gray-500">{booking.providerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.officeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(booking.startDate)}</div>
                    <div className="text-xs text-gray-500">to {formatDate(booking.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.duration} {booking.durationType === 'daily' ? 'day' : booking.durationType.replace('ly', '')}
                      {booking.duration > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ${booking.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${STATUS_COLORS[booking.status]} border`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={PAYMENT_STATUS_COLORS[booking.paymentStatus]}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => openConfirmationModal('confirm', booking.id, booking.officeName)}
                          disabled={loading === booking.id}
                          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === booking.id ? 'Confirming...' : 'Confirm'}
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => openConfirmationModal('complete', booking.id, booking.officeName)}
                          disabled={loading === booking.id}
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === booking.id ? 'Completing...' : 'Complete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.type === 'confirm' ? handleConfirmBooking : handleCompleteBooking}
        title={confirmationModal.type === 'confirm' ? 'Confirm Booking' : 'Complete Booking'}
        message={
          confirmationModal.type === 'confirm'
            ? `Are you sure you want to confirm the booking for "${confirmationModal.bookingName}"? This will change the status to confirmed.`
            : `Are you sure you want to mark the booking for "${confirmationModal.bookingName}" as completed? This action cannot be undone.`
        }
        confirmText={confirmationModal.type === 'confirm' ? 'Confirm Booking' : 'Mark Complete'}
        type={confirmationModal.type === 'confirm' ? 'confirm' : 'warning'}
        loading={loading === confirmationModal.bookingId}
      />
    </div>
  );
}

