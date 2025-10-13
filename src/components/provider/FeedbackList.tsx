/**
 * FeedbackList Component
 * Displays list of reviews with filters and pagination
 */

import React from 'react';
import { ReviewsResponse } from '@/api/provider';
import FeedbackCard from './FeedbackCard';

interface FeedbackListProps {
  reviews: ReviewsResponse | null;
  isLoading?: boolean;
  ratingFilter: string;
  sortBy: string;
  onRatingFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange?: (page: number) => void;
  onViewDetails?: (reviewId: number) => void;
}

export default function FeedbackList({
  reviews,
  isLoading,
  ratingFilter,
  sortBy,
  onRatingFilterChange,
  onSortChange,
  onPageChange,
  onViewDetails,
}: FeedbackListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Filters Skeleton */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>

        {/* Cards Skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mb-3"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Rating Filter */}
          <div>
            <label htmlFor="rating-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Rating
            </label>
            <select
              id="rating-filter"
              value={ratingFilter}
              onChange={(e) => onRatingFilterChange(e.target.value)}
              className="block w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="block w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews && reviews.data.length > 0 ? (
        <>
          <div className="space-y-6">
            {reviews.data.map((review) => (
              <FeedbackCard key={review.id} review={review} onViewDetails={onViewDetails} />
            ))}
          </div>

          {/* Pagination */}
          {reviews.pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((reviews.pagination.page - 1) * reviews.pagination.limit) + 1} to{' '}
                  {Math.min(reviews.pagination.page * reviews.pagination.limit, reviews.pagination.total)} of{' '}
                  {reviews.pagination.total} reviews
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onPageChange?.(reviews.pagination.page - 1)}
                    disabled={reviews.pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: reviews.pagination.totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === reviews.pagination.totalPages ||
                          Math.abs(page - reviews.pagination.page) <= 1
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => onPageChange?.(page)}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              page === reviews.pagination.page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>
                  
                  <button
                    onClick={() => onPageChange?.(reviews.pagination.page + 1)}
                    disabled={reviews.pagination.page === reviews.pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">No feedback found</p>
          <p className="text-gray-500">Try adjusting your filters or complete more jobs to receive feedback</p>
        </div>
      )}
    </div>
  );
}

