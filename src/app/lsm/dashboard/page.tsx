'use client';

import Link from 'next/link';
import { dummySPRequests } from '@/data/dummyRequest';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/layout/Footer';

export default function LSMDashboard() {
  const pendingRequests = dummySPRequests.filter(req => req.status === 'pending');
  const approvedRequests = dummySPRequests.filter(req => req.status === 'approved');
  const rejectedRequests = dummySPRequests.filter(req => req.status === 'rejected');
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 pt-6">
        <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-blue-100">
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
                  <h3 className="text-lg font-semibold text-gray-800">SP Requests</h3>
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
          <Link href="/lsm/providers" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👥</div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">Service Providers in Region</h3>
                <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>Manage active service providers</span>
            </div>
          </div>
          </Link>

          {/* Jobs Card */}
          <Link href="/lsm/jobs" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">💼</div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">Jobs in Region</h3>
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>Monitor job activities</span>
            </div>
          </div>
          </Link>


          {/* Disputes Card */}
          <Link href="/lsm/disputes" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👥</div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">Disputes</h3>
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>Manage dispute resolutions</span>
            </div>
          </div>
          </Link>

          {/* SP Feedbacks Card */}
          <Link href="/lsm/sp-feedbacks" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">💼</div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">SP Feedbacks</h3>
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>Review service provider feedback</span>
            </div>
          </div>
          </Link>


        </div>

        {/* Recent Activity Section */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <div className="text-4xl">📊</div>
            </div>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">No recent activity</p>
              <p className="text-gray-400 text-sm">Activity will appear here as it happens</p>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}