'use client';

import { useState } from 'react';
import RatingForm from '@/components/forms/RatingForm';
import { FeedbackFormData } from '@/types/user';

interface CompletedJob {
  id: number;
  providerName: string;
  serviceName: string;
  category: string;
  completedDate: string;
  address: string;
  duration: string;
  totalCost: number;
  status: string;
  providerId: number;
}

interface JobCardProps {
  job: CompletedJob;
}

export default function JobCard({ job }: JobCardProps) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleFeedbackSubmit = (data: FeedbackFormData) => {
    const feedbackData = {
      ...data,
      job_id: job.id,
      customer_id: 1, // This would come from auth context
      provider_id: job.providerId,
    };
    
    console.log('Feedback submitted for job:', job.id, feedbackData);
    alert('Thank you for your feedback!');
    setShowFeedbackModal(false);
  };

  const closeModal = () => {
    setShowFeedbackModal(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🧰 {job.providerName}
            </h3>
            <p className="text-gray-600 mb-1">
              🏷️ <span className="font-medium">Service:</span> {job.serviceName}
            </p>
            <p className="text-gray-600 mb-1">
              🧾 <span className="font-medium">Category:</span> {job.category}
            </p>
            <p className="text-gray-600">
              📅 <span className="font-medium">Completed:</span> {job.completedDate}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600 mb-1">
              📍 <span className="font-medium">Location:</span> {job.address}
            </p>
            <p className="text-gray-600 mb-1">
              ⏱️ <span className="font-medium">Duration:</span> {job.duration}
            </p>
            <p className="text-gray-600 mb-1">
              💵 <span className="font-medium">Total Cost:</span> ${job.totalCost}
            </p>
            <p className="text-green-600 font-medium">
              🟢 <span className="font-medium">Status:</span> {job.status}
            </p>
          </div>
        </div>

        {/* Feedback Button */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Give Feedback
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Feedback for {job.providerName}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {/* Job Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Service:</span> {job.serviceName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Completed:</span> {job.completedDate}
                </p>
              </div>
              
              {/* Rating Form */}
              <RatingForm onSubmit={handleFeedbackSubmit} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}