'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { lsmApi } from '@/api/lsm';
import { useAuth } from '@/hooks/useAuth';
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';

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
    return <DashboardSkeleton />;
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
x``      <div className="flex-1 pt-6 pb-12">
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
          <Link href="/lsm/sp-request" className="block h-full">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col min-h-[180px]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="text-right flex-1 ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Onboarding Requests</h3>
                  <p className="text-2xl font-bold text-blue-600">{summary.pendingServiceRequests}</p>
                  <p className="text-sm text-gray-500">Pending Review</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-auto">
                <span>{providers.active} Active</span>
                <span>{providers.pending} Pending</span>
              </div>
            </div>
          </Link>

          {/* Providers Card */}
          <Link href="/lsm/providers" className="block h-full">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col min-h-[180px]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-right flex-1 ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Service Providers</h3>
                <p className="text-2xl font-bold text-green-600">{summary.totalProviders}</p>
                <p className="text-sm text-gray-500">Total in Region</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-auto">
              <span>{providers.active} Active • {providers.pending} Pending</span>
            </div>
          </div>
          </Link>

          {/* Jobs Card */}
          <Link href="/lsm/jobs" className="block h-full">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col min-h-[180px]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-right flex-1 ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Jobs in Region</h3>
                <p className="text-2xl font-bold text-purple-600">{summary.totalJobs}</p>
                <p className="text-sm text-gray-500">Total Jobs</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-auto">
              <span>{jobs.in_progress} In Progress • {jobs.completed} Completed</span>
            </div>
          </div>
          </Link>

          {/* Service Requests Card */}
          <Link href="/lsm/requests-history" className="block h-full">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col min-h-[180px]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-right flex-1 ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Service Requests</h3>
                <p className="text-2xl font-bold text-teal-600">{summary.pendingServiceRequests}</p>
                <p className="text-sm text-gray-500">Pending Approval</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-auto">
              <span>Review & manage requests</span>
            </div>
          </div>
          </Link>

          {/* Disputes Card */}
          <Link href="/lsm/disputes" className="block h-full">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col min-h-[180px]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-right flex-1 ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Disputes</h3>
                <p className="text-2xl font-bold text-orange-600">{summary.pendingDisputes}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-auto">
              <span>{disputes.pending} Pending • {disputes.resolved} Resolved</span>
            </div>
          </div>
          </Link>

          {/* SP Feedbacks Card */}
          <Link href="/lsm/sp-feedbacks" className="block h-full">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col min-h-[180px]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="text-right flex-1 ml-4">
                <h3 className="text-lg font-semibold text-gray-800">SP Feedbacks</h3>
                <p className="text-2xl font-bold text-indigo-600">★ 4.5</p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-auto">
              <span>View all provider reviews</span>
            </div>
          </div>
          </Link>


        </div>

        {/* Recent Activity Section */}
        <div className="max-w-6xl mx-auto mt-8 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity (Last 24 Hours)</h2>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* New Providers */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-900">New Providers</h3>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-600">{recentActivity.newProviders24h}</p>
                <p className="text-xs text-blue-700 mt-1">registered in last 24h</p>
              </div>

              {/* Completed Jobs */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-green-900">Completed Jobs</h3>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">{recentActivity.completedJobs24h}</p>
                <p className="text-xs text-green-700 mt-1">finished in last 24h</p>
              </div>

              {/* Documents Verified */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-purple-900">Documents Verified</h3>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-600">{recentActivity.documentsVerified24h}</p>
                <p className="text-xs text-purple-700 mt-1">verified in last 24h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}