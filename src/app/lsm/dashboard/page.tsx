'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { lsmApi } from '@/api/lsm';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/ui/Loader';

export default function LSMDashboard() {
  const { user } = useAuth();

  // Debug: Log current user info
  console.log('Current user:', user);
  console.log('User role:', user?.role);

  // Fetch dashboard data from API
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['lsm-dashboard'],
    queryFn: () => lsmApi.getDashboard(),
    staleTime: 60 * 1000, // 1 minute
    retry: 1, // Only retry once
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Show error state with fallback option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-xl mb-4">Failed to load dashboard</div>
          <p className="text-gray-600 mb-4">API connection failed</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
            <p className="mt-2">Check browser console for more details</p>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => {
                // Force refetch
                window.location.href = '/lsm/dashboard';
              }} 
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from API response with proper typing
  const summary = dashboardData?.summary || { totalProviders: 0, totalJobs: 0, pendingServiceRequests: 0, pendingDisputes: 0 };
  const providers = dashboardData?.providers || { pending: 0, active: 0, inactive: 0, banned: 0 };
  const jobs = dashboardData?.jobs || { new: 0, in_progress: 0, completed: 0, paid: 0, cancelled: 0, rejected_by_sp: 0 };
  const disputes = dashboardData?.disputes || { pending: 0, resolved: 0 };
  const recentActivity = dashboardData?.recentActivity || { newProviders24h: 0, completedJobs24h: 0, documentsVerified24h: 0 };

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
                  <p className="text-2xl font-bold text-blue-600">{summary.pendingServiceRequests}</p>
                  <p className="text-sm text-gray-500">Pending Review</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>✅ {providers.active} Active</span>
                <span>⏳ {providers.pending} Pending</span>
              </div>
            </div>
          </Link>

          {/* Providers Card */}
          <Link href="/lsm/providers" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👥</div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">Service Providers</h3>
                <p className="text-2xl font-bold text-green-600">{summary.totalProviders}</p>
                <p className="text-sm text-gray-500">Total in Region</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>✅ {providers.active} Active • ⏳ {providers.pending} Pending</span>
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
                <p className="text-2xl font-bold text-purple-600">{summary.totalJobs}</p>
                <p className="text-sm text-gray-500">Total Jobs</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>🔄 {jobs.in_progress} In Progress • ✅ {jobs.completed} Completed</span>
            </div>
          </div>
          </Link>

          {/* Service Request History Card */}
          <Link href="/lsm/requests-history" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📜</div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">Request History</h3>
                <p className="text-2xl font-bold text-teal-600">View All</p>
                <p className="text-sm text-gray-500">Service Requests</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>📋 View complete request history</span>
            </div>
          </div>
          </Link>

          {/* Disputes Card */}
          <Link href="/lsm/disputes" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">⚖️</div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">Disputes</h3>
                <p className="text-2xl font-bold text-orange-600">{summary.pendingDisputes}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>⏳ {disputes.pending} Pending • ✅ {disputes.resolved} Resolved</span>
            </div>
          </div>
          </Link>

          {/* SP Feedbacks Card */}
          <Link href="/lsm/sp-feedbacks" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">💬</div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">SP Feedbacks</h3>
                <p className="text-2xl font-bold text-indigo-600">View All</p>
                <p className="text-sm text-gray-500">Provider Reviews</p>
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
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity (Last 24 Hours)</h2>
              <div className="text-4xl">📊</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* New Providers */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-900">New Providers</h3>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{recentActivity.newProviders24h}</p>
                <p className="text-xs text-blue-700 mt-1">registered in last 24h</p>
              </div>

              {/* Completed Jobs */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-green-900">Completed Jobs</h3>
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{recentActivity.completedJobs24h}</p>
                <p className="text-xs text-green-700 mt-1">finished in last 24h</p>
              </div>

              {/* Documents Verified */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-purple-900">Documents Verified</h3>
                  <span className="text-2xl">📄</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">{recentActivity.documentsVerified24h}</p>
                <p className="text-xs text-purple-700 mt-1">verified in last 24h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Footer */}
      
    </div>
  );
}