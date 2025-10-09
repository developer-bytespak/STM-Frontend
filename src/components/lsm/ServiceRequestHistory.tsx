'use client';

import { ServiceRequestHistoryItem } from '@/api/lsm';

interface ServiceRequestHistoryProps {
  requests: ServiceRequestHistoryItem[];
  totalRequests: number;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'under_review':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getApprovalStatus = (lsmApproved: boolean, adminApproved: boolean, finalStatus: string) => {
  if (finalStatus === 'approved') {
    return { status: 'Approved', color: 'bg-green-100 text-green-800' };
  } else if (finalStatus === 'rejected') {
    return { status: 'Rejected', color: 'bg-red-100 text-red-800' };
  } else if (adminApproved && !lsmApproved) {
    return { status: 'Pending LSM Review', color: 'bg-yellow-100 text-yellow-800' };
  } else if (lsmApproved && !adminApproved) {
    return { status: 'Pending Admin Review', color: 'bg-blue-100 text-blue-800' };
  } else {
    return { status: 'Under Review', color: 'bg-gray-100 text-gray-800' };
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ServiceRequestHistory({
  requests,
  totalRequests,
  currentPage,
  totalPages,
  onPageChange,
}: ServiceRequestHistoryProps) {
  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="text-3xl mr-4">📋</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Total Service Requests</h3>
            <p className="text-3xl font-bold text-gray-900">{totalRequests}</p>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Service Requests Found</h3>
          <p className="text-gray-600">No service requests match your current filters.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Request ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Provider
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      LSM Approved
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Admin Approved
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => {
                    const approvalStatus = getApprovalStatus(
                      request.lsmApproved,
                      request.adminApproved,
                      request.finalStatus
                    );

                    return (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{request.id}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 font-medium">{request.serviceName}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{request.category}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {request.provider.businessName || `${request.provider.user.first_name} ${request.provider.user.last_name}`}
                          </div>
                          <div className="text-xs text-gray-500">{request.provider.user.email}</div>
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <div className="text-sm text-gray-600 truncate" title={request.description}>
                            {request.description}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${approvalStatus.color}`}
                          >
                            {approvalStatus.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.lsmApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {request.lsmApproved ? 'Yes' : 'No'}
                          </span>
                          {request.lsmReviewedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(request.lsmReviewedAt)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.adminApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {request.adminApproved ? 'Yes' : 'No'}
                          </span>
                          {request.adminReviewedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(request.adminReviewedAt)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{formatDate(request.createdAt)}</div>
                        </td>
                      </tr>
                    );
                  })}
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
