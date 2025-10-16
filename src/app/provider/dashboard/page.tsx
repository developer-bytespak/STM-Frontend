'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { providerApi, DashboardResponse } from '@/api/provider';
import { MyRequestsCard } from '@/components/provider';
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';

function ProviderDashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<string>('checking');
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard data - backend will tell us the real approval status
        const data = await providerApi.getDashboard();
        setDashboardData(data);
        setError(null);
        
        // If we successfully got dashboard data, provider is approved
        setApprovalStatus('approved');
        // Update localStorage to match backend
        localStorage.setItem('approval_status', 'approved');
        
      } catch (err: any) {
        console.error('Failed to fetch dashboard:', err);
        
        // Check if error is due to pending status
        if (err.message?.includes('pending') || err.message?.includes('not approved') || err.status === 403) {
          setApprovalStatus('pending');
          localStorage.setItem('approval_status', 'pending');
        } else {
          // If dashboard exists in response despite error, provider might be approved
          // but there's a data issue - still show approved dashboard
          const urlStatus = searchParams.get('status');
          if (urlStatus === 'approved') {
            setApprovalStatus('approved');
          } else {
            setApprovalStatus('pending');
          }
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [searchParams]);

  if (loading && approvalStatus === 'checking') {
    return <DashboardSkeleton />;
  }

  if (approvalStatus === 'pending') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏳</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Approval Pending
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your service provider application is currently under review by our Local Service Manager. 
              We&apos;ll notify you via email once your account is approved.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• LSM reviews your application</li>
                <li>• Verification of credentials and experience</li>
                <li>• Approval notification via email</li>
                <li>• Full dashboard access granted</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { summary, jobs, pendingActions, recentJobs, recentFeedback } = dashboardData;

  // Approved provider dashboard
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-navy-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Provider'}!
        </h1>
        <p className="text-blue-100">
          Manage your services, track your earnings, and respond to customer requests.
        </p>
      </div>

      {/* Warnings Card - Only show if there are warnings */}
      {summary.warnings > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">You have {summary.warnings} warning{summary.warnings > 1 ? 's' : ''}</h3>
                <p className="text-sm text-gray-600">Please review your account status and address any issues</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Actions */}
      {(pendingActions.newJobRequests > 0 || pendingActions.jobsToComplete > 0 || pendingActions.paymentsToMark > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Pending Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingActions.newJobRequests > 0 && (
              <Link href="/provider/jobs?status=new" className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-navy-600">{pendingActions.newJobRequests}</p>
                <p className="text-sm text-gray-600">New Job Requests</p>
              </Link>
            )}
            {pendingActions.jobsToComplete > 0 && (
              <Link href="/provider/jobs?status=in_progress" className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-blue-600">{pendingActions.jobsToComplete}</p>
                <p className="text-sm text-gray-600">Jobs to Complete</p>
              </Link>
            )}
            {pendingActions.paymentsToMark > 0 && (
              <Link href="/provider/jobs?status=completed" className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-green-600">{pendingActions.paymentsToMark}</p>
                <p className="text-sm text-gray-600">Payments to Mark</p>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          href="/provider/jobs"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Requests</h3>
          <p className="text-gray-600 text-sm">
            Review and respond to customer requests
          </p>
        </Link>

        <Link
          href="/provider/total_jobs"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Jobs</h3>
          <p className="text-3xl font-bold text-navy-600 mb-1">{summary.totalJobs}</p>
          <p className="text-gray-600 text-sm">
            View your completed jobs history
          </p>
        </Link>

        <Link
          href="/provider/earnings"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Earnings</h3>
          <p className="text-3xl font-bold text-green-600 mb-1">${summary.totalEarnings.toLocaleString()}</p>
          <p className="text-gray-600 text-sm">
            View payment history and manage billing
          </p>
        </Link>

        <Link
          href="/provider/activejobs"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Jobs</h3>
          <p className="text-gray-600 text-sm">
            Manage your ongoing and scheduled jobs
          </p>
        </Link>

        <Link
          href="/provider/feedback"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rating</h3>
          <p className="text-3xl font-bold text-yellow-600 mb-1">{summary.averageRating} / 5.0</p>
          <p className="text-gray-600 text-sm">
            View customer reviews and ratings
          </p>
        </Link>

        <Link
          href="/provider/service-request"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Service</h3>
          <p className="text-gray-600 text-sm">
            Add a new service to your profile
          </p>
        </Link>

        <Link
          href="/provider/office-booking"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Office Booking</h3>
          <p className="text-gray-600 text-sm">
            Book workspace and manage office reservations
          </p>
        </Link>
      </div>

      {/* My Service Requests Card */}
      <MyRequestsCard />

      {/* Recent Jobs & Feedback Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Jobs</h2>
          {recentJobs.length > 0 ? (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.service}</h3>
                      <p className="text-sm text-gray-600">{job.customer}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'completed' ? 'bg-green-100 text-green-700' :
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      job.status === 'new' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Rs. {job.price.toLocaleString()}</span>
                    <span className="text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              <Link href="/provider/jobs" className="block text-center text-navy-600 hover:text-navy-700 font-medium text-sm pt-2">
                View All Jobs →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent jobs</p>
            </div>
          )}
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Feedback</h2>
          {recentFeedback.length > 0 ? (
            <div className="space-y-4">
              {recentFeedback.map((feedback) => (
                <div key={feedback.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{feedback.customer}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>
                  {feedback.feedback && (
                    <p className="text-sm text-gray-700 line-clamp-2">{feedback.feedback}</p>
                  )}
                </div>
              ))}
              <Link href="/provider/feedback" className="block text-center text-navy-600 hover:text-navy-700 font-medium text-sm pt-2">
                View All Feedback →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No feedback yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProviderDashboardContent />
    </Suspense>
  );
}