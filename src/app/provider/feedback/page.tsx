'use client';

import React, { useState, useMemo } from 'react';

interface Feedback {
  id: string;
  customerName: string;
  serviceType: string;
  overallRating: number;
  punctualityRating: number;
  responseTimeRating: number;
  comment?: string;
  date: string;
  jobId: string;
}

export default function ProviderFeedback() {
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock feedback data with specific ratings
  const feedbacks: Feedback[] = [
    {
      id: '1',
      customerName: 'John Smith',
      serviceType: 'Plumbing Repair',
      overallRating: 5,
      punctualityRating: 5,
      responseTimeRating: 5,
      comment: 'Excellent work! The plumber was professional, arrived on time, and fixed the issue quickly. Highly recommend!',
      date: '2025-01-15',
      jobId: 'job-001'
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      serviceType: 'Bathroom Remodeling',
      overallRating: 4,
      punctualityRating: 3,
      responseTimeRating: 4,
      comment: 'Great service overall. The work was done well and the team was respectful of our home. Minor delay in completion but worth it.',
      date: '2025-01-14',
      jobId: 'job-002'
    },
    {
      id: '3',
      customerName: 'Mike Rodriguez',
      serviceType: 'Emergency Repair',
      overallRating: 5,
      punctualityRating: 5,
      responseTimeRating: 5,
      comment: 'Saved us from a major disaster! Responded to our emergency call within an hour and fixed everything perfectly. Thank you!',
      date: '2025-01-13',
      jobId: 'job-003'
    },
    {
      id: '4',
      customerName: 'Emily Chen',
      serviceType: 'Drain Cleaning',
      overallRating: 4,
      punctualityRating: 4,
      responseTimeRating: 5,
      comment: 'Professional service and reasonable pricing. The drain is working perfectly now. Would use again.',
      date: '2025-01-12',
      jobId: 'job-004'
    },
    {
      id: '5',
      customerName: 'David Thompson',
      serviceType: 'Water Heater Installation',
      overallRating: 5,
      punctualityRating: 5,
      responseTimeRating: 4,
      comment: 'Outstanding work! The installation was clean, professional, and the new water heater is working great. Excellent communication throughout.',
      date: '2025-01-11',
      jobId: 'job-005'
    },
    {
      id: '6',
      customerName: 'Lisa Martinez',
      serviceType: 'Pipe Inspection',
      overallRating: 3,
      punctualityRating: 2,
      responseTimeRating: 3,
      comment: 'Service was okay. The technician was knowledgeable but took longer than expected. Fair pricing though.',
      date: '2025-01-10',
      jobId: 'job-006'
    },
    {
      id: '7',
      customerName: 'Robert Wilson',
      serviceType: 'Kitchen Sink Repair',
      overallRating: 5,
      punctualityRating: 5,
      responseTimeRating: 5,
      date: '2025-01-09',
      jobId: 'job-007'
    },
    {
      id: '8',
      customerName: 'Jennifer Brown',
      serviceType: 'Bathroom Fixture Installation',
      overallRating: 4,
      punctualityRating: 4,
      responseTimeRating: 4,
      comment: 'Good service overall. The fixtures look great and installation was clean. Slightly over budget but worth it.',
      date: '2025-01-08',
      jobId: 'job-008'
    }
  ];

  // Calculate stats
  const totalFeedbacks = feedbacks.length;
  const averageOverallRating = useMemo(() => {
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.overallRating, 0);
    return (sum / totalFeedbacks).toFixed(1);
  }, [feedbacks, totalFeedbacks]);

  const averagePunctualityRating = useMemo(() => {
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.punctualityRating, 0);
    return (sum / totalFeedbacks).toFixed(1);
  }, [feedbacks, totalFeedbacks]);

  const averageResponseTimeRating = useMemo(() => {
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.responseTimeRating, 0);
    return (sum / totalFeedbacks).toFixed(1);
  }, [feedbacks, totalFeedbacks]);

  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach(feedback => {
      distribution[feedback.overallRating as keyof typeof distribution]++;
    });
    return distribution;
  }, [feedbacks]);

  // Filter and sort feedbacks
  const filteredAndSortedFeedbacks = useMemo(() => {
    let filtered = feedbacks;

    // Filter by rating
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.overallRating === parseInt(ratingFilter));
    }

    // Sort feedbacks
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'highest') {
        return b.overallRating - a.overallRating;
      } else if (sortBy === 'lowest') {
        return a.overallRating - b.overallRating;
      }
      return 0;
    });

    return filtered;
  }, [feedbacks, ratingFilter, sortBy]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 2.5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>
            <p className="mt-2 text-gray-600">View and manage customer reviews and ratings</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-3xl font-bold text-blue-600">{totalFeedbacks}</p>
              </div>
            </div>
          </div>

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
                <p className="text-3xl font-bold text-yellow-600">{averageOverallRating}</p>
              </div>
            </div>
          </div>

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
                <p className="text-3xl font-bold text-green-600">{averagePunctualityRating}</p>
              </div>
            </div>
          </div>

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
                <p className="text-3xl font-bold text-purple-600">{averageResponseTimeRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center">
                <div className="w-8 text-sm font-medium text-gray-600">{rating}★</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / totalFeedbacks) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        

        {/* Feedback List */}
        <div className="space-y-6">
          {filteredAndSortedFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">{feedback.customerName}</h3>
                    <div className="flex items-center">
                      <div className="flex text-lg mr-2">
                        {renderStars(feedback.overallRating)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRatingColor(feedback.overallRating)}`}>
                        {feedback.overallRating}.0
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <span className="font-medium">{feedback.serviceType}</span>
                    <span className="mx-2">•</span>
                    <span>Job #{feedback.jobId}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(feedback.date)}</span>
                  </div>
                </div>
              </div>
              
              {/* Rating Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                    <span className="text-sm font-bold text-blue-600">{feedback.overallRating}.0</span>
                  </div>
                  <div className="flex text-sm">
                    {renderStars(feedback.overallRating)}
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Punctuality</span>
                    <span className="text-sm font-bold text-green-600">{feedback.punctualityRating}.0</span>
                  </div>
                  <div className="flex text-sm">
                    {renderStars(feedback.punctualityRating)}
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Response Time</span>
                    <span className="text-sm font-bold text-purple-600">{feedback.responseTimeRating}.0</span>
                  </div>
                  <div className="flex text-sm">
                    {renderStars(feedback.responseTimeRating)}
                  </div>
                </div>
              </div>
              
              {/* Comment */}
              {feedback.comment && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">&ldquo;{feedback.comment}&rdquo;</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedFeedbacks.length === 0 && (
          <div className="text-center py-12">
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
    </div>
  );
}
