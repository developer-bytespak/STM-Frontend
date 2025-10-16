'use client';

import { Job } from '@/api/provider';

interface TotalJobsCardProps {
  job: Job;
  onViewDetails: (jobId: number) => void;
}

export default function TotalJobsCard({ job, onViewDetails }: TotalJobsCardProps) {
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
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

      {/* Additional Info */}
      {job.scheduledAt && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Scheduled Date</p>
          <p className="text-sm font-medium text-gray-900">{formatDate(job.scheduledAt)}</p>
        </div>
      )}

      {getCorrectCompletedDate() && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Completed Date</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(getCorrectCompletedDate()!)}
            {!isValidDateOrder() && (
              <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                ⚠️ Adjusted
              </span>
            )}
          </p>
        </div>
      )}

      {/* Customer Contact */}
      <div className="pt-4 border-t border-gray-200 mb-4">
        <p className="text-xs text-gray-500 mb-1">Customer Contact</p>
        <p className="text-sm text-gray-700 flex items-center">
          <span className="mr-2">📞</span>
          {job.customer.phone}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-gray-200 flex gap-3">
        <button 
          onClick={() => onViewDetails(job.id)}
          className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          View Details
        </button>
        
        {job.status === 'completed' && job.paymentStatus === 'pending' && (
          <button className="flex-1 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            Mark Payment
          </button>
        )}
        
        {job.status === 'in_progress' && (
          <button className="flex-1 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
