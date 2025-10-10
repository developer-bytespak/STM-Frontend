'use client';

import { ProviderReview } from '@/api/lsm';

interface ReviewCardProps {
  review: ProviderReview;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {renderStars(review.rating)}
            <span className="text-sm font-semibold text-gray-900">{review.rating}.0</span>
          </div>
          <p className="text-sm text-gray-600">by {review.customer.name}</p>
        </div>
        <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
      </div>

      {/* Job Information */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-900">{review.job.service}</p>
        <p className="text-xs text-gray-600">{review.job.category} • ${review.job.price}</p>
        {review.job.completedAt && (
          <p className="text-xs text-gray-500 mt-1">Completed: {formatDate(review.job.completedAt)}</p>
        )}
      </div>

      {/* Feedback */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">{review.feedback}</p>
      </div>

      {/* Additional Ratings */}
      {(review.punctualityRating || review.responseTime) && (
        <div className="pt-4 border-t border-gray-200 flex gap-4 text-xs">
          {review.punctualityRating && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600">Punctuality: {review.punctualityRating}/5</span>
            </div>
          )}
          {review.responseTime && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-gray-600">Response: {review.responseTime} min</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

