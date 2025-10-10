'use client';

import { useState, useEffect } from 'react';
import { lsmApi, ProviderInRegion, ProviderReview, ProviderReviewStats, ReviewFilters } from '@/api/lsm';
import { ReviewCard, ReviewStats } from '@/components/lsm/reviews';

export default function LSMFeedback() {
  const [providers, setProviders] = useState<ProviderInRegion[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [stats, setStats] = useState<ProviderReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Fetch all active providers on mount
  useEffect(() => {
    fetchProviders();
  }, []);

  // Fetch reviews when provider is selected
  useEffect(() => {
    if (selectedProviderId) {
      fetchReviews();
      fetchStats();
    }
  }, [selectedProviderId, ratingFilter, pagination.page]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lsmApi.getProvidersInRegion('active');
      setProviders(response.providers);
      
      // Auto-select first provider if available
      if (response.providers.length > 0 && !selectedProviderId) {
        setSelectedProviderId(response.providers[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching providers:', err);
      setError(err.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!selectedProviderId) return;

    try {
      setReviewsLoading(true);
      const filters: ReviewFilters = {
        page: pagination.page,
        limit: 10,
      };

      // Apply rating filter
      if (ratingFilter !== 'all') {
        const rating = parseInt(ratingFilter);
        filters.minRating = rating;
        filters.maxRating = rating;
      }

      const response = await lsmApi.getProviderReviews(selectedProviderId, filters);
      setReviews(response.data);
      setPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
      });
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedProviderId) return;

    try {
      const response = await lsmApi.getProviderReviewStats(selectedProviderId);
      setStats(response);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleProviderChange = (providerId: number) => {
    setSelectedProviderId(providerId);
    setPagination({ page: 1, totalPages: 1, total: 0 });
    setRatingFilter('all');
  };

  const handleRatingFilterChange = (rating: string) => {
    setRatingFilter(rating);
    setPagination({ page: 1, totalPages: 1, total: 0 });
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading providers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && providers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
              <button
                onClick={fetchProviders}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Feedback & Reviews</h1>
          <p className="text-gray-600">
            Monitor and analyze customer feedback for service providers
          </p>
        </div>

        {/* Provider Selection & Filters */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Provider
                </label>
                <select
                  value={selectedProviderId || ''}
                  onChange={(e) => handleProviderChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Choose a provider...</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.businessName} ({provider.rating.toFixed(1)} ★ • {provider.jobCount} jobs)
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Rating
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => handleRatingFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  disabled={!selectedProviderId}
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {providers.length === 0 ? (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Providers</h3>
                <p className="text-gray-600">
                  There are no active providers in your region yet.
                </p>
              </div>
            </div>
          </div>
        ) : selectedProviderId ? (
          <div className="max-w-6xl mx-auto">
            {/* Statistics Section */}
            <div className="mb-6">
              <ReviewStats stats={stats} />
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Customer Reviews ({pagination.total})
                </h2>
                <button
                  onClick={() => {
                    fetchReviews();
                    fetchStats();
                  }}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="inline-block">↻</span> Refresh
                </button>
              </div>

              {reviewsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">
                    {ratingFilter !== 'all' 
                      ? `No ${ratingFilter}-star reviews found for this provider.`
                      : 'No reviews yet for this provider.'
                    }
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-6 bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">Please select a provider to view reviews</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}