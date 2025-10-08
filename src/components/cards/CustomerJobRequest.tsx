'use client';

import { useState } from 'react';
import { CustomerJobRequest } from '@/data/dummyCustomerRequests';
import BookingModal from '@/components/booking/BookingModal';
import { BookingFormData } from '@/contexts/ChatContext';

interface CustomerJobRequestProps {
  request: CustomerJobRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onQuote?: (id: string) => void;
}

export default function CustomerJobRequestCard({ 
  request, 
  onAccept, 
  onReject,
  onQuote 
}: CustomerJobRequestProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'quoted': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    if (urgency.includes('24')) return 'text-red-600 bg-red-50';
    if (urgency.includes('3')) return 'text-orange-600 bg-orange-50';
    if (urgency.includes('7')) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Convert customer request to BookingFormData for the modal
  const getBookingFormData = (): BookingFormData => ({
    serviceType: request.serviceType,
    description: request.description,
    dimensions: request.dimensions || '',
    budget: request.budget,
    preferredDate: request.preferredDate || '',
    urgency: request.urgency,
    additionalDetails: request.additionalDetails || ''
  });

  const handleQuoteClick = () => {
    setIsQuoteModalOpen(true);
  };

  const handleQuoteSubmit = () => {
    // Close modal and trigger callback
    setIsQuoteModalOpen(false);
    onQuote?.(request.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {request.serviceType}
            </h3>
            <p className="text-sm text-gray-500">Request #{request.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
            {request.status.toUpperCase()}
          </span>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">
              {request.customerName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{request.customerName}</p>
            <p className="text-xs text-gray-500">{request.customerEmail}</p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">💰</span>
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="font-bold text-green-600">${request.budget}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">⏰</span>
            <div>
              <p className="text-xs text-gray-500">Urgency</p>
              <p className={`text-xs font-semibold px-2 py-1 rounded ${getUrgencyColor(request.urgency)}`}>
                {request.urgency}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description Preview */}
      <div className="p-6 bg-gray-50">
        <p className="text-sm text-gray-700 line-clamp-3 mb-2">
          {request.description}
        </p>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 text-sm font-medium hover:text-blue-700"
        >
          {showDetails ? '▼ Hide Details' : '▶ View Full Details'}
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="p-6 border-t border-gray-200 bg-white space-y-4">
          {/* Full Description */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">DESCRIPTION</p>
            <p className="text-sm text-gray-700">{request.description}</p>
          </div>

          {/* Dimensions */}
          {request.dimensions && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">DIMENSIONS/SCOPE</p>
              <p className="text-sm text-gray-700">{request.dimensions}</p>
            </div>
          )}

          {/* Preferred Date */}
          {request.preferredDate && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">PREFERRED DATE</p>
              <p className="text-sm text-gray-700">
                {new Date(request.preferredDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Additional Details */}
          {request.additionalDetails && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">ADDITIONAL DETAILS</p>
              <p className="text-sm text-gray-700">{request.additionalDetails}</p>
            </div>
          )}

          {/* Location */}
          {request.location && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">LOCATION</p>
              <p className="text-sm text-gray-700 flex items-center">
                <span className="mr-2">📍</span>
                {request.location}
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">EMAIL</p>
              <p className="text-sm text-gray-700">{request.customerEmail}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">PHONE</p>
              <p className="text-sm text-gray-700">{request.customerPhone}</p>
            </div>
          </div>

          {/* Submitted Time */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">SUBMITTED</p>
            <p className="text-sm text-gray-700">{formatDate(request.createdAt)}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {request.status === 'pending' && (
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => onAccept?.(request.id)}
            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            ✅ Accept Job
          </button>
          <button
            onClick={handleQuoteClick}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            💬 Send Quote
          </button>
          <button
            onClick={() => onReject?.(request.id)}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            ❌
          </button>
        </div>
      )}

      {/* Quote Modal */}
      <BookingModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        providerId={request.providerId}
        providerName={request.providerName}
        serviceType={request.serviceType}
        mode="sp-quote"
        initialData={getBookingFormData()}
        customerName={request.customerName}
      />
    </div>
  );
}

