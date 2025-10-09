'use client';

import { PendingOnboardingResponse } from '@/api/lsm';
import SPRequestCard from './SPRequestCard';

interface SPRequestListProps {
  requests: PendingOnboardingResponse[];
  onRequestClick: (request: PendingOnboardingResponse) => void;
}

export default function SPRequestList({ requests, onRequestClick }: SPRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No Pending Requests
        </h3>
        <p className="text-gray-500">
          All service provider requests have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Pending Approval ({requests.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((request) => (
          <SPRequestCard
            key={request.id}
            request={request}
            onClick={() => onRequestClick(request)}
          />
        ))}
      </div>
    </div>
  );
}
