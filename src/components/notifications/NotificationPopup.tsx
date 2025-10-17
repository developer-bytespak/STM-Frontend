'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRelativeTime } from '@/api/notifications';
import type { Notification } from '@/api/notifications';
import { ROUTES } from '@/constants/routes';
import AllNotificationsModal from './AllNotificationsModal';
import { useChat } from '@/contexts/ChatContext';

interface NotificationPopupProps {
  notifications: Notification[];
  onMarkAsRead: (id: number | string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: number | string) => void;
  onClearRead: () => void;
  onClose: () => void;
  bellRef: React.RefObject<HTMLDivElement | null>;
  isLoading?: boolean;
}

export default function NotificationPopup({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearRead,
  onClose,
  bellRef,
  isLoading = false
}: NotificationPopupProps) {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { openConversation } = useChat();
  const [showAllModal, setShowAllModal] = useState(false);

  // Close popup when clicking outside (but not on the bell)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickOnPopup = popupRef.current && popupRef.current.contains(target);
      const isClickOnBell = bellRef.current && bellRef.current.contains(target);
      
      if (!isClickOnPopup && !isClickOnBell) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, bellRef]);

  // Get redirect URL based on notification type and metadata
  const getRedirectUrl = (notification: Notification): string | null => {
    const { type, recipient_type, metadata, title } = notification;

    // Normalize recipient type (handle both abbreviated and full names)
    const recipientStr = recipient_type as string;
    const isLSM = recipientStr === 'lsm' || recipientStr === 'local_service_manager';
    const isProvider = recipientStr === 'provider' || recipientStr === 'service_provider';
    const isCustomer = recipientStr === 'customer';
    const isAdmin = recipientStr === 'admin';

    switch (type) {
      case 'job':
        if (isCustomer) {
          // For customers, redirect to bookings or specific booking
          return metadata?.booking_id 
            ? ROUTES.CUSTOMER.BOOKING_DETAILS(metadata.booking_id)
            : ROUTES.CUSTOMER.BOOKINGS;
        } else if (isProvider) {
          // For providers, redirect to jobs or specific job
          return metadata?.job_id 
            ? ROUTES.PROVIDER.JOB_DETAILS(metadata.job_id)
            : ROUTES.PROVIDER.JOBS;
        } else if (isLSM) {
          return ROUTES.LSM.JOBS;
        }
        return null;

      case 'booking':
        if (isCustomer) {
          return metadata?.booking_id 
            ? ROUTES.CUSTOMER.BOOKING_DETAILS(metadata.booking_id)
            : ROUTES.CUSTOMER.BOOKINGS;
        } else if (isProvider) {
          return metadata?.job_id 
            ? ROUTES.PROVIDER.JOB_DETAILS(metadata.job_id)
            : ROUTES.PROVIDER.JOBS;
        }
        return null;

      case 'payment':
        if (isCustomer) {
          return ROUTES.CUSTOMER.PAYMENTS;
        } else if (isProvider) {
          return ROUTES.PROVIDER.EARNINGS;
        } else if (isAdmin) {
          return ROUTES.ADMIN.FINANCES;
        }
        return null;

      case 'message':
        // Could be enhanced to open chat with specific user
        if (isCustomer) {
          return ROUTES.CUSTOMER.DASHBOARD;
        } else if (isProvider) {
          return ROUTES.PROVIDER.DASHBOARD;
        } else if (isLSM) {
          return ROUTES.LSM.DASHBOARD;
        }
        return null;

      case 'approval':
      case 'provider_request':
        if (isProvider) {
          return ROUTES.PROVIDER.PROFILE;
        } else if (isLSM) {
          return '/lsm/sp-request'; // Provider requests page
        } else if (isAdmin) {
          return ROUTES.ADMIN.PROVIDERS;
        }
        return null;

      case 'dispute':
        if (isLSM) {
          return '/lsm/disputes';
        } else if (isAdmin) {
          return ROUTES.ADMIN.JOBS;
        }
        return null;

      case 'system':
        // Check title/message for context-specific redirects
        const titleLower = title.toLowerCase();
        
        // Dispute related notifications
        if (titleLower.includes('dispute') || titleLower.includes('new dispute filed')) {
          if (isLSM) {
            return '/lsm/disputes'; // Dispute management page
          } else if (isAdmin) {
            return ROUTES.ADMIN.JOBS;
          }
        }
        
        // LSM joined chat notifications
        if (titleLower.includes('lsm joined') || titleLower.includes('local service manager')) {
          if (isCustomer) {
            return ROUTES.CUSTOMER.DASHBOARD; // Customer dashboard to see chat
          } else if (isProvider) {
            return ROUTES.PROVIDER.DASHBOARD; // Provider dashboard to see chat
          }
        }
        
        // Provider registration related
        if (titleLower.includes('provider') && titleLower.includes('registration')) {
          if (isLSM) {
            return '/lsm/sp-request'; // Provider requests page
          } else if (isAdmin) {
            return ROUTES.ADMIN.PROVIDERS;
          }
        }
        
        // Provider approval related
        if (titleLower.includes('approved') || titleLower.includes('rejected')) {
          if (isProvider) {
            return ROUTES.PROVIDER.PROFILE;
          }
        }

        // Fallback: Redirect to appropriate dashboard
        if (isCustomer) {
          return ROUTES.CUSTOMER.DASHBOARD;
        } else if (isProvider) {
          return ROUTES.PROVIDER.DASHBOARD;
        } else if (isLSM) {
          return ROUTES.LSM.DASHBOARD;
        } else if (isAdmin) {
          return ROUTES.ADMIN.DASHBOARD;
        }
        return null;

      default:
        return null;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'approval':
        return (
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'dispute':
        return (
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'booking':
        return (
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'provider_request':
        return (
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Helper to extract chat ID from notification title and clean it for display
  const extractChatId = (title: string): { chatId: string | null; cleanTitle: string } => {
    const match = title.match(/\[chat:([^\]]+)\]/);
    if (match && match[1]) {
      return {
        chatId: match[1],
        cleanTitle: title.replace(/\s*\[chat:[^\]]+\]/, '').trim()
      };
    }
    return { chatId: null, cleanTitle: title };
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    
    // Mark as read if unread
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Special handling for message notifications - extract chat_id from title
    if (notification.type === 'message') {
      // Try to extract chat_id from metadata first (if available)
      let chatId = notification.metadata?.chat_id;
      
      // If not in metadata, try to parse from title format: "New Message [chat:uuid]"
      if (!chatId && notification.title) {
        const extracted = extractChatId(notification.title);
        chatId = extracted.chatId;
      }
      
      if (chatId) {
        console.log('Opening chat:', chatId);
        onClose(); // Close popup
        openConversation(chatId);
        return;
      }
    }

    // Get redirect URL and navigate
    const redirectUrl = getRedirectUrl(notification);
    console.log('Redirect URL:', redirectUrl);
    
    if (redirectUrl) {
      onClose(); // Close popup before navigating
      router.push(redirectUrl);
    } else {
      console.warn('No redirect URL found for notification type:', notification.type, 'recipient:', notification.recipient_type);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  return (
    <div
      ref={popupRef}
      className="absolute right-0 mt-2 w-screen sm:w-96 max-w-md bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[calc(100vh-120px)] flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({unreadCount} unread)
            </span>
          )}
        </h3>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Mark all read
            </button>
          )}
          {readCount > 0 && (
            <button
              onClick={onClearRead}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
            >
              Clear read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-gray-500 text-sm mt-3">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">We&apos;ll notify you when something arrives</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 transition-colors relative cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                {/* Unread indicator dot */}
                {!notification.is_read && (
                  <span className="absolute top-4 left-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}

                <div className="flex items-start gap-3">
                  {/* Icon */}
                  {getNotificationIcon(notification.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {extractChatId(notification.title).cleanTitle}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {getRelativeTime(notification.created_at)}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                    aria-label="Delete notification"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 text-center">
          <button 
            onClick={() => setShowAllModal(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            View All Notifications
          </button>
        </div>
      )}

      {/* All Notifications Modal */}
      <AllNotificationsModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    </div>
  );
}

