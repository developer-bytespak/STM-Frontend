'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { dummyCompletedJobs } from '@/data/dummyjobdone';
import { dummyCustomerRequests } from '@/data/dummyCustomerRequests';
import { dummyActiveJobs } from '@/data/dummyActiveJobs';

function ProviderDashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<string>('pending');
  
  // Calculate stats from dummy data (will come from API later)
  // TODO: When backend ready, filter by currentProviderId from auth
  const totalJobs = dummyCompletedJobs.length;
  const totalEarnings = dummyCompletedJobs.reduce((sum, job) => sum + job.totalCost, 0);
  const pendingRequests = dummyCustomerRequests.filter(r => r.status === 'pending').length;
  const activeJobsCount = dummyActiveJobs.filter(job => !['completed', 'cancelled'].includes(job.status)).length;

  useEffect(() => {
    // Check approval status from URL params or localStorage
    const status = searchParams.get('status') || localStorage.getItem('approval_status') || 'approved';
    setApprovalStatus(status);
  }, [searchParams]);

  if (approvalStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
              <a
                href="/login"
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    );
   }

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
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
          <p className="text-gray-600 text-sm">
            View customer reviews and ratings
          </p>
        </Link>
      </div>

    


      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">No recent activity</p>
          <Link
            href="/provider/jobs"
            className="text-navy-600 hover:text-navy-700 font-medium"
          >
            Check for new job requests →
          </Link>
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