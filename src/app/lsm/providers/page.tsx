'use client';

import { useState, useEffect } from 'react';
import { lsmApi, ProviderInRegion } from '@/api/lsm';
import ProviderManagementCard from '@/components/lsm/ProviderManagementCard';
import ProviderDetailModal from '@/components/lsm/ProviderDetailModal';
import CardListSkeleton from '@/components/ui/CardListSkeleton';

export default function LSMProviders() {
  const [allProviders, setAllProviders] = useState<ProviderInRegion[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderInRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'active' | 'inactive' | 'banned'>('active');
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all providers to get counts
      const allResponse = await lsmApi.getProvidersInRegion();
      setAllProviders(allResponse.providers);
      
      // Fetch filtered providers based on active filter
      const response = await lsmApi.getProvidersInRegion(activeFilter);
      setFilteredProviders(response.providers);
    } catch (err: any) {
      console.error('Error fetching providers:', err);
      setError(err.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    
    try {
      setLoading(true);
      const response = await lsmApi.getProvidersInRegion(filter);
      setFilteredProviders(response.providers);
    } catch (err) {
      console.error('Error filtering providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status: string) => {
    return allProviders.filter(p => p.status === status).length;
  };

  const handleStatusChange = async (providerId: number, status: 'active' | 'inactive') => {
    try {
      await lsmApi.setProviderStatus(providerId, status);
      // Refresh the provider list
      await fetchProviders();
    } catch (error) {
      console.error('Error changing provider status:', error);
      throw error;
    }
  };

  const handleRequestBan = async (providerId: number, reason: string) => {
    try {
      await lsmApi.requestBan(providerId, reason);
      // Refresh the provider list
      await fetchProviders();
    } catch (error) {
      console.error('Error requesting ban:', error);
      throw error;
    }
  };

  const handleViewDetails = (providerId: number) => {
    setSelectedProviderId(providerId);
  };

  const handleCloseModal = () => {
    setSelectedProviderId(null);
  };

  if (loading && allProviders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <CardListSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Management</h1>
          <p className="text-gray-600">
            Manage and monitor service providers in your region
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('active')}
                className={'flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium text-sm transition-all ' + (activeFilter === 'active' ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent')}
              >
                Active Providers
                <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                  {getStatusCount('active')}
                </span>
              </button>
              
              <button
                onClick={() => handleFilterChange('inactive')}
                className={'flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium text-sm transition-all ' + (activeFilter === 'inactive' ? 'bg-gray-100 text-gray-700 border-2 border-gray-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent')}
              >
                Inactive Providers
                <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                  {getStatusCount('inactive')}
                </span>
              </button>
              
              <button
                onClick={() => handleFilterChange('banned')}
                className={'flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium text-sm transition-all ' + (activeFilter === 'banned' ? 'bg-red-200 text-red-900 border-2 border-red-400' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent')}
              >
                Banned Providers
                <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                  {getStatusCount('banned')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Providers Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredProviders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Providers Found</h3>
                <p className="text-gray-600 mb-6">
                  There are no {activeFilter} providers in your region.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Providers ({filteredProviders.length})
                </h2>
                <button
                  onClick={fetchProviders}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="inline-block">↻</span> Refresh
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProviders.map((provider) => (
                  <ProviderManagementCard 
                    key={provider.id} 
                    provider={provider}
                    onStatusChange={handleStatusChange}
                    onRequestBan={handleRequestBan}
                    onRefresh={fetchProviders}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Provider Detail Modal */}
        {selectedProviderId && (
          <ProviderDetailModal
            providerId={selectedProviderId}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}
