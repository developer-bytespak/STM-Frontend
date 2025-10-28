'use client';

import { useState, useMemo, useEffect } from 'react';
import { providerApi, JobDetailsResponse } from '@/api/provider';
import { JobRequestCard } from '@/components/provider';
import { useAuth } from '@/hooks/useAuth';

export default function ProviderJobs() {
  const { user } = useAuth();
  
  // Debug: Log user info
  console.log('🔍 Current user:', user);
  console.log('🔍 User role:', user?.role);
  console.log('🔍 User ID:', user?.id);
  
  // State for data
  const [jobRequests, setJobRequests] = useState<JobDetailsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters - default to 'all' instead of 'new'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 items per page

  const fetchJobRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get pending job requests for current provider
      const pendingJobs = await providerApi.getPendingJobs(statusFilter === 'all' ? undefined : statusFilter);
      console.log('🔍 Fetching jobs with status filter:', statusFilter);
      console.log('🔍 All Jobs from API:', pendingJobs);
      console.log('🔍 Jobs count:', pendingJobs.length);
      
      // Debug: Show all jobs regardless of status for now
      if (pendingJobs.length === 0) {
        console.log('⚠️ No jobs returned from API - this might indicate:');
        console.log('1. Provider has no jobs assigned');
        console.log('2. Authentication issue');
        console.log('3. Backend error');
        console.log('4. Database connection issue');
      }
      
      // Convert simplified jobs to JobDetailsResponse format for consistency
      const requests = pendingJobs.map((job) => ({
        job: {
          id: job.id,
          service: job.service,
          category: job.category,
          status: job.status,
          price: job.price,
          originalAnswers: {}, // Not available in simplified format
          editedAnswers: {}, // Not available in simplified format
          spAccepted: false, // Default value
          pendingApproval: false, // Default value
          location: 'Location not specified', // Not available in simplified format
          description: `${job.service} service request`, // Basic description from service name
          urgency: '', // Not available in simplified format
          dimensions: '', // Not available in simplified format
          additionalDetails: '', // Not available in simplified format
          budget: '', // Not available in simplified format
          preferredDate: job.scheduledAt || null,
          requiresInPersonVisit: false,
          scheduledAt: job.scheduledAt,
          completedAt: job.completedAt,
          createdAt: job.createdAt,
          updatedAt: job.createdAt, // Use createdAt as fallback
          responseDeadline: null,
          paidAt: null
        },
        customer: {
          name: job.customer.name,
          phone: job.customer.phone,
          address: 'Address not specified' // Not available in simplified format
        },
        payment: job.paymentStatus ? {
          amount: job.price,
          method: 'pending',
          status: job.paymentStatus,
          markedAt: null,
          notes: null
        } : null,
        chatId: job.chatId,
        actions: {
          canMarkComplete: job.status === 'in_progress',
          canMarkPayment: job.status === 'completed'
        }
      }));
      
      setJobRequests(requests);
    } catch (err: any) {
      console.error('Failed to fetch job requests:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        response: err.response
      });
      setError(err.message || 'Failed to load customer job requests');
      setJobRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobRequests();
  }, [statusFilter]); // Refetch when status filter changes

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let filtered = [...jobRequests];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.job.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.job.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.job.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.job.createdAt).getTime() - new Date(b.job.createdAt).getTime());
    }

    return filtered;
  }, [jobRequests, statusFilter, searchQuery, sortBy]);

  // Calculate pagination
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, sortBy]);

  // Calculate stats
  const newRequestsCount = jobRequests.filter(r => r.job.status === 'new').length;
  const acceptedCount = jobRequests.filter(r => r.job.status === 'accepted').length;
  const totalRequests = jobRequests.length;

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow rounded-lg mx-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center mb-2">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Job Requests</h1>
            <p className="mt-1 text-gray-600">Review and respond to new customer service requests</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📬</span>
                </div>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-500">New Customer Requests</p>
                <p className="text-3xl font-bold text-yellow-600">{newRequestsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-500">Accepted Jobs</p>
                <p className="text-3xl font-bold text-green-600">{acceptedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-3xl font-bold text-blue-600">{totalRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by customer name, service type, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="accepted">Accepted</option>
              <option value="rejected_by_sp">Rejected</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                
                {/* Customer info skeleton */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
                
                {/* Job details skeleton */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-18"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
                
                {/* Description skeleton */}
                <div className="mb-4">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                
                {/* Action buttons skeleton */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Requests</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchJobRequests}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : totalItems === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'new'
                ? 'Try adjusting your filters to see more results.'
                : 'New customer requests will appear here.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentItems.map((request) => (
                <JobRequestCard
                  key={request.job.id}
                  jobId={request.job.id}
                  onJobUpdated={fetchJobRequests}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && goToPage(page)}
                        disabled={page === '...'}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          page === currentPage
                            ? 'bg-blue-600 text-white cursor-pointer'
                            : page === '...'
                            ? 'text-gray-500 cursor-default'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Results Info for single page */}
            {totalPages === 1 && (
              <div className="mt-6 text-center text-sm text-gray-600">
                Showing {totalItems} request{totalItems !== 1 ? 's' : ''}
                {statusFilter !== 'all' && ` with status: ${statusFilter.replace('_', ' ')}`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
