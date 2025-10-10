'use client';

import { ProviderReviewStats } from '@/api/lsm';

interface ReviewStatsProps {
  stats: ProviderReviewStats | null;
}

export default function ReviewStats({ stats }: ReviewStatsProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Select a provider to view statistics</p>
      </div>
    );
  }

  if (stats.totalReviews === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Review Statistics</h3>
        <p className="text-gray-500 text-center py-4">No reviews yet for this provider</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-6 text-xl">Review Statistics</h3>

      {/* Overall Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-900 font-medium mb-1">Total Reviews</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalReviews}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-green-900 font-medium mb-1">Avg Rating</p>
          <div className="flex items-center justify-center gap-1">
            <svg className="w-6 h-6 text-yellow-400 fill-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-3xl font-bold text-green-600">{stats.averageRating}</p>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-sm text-purple-900 font-medium mb-1">Avg Punctuality</p>
          <p className="text-3xl font-bold text-purple-600">{stats.averagePunctuality}</p>
          <p className="text-xs text-purple-700">out of 5</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-sm text-orange-900 font-medium mb-1">Avg Response</p>
          <p className="text-3xl font-bold text-orange-600">{stats.averageResponseTime}</p>
          <p className="text-xs text-orange-700">minutes</p>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm font-medium text-gray-700">{rating}</span>
                <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full transition-all"
                      style={{ width: `${stats.percentages[rating as keyof typeof stats.percentages]}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {stats.percentages[rating as keyof typeof stats.percentages]}%
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 w-12 text-right">
                {stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Provider Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{stats.provider.businessName}</span> • {stats.provider.totalJobs} total jobs completed
        </p>
      </div>
    </div>
  );
}

