'use client';

import { useState } from 'react';
import { Meeting, RescheduleMeetingDto } from '@/types/meeting';
import { rescheduleMeeting, cancelMeeting } from '@/api/meetings';

interface MeetingDetailsModalProps {
  meeting: Meeting;
  onClose: () => void;
  onUpdate: () => void;
}

export default function MeetingDetailsModal({
  meeting,
  onClose,
  onUpdate,
}: MeetingDetailsModalProps) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rescheduleData, setRescheduleData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: meeting.timezone,
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      timeStyle: 'short',
      timeZone: meeting.timezone,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      scheduled: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Scheduled' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: '✓ Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Cancelled' },
    };

    const config = statusConfig[meeting.meeting_status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} text-sm font-medium rounded-full`}>
        {config.label}
      </span>
    );
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!rescheduleData.startDate || !rescheduleData.startTime) {
        throw new Error('Please select start date and time');
      }
      if (!rescheduleData.endDate || !rescheduleData.endTime) {
        throw new Error('Please select end date and time');
      }

      const scheduledStart = new Date(`${rescheduleData.startDate}T${rescheduleData.startTime}`);
      const scheduledEnd = new Date(`${rescheduleData.endDate}T${rescheduleData.endTime}`);

      if (scheduledStart >= scheduledEnd) {
        throw new Error('End time must be after start time');
      }

      if (scheduledStart < new Date()) {
        throw new Error('Cannot schedule meeting in the past');
      }

      const dto: RescheduleMeetingDto = {
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
      };

      await rescheduleMeeting(meeting.id, dto);
      alert('Meeting rescheduled successfully!');
      setShowReschedule(false);
      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this meeting?')) {
      return;
    }

    setLoading(true);
    try {
      await cancelMeeting(meeting.id);
      alert('Meeting cancelled successfully!');
      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel meeting');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value;
    const startDate = rescheduleData.startDate;
    
    setRescheduleData((prev) => ({ ...prev, startTime }));

    if (startTime && startDate) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      
      const endDate = end.toISOString().split('T')[0];
      const endTime = end.toTimeString().slice(0, 5);
      
      setRescheduleData((prev) => ({ ...prev, endDate, endTime }));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📅 Meeting Details</h2>
              <p className="text-blue-100 text-sm mt-1">
                {meeting.provider_business_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <button
                onClick={onClose}
                className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {!showReschedule ? (
            <>
              {/* Meeting Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{meeting.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-32 flex-shrink-0">📧 Provider:</span>
                    <span className="text-gray-900">{meeting.provider_email}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-32 flex-shrink-0">📅 Start:</span>
                    <span className="text-gray-900">{formatDateTime(meeting.scheduled_start)}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-32 flex-shrink-0">🕐 End:</span>
                    <span className="text-gray-900">{formatDateTime(meeting.scheduled_end)}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-32 flex-shrink-0">🌍 Timezone:</span>
                    <span className="text-gray-900">{meeting.timezone}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-32 flex-shrink-0">🆔 Meeting ID:</span>
                    <span className="text-gray-900 font-mono">{meeting.zoom_meeting_id}</span>
                  </div>
                  {meeting.is_rescheduled && (
                    <div className="flex items-start">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                        🔄 Rescheduled
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Zoom Links */}
              <div className="space-y-4 mb-6">
                {/* Host Start Link */}
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 flex items-center">
                      <span className="mr-2">🚀</span>
                      Your Host Start Link
                    </h4>
                    <button
                      onClick={() => copyToClipboard(meeting.zoom_start_url, 'Host link')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-white border border-green-200 rounded p-3 break-all text-sm font-mono text-gray-700 mb-3">
                    {meeting.zoom_start_url}
                  </div>
                  <a
                    href={meeting.zoom_start_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    🚀 Start Meeting
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
                  <div className="bg-white border border-blue-200 rounded p-3 break-all text-sm font-mono text-gray-700">
                    {meeting.zoom_join_url}
                  </div>
                </div>
              </div>

              {/* Description */}
              {meeting.meeting_description && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-gray-900 mb-2">📝 Description</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{meeting.meeting_description}</p>
                </div>
              )}

              {/* Action Buttons */}
              {meeting.meeting_status !== 'cancelled' && meeting.meeting_status !== 'completed' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReschedule(true)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    🔄 Reschedule Meeting
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    disabled={loading}
                  >
                    ❌ Cancel Meeting
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Reschedule Form */
            <form onSubmit={handleReschedule}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔄 Reschedule Meeting</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={rescheduleData.startDate}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, startDate: e.target.value })}
                    min={getMinDate()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={rescheduleData.startTime}
                    onChange={handleStartTimeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={rescheduleData.endDate}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, endDate: e.target.value })}
                    min={rescheduleData.startDate || getMinDate()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={rescheduleData.endTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReschedule(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  disabled={loading}
                >
                  {loading ? 'Rescheduling...' : '✅ Confirm Reschedule'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
