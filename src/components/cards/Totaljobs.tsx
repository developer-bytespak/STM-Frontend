'use client';

import { CompletedJob } from '@/data/dummyjobdone';

interface TotaljobsProps {
job: CompletedJob;
}

export default function Totaljobs({ job }: TotaljobsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header with Job ID and Status */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {job.serviceName}
          </h3>
          <p className="text-sm text-gray-500">Job #{job.id}</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          {job.status}
        </span>
      </div>

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Category</p>
          <p className="text-sm font-medium text-gray-900">{job.category}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Completed Date</p>
          <p className="text-sm font-medium text-gray-900">{job.completedDate}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Duration</p>
          <p className="text-sm font-medium text-gray-900">{job.duration}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Earned</p>
          <p className="text-sm font-bold text-green-600">${job.totalCost}</p>
        </div>
      </div>

      {/* Address */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1">Service Location</p>
        <p className="text-sm text-gray-700 flex items-center">
          <span className="mr-2">📍</span>
          {job.address}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
        <button className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          View Details
        </button>
        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Download Invoice
        </button>
      </div>
    </div>
  );
}

