/**
 * FeedbackCard Component
 * Displays individual review/feedback card
 */

import React from 'react';
import { Review } from '@/api/provider';

interface FeedbackCardProps {
  review: Review;
  onViewDetails?: (reviewId: number) => void;
}

export default function FeedbackCard({ review, onViewDetails }: FeedbackCardProps) {
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
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mr-3">{review.customer.name}</h3>
            <div className="flex items-center">
              <div className="flex text-lg mr-2">
                {renderStars(review.rating)}
              </div>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRatingColor(review.rating)}`}>
                {review.rating}.0
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="font-medium">{review.job.service}</span>
            <span className="mx-2">•</span>
            <span>{review.job.category}</span>
            <span className="mx-2">•</span>
            <span>Job #{review.job.id}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>
      
      {/* Rating Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Overall Rating</span>
            <span className="text-sm font-bold text-blue-600">{review.rating}.0</span>
          </div>
          <div className="flex text-sm">
            {renderStars(review.rating)}
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Punctuality</span>
            <span className="text-sm font-bold text-green-600">{review.punctualityRating}.0</span>
          </div>
          <div className="flex text-sm">
            {renderStars(review.punctualityRating)}
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Response Time</span>
            <span className="text-sm font-bold text-purple-600">{review.responseTime}.0</span>
          </div>
          <div className="flex text-sm">
            {renderStars(review.responseTime)}
          </div>
        </div>
      </div>
      
      {/* Comment */}
      {review.feedback && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">&ldquo;{review.feedback}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

