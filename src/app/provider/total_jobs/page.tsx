'use client';

import React, { useState, useEffect } from 'react';
import { providerApi, JobsResponse, JobDetailsResponse } from '@/api/provider';
import TotalJobsCard from '@/components/provider/TotalJobsCard';

export default function TotalJobsPage() {
  const [jobs, setJobs] = useState<JobsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobDetailsResponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch jobs with filters
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const params: {
          fromDate?: string;
          toDate?: string;
          page: number;
          limit: number;
        } = {
          page: currentPage,
          limit: 6,
        };

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

  // Filter jobs by search query and category (client-side since API doesn't support these filters)
  const filteredJobs = jobs?.data.filter(job =>
    job.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(job =>
    !categoryFilter || job.category.toLowerCase() === categoryFilter.toLowerCase()
  ) || [];

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
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Total Jobs</h1>
            <p className="mt-2 text-gray-600">View and manage all your jobs</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Search by service, customer, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">All Categories</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleaning">Cleaning</option>
                <option value="HVAC">HVAC</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Painting">Painting</option>
                <option value="Flooring">Flooring</option>
                <option value="Electronics">Electronics</option>
                <option value="Security">Security</option>
                <option value="Appliance Repair">Appliance Repair</option>
              </select>
            </div>
            <div>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From Date"
              />
            </div>
            <div>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To Date"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                  setCategoryFilter('');
                  setFromDate('');
                  setToDate('');
                  setSortBy('newest');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
        ) : sortedJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || categoryFilter ? 'No Jobs Found' : 'No Jobs Yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || categoryFilter 
                ? 'Try adjusting your filters to see more results.'
                : 'Your jobs will appear here once you start receiving requests.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedJobs.map((job) => (
                <TotalJobsCard key={job.id} job={job} onViewDetails={handleViewDetails} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="text-gray-400 hover:text-gray-600"
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
                    <p className="font-medium">#{selectedJobDetails.job.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{selectedJobDetails.job.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="font-medium">{selectedJobDetails.job.service}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{selectedJobDetails.job.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium text-green-600">${selectedJobDetails.job.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{selectedJobDetails.job.location}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedJobDetails.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedJobDetails.customer.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{selectedJobDetails.customer.address}</p>
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
                        <p className="font-medium">${selectedJobDetails.payment.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium">{selectedJobDetails.payment.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Method</p>
                        <p className="font-medium">{selectedJobDetails.payment.method || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Marked At</p>
                        <p className="font-medium">{selectedJobDetails.payment.markedAt ? new Date(selectedJobDetails.payment.markedAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Available Actions</h3>
                  <div className="flex gap-3">
                    {selectedJobDetails.actions.canMarkComplete && (
                      <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                        Mark Complete
                      </button>
                    )}
                    {selectedJobDetails.actions.canMarkPayment && (
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Mark Payment
                      </button>
                    )}
                    {selectedJobDetails.chatId && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Open Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

