'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import DataTable, { Column } from '@/components/admin/DataTable';
import StatsGrid, { StatItem } from '@/components/admin/StatsGrid';
import CreateLSMModal from '@/components/admin/CreateLSMModal';
import UpdateLSMModal from '@/components/admin/UpdateLSMModal';
import ReplaceLSMModal from '@/components/admin/ReplaceLSMModal';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

const mockLSMs = [
  {
    id: 1,
    name: 'Lisa Manager',
    email: 'lisa@lsm.com',
    phoneNumber: '+1234567891',
    region: 'New York',
    area: 'Manhattan',
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
    area: 'Downtown LA',
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
    area: 'North Side',
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
    area: 'Downtown',
    status: 'active',
    providerCount: 28,
    closedDealsCount: 134,
    earnings: 6700,
    lastLogin: null,
    createdAt: '2025-02-15T10:00:00Z',
  },
];

export default function LSMManagementPage() {
  const { ToastContainer } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [selectedLSM, setSelectedLSM] = useState<any>(null);

  // Fetch LSMs
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

  // Get unique regions for filter
  const regions = Array.from(new Set(lsms?.map((lsm: any) => lsm.region) || [])) as string[];

  // Stats configuration
  const stats: StatItem[] = [
    {
      label: 'Total LSMs',
      value: lsms?.length || 0,
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Active Regions',
      value: regions.length,
      color: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Active LSMs',
      value: lsms?.filter((lsm: any) => lsm.status === 'active').length || 0,
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Providers Managed',
      value: lsms?.reduce((sum: number, lsm: any) => sum + (lsm.providerCount || 0), 0) || 0,
      color: 'orange',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  // Table columns configuration
  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'LSM',
      render: (lsm) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-navy-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {lsm.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{lsm.name}</p>
            <p className="text-sm text-gray-500">ID: {lsm.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'region',
      label: 'Region',
      render: (lsm) => (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">{lsm.region}</span>
        </div>
      ),
    },
    {
      key: 'area',
      label: 'Area',
      render: (lsm) => (
        <div className="text-sm">
          <span className="text-gray-900 font-medium">{lsm.area || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (lsm) => (
        <div className="text-sm">
          <p className="text-gray-900 font-medium">{lsm.email}</p>
          <p className="text-gray-500">{lsm.phoneNumber}</p>
        </div>
      ),
    },
    {
      key: 'providerCount',
      label: 'Providers',
      render: (lsm) => (
        <span className="text-sm font-semibold text-gray-900">
          {lsm.providerCount || 0}
        </span>
      ),
    },
    {
      key: 'closedDealsCount',
      label: 'Closed Deals',
      render: (lsm) => (
        <span className="text-sm font-semibold text-gray-900">
          {lsm.closedDealsCount || 0}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (lsm) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
        };
        return (
          <Badge className={statusColors[lsm.status as keyof typeof statusColors]}>
            {lsm.status}
          </Badge>
        );
      },
    },
  ];

  // Filters configuration
  const filters = [
    {
      key: 'region',
      label: 'Region',
      options: [
        { value: 'all', label: 'All Regions' },
        ...regions.map(r => ({ value: r, label: r })),
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  // Actions for each row
  const actions = (lsm: any) => (
    <div className="flex items-center justify-end gap-2">
      <button 
        className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors" 
        title="View Details"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
      <button 
        onClick={() => {
          setSelectedLSM(lsm);
          setIsUpdateModalOpen(true);
        }}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
        title="Update LSM Info"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button 
        onClick={() => {
          setSelectedLSM(lsm);
          setIsReplaceModalOpen(true);
        }}
        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
        title="Replace LSM (includes deactivate/reassign options)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Local Service Managers</h1>
            <p className="text-gray-600 mt-1">Manage LSMs across all regions</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create LSM
          </button>
        </div>

        {/* Stats */}
        <StatsGrid stats={stats} />

        {/* Data Table */}
        <DataTable
          data={lsms || []}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Search by name, email, region, or area..."
          searchKeys={['name', 'email', 'region', 'area']}
          filters={filters}
          actions={actions}
          emptyMessage="No LSMs found"
          itemsPerPage={10}
        />
      </div>

      {/* Create LSM Modal */}
      <CreateLSMModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => setIsCreateModalOpen(false)}
      />

      {/* Update LSM Modal */}
      <UpdateLSMModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedLSM(null);
        }}
        lsm={selectedLSM}
        onSuccess={() => {
          setIsUpdateModalOpen(false);
          setSelectedLSM(null);
        }}
      />

      {/* Replace LSM Modal */}
      <ReplaceLSMModal
        isOpen={isReplaceModalOpen}
        onClose={() => {
          setIsReplaceModalOpen(false);
          setSelectedLSM(null);
        }}
        lsm={selectedLSM}
        onSuccess={() => {
          setIsReplaceModalOpen(false);
          setSelectedLSM(null);
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
