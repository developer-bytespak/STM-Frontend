'use client';

import { ProviderInRegion } from '@/api/lsm';

interface ProviderStatusCardProps {
  provider: ProviderInRegion;
  onClick?: () => void;
}

export default function ProviderStatusCard({ provider, onClick }: ProviderStatusCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'banned':
        return 'bg-red-200 text-red-900 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      case 'inactive':
        return '⏸️';
      case 'banned':
        return '🚫';
      default:
        return '📋';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {provider.businessName}
          </h3>
          <p className="text-sm text-gray-600">
            {provider.user.first_name} {provider.user.last_name}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}
        >
          {getStatusIcon(provider.status)} {provider.status.toUpperCase()}
        </span>
      </div>

      {/* Provider Details */}
      <div className="space-y-2 text-sm mb-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">📧</span>
          <span className="text-gray-700">{provider.user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">📱</span>
          <span className="text-gray-700">{provider.user.phone_number}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">⭐</span>
          <span className="text-gray-700">
            {provider.rating.toFixed(1)} • {provider.experience} years exp
          </span>
        </div>
      </div>

      {/* Services */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-600 mb-1">Services:</p>
        <div className="flex flex-wrap gap-1">
          {provider.services.slice(0, 3).map((service, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
            >
              {service.name}
            </span>
          ))}
          {provider.services.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
              +{provider.services.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Service Areas */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-600 mb-1">Areas:</p>
        <div className="flex flex-wrap gap-1">
          {provider.serviceAreas.slice(0, 4).map((area, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
            >
              {area}
            </span>
          ))}
          {provider.serviceAreas.length > 4 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
              +{provider.serviceAreas.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Rejection Reason (if rejected) */}
      {provider.status === 'rejected' && provider.rejectionReason && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
          <p className="text-xs text-red-700">{provider.rejectionReason}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>💼 {provider.jobCount} jobs</span>
          <span>📄 {provider.documentCount} docs</span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(provider.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

