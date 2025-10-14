'use client';

import { useState, useEffect, useRef } from 'react';
import NotificationPopup from './NotificationPopup';

interface Notification {
  id: string;
  type: 'job' | 'payment' | 'message' | 'system' | 'approval';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  link?: string;
}

interface NotificationBellProps {
  userRole?: 'customer' | 'service_provider' | 'admin' | 'local_service_manager';
}

export default function NotificationBell({ userRole }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const bellRef = useRef<HTMLDivElement | null>(null);

  // Initialize mock notifications based on user role
  useEffect(() => {
    const mockNotifications = getMockNotifications(userRole);
    setNotifications(mockNotifications);
  }, [userRole]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div ref={bellRef} className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={togglePopup}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
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
          onClose={closePopup}
          bellRef={bellRef}
        />
      )}
    </div>
  );
}

// Mock notifications generator based on user role
function getMockNotifications(userRole?: string): Notification[] {
  const baseTime = new Date();

  switch (userRole) {
    case 'customer':
      return [
        {
          id: '1',
          type: 'job',
          title: 'Job Accepted',
          message: 'Your Plumbing Service request has been accepted by John Doe.',
          isRead: false,
          timestamp: new Date(baseTime.getTime() - 5 * 60000), // 5 min ago
          link: '/customer/bookings'
        },
        {
          id: '2',
          type: 'message',
          title: 'New Message',
          message: 'You have a new message from your service provider.',
          isRead: false,
          timestamp: new Date(baseTime.getTime() - 15 * 60000), // 15 min ago
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payment Confirmed',
          message: 'Your payment of $150.00 has been confirmed.',
          isRead: true,
          timestamp: new Date(baseTime.getTime() - 2 * 60 * 60000), // 2 hours ago
          link: '/customer/payments'
        },
        {
          id: '4',
          type: 'job',
          title: 'Service Provider Proposed Changes',
          message: 'ABC Plumbing proposed changes to your Toilet Repair request. Please review.',
          isRead: true,
          timestamp: new Date(baseTime.getTime() - 24 * 60 * 60000), // 1 day ago
        }
      ];

    case 'service_provider':
      return [
        {
          id: '1',
          type: 'job',
          title: 'New Job Request',
          message: 'You have a new Electrical Repair job request from Sarah Wilson.',
          isRead: false,
          timestamp: new Date(baseTime.getTime() - 3 * 60000), // 3 min ago
          link: '/provider/jobs'
        },
        {
          id: '2',
          type: 'job',
          title: 'Job Completed',
          message: 'Customer marked your job as completed. Please review.',
          isRead: false,
          timestamp: new Date(baseTime.getTime() - 30 * 60000), // 30 min ago
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payment Received',
          message: 'You received $200.00 for AC Repair job.',
          isRead: false,
          timestamp: new Date(baseTime.getTime() - 1 * 60 * 60000), // 1 hour ago
          link: '/provider/earnings'
        },
        {
          id: '4',
          type: 'message',
          title: 'New Message',
          message: 'Customer sent you a message about House Cleaning job.',
          isRead: true,
          timestamp: new Date(baseTime.getTime() - 3 * 60 * 60000), // 3 hours ago
        },
        {
          id: '5',
          type: 'approval',
          title: 'Service Request Approved',
          message: 'Your new service request "Window Cleaning" has been approved.',
          isRead: true,
          timestamp: new Date(baseTime.getTime() - 2 * 24 * 60 * 60000), // 2 days ago
          link: '/provider/myrequests'
        }
      ];

    case 'local_service_manager':
      return [
        {
          id: '1',
          type: 'approval',
          title: 'New Provider Request',
          message: 'New service provider "Mike\'s Plumbing" is waiting for approval.',
          isRead: false,
          timestamp: new Date(baseTime.getTime() - 10 * 60000), // 10 min ago
          link: '/lsm/providers'
        },
        {
          id: '2',
          type: 'system',
          title: 'Dispute Alert',
          message: 'A dispute has been raised for Job #1234. Please review.',
          isRead: false,
          timestamp: new Date(baseTime.getTime() - 45 * 60000), // 45 min ago
          link: '/lsm/disputes'
        },
        {
          id: '3',
          type: 'job',
          title: 'Job Requires Attention',
          message: 'Job #5678 in your region needs immediate attention.',
          isRead: true,
          timestamp: new Date(baseTime.getTime() - 4 * 60 * 60000), // 4 hours ago
          link: '/lsm/jobs'
        }
      ];

    case 'admin':
      return [
        {
          id: '1',
          type: 'system',
          title: 'System Alert',
          message: 'High volume of job requests detected in North Region.',
          isRead: false,
          timestamp: new Date(baseTime.getTime() - 20 * 60000), // 20 min ago
          link: '/admin/analytics'
        },
        {
          id: '2',
          type: 'approval',
          title: 'LSM Request Pending',
          message: 'New LSM application from John Smith requires approval.',
          isRead: false,
          timestamp: new Date(baseTime.getTime() - 1 * 60 * 60000), // 1 hour ago
          link: '/admin/lsms'
        },
        {
          id: '3',
          type: 'approval',
          title: 'Service Request',
          message: 'Provider requested to add "Pool Cleaning" service.',
          isRead: false,
          timestamp: new Date(baseTime.getTime() - 2 * 60 * 60000), // 2 hours ago
          link: '/admin/service-requests'
        },
        {
          id: '4',
          type: 'system',
          title: 'Provider Banned',
          message: 'Provider #789 has been banned due to multiple violations.',
          isRead: true,
          timestamp: new Date(baseTime.getTime() - 6 * 60 * 60000), // 6 hours ago
          link: '/admin/providers'
        }
      ];

    default:
      return [];
  }
}

