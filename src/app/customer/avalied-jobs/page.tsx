'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi, CustomerJob } from '@/api/customer';
import Link from 'next/link';
import CardListSkeleton from '@/components/ui/CardListSkeleton';
import { useAlert } from '@/hooks/useAlert';

const JOBS_PER_PAGE = 10;

export default function AvailedJobsPage() {
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<CustomerJob | null>(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    feedback: '',
    punctualityRating: 5,
    responseTime: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCompletedJobs();
  }, []);

  const fetchCompletedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const allJobs = await customerApi.getJobs();
      // Filter for completed and paid jobs - include various possible status values
      const completedJobs = allJobs.filter(job => 
        job.status === 'completed' || 
        job.status === 'paid' || 
        job.status === 'completed_and_paid' ||
        job.status === 'done' ||
        job.completed_at !== null // Also include jobs that have a completed_at date
      );
      setJobs(completedJobs);
    } catch (err: any) {
      console.error('Error fetching completed jobs:', err);
      setError(err.message || 'Failed to load completed jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedJob) return;

    if (!feedbackData.feedback.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Please provide feedback comments',
        type: 'warning'
      });
      return;
    }

    try {
      setSubmitting(true);
      await customerApi.submitFeedback(selectedJob.id, {
        rating: feedbackData.rating,
        feedback: feedbackData.feedback,
        punctualityRating: feedbackData.punctualityRating,
        responseTime: feedbackData.responseTime > 0 ? feedbackData.responseTime : undefined,
      });

      showAlert({
        title: 'Success',
        message: 'Feedback submitted successfully!',
        type: 'success'
      });
      setSelectedJob(null);
      setFeedbackData({ rating: 5, feedback: '', punctualityRating: 5, responseTime: 0 });
      
      // Refresh jobs list
      fetchCompletedJobs();
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

  // Calculate pagination
  const totalJobs = jobs.length;
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const endIndex = startIndex + JOBS_PER_PAGE;
  const currentJobs = jobs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 cursor-pointer"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b cursor-pointer ${
            i === currentPage
              ? 'text-blue-600 bg-blue-50 border-blue-300'
              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 hover:text-gray-700 cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
        </button>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 gap-4">
        <div className="text-sm text-gray-700 text-center sm:text-left">
          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
          <span className="font-medium">{Math.min(endIndex, totalJobs)}</span> of{' '}
          <span className="font-medium">{totalJobs}</span> completed jobs
        </div>
        
        <div className="flex flex-wrap justify-center sm:justify-end gap-1">
          {pages}
        </div>
      </div>
    );
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
            <p className="font-semibold">Error Loading Jobs</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchCompletedJobs}
              className="mt-3 text-sm text-red-600 hover:text-red-800 underline cursor-pointer transition-colors"
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
          <Link href="/customer/dashboard" className="text-navy-600 hover:text-navy-700 text-sm inline-flex items-center gap-1 cursor-pointer transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Completed Jobs
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Here are all the services you&apos;ve completed. Leave feedback for your experience!
          </p>
          {totalJobs > 0 && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Total: {totalJobs} completed job{totalJobs !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {/* Jobs List */}
        <div className="max-w-4xl mx-auto">
          {totalJobs > 0 ? (
            <>
              <div className="space-y-4">
                {currentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.service.name}</h3>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Provider: <span className="font-medium">{job.provider.businessName}</span>
                          </p>
                          {job.provider.rating && (
                            <p className="text-sm text-gray-600">
                              Rating: ⭐ {job.provider.rating}/5
                            </p>
                          )}
                          {job.completed_at && (
                            <p className="text-xs text-gray-500">
                              Completed on {new Date(job.completed_at).toLocaleDateString()} at {new Date(job.completed_at).toLocaleTimeString()}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            Location: {job.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-col gap-2 sm:ml-4 w-full sm:w-auto">
                        <button
                          onClick={() => router.push(`/customer/bookings/${job.id}`)}
                          className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm cursor-pointer w-full sm:w-auto"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setFeedbackData({ rating: 5, feedback: '', punctualityRating: 5, responseTime: 0 });
                          }}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm cursor-pointer w-full sm:w-auto"
                        >
                          Leave Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination()}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
              <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📋</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                No Completed Jobs Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">
                When you complete services, they will appear here for feedback.
              </p>
            <button
              onClick={() => router.push('/customer/bookings')}
              className="text-navy-600 hover:text-navy-700 font-medium cursor-pointer transition-colors text-sm sm:text-base"
            >
              View Your Bookings →
            </button>
            </div>
          )}
        </div>

        {/* Feedback Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Leave Feedback</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{selectedJob.service.name} - {selectedJob.provider.businessName}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Job Summary */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Service:</span> {selectedJob.service.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Provider:</span> {selectedJob.provider.businessName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Completed:</span> {selectedJob.completed_at ? new Date(selectedJob.completed_at).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Location:</span> {selectedJob.location}
                  </p>
                </div>

                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Overall Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                        className="text-3xl sm:text-4xl transition-transform hover:scale-110 cursor-pointer"
                      >
                        {star <= feedbackData.rating ? '⭐' : '☆'}
                      </button>
                    ))}
                    <span className="ml-2 sm:ml-3 text-base sm:text-lg font-semibold text-gray-700 self-center">
                      {feedbackData.rating}/5
                    </span>
                  </div>
                </div>

                {/* Punctuality Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Punctuality Rating <span className="text-gray-400">(Optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">How punctual was the provider?</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackData({ ...feedbackData, punctualityRating: star })}
                        className="text-2xl sm:text-3xl transition-transform hover:scale-110 cursor-pointer"
                      >
                        {star <= feedbackData.punctualityRating ? '⭐' : '☆'}
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600 self-center">
                      {feedbackData.punctualityRating} / 5
                    </span>
                  </div>
                </div>

                {/* Response Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Response Time <span className="text-gray-400">(Optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">How long did it take for the provider to respond?</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <input
                      type="number"
                      value={feedbackData.responseTime}
                      onChange={(e) => setFeedbackData({ ...feedbackData, responseTime: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent cursor-pointer text-gray-900 placeholder:text-gray-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-600">minutes</span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Share your experience
                  </label>
                  <textarea
                    value={feedbackData.feedback}
                    onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                    rows={6}
                    maxLength={1000}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="Tell us about your experience with this service provider..."
                  />
                  <p className="text-sm text-gray-500 mt-1 text-right">{feedbackData.feedback.length}/1000</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                  <button
                    onClick={() => setSelectedJob(null)}
                    disabled={submitting}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Modal */}
        <AlertComponent />
      </div>
    </div>
  );
}
