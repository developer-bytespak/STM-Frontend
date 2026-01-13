'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { customerApi, CustomerJob } from '@/api/customer';
import { useChat } from '@/contexts/ChatContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { useAlert } from '@/hooks/useAlert';

const JOBS_PER_PAGE = 10;

export default function CustomerBookings() {
  const { openConversationByJobId, createConversationFromAI } = useChat();
  const { showAlert, AlertComponent } = useAlert();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerApi.getJobs();
        setJobs(data);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError(err.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Read status filter from query params
  useEffect(() => {
    const status = searchParams?.get('status');
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchParams]);

  const handleOpenChat = async (jobId: number) => {
    try {
      // First, try to open existing conversation
      const chatOpened = openConversationByJobId(jobId);
      if (chatOpened) {
        return;
      }

      // If no existing conversation, fetch job details to get chatId
      console.log('Fetching job details for chatId...');
      const jobDetails = await customerApi.getJobDetails(jobId);
      
      if (!jobDetails.chatId) {
        showAlert({
          title: 'Chat Unavailable',
          message: 'Chat is not available for this booking. Please contact support if you need assistance.',
          type: 'info'
        });
        return;
      }

      // Create conversation with the chatId from backend
      createConversationFromAI(
        jobDetails.provider.id,
        jobDetails.provider.businessName,
        jobDetails.chatId.toString()
      );
    } catch (error: any) {
      console.error('Error opening chat:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'Failed to open chat. Please try again.',
        type: 'error'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      'new': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'New' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'in_progress': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'In Progress' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      'disputed': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Disputed' },
    };

    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Filter jobs by status if query parameter is set
  const filteredJobs = filterStatus 
    ? jobs.filter(job => job.status.toLowerCase() === filterStatus.toLowerCase())
    : jobs;

  // Calculate pagination
  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const endIndex = startIndex + JOBS_PER_PAGE;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

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
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-all duration-200 flex items-center gap-2"
          title="Go to previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`min-w-10 h-10 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
            i === currentPage
              ? 'bg-navy-600 text-white border border-navy-600 shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400'
          }`}
          title={`Go to page ${i}`}
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
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-all duration-200 flex items-center gap-2"
          title="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      );
    }

    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            <span className="font-semibold text-gray-900">Showing</span> <span className="font-bold text-navy-600">{startIndex + 1}</span>{' '}
            <span className="font-semibold text-gray-900">to</span> <span className="font-bold text-navy-600">{Math.min(endIndex, totalJobs)}</span>{' '}
            <span className="font-semibold text-gray-900">of</span> <span className="font-bold text-navy-600">{totalJobs}</span>{' '}
            <span className="font-semibold text-gray-900">bookings</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            {pages}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
          <p className="font-semibold">Error Loading Bookings</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/customer/dashboard" className="text-navy-600 hover:text-navy-700 text-sm mb-2 inline-flex items-center gap-1">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-600">View and manage your service requests</p>
              {filterStatus && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-xs text-gray-600">Filtered:</span>
                  <span className="text-xs font-semibold text-blue-700">{filterStatus.replace('_', ' ').toUpperCase()}</span>
                  <Link 
                    href="/customer/bookings"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-2"
                  >
                    ✕ Clear
                  </Link>
                </div>
              )}
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
          >
            + New Booking
          </Link>
        </div>
      </div>

      {/* Summary */}
      {jobs.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {jobs.length} booking{jobs.length !== 1 ? 's' : ''} total
            </span>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">No bookings yet</p>
            <Link
              href="/"
              className="text-navy-600 hover:text-navy-700 font-medium"
            >
              Find a service provider →
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {currentJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.service.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Provider: <span className="font-medium">{job.provider.businessName}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Location: {job.location}
                      </p>
                      {job.scheduled_at && (
                        <p className="text-sm text-gray-600 mb-1">
                          Scheduled: {new Date(job.scheduled_at).toLocaleDateString()} at {new Date(job.scheduled_at).toLocaleTimeString()}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Created: {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex flex-col gap-2">
                      <Link
                        href={`/customer/bookings/${job.id}`}
                        className="inline-block text-sm text-navy-600 hover:text-navy-700 font-medium"
                      >
                        View Details →
                      </Link>
                      <button
                        onClick={() => handleOpenChat(job.id)}
                        className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Open Chat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* Alert Modal */}
      <AlertComponent />
    </div>
  );
}
