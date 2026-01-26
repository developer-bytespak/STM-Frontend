'use client';

import { useState, useRef } from 'react';
import NotificationPopup from './NotificationPopup';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationBellProps {
  userRole?: 'customer' | 'service_provider' | 'admin' | 'local_service_manager';
}

export default function NotificationBell({ userRole }: NotificationBellProps) {
  const [showPopup, setShowPopup] = useState(false);
  const bellRef = useRef<HTMLDivElement | null>(null);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  } = useNotifications();

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const closePopup = () => {
    setShowPopup(false);
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
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onClearRead={clearReadNotifications}
          onClose={closePopup}
          bellRef={bellRef}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMoreNotifications}
        />
      )}
    </div>
  );
}
