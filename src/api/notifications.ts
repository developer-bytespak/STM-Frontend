/**
 * Notifications API
 * Handles all notification-related API calls
 */

import { apiClient } from './index';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type NotificationType = 
  | 'job' 
  | 'payment' 
  | 'message' 
  | 'system' 
  | 'approval' 
  | 'dispute'
  | 'booking'
  | 'provider_request';

export type RecipientType = 'customer' | 'provider' | 'service_provider' | 'lsm' | 'local_service_manager' | 'admin';

export interface Notification {
  id: number | string; // Can be number or UUID string
  recipient_type: RecipientType;
  recipient_id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CombinedNotificationsQueryDto {
  recipient_type?: RecipientType;
  recipient_id?: number;
  type?: NotificationType;
  is_read?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationsListResponseDto {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
  unreadCount: number;
}

export interface UnreadCountResponseDto {
  count: number;
}

export interface MarkAllAsReadResponseDto {
  count: number;
}

export interface ClearReadNotificationsResponseDto {
  count: number;
}

export interface NotificationResponseDto {
  id: number;
  recipient_type: RecipientType;
  recipient_id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DeleteNotificationResponseDto {
  message: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get combined notifications
 * For regular users: returns their own notifications
 * For admins: can filter platform-wide using recipient_type and recipient_id
 * 
 * Backend endpoint: GET /notifications
 */
export async function getCombinedNotifications(
  query?: CombinedNotificationsQueryDto
): Promise<NotificationsListResponseDto> {
  const queryParams = new URLSearchParams();
  
  if (query?.recipient_type) {
    queryParams.append('recipient_type', query.recipient_type);
  }
  if (query?.recipient_id !== undefined) {
    queryParams.append('recipient_id', query.recipient_id.toString());
  }
  if (query?.type) {
    queryParams.append('type', query.type);
  }
  if (query?.is_read !== undefined) {
    queryParams.append('is_read', query.is_read.toString());
  }
  if (query?.limit !== undefined) {
    queryParams.append('limit', query.limit.toString());
  }
  if (query?.offset !== undefined) {
    queryParams.append('offset', query.offset.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;

  return apiClient.request<NotificationsListResponseDto>(endpoint, {
    method: 'GET',
  });
}

/**
 * Get unread notifications count for the current user
 * 
 * Backend endpoint: GET /notifications/unread-count
 */
export async function getUnreadCount(): Promise<UnreadCountResponseDto> {
  return apiClient.request<UnreadCountResponseDto>('/notifications/unread-count', {
    method: 'GET',
  });
}

/**
 * Mark all notifications as read for the current user
 * 
 * Backend endpoint: PATCH /notifications/mark-all-read
 */
export async function markAllAsRead(): Promise<MarkAllAsReadResponseDto> {
  return apiClient.request<MarkAllAsReadResponseDto>('/notifications/mark-all-read', {
    method: 'PATCH',
  });
}

/**
 * Clear (delete) all read notifications for the current user
 * 
 * Backend endpoint: DELETE /notifications/clear-read
 */
export async function clearReadNotifications(): Promise<ClearReadNotificationsResponseDto> {
  return apiClient.request<ClearReadNotificationsResponseDto>('/notifications/clear-read', {
    method: 'DELETE',
  });
}

/**
 * Get a specific notification by ID
 * Users can only access their own notifications
 * 
 * Backend endpoint: GET /notifications/:id
 */
export async function getNotificationById(id: string | number): Promise<NotificationResponseDto> {
  return apiClient.request<NotificationResponseDto>(`/notifications/${id}`, {
    method: 'GET',
  });
}

/**
 * Mark a specific notification as read
 * Users can only mark their own notifications as read
 * 
 * Backend endpoint: PATCH /notifications/:id/read
 */
export async function markNotificationAsRead(id: string | number): Promise<NotificationResponseDto> {
  return apiClient.request<NotificationResponseDto>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

/**
 * Delete a specific notification
 * Users can only delete their own notifications
 * 
 * Backend endpoint: DELETE /notifications/:id
 */
export async function deleteNotification(id: string | number): Promise<DeleteNotificationResponseDto> {
  return apiClient.request<DeleteNotificationResponseDto>(`/notifications/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get relative time string from timestamp
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

/**
 * Map user role to recipient type
 */
export function mapRoleToRecipientType(role: string): RecipientType {
  const roleMap: Record<string, RecipientType> = {
    'customer': 'customer',
    'service_provider': 'provider',
    'provider': 'provider',
    'local_service_manager': 'lsm',
    'lsm': 'lsm',
    'admin': 'admin',
  };
  
  return roleMap[role.toLowerCase()] || 'customer';
}

// ============================================================================
// Export
// ============================================================================

export default {
  getCombinedNotifications,
  getUnreadCount,
  markAllAsRead,
  clearReadNotifications,
  getNotificationById,
  markNotificationAsRead,
  deleteNotification,
  getRelativeTime,
  mapRoleToRecipientType,
};
