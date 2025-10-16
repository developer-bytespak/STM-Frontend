'use client';

import { useState, useEffect } from 'react';
import { lsmApi, JobsInRegionFilters } from '@/api/lsm';
import JobsInRegion from '@/components/lsm/JobsInRegion';
import TableSkeleton from '@/components/ui/TableSkeleton';

export default function JobsInRegionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobsInRegionFilters>({
    page: 1,
    limit: 20,
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [providerIdFilter, setProviderIdFilter] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lsmApi.getJobsInRegion(filters);
      setData(response);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const newFilters: JobsInRegionFilters = {
      page: 1,
      limit: 20,
    };

    if (statusFilter) newFilters.status = statusFilter;
    if (providerIdFilter) newFilters.providerId = parseInt(providerIdFilter);
    if (fromDateFilter) newFilters.fromDate = fromDateFilter;
    if (toDateFilter) newFilters.toDate = toDateFilter;

    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setProviderIdFilter('');
    setFromDateFilter('');
    setToDateFilter('');
    setFilters({ page: 1, limit: 20 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs in Region</h1>
          <p className="text-gray-600">View and manage all jobs in your service region</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Jobs</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected_by_sp">Rejected by SP</option>
              </select>
            </div>

            {/* Provider ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider ID
              </label>
              <input
                type="number"
                value={providerIdFilter}
                onChange={(e) => setProviderIdFilter(e.target.value)}
                placeholder="Enter provider ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-900"
              />
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDateFilter}
                onChange={(e) => setFromDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDateFilter}
                onChange={(e) => setToDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
            <button
              onClick={handleResetFilters}
              disabled={loading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Jobs Component */}
        {data && (
          <JobsInRegion
            jobs={data.data}
            totalJobs={data.summary.totalJobs}
            totalValue={data.summary.totalValue}
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
