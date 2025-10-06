'use client';

import RatingForm from '@/components/forms/RatingForm';
import { FeedbackFormData } from '@/types/user';

export default function FeedbackPage() {
  const handleFeedbackSubmit = (data: FeedbackFormData) => {
    console.log('Feedback submitted:', data);
    // Here you would typically send the data to your API
    alert('Thank you for your feedback!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Feedback  Form
          </h1>
          <p className="text-gray-600">
            Please share your experience with the service you received
          </p>
        </div>
        
        <RatingForm onSubmit={handleFeedbackSubmit} />
      </div>
    </div>
  );
}
