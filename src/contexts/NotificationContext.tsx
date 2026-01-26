'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getCombinedNotifications, markNotificationAsRead as markAsReadApi, markAllAsRead, clearReadNotifications as clearReadApi, deleteNotification as deleteApi } from '@/api/notifications';
import type { Notification } from '@/api/notifications';
import { socketService } from '@/lib/socketService';
import { useAuth } from '@/hooks/useAuth';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  fetchNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string | number) => Promise<void>;
  clearReadNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const isInitializedRef = useRef(false);
  const socketListenersAttachedRef = useRef(false);
  const userIdRef = useRef<string | number | null>(null);
  const fetchInProgressRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const PAGE_SIZE = 10;

  // Fetch notifications - memoized with useCallback
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    // 🛡️ REQUEST DEDUPLICATION: Prevent duplicate requests
    if (fetchInProgressRef.current) {
      console.log('⏳ Fetch already in progress, skipping...');
      return;
    }

    try {
      fetchInProgressRef.current = true;
      setIsLoading(true);
      const response = await getCombinedNotifications({
        limit: PAGE_SIZE,
        offset: 0,
      });
      
      setNotifications(response.notifications || []);
      setPage(1);
      setHasMore((response.notifications?.length || 0) >= PAGE_SIZE);
      // ✅ USE SERVER-SIDE UNREAD COUNT (accurate across all notifications)
      setUnreadCount(response.unreadCount || 0);
      console.log(`✅ Fetched ${response.notifications?.length || 0} notifications, ${response.unreadCount || 0} unread`);
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [isAuthenticated, user, PAGE_SIZE]);

  // Load more notifications - for Load More button
  const loadMoreNotifications = useCallback(async () => {
    if (!isAuthenticated || !user || !hasMore || fetchInProgressRef.current) return;

    try {
      fetchInProgressRef.current = true;
      setIsLoading(true);
      const response = await getCombinedNotifications({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      
      // 🛡️ PREVENT DUPLICATES: Filter out notifications that already exist
      const existingIds = new Set(notifications.map(n => n.id));
      const newNotifications = (response.notifications || []).filter(
        n => !existingIds.has(n.id)
      );
      
      setNotifications(prev => [...prev, ...newNotifications]);
      setPage(prev => prev + 1);
      setHasMore((response.notifications?.length || 0) >= PAGE_SIZE);
      console.log(`✅ Loaded ${newNotifications.length} more notifications (page ${page + 1})`);
    } catch (error) {
      console.error('❌ Failed to load more notifications:', error);
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [isAuthenticated, user, hasMore, page, PAGE_SIZE, notifications]);

  // Initial fetch - ONLY ONCE per user
  useEffect(() => {
    if (!isAuthenticated || !user) {
      isInitializedRef.current = false;
      userIdRef.current = null;
      setNotifications([]);
      setUnreadCount(0);
      setPage(0);
      setHasMore(true);
      return;
    }

    // Check if already initialized for this user
    if (isInitializedRef.current && userIdRef.current === user.id) return;
    
    isInitializedRef.current = true;
    userIdRef.current = user.id;
    fetchNotifications();
  }, [isAuthenticated, user?.id, fetchNotifications]);

  // Socket.IO real-time listener - ONLY ONCE per user
  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketListenersAttachedRef.current = false;
      userIdRef.current = null;
      return;
    }

    // Check if already attached for this user
    if (socketListenersAttachedRef.current && userIdRef.current === user.id) return;

    try {
      const socket = socketService.connect();
      if (!socket) {
        console.warn('⚠️ Socket.IO not connected, using polling fallback');
        return;
      }

      socketListenersAttachedRef.current = true;
      userIdRef.current = user.id;

      // Handle new notification in real-time
      const handleNewNotification = (data: any) => {
        console.log('🔔 Real-time notification received:', data);
        
        const newNotification: Notification = data.notification || {
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

        // 🛡️ PREVENT DUPLICATES: Check if notification already exists
        setNotifications(prev => {
          const exists = prev.some(n => n.id === newNotification.id);
          if (exists) {
            console.log('⚠️ Duplicate notification, skipping:', newNotification.id);
            return prev;
          }
          return [newNotification, ...prev];
        });
        
        // ✅ USE SERVER-PROVIDED TOTAL UNREAD COUNT if available
        if (data.totalUnreadCount !== undefined) {
          setUnreadCount(data.totalUnreadCount);
          console.log(`🔴 Badge updated: ${data.totalUnreadCount} total unread`);
        } else if (!newNotification.is_read) {
          setUnreadCount(prev => prev + 1);
          console.log('🔴 Badge updated: +1 unread');
        }
      };

      // Handle combined job request + chat event
      const handleNewJobWithChat = (data: any) => {
        console.log('🔔💬 New job request with chat:', data);
        
        // Add notification to bell
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
        
        // Dispatch event for chat auto-open (handled by ChatContext)
        if (data.chat) {
          window.dispatchEvent(new CustomEvent('auto_open_chat', {
            detail: {
              chatId: data.chat.chatId,
              jobId: data.notification?.jobId,
              message: data.chat,
            }
          }));
        }
      };

      // ✅ STANDARDIZED EVENT: Primary modern event
      socket.on('notification:created', handleNewNotification);
      
      // Legacy fallback for backward compatibility
      socket.on('notification', handleNewNotification);
      socket.on('new_job_with_chat', handleNewJobWithChat);

      console.log('✅ Socket.IO listener ready for real-time notifications');

      return () => {
        socket.off('notification:created', handleNewNotification);
        socket.off('notification', handleNewNotification);
        socket.off('new_job_with_chat', handleNewJobWithChat);
      };
    } catch (error) {
      console.error('❌ Error setting up Socket.IO listener:', error);
    }
  }, [isAuthenticated, user?.id]);

  // 🔌 RECONNECTION HANDLER: Sync missed notifications on reconnect
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = socketService.connect();
    if (!socket) return;

    const handleConnect = () => {
      console.log('✅ Socket reconnected, syncing missed notifications');
      fetchNotifications(); // Immediate sync on reconnect
    };

    const handleDisconnect = (reason: string) => {
      console.log('⚠️ Socket disconnected:', reason);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [isAuthenticated, user?.id, fetchNotifications]);

  // ⏰ SMART POLLING: Only polls when socket is disconnected (95% API call reduction)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Poll every 60 seconds, but ONLY if socket is disconnected
    pollingIntervalRef.current = setInterval(() => {
      const socket = socketService.getSocket?.() || socketService.connect();
      
      if (!socket || !socket.connected) {
        console.log('⚠️ Socket disconnected, using fallback polling');
        fetchNotifications();
      } else {
        console.log('✅ Socket connected, skipping poll');
      }
    }, 60000); // 60 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id, fetchNotifications]);

  // Mark as read
  const markAsRead = async (id: string | number) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.is_read) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await markAsReadApi(id);
    } catch (error) {
      // Revert on error
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
      setUnreadCount(prev => prev + 1);
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsReadHandler = async () => {
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await markAllAsRead();
    } catch (error) {
      // Revert on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string | number) => {
    const notificationToDelete = notifications.find(n => n.id === id);
    if (!notificationToDelete) return;

    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!notificationToDelete.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await deleteApi(id);
    } catch (error) {
      // Refetch on error
      fetchNotifications();
      console.error('Failed to delete notification:', error);
    }
  };

  // Clear read notifications
  const clearReadNotifications = async () => {
    const previousNotifications = [...notifications];

    // Optimistic update
    setNotifications(prev => prev.filter(n => !n.is_read));

    try {
      await clearReadApi();
    } catch (error) {
      // Revert on error
      setNotifications(previousNotifications);
      console.error('Failed to clear read notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        fetchNotifications,
        loadMoreNotifications,
        markAsRead,
        markAllAsRead: markAllAsReadHandler,
        deleteNotification,
        clearReadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
