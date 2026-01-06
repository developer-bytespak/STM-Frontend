'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import DataTable, { Column } from '@/components/admin/DataTable';
import StatsGrid, { StatItem } from '@/components/admin/StatsGrid';
import BanProviderModal from '@/components/admin/BanProviderModal';
import UnbanConfirmModal from '@/components/admin/UnbanConfirmModal';
import ProviderDetailsModal from '@/components/admin/ProviderDetailsModal';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { mockProviders } from '@/data/mockProviders';

export default function ProvidersManagementPage() {
  const { ToastContainer } = useToast();
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [unbanModalOpen, setUnbanModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // Fetch Providers
  const { data: providers, isLoading } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: async () => {
      try {
        const response = await adminApi.getAllProviders();
        // Map backend response to expected frontend format
        return (response || []).map((provider: any) => ({
          ...provider,
          // Ensure totalEarnings is set from various possible backend field names
          totalEarnings: provider.totalEarnings 
            || provider.total_earnings 
            || provider.earnings 
            || provider.earned_amount 
            || 0,
          totalJobs: provider.totalJobs || provider.total_jobs || 0,
          rating: provider.rating || 0,
        }));
      } catch (err) {
        console.error('Failed to fetch providers:', err);
        return mockProviders;
      }
    },
  });

  // Get unique regions for filter
  const regions = Array.from(new Set((providers || []).map((p: any) => p.region))) as string[];

  // Stats configuration
  const stats: StatItem[] = [
    {
      label: 'Total Providers',
      value: providers?.length || 0,
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: 'Active Providers',
      value: providers?.filter((p: any) => p.status === 'active').length || 0,
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Banned Providers',
      value: providers?.filter((p: any) => p.status === 'banned').length || 0,
      color: 'red',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Avg Rating',
      value: providers?.length 
        ? (providers.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / providers.length).toFixed(1) + '★'
        : '0.0★',
      color: 'yellow',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ];

  // Table columns configuration
  const columns: Column<any>[] = [
    {
      key: 'businessName',
      label: 'Provider',
      render: (provider) => (
        <div>
          <p className="font-semibold text-gray-900">{provider.businessName}</p>
          <p className="text-sm text-gray-500">{provider.ownerName}</p>
          <p className="text-xs text-gray-400">{provider.email}</p>
        </div>
      ),
    },
    {
      key: 'region',
      label: 'Region',
      render: (provider) => (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">{provider.region}</span>
        </div>
      ),
    },
    {
      key: 'lsmName',
      label: 'LSM',
      render: (provider) => {
        const lsmName = provider.lsmName || provider.lsm_name || provider.lsm?.name || 'N/A';
        return (
          <span className="text-sm text-gray-700">{lsmName}</span>
        );
      },
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (provider) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-900">{provider.rating}</span>
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      ),
    },
    {
      key: 'totalJobs',
      label: 'Jobs',
      render: (provider) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
          {provider.totalJobs}
        </span>
      ),
    },
    {
      key: 'totalEarnings',
      label: 'Earnings',
      render: (provider) => {
        const earnings = provider.totalEarnings || provider.total_earnings || provider.earnings || 0;
        const formattedEarnings = typeof earnings === 'number' ? earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
        return (
          <span className="text-sm font-semibold text-gray-900">
            ${formattedEarnings}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (provider) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          banned: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
        };
        return (
          <Badge className={statusColors[provider.status as keyof typeof statusColors]}>
            {provider.status}
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
        { value: 'banned', label: 'Banned' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
    },
  ];

  // Actions for each row
  const actions = (provider: any) => {
    const isPending = provider.approvalStatus === 'pending' || provider.status === 'pending';
    
    return (
      <div className="flex items-center justify-end gap-2">
        <button 
          onClick={() => {
            setSelectedProvider(provider);
            setDetailsModalOpen(true);
          }}
          className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors cursor-pointer" 
          title="View Details"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        {provider.status === 'banned' ? (
          <button 
            onClick={() => {
              setSelectedProvider(provider);
              setUnbanModalOpen(true);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
            title="Unban Provider"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        ) : isPending ? (
          <button 
            disabled
            className="p-2 text-gray-400 cursor-not-allowed rounded-lg" 
            title="Cannot ban providers with pending approval status"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
        ) : (
          <button 
            onClick={() => {
              setSelectedProvider(provider);
              setBanModalOpen(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
            title="Ban Provider"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
    <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor service providers across all regions
          </p>
        </div>

        {/* Stats */}
        <StatsGrid stats={stats} />

        {/* Data Table */}
        <DataTable
          data={providers || []}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Search by business name, owner, email, or region..."
          searchKeys={['businessName', 'ownerName', 'email', 'region']}
          filters={filters}
          actions={actions}
          emptyMessage="No providers found"
          itemsPerPage={10}
        />
      </div>

      {/* Ban Provider Modal */}
      <BanProviderModal
        isOpen={banModalOpen}
        onClose={() => {
          setBanModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onSuccess={() => {
          setBanModalOpen(false);
          setSelectedProvider(null);
        }}
      />

      {/* Unban Confirm Modal */}
      <UnbanConfirmModal
        isOpen={unbanModalOpen}
        onClose={() => {
          setUnbanModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onSuccess={() => {
          setUnbanModalOpen(false);
          setSelectedProvider(null);
        }}
      />

      {/* Provider Details Modal */}
      <ProviderDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
