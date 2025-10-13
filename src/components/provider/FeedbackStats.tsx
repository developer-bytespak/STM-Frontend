/**
 * FeedbackStats Component
 * Displays provider review statistics and rating breakdown
 */

import React from 'react';
import { ReviewStats } from '@/api/provider';

interface FeedbackStatsProps {
  stats: ReviewStats | null;
  isLoading?: boolean;
}

export default function FeedbackStats({ stats, isLoading }: FeedbackStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating Distribution Skeleton */}
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-8 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2"></div>
                </div>
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { totalReviews, averageRating, averagePunctuality, averageResponseTime, ratingBreakdown, percentages } = stats;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Reviews */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <p className="text-3xl font-bold text-blue-600">{totalReviews}</p>
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall Rating</p>
              <p className="text-3xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Punctuality */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Punctuality</p>
              <p className="text-3xl font-bold text-green-600">{averagePunctuality.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Response Time</p>
              <p className="text-3xl font-bold text-purple-600">{averageResponseTime.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center">
              <div className="w-8 text-sm font-medium text-gray-600">{rating}★</div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentages[rating as keyof typeof percentages]}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-20 text-sm text-gray-600 text-right">
                {ratingBreakdown[rating as keyof typeof ratingBreakdown]} ({percentages[rating as keyof typeof percentages]}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

