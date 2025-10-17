'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { customerApi, CustomerDashboard as DashboardData } from '@/api/customer';
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerApi.getDashboard();
        console.log('Dashboard data received:', data); // Debug log
        setDashboard(data);
      } catch (err: any) {
        console.error('Error fetching dashboard:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
          <p className="font-semibold">Error Loading Dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 pb-12 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-navy-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-blue-100">
          Manage your bookings, find service providers, and track your service history.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[150px] hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Jobs</span>
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.summary?.totalJobs || 0}</p>
          <Link href="/customer/bookings" className="text-navy-600 text-sm hover:underline mt-auto pt-2 inline-block cursor-pointer">
            View all →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[150px] hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">In Progress</span>
            <span className="text-2xl">🔵</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.jobs?.in_progress || 0}</p>
          <Link href="/customer/bookings" className="text-navy-600 text-sm hover:underline mt-auto pt-2 inline-block cursor-pointer">
            View active →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[150px] hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Spent</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${dashboard?.summary?.totalSpent || 0}</p>
          <Link href="/customer/payments" className="text-navy-600 text-sm hover:underline mt-auto pt-2 inline-block cursor-pointer">
            View payments →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[150px] hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Pending Feedback</span>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.summary?.pendingFeedback || 0}</p>
          <Link href="/customer/feedback" className="text-navy-600 text-sm hover:underline mt-auto pt-2 inline-block cursor-pointer">
            Leave feedback →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col min-h-[170px]"
        >
          <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Providers</h3>
          <p className="text-gray-600 text-sm mt-auto">
            Search for service providers in your area
          </p>
        </Link>

        <Link
          href="/customer/bookings"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col min-h-[170px]"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Bookings</h3>
          <p className="text-gray-600 text-sm mt-auto">
            View and manage your service bookings
          </p>
        </Link>

        <Link
          href="/customer/payments"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col min-h-[170px]"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payments</h3>
          <p className="text-gray-600 text-sm mt-auto">
            View payment history and manage billing
          </p>
        </Link>
        
        <Link
          href="/customer/avalied-jobs"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col min-h-[170px]"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Jobs</h3>
          <p className="text-gray-600 text-sm mt-auto">
            View completed jobs and leave feedback
          </p>
        </Link>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Jobs</h2>
          <Link href="/customer/bookings" className="text-navy-600 hover:text-navy-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        {!dashboard?.recentJobs || dashboard.recentJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">No recent jobs</p>
            <Link
              href="/"
              className="text-navy-600 hover:text-navy-700 font-medium"
            >
              Find a service provider to get started →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboard.recentJobs.slice(0, 5).map((job) => (
              <Link
                key={job.id}
                href={`/customer/bookings/${job.id}`}
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.service}</h3>
                    <p className="text-sm text-gray-600 mt-1">{job.provider}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      job.status === 'completed' || job.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : job.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 mt-2">${job.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}