'use client';

import React, { useState, useEffect } from 'react';
import { providerApi, ReviewsResponse, ReviewStats } from '@/api/provider';
import { FeedbackStats, FeedbackList } from '@/components/provider';

export default function ProviderFeedback() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch review stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        setError(null);
        const data = await providerApi.getReviewStats();
        setStats(data);
      } catch (err: unknown) {
        console.error('Error fetching review stats:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load review statistics';
        setError(errorMessage);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch reviews with filters
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true);
        setError(null);
        
        const params: {
          page: number;
          limit: number;
          minRating?: number;
          maxRating?: number;
        } = {
          page: currentPage,
          limit: 10,
        };

        // Add rating filter if not 'all'
        if (ratingFilter !== 'all') {
          const rating = parseInt(ratingFilter);
          params.minRating = rating;
          params.maxRating = rating;
        }

        const data = await providerApi.getReviews(params);
        
        // Sort reviews on client side since API returns them sorted by date
        if (data && data.data) {
          const sortedData = { ...data };
          sortedData.data = [...data.data].sort((a, b) => {
            if (sortBy === 'newest') {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === 'oldest') {
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortBy === 'highest') {
              return b.rating - a.rating;
            } else if (sortBy === 'lowest') {
              return a.rating - b.rating;
            }
            return 0;
          });
          setReviews(sortedData);
        } else {
          setReviews(data);
        }
      } catch (err: unknown) {
        console.error('Error fetching reviews:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews';
        setError(errorMessage);
        // Set empty reviews on error
        setReviews({
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          }
        });
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [ratingFilter, sortBy, currentPage]);

  const handleRatingFilterChange = (filter: string) => {
    setRatingFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = async (reviewId: number) => {
    try {
      const reviewDetail = await providerApi.getReviewById(reviewId);
      // TODO: Show review detail in a modal or navigate to detail page
      console.log('Review details:', reviewDetail);
      alert(`Review Details:\nRating: ${reviewDetail.rating}\nFeedback: ${reviewDetail.feedback}\nJob Price: $${reviewDetail.job.price}`);
    } catch (err: unknown) {
      console.error('Error fetching review details:', err);
      alert('Failed to load review details');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center mb-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>
            <p className="mt-2 text-gray-600">View and manage customer reviews and ratings</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="mb-8">
          <FeedbackStats stats={stats} isLoading={isLoadingStats} />
        </div>

        {/* Reviews List Section */}
        <FeedbackList
          reviews={reviews}
          isLoading={isLoadingReviews}
          ratingFilter={ratingFilter}
          sortBy={sortBy}
          onRatingFilterChange={handleRatingFilterChange}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
}
