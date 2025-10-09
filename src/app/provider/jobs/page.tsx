'use client';

import { useState, useMemo } from 'react';
import { dummyCustomerRequests, CustomerJobRequest } from '@/data/dummyCustomerRequests';
import CustomerJobRequestCard from '@/components/cards/CustomerJobRequest';

export default function ProviderJobs() {
  // State for filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 items per page

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let filtered = [...dummyCustomerRequests];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'budget-high') {
      filtered.sort((a, b) => Number(b.budget) - Number(a.budget));
    } else if (sortBy === 'budget-low') {
      filtered.sort((a, b) => Number(a.budget) - Number(b.budget));
    } else if (sortBy === 'urgent') {
      const urgencyOrder: Record<string, number> = {
        '24 Hours': 1,
        '3 Days': 2,
        '7 Days': 3,
        'Flexible': 4
      };
      filtered.sort((a, b) => 
        (urgencyOrder[a.urgency] || 999) - (urgencyOrder[b.urgency] || 999)
      );
    }

    return filtered;
  }, [statusFilter, searchQuery, sortBy]);

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
  const pendingCount = dummyCustomerRequests.filter(r => r.status === 'pending').length;
  const totalBudget = filteredRequests.reduce((sum, req) => sum + Number(req.budget), 0);
  const avgBudget = filteredRequests.length > 0 ? totalBudget / filteredRequests.length : 0;

  // Handle actions
  const handleAccept = (id: string) => {
    alert(`Accepting job request: ${id}\n\nIn production, this will:\n- Update request status to 'accepted'\n- Create active job\n- Notify customer\n- Add to your active jobs list`);
  };

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this request?')) {
      alert(`Rejecting job request: ${id}\n\nIn production, this will:\n- Update request status to 'rejected'\n- Notify customer\n- Remove from pending list`);
    }
  };

  const handleQuote = (id: string) => {
    alert(`Opening quote modal for request: ${id}\n\nIn production, this will:\n- Open quote/proposal form\n- Allow you to modify price\n- Add custom terms\n- Send to customer for approval`);
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Job Requests</h1>
            <p className="mt-2 text-gray-600">Review and respond to customer service requests</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📬</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
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
                <p className="text-sm font-medium text-gray-500">Total Potential</p>
                <p className="text-3xl font-bold text-green-600">${totalBudget}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Budget</p>
                <p className="text-3xl font-bold text-blue-600">${avgBudget.toFixed(0)}</p>
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="quoted">Quoted</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="urgent">Most Urgent</option>
              <option value="budget-high">Highest Budget</option>
              <option value="budget-low">Lowest Budget</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        {totalItems === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'pending'
                ? 'Try adjusting your filters to see more results.'
                : 'New customer requests will appear here.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentItems.map((request) => (
                <CustomerJobRequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onQuote={handleQuote}
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
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            ? 'bg-blue-600 text-white'
                            : page === '...'
                            ? 'text-gray-500 cursor-default'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
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
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {statusFilter !== 'all' && ` with status: ${statusFilter}`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
