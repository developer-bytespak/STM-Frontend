'use client';

import React from 'react';
import Link from 'next/link';

interface ActiveJobsProps {
  maxItems?: number;
  showViewAll?: boolean;
}

export default function ActiveJobs({ maxItems = 3, showViewAll = true }: ActiveJobsProps) {
  // Mock data for now - you can replace this with your actual data
  const activeJobs = [
    {
      id: '1',
      serviceType: 'Plumbing Repair',
      description: 'Fix leaking kitchen sink pipe',
      customerName: 'John Doe',
      location: '123 Main St, Portland',
      budget: '150',
      estimatedDuration: '2 hours',
      startDate: '2025-01-15',
      status: 'in_progress',
      urgency: '24 Hours'
    },
    {
      id: '2', 
      serviceType: 'Bathroom Remodeling',
      description: 'Install new bathroom fixtures',
      customerName: 'Jane Smith',
      location: '456 Oak Ave, Salem',
      budget: '300',
      estimatedDuration: '4 hours',
      startDate: '2025-01-16',
      status: 'scheduled',
      urgency: '3 Days'
    }
  ];

  const totalActiveJobs = 5; // Mock total

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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
      day: 'numeric'
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
            <div key={job.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {job.serviceType}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>👤 {job.customerName}</span>
                    <span>•</span>
                    <span>📍 {job.location.split(',')[0]}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    <span className="mr-1">{getStatusIcon(job.status)}</span>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <span>💰 ${job.budget}</span>
                  <span>⏱️ {job.estimatedDuration}</span>
                  <span>📅 {formatDate(job.startDate)}</span>
                </div>
                {job.urgency === '24 Hours' && (
                  <span className="text-red-600 font-medium">🚨 URGENT</span>
                )}
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
