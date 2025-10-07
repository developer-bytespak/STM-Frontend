'use client';

import { useState } from 'react';
import JobCard from '@/components/cards/JobCard';
import { dummyCompletedJobs } from '@/data/dummyjobdone';

const JOBS_PER_PAGE = 10;

export default function AvailedJobsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const totalJobs = dummyCompletedJobs.length;
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const endIndex = startIndex + JOBS_PER_PAGE;
  const currentJobs = dummyCompletedJobs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b ${
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
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 hover:text-gray-700"
        >
          Next
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-8">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
          <span className="font-medium">{Math.min(endIndex, totalJobs)}</span> of{' '}
          <span className="font-medium">{totalJobs}</span> completed jobs
        </div>
        
        <div className="flex">
          {pages}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Completed Jobs
          </h1>
          <p className="text-gray-600">
            Here are all the services you&apos;ve completed. Leave feedback for your experience!
          </p>
          {totalJobs > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Total: {totalJobs} completed jobs
            </p>
          )}
        </div>
        
        <div className="max-w-4xl mx-auto">
          {totalJobs > 0 ? (
            <>
              <div className="space-y-4">
                {currentJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Completed Jobs Yet
              </h3>
              <p className="text-gray-500">
                When you complete services, they will appear here for feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
