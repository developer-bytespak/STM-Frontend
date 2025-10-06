'use client';

import Link from 'next/link';
import { dummySPRequests } from '../Data/dummyRequest';

export default function LSMDashboard() {
  const pendingRequests = dummySPRequests.filter(req => req.status === 'pending');
  const approvedRequests = dummySPRequests.filter(req => req.status === 'approved');
  const rejectedRequests = dummySPRequests.filter(req => req.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LSM Dashboard
          </h1>
          <p className="text-gray-600">
            Manage service provider requests and approvals
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Requests Card */}
          <Link href="/lsm/sp-request" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📋</div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold text-gray-800">Requests</h3>
                  <p className="text-2xl font-bold text-blue-600">{pendingRequests.length}</p>
                  <p className="text-sm text-gray-500">Pending Review</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>✅ {approvedRequests.length} Approved</span>
                <span>❌ {rejectedRequests.length} Rejected</span>
              </div>
            </div>
          </Link>

          {/* Providers Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👥</div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">Providers</h3>
                <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>Manage active service providers</span>
            </div>
          </div>

          {/* Jobs Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">💼</div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">Jobs</h3>
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>Monitor job activities</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}