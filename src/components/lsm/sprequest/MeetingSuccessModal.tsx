'use client';

import { MeetingResponseDto } from '@/types/meeting';

interface MeetingSuccessModalProps {
  meeting: MeetingResponseDto;
  onClose: () => void;
  onViewDetails?: () => void;
}

export default function MeetingSuccessModal({
  meeting,
  onClose,
  onViewDetails,
}: MeetingSuccessModalProps) {
  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: meeting.timezone,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">✅ Meeting Scheduled Successfully!</h2>
              <p className="text-green-100 text-sm mt-1">
                Your Zoom meeting has been created and the provider has been notified
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-green-800 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meeting Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Meeting Details</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32 flex-shrink-0">Title:</span>
                <span className="text-gray-900">{meeting.title}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32 flex-shrink-0">Provider:</span>
                <span className="text-gray-900">{meeting.provider_business_name}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32 flex-shrink-0">Email:</span>
                <span className="text-gray-900">{meeting.provider_email}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32 flex-shrink-0">Start Time:</span>
                <span className="text-gray-900">{formatDateTime(meeting.scheduled_start)}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32 flex-shrink-0">End Time:</span>
                <span className="text-gray-900">{formatDateTime(meeting.scheduled_end)}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32 flex-shrink-0">Timezone:</span>
                <span className="text-gray-900">{meeting.timezone}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32 flex-shrink-0">Meeting ID:</span>
                <span className="text-gray-900 font-mono">{meeting.zoom_meeting_id}</span>
              </div>
              {meeting.zoom_password && (
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 w-32 flex-shrink-0">Passcode:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-3 py-1 rounded text-gray-900 font-mono">
                      {meeting.zoom_password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(meeting.zoom_password!, 'Passcode')}
                      className="text-blue-600 hover:text-blue-700"
                      title="Copy passcode"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zoom Links */}
          <div className="space-y-4 mb-6">
            {/* Host Start Link (for LSM) */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 flex items-center">
                  <span className="mr-2">🚀</span>
                  Your Host Start Link (LSM)
                </h4>
                <button
                  onClick={() => copyToClipboard(meeting.zoom_start_url, 'Host link')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Use this link to start and host the meeting
              </p>
              <div className="bg-white border border-green-200 rounded p-3 break-all text-sm font-mono text-gray-700">
                {meeting.zoom_start_url}
              </div>
              <a
                href={meeting.zoom_start_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                🚀 Start Meeting Now
              </a>
            </div>

            {/* Provider Join Link */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 flex items-center">
                  <span className="mr-2">🔗</span>
                  Provider Join Link
                </h4>
                <button
                  onClick={() => copyToClipboard(meeting.zoom_join_url, 'Join link')}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                This link has been sent to the provider via email
              </p>
              <div className="bg-white border border-blue-200 rounded p-3 break-all text-sm font-mono text-gray-700">
                {meeting.zoom_join_url}
              </div>
            </div>
          </div>

          {/* Email Notification */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">📧 Email Notification Sent</p>
                <p>
                  An email with the meeting details, join link, and passcode has been sent to{' '}
                  <span className="font-semibold">{meeting.provider_email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            {onViewDetails && (
              <button
                onClick={() => {
                  onClose();
                  onViewDetails();
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                📋 View Meeting Details
              </button>
            )}
            <a
              href={meeting.zoom_start_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
            >
              🚀 Start Meeting Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
