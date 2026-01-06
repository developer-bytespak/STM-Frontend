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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [revenuePeriod, setRevenuePeriod] = useState<string>('7days');
  const [jobsPeriod, setJobsPeriod] = useState<string>('7days');

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

  // Fetch jobs distribution - will implement API later
  // For now using mock data
  const jobsChartData = mockJobStatusData;

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
          <JobsStatusChart 
            data={jobsChartData}
            period={jobsPeriod}
            onPeriodChange={setJobsPeriod}
          />
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