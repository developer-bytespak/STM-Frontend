'use client';

import { useState, useMemo } from 'react';
import { dummyCompletedJobs } from '@/data/dummyjobdone';
import Totaljobs from '@/components/cards/Totaljobs';

export default function TotalJobsPage() {
  // TODO: When backend is ready, filter by currentProviderId from auth
  // const currentProviderId = 101; // This will come from auth context
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 items per page

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...dummyCompletedJobs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(job => 
        job.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Sort
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.completedDate).getTime() - new Date(b.completedDate).getTime());
    } else if (sortBy === 'cost-desc') {
      filtered.sort((a, b) => b.totalCost - a.totalCost);
    } else if (sortBy === 'cost-asc') {
      filtered.sort((a, b) => a.totalCost - b.totalCost);
    }

    return filtered;
  }, [searchQuery, categoryFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Calculate stats from filtered jobs
  const totalJobs = filteredJobs.length;
  const totalEarnings = filteredJobs.reduce((sum, job) => sum + job.totalCost, 0);
  const avgJobValue = totalJobs > 0 ? totalEarnings / totalJobs : 0;

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-3xl font-bold text-gray-900">Job History</h1>
            <p className="mt-2 text-gray-600">View all your completed jobs and earnings</p>
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

        {/* Filter/Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by service name, category, or address..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                handleFilterChange();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Sort By</option>
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="cost-desc">Highest Earnings</option>
              <option value="cost-asc">Lowest Earnings</option>
            </select>
          </div>
          
          {/* Active Filters Display */}
          {(searchQuery || categoryFilter) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                  Search: &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => {setSearchQuery(''); handleFilterChange();}} className="hover:text-blue-900">×</button>
                </span>
              )}
              {categoryFilter && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">
                  Category: {categoryFilter}
                  <button onClick={() => {setCategoryFilter(''); handleFilterChange();}} className="hover:text-purple-900">×</button>
                </span>
              )}
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('');
                  handleFilterChange();
                }}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || categoryFilter ? 'No Jobs Found' : 'No Completed Jobs Yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || categoryFilter 
                ? 'Try adjusting your filters to see more results.'
                : 'Your completed jobs will appear here once you finish your first service.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedJobs.map((job) => (
                <Totaljobs key={job.id} job={job} />
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
            </div>
          </>
        )}
      </div>
    </div>
  );
}

