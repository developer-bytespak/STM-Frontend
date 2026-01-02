/**
 * Meetings API Client - LSM Provider Meeting Scheduling
 */

import { apiClient } from './index';
import type {
  Meeting,
  ScheduleMeetingDto,
  RescheduleMeetingDto,
  MeetingResponseDto,
  CompleteMeetingDto,
  CancelMeetingDto,
} from '@/types/meeting';

/**
 * Schedule a new meeting with a provider
 */
export async function scheduleMeeting(
  data: ScheduleMeetingDto
): Promise<MeetingResponseDto> {
  const response = await apiClient.request<MeetingResponseDto>(
    '/lsm/meetings/schedule',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response;
}

/**
 * Get all meetings for current LSM
 */
export async function getLsmMeetings(): Promise<Meeting[]> {
  const response = await apiClient.request<Meeting[]>('/lsm/meetings');
  return response;
}

/**
 * Get pending meetings (not confirmed/completed)
 */
export async function getPendingMeetings(): Promise<Meeting[]> {
  const response = await apiClient.request<Meeting[]>('/lsm/meetings/pending');
  return response;
}

/**
 * Get a specific meeting by ID
 */
export async function getMeetingById(meetingId: string): Promise<Meeting> {
  const response = await apiClient.request<Meeting>(`/lsm/meetings/${meetingId}`);
  return response;
}

/**
 * Reschedule a meeting
 */
export async function rescheduleMeeting(
  meetingId: string,
  data: RescheduleMeetingDto
): Promise<MeetingResponseDto> {
  const response = await apiClient.request<MeetingResponseDto>(
    `/lsm/meetings/${meetingId}/reschedule`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
  return response;
}

/**
 * Complete a meeting
 */
export async function completeMeeting(
  meetingId: string,
  data?: CompleteMeetingDto
): Promise<MeetingResponseDto> {
  const response = await apiClient.request<MeetingResponseDto>(
    `/lsm/meetings/${meetingId}/complete`,
    {
      method: 'PATCH',
      body: JSON.stringify(data || {}),
    }
  );
  return response;
}

/**
 * Cancel a meeting
 */
export async function cancelMeeting(
  meetingId: string,
  data?: CancelMeetingDto
): Promise<MeetingResponseDto> {
  const response = await apiClient.request<MeetingResponseDto>(
    `/lsm/meetings/${meetingId}`,
    {
      method: 'DELETE',
      body: JSON.stringify(data || {}),
    }
  );
  return response;
}
