/**
 * Meeting Types for LSM-Provider Zoom Meetings
 */

export enum MeetingStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Meeting {
  id: string;
  provider_id: number;
  lsm_id: number;
  provider_email: string;
  provider_business_name: string;
  zoom_meeting_id: string;
  zoom_join_url: string;
  zoom_start_url: string;
  zoom_password?: string;
  scheduled_start: string | Date;
  scheduled_end: string | Date;
  timezone: string;
  title: string;
  meeting_description: string;
  meeting_status: MeetingStatus;
  is_rescheduled: boolean;
  rescheduled_at?: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
  provider?: {
    id: number;
    business_name: string;
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
    };
  };
  lsm?: {
    id: number;
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
    };
  };
}

export interface ScheduleMeetingDto {
  provider_id: number;
  scheduled_start: string;
  scheduled_end: string;
  timezone?: string;
  title?: string;
  meeting_description?: string;
}

export interface RescheduleMeetingDto {
  scheduled_start: string;
  scheduled_end: string;
}

export interface MeetingResponseDto extends Meeting {
  zoom_password?: string;
}

export interface CompleteMeetingDto {
  notes?: string;
}

export interface CancelMeetingDto {
  reason?: string;
}
