'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import NotificationPopup from './NotificationPopup';
import { getCombinedNotifications, getUnreadCount, markAllAsRead, clearReadNotifications as clearReadNotificationsApi, markNotificationAsRead, deleteNotification as deleteNotificationApi } from '@/api/notifications';
import type { Notification } from '@/api/notifications';
import { useAuth } from '@/hooks/useAuth';

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
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Fetch only unread count (lightweight)
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [isAuthenticated, user]);

  // Initial fetch and polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Poll for full notifications every 60 seconds
      const notificationsInterval = setInterval(fetchNotifications, 60000);
      
      // Poll for unread count every 15 seconds (lightweight)
      const unreadCountInterval = setInterval(fetchUnreadCount, 15000);
      
      return () => {
        clearInterval(notificationsInterval);
        clearInterval(unreadCountInterval);
      };
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

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

    // Optimistically update UI
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

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
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);

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
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!notificationToDelete.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
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
    setNotifications(prev => prev.filter(n => !n.is_read));

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
    // Refresh unread count when closing popup to ensure accuracy
    fetchUnreadCount();
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
