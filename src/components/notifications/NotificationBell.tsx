'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import NotificationPopup from './NotificationPopup';
import { getCombinedNotifications, markAllAsRead, clearReadNotifications as clearReadNotificationsApi, markNotificationAsRead, deleteNotification as deleteNotificationApi } from '@/api/notifications';
import type { Notification } from '@/api/notifications';
import { useAuth } from '@/hooks/useAuth';
import { socketService } from '@/lib/socketService';

interface NotificationBellProps {
  userRole?: 'customer' | 'service_provider' | 'admin' | 'local_service_manager';
}

export default function NotificationBell({ userRole }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLDivElement | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      setIsLoading(true);
      const response = await getCombinedNotifications({
        limit: 20,
        offset: 0,
      });
      
      setNotifications(response.notifications);
      // Calculate unread count locally from the notifications array
      const unread = response.notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      console.log(`✅ Fetched ${response.notifications.length} notifications, ${unread} unread`);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Poll as fallback every 60 seconds
      const pollInterval = setInterval(fetchNotifications, 60000);
      
      return () => clearInterval(pollInterval);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Socket.IO real-time listener for new notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    try {
      const socket = socketService.connect();
      if (!socket) {
        console.warn('⚠️ Socket.IO not connected, using polling fallback');
        return;
      }

      // Handle new notification in real-time
      const handleNewNotification = (data: any) => {
        console.log('🔔 New notification received via Socket.IO:', data);
        
        const newNotification: Notification = {
          id: data.id || Date.now(),
          recipient_type: data.recipient_type || 'customer',
          recipient_id: data.recipient_id || user.id,
          type: data.type || 'system',
          title: data.title || 'New Notification',
          message: data.message || '',
          is_read: false,
          metadata: data.metadata,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };

        // Add new notification to the top of the list
        setNotifications(prev => [newNotification, ...prev]);
        // Increment unread count (optimistic update)
        setUnreadCount(prev => prev + 1);
        console.log('🔴 Badge updated: +1 unread');
      };

      // Listen for multiple event names (backend compatibility)
      socket.on('notification', handleNewNotification);
      socket.on('notification:new', handleNewNotification);
      socket.on('new_notification', handleNewNotification);

      // NEW: Handle combined job request + chat event
      socket.on('new_job_with_chat', (data: any) => {
        console.log('🔔💬 New job request with chat:', data);
        
        // 1. Add notification to bell
        if (data.notification) {
          const newNotification: Notification = {
            id: Date.now(),
            recipient_type: 'service_provider',
            recipient_id: typeof user.id === 'string' ? parseInt(user.id) : user.id,
            type: data.notification.type || 'job',
            title: data.notification.title,
            message: data.notification.message,
            is_read: false,
            metadata: {
              job_id: data.notification.jobId,
              chat_id: data.notification.chatId,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
        
        // 2. Dispatch event for chat auto-open (handled by ChatContext)
        if (data.chat) {
          window.dispatchEvent(new CustomEvent('auto_open_chat', {
            detail: {
              chatId: data.chat.chatId,
              jobId: data.notification?.jobId,
              message: data.chat,
            }
          }));
        }
      });

      console.log('👂 Socket.IO listener ready for real-time notifications');

      return () => {
        socket.off('notification', handleNewNotification);
        socket.off('notification:new', handleNewNotification);
        socket.off('new_notification', handleNewNotification);
        socket.off('new_job_with_chat');
      };
    } catch (error) {
      console.error('Error setting up Socket.IO listener:', error);
    }
  }, [isAuthenticated, user]);

  const togglePopup = () => {
    setShowPopup(!showPopup);
    // Refresh notifications when opening popup
    if (!showPopup) {
      fetchNotifications();
    }
  };

  const markAsRead = async (id: number | string) => {
    const notification = notifications.find(n => n.id === id);
    
    // Only proceed if notification exists and is unread
    if (!notification || notification.is_read) return;

    // Optimistically update UI (instant feedback)
    const updatedNotifications = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    setNotifications(updatedNotifications);
    // Recalculate unread count from updated array
    const newUnreadCount = updatedNotifications.filter(n => !n.is_read).length;
    setUnreadCount(newUnreadCount);
    console.log(`✓ Marked notification ${id} as read, unread count: ${newUnreadCount}`);

    try {
      // Call API to mark as read
      await markNotificationAsRead(id);
      console.log(`Marked notification ${id} as read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const markAllAsReadHandler = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    
    // Only proceed if there are unread notifications
    if (unreadNotifications.length === 0) return;

    // Optimistically update UI
    const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    console.log(`✓ Marked ${unreadNotifications.length} notifications as read`);

    try {
      // Call API to mark all as read
      const response = await markAllAsRead();
      console.log(`Marked ${response.count} notifications as read`);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: number | string) => {
    const notificationToDelete = notifications.find(n => n.id === id);
    
    if (!notificationToDelete) return;

    // Optimistically update UI
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    // Recalculate unread count from updated array
    if (!notificationToDelete.is_read) {
      const newUnreadCount = updatedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(newUnreadCount);
      console.log(`✓ Deleted notification ${id}, unread count: ${newUnreadCount}`);
    }

    try {
      // Call API to delete notification
      await deleteNotificationApi(id);
      console.log(`Deleted notification ${id}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const clearReadNotifications = async () => {
    const readNotifications = notifications.filter(n => n.is_read);
    
    // Only proceed if there are read notifications
    if (readNotifications.length === 0) return;

    // Optimistically update UI - remove all read notifications
    const updatedNotifications = notifications.filter(n => !n.is_read);
    setNotifications(updatedNotifications);
    // Unread count stays the same since we're only removing read ones
    console.log(`✓ Cleared ${readNotifications.length} read notifications`);

    try {
      // Call API to clear read notifications
      const response = await clearReadNotificationsApi();
      console.log(`Cleared ${response.count} read notifications`);
    } catch (error) {
      console.error('Failed to clear read notifications:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    // Unread count is already calculated locally, no need to refetch
  };

  return (
    <div ref={bellRef} className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={togglePopup}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg cursor-pointer"
        aria-label="Notifications"
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popup */}
      {showPopup && (
        <NotificationPopup
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsReadHandler}
          onDelete={deleteNotification}
          onClearRead={clearReadNotifications}
          onClose={closePopup}
          bellRef={bellRef}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
