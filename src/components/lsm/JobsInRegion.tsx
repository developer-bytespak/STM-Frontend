'use client';

import { JobInRegion } from '@/api/lsm';

interface JobsInRegionProps {
  jobs: JobInRegion[];
  totalJobs: number;
  totalValue: number;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'paid':
      return 'bg-emerald-100 text-emerald-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'rejected_by_sp':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function JobsInRegion({
  jobs,
  totalJobs,
  totalValue,
  currentPage,
  totalPages,
  onPageChange,
}: JobsInRegionProps) {
  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Jobs</h3>
              <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="text-3xl mr-4">💰</div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Value</h3>
              <p className="text-2xl font-bold text-green-600">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📈</div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Average Value</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${totalJobs > 0 ? (totalValue / totalJobs).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Jobs Found</h3>
          <p className="text-gray-600">No jobs match your current filters.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Job ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Provider
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Scheduled
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{job.id}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 font-medium">{job.service}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{job.category}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{job.customer}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{job.provider}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {formatStatus(job.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${job.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDateTime(job.scheduledAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{formatDate(job.createdAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

