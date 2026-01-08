'use client';

import { useState } from 'react';
import { scheduleMeeting } from '@/api/meetings';
import { ScheduleMeetingDto } from '@/types/meeting';

interface ScheduleMeetingModalProps {
  providerId: number;
  providerName: string;
  providerEmail: string;
  onClose: () => void;
  onSuccess: (meetingData: any) => void;
  onBackdropClick: (e: React.MouseEvent) => void;
}

export default function ScheduleMeetingModal({
  providerId,
  providerName,
  providerEmail,
  onClose,
  onSuccess,
  onBackdropClick,
}: ScheduleMeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    title: `Onboarding Meeting - ${providerName}`,
    description: `Provider onboarding meeting for ${providerName}`,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate dates
      if (!formData.startDate || !formData.startTime) {
        throw new Error('Please select start date and time');
      }

      if (!formData.endDate || !formData.endTime) {
        throw new Error('Please select end date and time');
      }

      // Combine date and time
      const scheduledStart = new Date(`${formData.startDate}T${formData.startTime}`);
      const scheduledEnd = new Date(`${formData.endDate}T${formData.endTime}`);

      // Validate times
      if (scheduledStart >= scheduledEnd) {
        throw new Error('End time must be after start time');
      }

      if (scheduledStart < new Date()) {
        throw new Error('Cannot schedule meeting in the past');
      }

      const duration = (scheduledEnd.getTime() - scheduledStart.getTime()) / (1000 * 60);
      if (duration < 15) {
        throw new Error('Meeting must be at least 15 minutes long');
      }

      if (duration > 480) {
        throw new Error('Meeting cannot be longer than 8 hours');
      }

      // Prepare DTO
      const dto: ScheduleMeetingDto = {
        provider_id: providerId,
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
        timezone: formData.timezone,
        title: formData.title,
        meeting_description: formData.description,
      };

      // Schedule meeting
      const result = await scheduleMeeting(dto);
      
      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error('Error scheduling meeting:', err);
      setError(err.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  // Get min date (today) in YYYY-MM-DD format
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Auto-fill end time based on start time (default 1 hour duration)
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value;
    const startDate = formData.startDate;
    
    setFormData((prev) => ({
      ...prev,
      startTime,
    }));

    if (startTime && startDate) {
      // Calculate end time (1 hour later)
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      
      const endDate = end.toISOString().split('T')[0];
      const endTime = end.toTimeString().slice(0, 5);
      
      setFormData((prev) => ({
        ...prev,
        endDate,
        endTime,
      }));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📅 Schedule Zoom Meeting</h2>
              <p className="text-blue-100 text-sm mt-1">
                Schedule an onboarding meeting with {providerName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Provider Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Provider Details</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Name:</span> {providerName}</p>
              <p><span className="font-medium">Email:</span> {providerEmail}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Meeting Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Onboarding Meeting"
              required
            />
          </div>

          {/* Meeting Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add meeting agenda or notes..."
            />
          </div>

          {/* Date and Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={getMinDate()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleStartTimeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || getMinDate()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Timezone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
              <option value="UTC">UTC</option>
              <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                {Intl.DateTimeFormat().resolvedOptions().timeZone} (Auto-detected)
              </option>
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Meeting Details:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>A Zoom meeting will be created automatically</li>
                  <li>Provider will receive an email with the meeting link and password</li>
                  <li>You'll receive the host start link after scheduling</li>
                  <li>Meeting duration should be between 15 minutes and 8 hours</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scheduling...
                </span>
              ) : (
                '📅 Schedule Meeting'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
