'use client';

import React, { useState, useEffect } from 'react';
import { providerApi, JobsResponse, JobDetailsResponse } from '@/api/provider';
import TotalJobsCard from '@/components/provider/TotalJobsCard';
import { useChat } from '@/contexts/ChatContext';

export default function TotalJobsPage() {
  const { openConversation } = useChat();
  const [jobs, setJobs] = useState<JobsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobDetailsResponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // State for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch jobs function
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: {
        status?: string;
        fromDate?: string;
        toDate?: string;
        page: number;
        limit: number;
      } = {
        page: currentPage,
        limit: 6,
      };

      // Only show completed/paid jobs on total jobs page, exclude in_progress
      params.status = 'completed,paid';

      // Add date filters
      if (fromDate) {
        params.fromDate = fromDate;
      }
      if (toDate) {
        params.toDate = toDate;
      }

      const data = await providerApi.getJobs(params);
      setJobs(data);
      
    } catch (err: unknown) {
      console.error('Error fetching jobs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load jobs';
      setError(errorMessage);
      // Set empty jobs on error
      setJobs({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 6,
          totalPages: 0,
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch jobs with filters
  useEffect(() => {
    fetchJobs();
  }, [currentPage, fromDate, toDate]);

  const handleViewDetails = async (jobId: number) => {
    try {
      const jobDetails = await providerApi.getJobDetails(jobId);
      setSelectedJobDetails(jobDetails);
      setShowDetailsModal(true);
    } catch (err: unknown) {
      console.error('Error fetching job details:', err);
      alert('Failed to load job details');
    }
  };

  const handleOpenChat = (chatId: string | null) => {
    if (!chatId) {
      alert('No chat available for this job. Chat is created when the job is created.');
      return;
    }
    
    // Close modal if open
    setShowDetailsModal(false);
    
    // Open the chat
    openConversation(chatId);
  };

  const handleMarkComplete = async (jobId: number) => {
    try {
      setIsUpdating(true);
      setUpdateMessage(null);
      
      const response = await providerApi.updateJobStatus(jobId, 'MARK_COMPLETE');
      
      setUpdateMessage({ type: 'success', text: response.message });
      
      // Refresh job details
      if (selectedJobDetails) {
        const updatedDetails = await providerApi.getJobDetails(jobId);
        setSelectedJobDetails(updatedDetails);
      }
      
      // Refresh jobs list
      await fetchJobs();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setUpdateMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to mark job complete:', err);
      console.error('Error details:', err);
      
      // Show more detailed error message
      let errorMessage = 'Failed to mark job as complete';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.status) {
        errorMessage = `Server error (${err.status})`;
      }
      
      setUpdateMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkPayment = async (jobId: number) => {
    try {
      setIsUpdating(true);
      setUpdateMessage(null);
      
      // Use default payment details as backend requires them
      const response = await providerApi.updateJobStatus(jobId, 'MARK_PAYMENT', {
        method: 'cash',
        notes: 'Payment received'
      });
      
      setUpdateMessage({ type: 'success', text: response.message });
      
      // Refresh job details
      if (selectedJobDetails) {
        const updatedDetails = await providerApi.getJobDetails(jobId);
        setSelectedJobDetails(updatedDetails);
      }
      
      // Refresh jobs list
      await fetchJobs();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setUpdateMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to mark payment:', err);
      console.error('Error details:', err);
      
      // Show more detailed error message
      let errorMessage = 'Failed to mark payment';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.status) {
        errorMessage = `Server error (${err.status})`;
      }
      
      setUpdateMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter jobs by search query and exclude in_progress jobs (client-side filtering)
  const filteredJobs = jobs?.data.filter(job => {
    // First, exclude in_progress jobs - they should only be on Active Jobs page
    if (job.status.toLowerCase() === 'in_progress') {
      return false;
    }
    
    // Then apply search filter
    return job.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
           job.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           job.category.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  // Sort jobs (client-side)
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest' || sortBy === 'date-desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'oldest' || sortBy === 'date-asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'cost-desc') {
      return b.price - a.price;
    } else if (sortBy === 'cost-asc') {
      return a.price - b.price;
    }
    return 0;
  });

  // Pagination
  const totalPages = jobs?.pagination.totalPages || 0;

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Calculate stats from filtered jobs
  const totalJobs = jobs?.pagination.total || 0;
  const totalEarnings = filteredJobs.reduce((sum, job) => sum + job.price, 0);
  const avgJobValue = filteredJobs.length > 0 ? totalEarnings / filteredJobs.length : 0;

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
              <h1 className="text-3xl font-bold text-gray-900">Total Jobs</h1>
            <p className="mt-2 text-gray-600">View and manage your completed and paid jobs</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">${totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Job Value</p>
                <p className="text-3xl font-bold text-purple-600">${avgJobValue.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

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

        {/* Filter/Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Search by service, customer, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 cursor-pointer"
              />
            </div>
            <div>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 cursor-pointer"
                placeholder="From Date"
              />
            </div>
            <div>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 cursor-pointer"
                placeholder="To Date"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="cost-desc">Highest Earnings</option>
                <option value="cost-asc">Lowest Earnings</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFromDate('');
                  setToDate('');
                  setSortBy('newest');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                
                {/* Job details grid skeleton */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-18"></div>
                  </div>
                </div>
                
                {/* Customer contact skeleton */}
                <div className="pt-4 border-t border-gray-200 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                
                {/* Action buttons skeleton */}
                <div className="pt-4 border-t border-gray-200 flex gap-3">
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No Jobs Found' : 'No Jobs Yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'Try adjusting your search query to see more results.'
                : 'Your completed and paid jobs will appear here once you finish active jobs.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedJobs.map((job) => (
                <TotalJobsCard 
                  key={job.id} 
                  job={job} 
                  onViewDetails={handleViewDetails}
                  onOpenChat={handleOpenChat}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results Info */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {sortedJobs.length} of {totalJobs} jobs
            </div>
          </>
        )}
      </div>

      {/* Job Details Modal */}
      {showDetailsModal && selectedJobDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Job Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Job ID</p>
                    <p className="font-medium text-gray-900">#{selectedJobDetails.job.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium text-gray-900">{selectedJobDetails.job.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="font-medium text-gray-900">{selectedJobDetails.job.service}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{selectedJobDetails.job.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium text-green-600">${selectedJobDetails.job.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{selectedJobDetails.job.location}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{selectedJobDetails.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{selectedJobDetails.customer.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{selectedJobDetails.customer.address}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {selectedJobDetails.payment && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium text-green-600">${selectedJobDetails.payment.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-gray-900">{selectedJobDetails.payment.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Method</p>
                        <p className="font-medium text-gray-900">{selectedJobDetails.payment.method || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Marked At</p>
                        <p className="font-medium text-gray-900">{selectedJobDetails.payment.markedAt ? new Date(selectedJobDetails.payment.markedAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Update Message */}
                {updateMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    updateMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <p className="text-sm font-medium">{updateMessage.text}</p>
                  </div>
                )}

                {/* Actions */}
                {(selectedJobDetails.actions.canMarkComplete || selectedJobDetails.actions.canMarkPayment) && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Available Actions</h3>
                    <div className="flex gap-3">
                      {selectedJobDetails.actions.canMarkComplete && (
                        <button 
                          onClick={() => handleMarkComplete(selectedJobDetails.job.id)}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isUpdating ? 'Updating...' : 'Mark Complete'}
                        </button>
                      )}
                      {selectedJobDetails.actions.canMarkPayment && (
                        <button 
                          onClick={() => handleMarkPayment(selectedJobDetails.job.id)}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isUpdating ? 'Updating...' : 'Mark Payment'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

