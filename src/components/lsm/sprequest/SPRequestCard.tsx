'use client';

import { PendingOnboardingResponse } from '@/api/lsm';

interface SPRequestCardProps {
  request: PendingOnboardingResponse;
  onClick: () => void;
}

export default function SPRequestCard({ request, onClick }: SPRequestCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {request.businessName}
        </h3>
        <div className="flex flex-col items-end space-y-1">
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            ⏳ PENDING
          </span>
          {request.readyForActivation && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              ✅ READY
            </span>
          )}
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium">Contact:</span> {request.user.name}</p>
        <p><span className="font-medium">Email:</span> {request.user.email}</p>
        <p><span className="font-medium">Phone:</span> {request.user.phone}</p>
        <p><span className="font-medium">Location:</span> {request.location}</p>
        <p><span className="font-medium">Experience:</span> {request.experience} years ({request.experienceLevel})</p>
        <div className="flex items-center justify-between">
          <p><span className="font-medium">Documents:</span></p>
          <div className="flex space-x-1">
            <span className="px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded">
              {request.documents.verified}✓
            </span>
            <span className="px-1 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
              {request.documents.pending}⏳
            </span>
            <span className="px-1 py-0.5 bg-red-100 text-red-700 text-xs rounded">
              {request.documents.rejected}✗
            </span>
          </div>
        </div>
        <p><span className="font-medium">Services:</span> {request.requestedServices.slice(0, 2).join(', ')}
          {request.requestedServices.length > 2 && ` +${request.requestedServices.length - 2} more`}
        </p>
      </div>
      <div className="mt-3 pt-3 border-t">
        <p className="text-blue-600 text-sm font-medium">
          Click to view details →
        </p>
      </div>
    </div>
  );
}
