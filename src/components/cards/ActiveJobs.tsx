'use client';

import React from 'react';
import Link from 'next/link';
  import { dummyActiveJobs, ActiveJob } from '@/data/dummyActiveJobs';

interface ActiveJobsProps {
  maxItems?: number;
  showViewAll?: boolean;
}

export default function ActiveJobs({ maxItems = 3, showViewAll = true }: ActiveJobsProps) {
  // Get active jobs (excluding completed and cancelled)
  const activeJobs = dummyActiveJobs
    .filter(job => !['completed', 'cancelled'].includes(job.status))
    .slice(0, maxItems);

  const totalActiveJobs = dummyActiveJobs.filter(job => 
    !['completed', 'cancelled'].includes(job.status)
  ).length;

  const getStatusColor = (status: ActiveJob['status']) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ActiveJob['status']) => {
    switch (status) {
      case 'active':
        return '🔴';
      case 'in_progress':
        return '🔄';
      case 'scheduled':
        return '📅';
      case 'pending':
        return '⏳';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
        {showViewAll && (
          <Link
            href="/provider/activejobs"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All ({totalActiveJobs})
          </Link>
        )}
      </div>

      {activeJobs.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-gray-600 text-sm">No active jobs</p>
          <p className="text-gray-500 text-xs">New jobs will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeJobs.map((job) => (
            <div key={job.id} className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {job.serviceType}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {job.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                    <span className="flex items-center">
                      <span className="text-purple-600 mr-1">👤</span>
                      {job.customerName}
                    </span>
                    <span className="flex items-center">
                      <span className="text-red-600 mr-1">📍</span>
                      {job.location.split(',')[0]}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex flex-col items-end">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)} mb-1`}>
                    <span className="mr-1">{getStatusIcon(job.status)}</span>
                    {job.status.replace('_', ' ')}
                  </span>
                  {job.urgency === '24 Hours' && (
                    <span className="text-red-600 font-semibold text-xs flex items-center">
                      🚨 URGENT
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <span className="flex items-center">
                  <span className="text-yellow-600 mr-1">💰</span>
                  ${job.budget}
                </span>
                <span className="flex items-center">
                  <span className="text-purple-600 mr-1">⏱️</span>
                  {job.estimatedDuration}
                </span>
                <span className="flex items-center">
                  <span className="text-blue-600 mr-1">📅</span>
                  {formatDate(job.startDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showViewAll && activeJobs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href="/provider/activejobs"
            className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium py-2 px-4 rounded-lg text-center block"
          >
            Manage All Jobs
          </Link>
        </div>
      )}
    </div>
  );
}