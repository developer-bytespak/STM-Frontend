'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';

// Mock data for now (will be replaced with real API)
const mockLSMs = [
  {
    id: 1,
    name: 'Lisa Manager',
    email: 'lisa@lsm.com',
    phoneNumber: '+1234567891',
    region: 'New York',
    status: 'active',
    providerCount: 45,
    closedDealsCount: 234,
    earnings: 12500,
    lastLogin: null,
    createdAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Bob Manager',
    email: 'bob@lsm.com',
    phoneNumber: '+1234567892',
    region: 'Los Angeles',
    status: 'active',
    providerCount: 38,
    closedDealsCount: 189,
    earnings: 9500,
    lastLogin: null,
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 3,
    name: 'Sara Manager',
    email: 'sara@lsm.com',
    phoneNumber: '+1234567893',
    region: 'Chicago',
    status: 'active',
    providerCount: 32,
    closedDealsCount: 156,
    earnings: 7800,
    lastLogin: null,
    createdAt: '2025-02-01T10:00:00Z',
  },
  {
    id: 4,
    name: 'Mike Manager',
    email: 'mike@lsm.com',
    phoneNumber: '+1234567894',
    region: 'Houston',
    status: 'active',
    providerCount: 28,
    closedDealsCount: 134,
    earnings: 6700,
    lastLogin: null,
    createdAt: '2025-02-15T10:00:00Z',
  },
];

export default function LSMRegionsCard() {
  // Fetch LSMs (using mock data for now)
  const { data: lsms, isLoading } = useQuery({
    queryKey: ['admin-lsms'],
    queryFn: async () => {
      try {
        return await adminApi.getAllLSMs();
      } catch (err) {
        return mockLSMs;
      }
    },
  });

  // Calculate summary statistics
  const regions = Array.from(new Set(lsms?.map((lsm: any) => lsm.region) || [])) as string[];
  const totalLSMs = lsms?.length || 0;
  const totalProviders = lsms?.reduce((sum: number, lsm: any) => sum + (lsm.providerCount || 0), 0) || 0;
  const totalJobs = lsms?.reduce((sum: number, lsm: any) => sum + (lsm.closedDealsCount || 0), 0) || 0;
  
  // Get top 3 regions by LSM count
  const regionCounts = regions.map(region => ({
    region,
    count: lsms?.filter((lsm: any) => lsm.region === region).length || 0,
    lsms: lsms?.filter((lsm: any) => lsm.region === region) || []
  })).sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Local Service Managers</h2>
          <p className="text-sm text-gray-500 mt-1">
            Overview of LSM distribution and performance
          </p>
        </div>
        <Link
          href="/admin/lsms"
          className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          View All LSMs
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && lsms && (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-navy-50 to-blue-50 p-4 rounded-lg border border-navy-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-navy-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total LSMs</p>
                  <p className="text-2xl font-bold text-gray-900">{totalLSMs}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Regions</p>
                  <p className="text-2xl font-bold text-gray-900">{regions.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Providers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProviders}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{totalJobs.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Regions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Regions</h3>
            <div className="space-y-2">
              {regionCounts.length > 0 ? (
                regionCounts.map((item, index) => (
                  <div key={item.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.region}</p>
                        <p className="text-xs text-gray-500">
                          {item.count} LSM{item.count !== 1 ? 's' : ''} managing{' '}
                          {item.lsms.reduce((sum: number, lsm: any) => sum + (lsm.providerCount || 0), 0)} providers
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/admin/lsms?region=${encodeURIComponent(item.region)}`}
                      className="text-navy-600 hover:text-navy-700 text-sm font-medium flex items-center gap-1"
                    >
                      View
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No LSMs created yet</p>
                  <p className="text-gray-400 text-xs mt-1">Create your first LSM to get started</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

