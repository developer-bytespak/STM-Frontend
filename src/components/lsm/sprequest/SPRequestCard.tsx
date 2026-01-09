'use client';

import { PendingOnboardingResponse } from '@/api/lsm';
import { Meeting } from '@/types/meeting';

interface SPRequestCardProps {
  request: PendingOnboardingResponse;
  onClick: () => void;
  onScheduleMeeting?: (request: PendingOnboardingResponse) => void;
  onViewMeeting?: (request: PendingOnboardingResponse) => void;
  scheduledMeeting?: Meeting | null;
}

export default function SPRequestCard({ 
  request, 
  onClick, 
  onScheduleMeeting,
  onViewMeeting,
  scheduledMeeting 
}: SPRequestCardProps) {
  const handleScheduleMeeting = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onScheduleMeeting) {
      onScheduleMeeting(request);
    }
  };

  const handleViewMeeting = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onViewMeeting) {
      onViewMeeting(request);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {request.businessName}
        </h3>
        <div className="flex flex-wrap gap-2 items-start justify-end">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full whitespace-nowrap">
            ⏳ PENDING
          </span>
          {request.readyForActivation && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full whitespace-nowrap">
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
      <div className="mt-3 pt-3 border-t flex flex-col gap-2">
        {/* Meeting Status or Schedule Button */}
        {scheduledMeeting ? (
          <button
            onClick={handleViewMeeting}
            className="w-full px-4 py-2 bg-green-100 border-2 border-green-400 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            ✅ Meeting Scheduled - View Details
          </button>
        ) : onScheduleMeeting && (
          <button
            onClick={handleScheduleMeeting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            📅 Schedule Meeting
          </button>
        )}
        <p className="text-blue-600 text-sm font-medium text-center">
          Click to view details →
        </p>
      </div>
    </div>
  );
}
