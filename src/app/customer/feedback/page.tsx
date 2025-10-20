'use client';

import { useState, useEffect } from 'react';
import { customerApi } from '@/api/customer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CardListSkeleton from '@/components/ui/CardListSkeleton';
import { useAlert } from '@/hooks/useAlert';

type PendingJob = {
  jobId: number;
  service: string;
  provider: string;
  completedAt: string;
  amount: number;
};

export default function FeedbackPage() {
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PendingJob | null>(null);
  const [feedback, setFeedback] = useState({
    rating: 5,
    feedback: '',
    punctualityRating: 5,
    responseTime: 0,
  });
  const [feedbackErrors, setFeedbackErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPendingFeedback();
  }, []);

  const fetchPendingFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerApi.getPendingFeedback();
      setPendingJobs(data.jobs);
      setPendingCount(data.pendingCount);
    } catch (err: any) {
      console.error('Error fetching pending feedback:', err);
      setError(err.message || 'Failed to load pending feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = (job: PendingJob) => {
    setSelectedJob(job);
    setFeedback({
      rating: 5,
      feedback: '',
      punctualityRating: 5,
      responseTime: 0,
    });
    setFeedbackErrors({});
  };

  const validateFeedback = (): boolean => {
    const errors: Record<string, string> = {};

    if (feedback.rating < 1 || feedback.rating > 5) {
      errors.rating = 'Please select a rating between 1 and 5';
    }

    if (!feedback.feedback.trim()) {
      errors.feedback = 'Please provide feedback comments';
    } else if (feedback.feedback.trim().length < 10) {
      errors.feedback = 'Please provide more detailed feedback (at least 10 characters)';
    }

    setFeedbackErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJob) return;

    if (!validateFeedback()) return;

    try {
      setSubmitting(true);
      await customerApi.submitFeedback(selectedJob.jobId, {
        rating: feedback.rating,
        feedback: feedback.feedback,
        punctualityRating: feedback.punctualityRating,
        responseTime: feedback.responseTime > 0 ? feedback.responseTime : undefined,
      });

      showAlert({
        title: 'Success',
        message: 'Feedback submitted successfully! Thank you for your review.',
        type: 'success'
      });
      
      // Close modal and refresh list
      setSelectedJob(null);
      setFeedback({ rating: 5, feedback: '', punctualityRating: 5, responseTime: 0 });
      fetchPendingFeedback();
    } catch (err: any) {
      console.error('Failed to submit feedback:', err);
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to submit feedback. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <CardListSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
            <p className="font-semibold">Error Loading Feedback</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchPendingFeedback}
              className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back to Dashboard */}
        <div className="max-w-4xl mx-auto mb-4">
          <Link href="/customer/dashboard" className="text-navy-600 hover:text-navy-700 text-sm inline-flex items-center gap-1">
            ← Back to Dashboard
          </Link>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Feedback & Reviews
          </h1>
          <p className="text-gray-600">
            Share your experience with completed services
          </p>
          {pendingCount > 0 && (
            <p className="text-sm text-navy-600 mt-2 font-medium">
              You have {pendingCount} job{pendingCount !== 1 ? 's' : ''} pending feedback
            </p>
          )}
        </div>

        {/* Jobs List */}
        <div className="max-w-4xl mx-auto">
          {pendingJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-600 mb-4">
                You have no pending feedback at this time.
              </p>
              <button
                onClick={() => router.push('/customer/bookings')}
                className="text-navy-600 hover:text-navy-700 font-medium"
              >
                View Your Bookings →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.service}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 w-fit">
                          Completed
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Provider: <span className="font-medium">{job.provider}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Completed on {new Date(job.completedAt).toLocaleDateString()} at {new Date(job.completedAt).toLocaleTimeString()}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-2">
                        Service Cost: ${job.amount}
                      </p>
                    </div>
                    <div className="flex justify-end sm:ml-4 sm:justify-start">
                      <button
                        onClick={() => handleSelectJob(job)}
                        className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium cursor-pointer w-full sm:w-auto"
                      >
                        Leave Feedback
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Leave Feedback</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedJob.service} - {selectedJob.provider}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmitFeedback} className="p-6 space-y-6">
                {/* Job Summary */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Service:</span> {selectedJob.service}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Provider:</span> {selectedJob.provider}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Completed:</span> {new Date(selectedJob.completedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Cost:</span> ${selectedJob.amount}
          </p>
        </div>
        
                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Overall Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, rating: star })}
                        className="text-4xl transition-transform hover:scale-110"
                      >
                        {star <= feedback.rating ? '⭐' : '☆'}
                      </button>
                    ))}
                    <span className="ml-3 text-lg font-semibold text-gray-700 self-center">
                      {feedback.rating}/5
                    </span>
                  </div>
                  {feedbackErrors.rating && (
                    <p className="text-sm text-red-500 mt-1">{feedbackErrors.rating}</p>
                  )}
                </div>

                {/* Punctuality Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Punctuality Rating <span className="text-gray-400">(Optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">How punctual was the provider?</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, punctualityRating: star })}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        {star <= feedback.punctualityRating ? '⭐' : '☆'}
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600 self-center">
                      {feedback.punctualityRating} / 5
                    </span>
                  </div>
                </div>

                {/* Response Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Response Time <span className="text-gray-400">(Optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">How long did it take for the provider to respond?</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={feedback.responseTime}
                      onChange={(e) => setFeedback({ ...feedback, responseTime: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-600">minutes</span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Share your experience <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={feedback.feedback}
                    onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })}
                    rows={6}
                    maxLength={1000}
                    className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                      feedbackErrors.feedback ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tell us about your experience with this service provider. What did they do well? What could be improved?"
                  />
                  <div className="flex justify-between items-center mt-1">
                    {feedbackErrors.feedback && (
                      <p className="text-sm text-red-500">{feedbackErrors.feedback}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">{feedback.feedback.length}/1000</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    disabled={submitting}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-sm text-gray-600 text-center">
                  Your feedback helps other customers make informed decisions and helps service providers improve their services.
                </p>
              </form>
            </div>
          </div>
        )}

        {/* Alert Modal */}
        <AlertComponent />
      </div>
    </div>
  );
}
