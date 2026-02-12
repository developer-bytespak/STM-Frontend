'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { adminApi } from '@/api/admin';
import StatsCard from '@/components/admin/StatsCard';
import ActivityFeed from '@/components/admin/ActivityFeed';
import PendingActions from '@/components/admin/PendingActions';
import RevenueChart from '@/components/admin/RevenueChart';
import JobsStatusChart from '@/components/admin/JobsStatusChart';
import QuickActions from '@/components/admin/QuickActions';
import LSMRegionsCard from '@/components/admin/LSMRegionsCard';
import Loader from '@/components/ui/Loader';
import { mockJobStatusData, mockRevenueData, mockRecentActivities } from '@/data/mockAdminData';
import { useToast } from '@/components/ui/Toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [revenuePeriod, setRevenuePeriod] = useState<string>('7days');
  const [jobsPeriod, setJobsPeriod] = useState<string>('7days');
  const [isTriggering, setIsTriggering] = useState(false);
  const [reminderStats, setReminderStats] = useState<{ success: number; failed: number; total: number } | null>(null);
  const [showReminderDialog, setShowReminderDialog] = useState(false);

  // Handle trigger availability reminders
  const handleTriggerReminders = async () => {
    try {
      setIsTriggering(true);
      const response = await adminApi.triggerAvailabilityReminders();
      
      setReminderStats(response.stats);
      setShowReminderDialog(false);
      
      showToast(
        `${response.stats.success} reminders sent, ${response.stats.failed} failed`,
        'success'
      );
    } catch (error: any) {
      console.error('Failed to trigger reminders:', error);
      showToast('Failed to send reminders. Please try again.', 'error');
    } finally {
      setIsTriggering(false);
    }
  };

  // Fetch dashboard stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
    placeholderData: {
      activeJobs: 0,
      activeUsers: 0,
      revenueToday: 0,
      pendingApprovals: 0,
      totalProviders: 0,
      totalLSMs: 0,
    },
  });

  // Fetch pending actions from real API
  const { data: pendingActionsData, isLoading: isPendingLoading } = useQuery({
    queryKey: ['admin-pending-actions'],
    queryFn: () => adminApi.getPendingActions(),
    placeholderData: [],
  });

  // Fetch activities
  const { data: activitiesData, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: () => adminApi.getActivities(8),
    placeholderData: [],
  });

  // Fetch revenue data
  const { data: revenueData, isLoading: isRevenueLoading } = useQuery({
    queryKey: ['admin-revenue', revenuePeriod],
    queryFn: () => adminApi.getRevenue(revenuePeriod),
    placeholderData: { data: [], summary: {} },
  });

  // Use real stats data
  const displayStats = (statsData || {}) as any;

  // Fetch jobs distribution
  const { data: jobsDistributionData, isLoading: isJobsLoading } = useQuery({
    queryKey: ['admin-jobs-distribution', jobsPeriod],
    queryFn: () => {
      const period = jobsPeriod === '7days' ? '7d' : jobsPeriod === '30days' ? '30d' : jobsPeriod === '90days' ? '90d' : '1y';
      return adminApi.getJobsDistribution(period);
    },
    placeholderData: { summary: {}, data: [] },
  });

  const jobsChartData = jobsDistributionData?.data || jobsDistributionData || [];

  const pendingActions = pendingActionsData || [];
  const activities = activitiesData || [];
  const revenueChartData = revenueData?.data || revenueData || [];

  const stats = [
    {
      title: 'Active Jobs',
      value: displayStats?.activeJobs || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Active Users',
      value: (displayStats?.activeUsers || 0).toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Revenue Today',
      value: `$${(displayStats?.revenueToday || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: { value: 23, isPositive: true },
    },
    {
      title: 'Pending Approvals',
      value: displayStats?.pendingApprovals || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Total Providers',
      value: displayStats?.totalProviders || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      trend: { value: 15, isPositive: true },
    },
    {
      title: 'Active LSMs',
      value: displayStats?.totalLSMs || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-navy-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
              </h1>
              <p className="text-blue-100">
                Here&apos;s what&apos;s happening with your platform today.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-blue-200">Current Date</p>
                <p className="text-lg font-semibold">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              bgColor={stat.bgColor}
              iconColor={stat.iconColor}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Admin Testing Tools Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Provider Availability Check</h2>
              <p className="text-sm text-gray-600 mt-1">Send weekly availability confirmation reminders to all active providers</p>
            </div>
          </div>

          <div className="space-y-4">
            {reminderStats && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-green-800">Reminders Sent Successfully</p>
                </div>
                <div className="grid grid-cols-3 gap-4 bg-white rounded p-3">
                  <div>
                    <p className="text-xs text-green-700 font-medium">Success</p>
                    <p className="text-2xl font-bold text-green-700">{reminderStats.success}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-700 font-medium">Failed</p>
                    <p className="text-2xl font-bold text-red-700">{reminderStats.failed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 font-medium">Total</p>
                    <p className="text-2xl font-bold text-gray-700">{reminderStats.total}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowReminderDialog(true)}
              disabled={isTriggering}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Send Availability Reminders
            </button>
          </div>
        </div>

        {/* Reminder Confirmation Dialog */}
        {showReminderDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 space-y-4">
                {/* Modal Header with Icon */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Send Availability Reminders
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Confirm to proceed
                    </p>
                  </div>
                </div>

                {/* What This Does */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-blue-900">What will happen:</p>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex gap-2">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Send emails to all active service providers</span>
                    </li>
                    <li className="flex gap-2">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Request profile verification and availability confirmation</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowReminderDialog(false)}
                    disabled={isTriggering}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTriggerReminders}
                    disabled={isTriggering}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isTriggering ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Reminders
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Pending Actions */}
      {isPendingLoading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : (
        <PendingActions actions={pendingActions} />
      )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
          {isRevenueLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : (
            <RevenueChart 
              data={revenueChartData}
              period={revenuePeriod}
              onPeriodChange={setRevenuePeriod}
            />
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
          {isJobsLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : (
            <JobsStatusChart 
              data={jobsChartData}
              period={jobsPeriod}
              onPeriodChange={setJobsPeriod}
              summary={jobsDistributionData?.summary}
            />
          )}
        </div>

        {/* Recent Activity */}
        {isActivitiesLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <ActivityFeed activities={activities} maxItems={8} />
        )}

        {/* LSM Regions Card */}
        <LSMRegionsCard />
      </div>
    </div>
  );
}