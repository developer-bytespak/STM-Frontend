'use client';

import { useState } from 'react';
import { FeedbackFormData } from '@/types/user';

interface RatingFormProps {
  onSubmit: (data: FeedbackFormData) => void;
}

export default function RatingForm({ onSubmit }: RatingFormProps) {
  const [ratings, setRatings] = useState({
    rating: 0,
    punctuality_rating: 0,
    response_time: 0,
  });
  const [feedback, setFeedback] = useState('');

  const handleStarClick = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      rating: ratings.rating,
      punctuality_rating: ratings.punctuality_rating,
      response_time: ratings.response_time,
      feedback: feedback || undefined,
    });
  };

  const StarRating = ({ 
    category, 
    label, 
    value 
  }: { 
    category: keyof typeof ratings; 
    label: string; 
    value: number; 
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(category, star)}
            className={`text-2xl transition-colors ${
              star <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Rate Your Experience
      </h2>
      
      <form onSubmit={handleSubmit}>
        <StarRating 
          category="rating" 
          label="Overall Rating" 
          value={ratings.rating} 
        />
        
        <StarRating 
          category="punctuality_rating" 
          label="Punctuality Rating" 
          value={ratings.punctuality_rating} 
        />
        
        <StarRating 
          category="response_time" 
          label="Response Time Rating" 
          value={ratings.response_time} 
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Feedback (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share any additional comments about your experience..."
          />
        </div>

        <button
          type="submit"
          disabled={ratings.rating === 0 || ratings.punctuality_rating === 0 || ratings.response_time === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}