'use client';

import React from 'react';
import { Meeting } from '@/types/meeting';

interface MeetingCardProps {
  meeting: Meeting;
  onView: (m: Meeting) => void;
}

export default function MeetingCard({ meeting, onView }: MeetingCardProps) {
  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const durationMinutes = Math.max(0, (new Date(meeting.scheduled_end).getTime() - new Date(meeting.scheduled_start).getTime()) / 60000);
  const durationStr = durationMinutes >= 60 ? `${Math.round(durationMinutes/60)}h` : `${Math.round(durationMinutes)}m`;

  const statusColors: Record<string, string> = {
    scheduled: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 -m-5 p-4 mb-3 border-b border-blue-100">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{meeting.title}</h4>
            <p className="text-xs text-gray-600 truncate mt-0.5">with {meeting.provider_business_name}</p>
          </div>
          <div className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${statusColors[meeting.meeting_status] || 'bg-gray-100 text-gray-800'}`}>
            {meeting.meeting_status === 'scheduled' && '✓ '}
            {meeting.meeting_status === 'pending' && '⏳ '}
            {meeting.meeting_status.charAt(0).toUpperCase() + meeting.meeting_status.slice(1)}
          </div>
        </div>
      </div>

      {/* Meeting details */}
      <div className="space-y-2.5 flex-1">
        <div className="flex items-center gap-3">
          <span className="text-lg flex-shrink-0">📅</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 font-medium">Date & Time</p>
            <p className="text-sm font-semibold text-gray-900">{formatDateTime(meeting.scheduled_start)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg flex-shrink-0">⏱️</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 font-medium">Duration</p>
            <p className="text-sm font-semibold text-gray-900">{durationStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg flex-shrink-0">🔗</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 font-medium">Zoom Meeting ID</p>
            <p className="text-xs font-mono text-blue-600 break-all hover:text-blue-700">{meeting.zoom_meeting_id}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={(e) => { e.stopPropagation(); onView(meeting); }}
          className="flex-1 text-sm px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 hover:shadow-md"
        >
          View Details
        </button>
        <a
          href={meeting.zoom_join_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-sm px-4 py-2.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium hover:border-blue-400"
        >
          🚀 Join
        </a>
      </div>
    </div>
  );
}
