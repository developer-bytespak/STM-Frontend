'use client';

import { useState } from 'react';
import { Job } from '@/api/provider';
import { sendJobInvoice, resendJobInvoice, getJobInvoiceDetails } from '@/api/payments';

interface TotalJobsCardProps {
  job: Job;
  onViewDetails: (jobId: number) => void;
  onOpenChat: (chatId: string | null) => void;
}

export default function TotalJobsCard({ job, onViewDetails, onOpenChat }: TotalJobsCardProps) {
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'new':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'received':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSendInvoice = async () => {
    try {
      setIsInvoiceLoading(true);
      setInvoiceMessage(null);
      const response = await sendJobInvoice(job.id);
      setInvoiceMessage({
        type: 'success',
        text: response.alreadyExists ? 'Invoice already sent' : 'Invoice sent successfully!'
      });
      // Clear message after 3 seconds
      setTimeout(() => setInvoiceMessage(null), 3000);
    } catch (error) {
      console.error('Error sending invoice:', error);
      setInvoiceMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send invoice'
      });
    } finally {
      setIsInvoiceLoading(false);
    }
  };

  const handleResendInvoice = async () => {
    try {
      setIsInvoiceLoading(true);
      setInvoiceMessage(null);
      const response = await resendJobInvoice(job.id);
      setInvoiceMessage({
        type: 'success',
        text: response.message || 'Invoice resent successfully!'
      });
      setTimeout(() => setInvoiceMessage(null), 3000);
    } catch (error) {
      console.error('Error resending invoice:', error);
      setInvoiceMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to resend invoice'
      });
    } finally {
      setIsInvoiceLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Validate date logic - completed date should not be before scheduled date
  const isValidDateOrder = () => {
    if (!job.scheduledAt || !job.completedAt) return true;
    const scheduledDate = new Date(job.scheduledAt);
    const completedDate = new Date(job.completedAt);
    return completedDate >= scheduledDate;
  };

  // Get the correct completed date (use scheduled date if completed is before scheduled)
  const getCorrectCompletedDate = () => {
    if (!job.completedAt) return null;
    if (!job.scheduledAt) return job.completedAt;
    
    const scheduledDate = new Date(job.scheduledAt);
    const completedDate = new Date(job.completedAt);
    
    // If completed date is before scheduled date, use scheduled date instead
    if (completedDate < scheduledDate) {
      return job.scheduledAt;
    }
    
    return job.completedAt;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
      {/* Header with Job ID and Status */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {job.service}
          </h3>
          <p className="text-sm text-gray-500">Job #{job.id}</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
            {job.status.replace('_', ' ').toUpperCase()}
          </span>
          {/* Only show payment status for completed jobs */}
          {job.status === 'completed' && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(job.paymentStatus)}`}>
              Payment: {job.paymentStatus.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Content Area - grows to fill available space */}
      <div className="flex-1">
        {/* Job Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Category</p>
            <p className="text-sm font-medium text-gray-900">{job.category}</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Customer</p>
            <p className="text-sm font-medium text-gray-900">{job.customer.name}</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-sm font-bold text-green-600">${job.price.toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Created</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(job.createdAt)}</p>
          </div>
        </div>

        {/* Additional Info - show both Scheduled and Completed consistently */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Scheduled Date</p>
            <p className="text-sm font-medium text-gray-900">
              {job.scheduledAt ? formatDate(job.scheduledAt) : <span className="text-sm text-gray-500">—</span>}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Completed Date</p>
            <p className="text-sm font-medium text-gray-900">
              {getCorrectCompletedDate() ? formatDate(getCorrectCompletedDate()!) : <span className="text-sm text-gray-500">—</span>}
              {!isValidDateOrder() && getCorrectCompletedDate() && (
                <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  ⚠️ Adjusted
                </span>
              )}
            </p>
          </div>

          {/* Customer Contact */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Customer Contact</p>
            <p className="text-sm text-gray-700 flex items-center">
              <span className="mr-2">📞</span>
              {job.customer.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions - always at bottom */}
      <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
        {/* Message Alert */}
        {invoiceMessage && (
          <div className={`p-3 rounded-lg text-sm ${
            invoiceMessage.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {invoiceMessage.text}
          </div>
        )}

        {/* Invoice Buttons - Show for completed jobs */}
        {job.status.toLowerCase() === 'completed' && (
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleSendInvoice}
              disabled={isInvoiceLoading}
              className="px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Generate and send invoice to customer"
            >
              {isInvoiceLoading ? '...' : '📧 Send Invoice'}
            </button>
            <button 
              onClick={handleResendInvoice}
              disabled={isInvoiceLoading}
              className="px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Resend invoice email to customer"
            >
              {isInvoiceLoading ? '...' : '🔄 Resend'}
            </button>
          </div>
        )}

        {/* For paid jobs we intentionally hide the resend button (invoice already finalized) */}

        <button 
          onClick={() => onViewDetails(job.id)}
          className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
        >
          View Details
        </button>
        <button 
          onClick={() => onOpenChat(job.chatId || null)}
          className="w-full px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Open Chat
        </button>
      </div>
    </div>
  );
}
