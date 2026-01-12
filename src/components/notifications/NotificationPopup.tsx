'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRelativeTime } from '@/api/notifications';
import type { Notification } from '@/api/notifications';
import { ROUTES } from '@/constants/routes';
import AllNotificationsModal from './AllNotificationsModal';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { providerApi } from '@/api/provider';
import { customerApi } from '@/api/customer';
import { getInvoiceById } from '@/api/payments';

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
  const { user } = useAuth();
  const [showAllModal, setShowAllModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

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
          // For customers, redirect to bookings or specific booking with filtering
          if (metadata?.booking_id) {
            return ROUTES.CUSTOMER.BOOKING_DETAILS(metadata.booking_id);
          }
          // Check title for specific job status to add filters
          const titleLower = title.toLowerCase();
          if (titleLower.includes('new') || titleLower.includes('request')) {
            return `${ROUTES.CUSTOMER.BOOKINGS}?status=new`;
          } else if (titleLower.includes('complete') || titleLower.includes('progress')) {
            return `${ROUTES.CUSTOMER.BOOKINGS}?status=in_progress`;
          } else if (titleLower.includes('dispute')) {
            return `${ROUTES.CUSTOMER.BOOKINGS}?status=disputed`;
          }
          return ROUTES.CUSTOMER.BOOKINGS;
        } else if (isProvider) {
          // For providers, redirect to jobs or specific job with proper filtering
          if (metadata?.job_id) {
            return ROUTES.PROVIDER.JOB_DETAILS(metadata.job_id);
          }
          // Check title for specific job status to add filters
          const titleLower = title.toLowerCase();
          if (titleLower.includes('new') || titleLower.includes('request')) {
            return `${ROUTES.PROVIDER.JOBS}?status=new`;
          } else if (titleLower.includes('complete') || titleLower.includes('progress')) {
            return `${ROUTES.PROVIDER.JOBS}?status=in_progress`;
          } else if (titleLower.includes('deal closed') || titleLower.includes('start work')) {
            // "Deal Closed - Start Work" notification should go to total_jobs page
            return '/provider/total_jobs';
          } else if (titleLower.includes('dispute')) {
            return `${ROUTES.PROVIDER.JOBS}?status=disputed`;
          }
          return ROUTES.PROVIDER.JOBS;
        } else if (isLSM) {
          // For LSM, redirect to jobs with filtering
          const titleLower = title.toLowerCase();
          if (titleLower.includes('new') || titleLower.includes('request')) {
            return `${ROUTES.LSM.JOBS}?status=new`;
          } else if (titleLower.includes('complete') || titleLower.includes('progress')) {
            return `${ROUTES.LSM.JOBS}?status=in_progress`;
          } else if (titleLower.includes('dispute')) {
            return `${ROUTES.LSM.JOBS}?status=disputed`;
          }
          return ROUTES.LSM.JOBS;
        } else if (isAdmin) {
          // For Admin, redirect to jobs with filtering
          const titleLower = title.toLowerCase();
          if (titleLower.includes('new') || titleLower.includes('request')) {
            return `${ROUTES.ADMIN.JOBS}?status=new`;
          } else if (titleLower.includes('complete') || titleLower.includes('progress')) {
            return `${ROUTES.ADMIN.JOBS}?status=in_progress`;
          } else if (titleLower.includes('dispute')) {
            return `${ROUTES.ADMIN.JOBS}?status=disputed`;
          }
          return ROUTES.ADMIN.JOBS;
        }
        return null;

      case 'booking':
        if (isCustomer) {
          // For customers, redirect to specific booking or bookings list with filtering
          if (metadata?.booking_id) {
            return ROUTES.CUSTOMER.BOOKING_DETAILS(metadata.booking_id);
          }
          const titleLower = title.toLowerCase();
          if (titleLower.includes('new') || titleLower.includes('request')) {
            return `${ROUTES.CUSTOMER.BOOKINGS}?status=new`;
          } else if (titleLower.includes('complete') || titleLower.includes('progress')) {
            return `${ROUTES.CUSTOMER.BOOKINGS}?status=in_progress`;
          }
          return ROUTES.CUSTOMER.BOOKINGS;
        } else if (isProvider) {
          // For providers, redirect to specific job or jobs list with filtering
          if (metadata?.job_id) {
            return ROUTES.PROVIDER.JOB_DETAILS(metadata.job_id);
          }
          const titleLower = title.toLowerCase();
          if (titleLower.includes('new') || titleLower.includes('request')) {
            return `${ROUTES.PROVIDER.JOBS}?status=new`;
          } else if (titleLower.includes('complete') || titleLower.includes('progress')) {
            return `${ROUTES.PROVIDER.JOBS}?status=in_progress`;
          } else if (titleLower.includes('deal closed') || titleLower.includes('start work')) {
            // "Deal Closed - Start Work" notification should go to total_jobs page
            return '/provider/total_jobs';
          }
          return ROUTES.PROVIDER.JOBS;
        } else if (isLSM) {
          // For LSM, redirect to jobs with filtering
          const titleLower = title.toLowerCase();
          if (titleLower.includes('new') || titleLower.includes('request')) {
            return `${ROUTES.LSM.JOBS}?status=new`;
          } else if (titleLower.includes('complete') || titleLower.includes('progress')) {
            return `${ROUTES.LSM.JOBS}?status=in_progress`;
          }
          return ROUTES.LSM.JOBS;
        } else if (isAdmin) {
          // For Admin, redirect to jobs with filtering
          const titleLower = title.toLowerCase();
          if (titleLower.includes('new') || titleLower.includes('request')) {
            return `${ROUTES.ADMIN.JOBS}?status=new`;
          } else if (titleLower.includes('complete') || titleLower.includes('progress')) {
            return `${ROUTES.ADMIN.JOBS}?status=in_progress`;
          }
          return ROUTES.ADMIN.JOBS;
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
        // For message notifications, redirect to dashboard (chat will open via context)
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

      case 'approval':
      case 'provider_request':
        if (isProvider) {
          return ROUTES.PROVIDER.PROFILE;
        } else if (isLSM) {
          return '/lsm/sp-request'; // Provider requests page
        } else if (isAdmin) {
          return ROUTES.ADMIN.PROVIDERS;
        } else if (isCustomer) {
          // Customer might get approval notifications for their bookings
          return ROUTES.CUSTOMER.BOOKINGS;
        }
        return null;

      case 'dispute':
        if (isLSM) {
          return '/lsm/disputes';
        } else if (isAdmin) {
          return ROUTES.ADMIN.JOBS;
        } else if (isCustomer) {
          // Customer involved in dispute should see their bookings
          return ROUTES.CUSTOMER.BOOKINGS;
        } else if (isProvider) {
          // Provider involved in dispute should see their jobs
          return ROUTES.PROVIDER.JOBS;
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
          } else if (isProvider) {
            return `${ROUTES.PROVIDER.JOBS}?status=disputed`; // Provider jobs with dispute filter
          } else if (isCustomer) {
            return `${ROUTES.CUSTOMER.BOOKINGS}?status=disputed`; // Customer bookings with dispute filter
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
          } else if (isCustomer) {
            return ROUTES.CUSTOMER.DASHBOARD; // Customer might be interested in new providers
          }
        }
        
        // Customer registration related
        if (titleLower.includes('customer') && titleLower.includes('registration')) {
          if (isAdmin) {
            return ROUTES.ADMIN.USERS;
          } else if (isLSM) {
            return ROUTES.LSM.DASHBOARD; // LSM might want to see new customers
          }
        }
        
        // LSM related notifications
        if (titleLower.includes('lsm') || titleLower.includes('local service manager')) {
          if (isAdmin) {
            return ROUTES.ADMIN.USERS; // Admin manages LSMs
          } else if (isProvider) {
            return ROUTES.PROVIDER.DASHBOARD; // Provider might need to contact LSM
          } else if (isCustomer) {
            return ROUTES.CUSTOMER.DASHBOARD; // Customer might need to contact LSM
          }
        }
        
        // Provider approval/status related
        if (titleLower.includes('approved') || titleLower.includes('rejected') || 
            titleLower.includes('activated') || titleLower.includes('suspended') || 
            titleLower.includes('banned')) {
          if (isProvider) {
            return ROUTES.PROVIDER.PROFILE;
          } else if (isLSM) {
            return '/lsm/sp-request'; // LSM manages provider approvals
          } else if (isAdmin) {
            return ROUTES.ADMIN.PROVIDERS; // Admin manages provider status
          } else if (isCustomer) {
            return ROUTES.CUSTOMER.DASHBOARD; // Customer might be affected by provider status changes
          }
        }
        
        // Document verification related
        if (titleLower.includes('document') || titleLower.includes('verification')) {
          if (isProvider) {
            return ROUTES.PROVIDER.PROFILE; // Documents are managed in profile
          } else if (isLSM) {
            return '/lsm/sp-request'; // LSM verifies provider documents
          } else if (isAdmin) {
            return ROUTES.ADMIN.PROVIDERS; // Admin can see document status
          }
        }
        
        // Service request related
        if (titleLower.includes('service request') || titleLower.includes('service added')) {
          if (isProvider) {
            return ROUTES.PROVIDER.PROFILE;
          } else if (isLSM) {
            return '/lsm/sp-request'; // LSM manages service requests
          } else if (isAdmin) {
            return ROUTES.ADMIN.PROVIDERS; // Admin can see service requests
          } else if (isCustomer) {
            return ROUTES.CUSTOMER.DASHBOARD; // Customer might be interested in new services
          }
        }
        
        // Payment related system notifications
        if (titleLower.includes('payment') || titleLower.includes('billing') || titleLower.includes('invoice')) {
          if (isCustomer) {
            return ROUTES.CUSTOMER.PAYMENTS;
          } else if (isProvider) {
            return ROUTES.PROVIDER.EARNINGS;
          } else if (isAdmin) {
            return ROUTES.ADMIN.FINANCES;
          } else if (isLSM) {
            return ROUTES.LSM.DASHBOARD; // LSM might need to see payment issues
          }
        }
        
        // Office booking related notifications
        if (titleLower.includes('office') || titleLower.includes('booking') || titleLower.includes('space')) {
          if (isProvider) {
            return ROUTES.PROVIDER.OFFICE_BOOKING;
          } else if (isAdmin) {
            return ROUTES.ADMIN.OFFICES;
          } else if (isCustomer) {
            return ROUTES.CUSTOMER.DASHBOARD; // Customer might be interested in office bookings
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

      case 'feedback':
        if (isProvider) {
          return ROUTES.PROVIDER.FEEDBACK; // Use existing feedback page
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
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m1 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'approval':
        return (
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'dispute':
        return (
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'booking':
        return (
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'provider_request':
        return (
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Helper to extract chat ID or job ID from notification title and clean it for display
  const extractMetadataFromTitle = (title: string): { chatId: string | null; jobId: number | null; cleanTitle: string } => {
    // Check for job ID first: [job:123]
    const jobMatch = title.match(/\[job:(\d+)\]/);
    if (jobMatch && jobMatch[1]) {
      return {
        chatId: null,
        jobId: parseInt(jobMatch[1], 10),
        cleanTitle: title.replace(/\s*\[job:\d+\]/, '').trim()
      };
    }
    
    // Check for chat ID: [chat:uuid]
    const chatMatch = title.match(/\[chat:([^\]]+)\]/);
    if (chatMatch && chatMatch[1]) {
      return {
        chatId: chatMatch[1],
        jobId: null,
        cleanTitle: title.replace(/\s*\[chat:[^\]]+\]/, '').trim()
      };
    }
    
    return { chatId: null, jobId: null, cleanTitle: title };
  };

  const handleNotificationClick = async (notification: Notification) => {
    console.log('Notification clicked:', notification);
    
    // Mark as read if unread
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Extract metadata from title (job_id or chat_id)
    const { chatId, jobId, cleanTitle } = extractMetadataFromTitle(notification.title);
    
    // Normalize recipient type
    const recipientStr = notification.recipient_type as string;
    const isProvider = recipientStr === 'provider' || recipientStr === 'service_provider';

    // Priority 1: If job_id is in title, redirect to job details
    if (jobId) {
      console.log('Redirecting to job:', jobId);
      onClose();
      
      if (isProvider) {
        router.push(ROUTES.PROVIDER.JOB_DETAILS(jobId.toString()));
      } else {
        router.push(ROUTES.CUSTOMER.BOOKING_DETAILS(jobId.toString()));
      }
      return;
    }

    // Priority 2: If chat_id is in title, open chat
    if (chatId) {
      console.log('Opening chat:', chatId);
      onClose();
      openConversation(chatId);
      return;
    }

    // Priority 3: If metadata contains job_id try to fetch job details to find chatId
    if (notification.metadata?.job_id) {
      const jobId = Number(notification.metadata.job_id);
      try {
        // Prefer chat open if job has a chatId
        let details: any = null;
        if (user?.role === 'service_provider') {
          details = await providerApi.getJobDetails(jobId as any);
        } else {
          details = await customerApi.getJobDetails(jobId as any);
        }

        if (details?.chatId) {
          onClose();
          openConversation(String(details.chatId));
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch job details for notification fallback:', err);
      }

      // Fallback: redirect to job/booking details
      onClose();
      if (isProvider) {
        router.push(ROUTES.PROVIDER.JOB_DETAILS(notification.metadata.job_id));
      } else {
        router.push(ROUTES.CUSTOMER.BOOKING_DETAILS(notification.metadata.job_id));
      }
      return;
    }

    // If metadata contains invoice id, try to resolve job id then open chat
    const invoiceId = notification.metadata?.invoice_id || notification.metadata?.invoiceId;
    if (invoiceId) {
      try {
        const invoice = await getInvoiceById(Number(invoiceId));
        if (invoice?.jobId) {
          // reuse job flow
          try {
            let details: any = null;
            if (user?.role === 'service_provider') {
              details = await providerApi.getJobDetails(Number(invoice.jobId));
            } else {
              details = await customerApi.getJobDetails(Number(invoice.jobId));
            }

            if (details?.chatId) {
              onClose();
              openConversation(String(details.chatId));
              return;
            }
          } catch (err) {
            console.warn('Failed to fetch job details from invoice fallback:', err);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch invoice for notification fallback:', err);
      }
    }

    if (notification.metadata?.chat_id) {
      console.log('Opening chat from metadata:', notification.metadata.chat_id);
      onClose();
      openConversation(notification.metadata.chat_id);
      return;
    }

    // Priority 4: Use standard redirect URL logic
    const redirectUrl = getRedirectUrl(notification);
    console.log('Redirect URL:', redirectUrl);
    
    if (redirectUrl) {
      onClose();
      router.push(redirectUrl);
    } else {
      console.warn('No redirect URL found for notification type:', notification.type, 'recipient:', notification.recipient_type);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  return (
    <div
      ref={popupRef}
      className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-72 sm:w-96 max-w-xs sm:max-w-md bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[calc(100vh-160px)] sm:max-h-[calc(100vh-120px)] flex flex-col"
    >
      {/* Header */}
      <div className="px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-xl font-semibold text-gray-900">
            All Notifications
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {notifications.length} total notifications
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Read ({readCount})
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-gray-500 text-sm mt-3">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No {filter !== 'all' ? filter : ''} notifications</p>
            <p className="text-gray-400 text-xs mt-1">We&apos;ll notify you when something arrives</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => void handleNotificationClick(notification)}
                  className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors relative cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!notification.is_read && (
                    <span className="absolute left-2 top-4 sm:top-6 w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}

                  <div className="flex items-start gap-2 sm:gap-3 relative">
                    {/* Icon */}
                    {getNotificationIcon(notification.type)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {extractMetadataFromTitle(notification.title).cleanTitle}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 sm:mt-2">
                        {getRelativeTime(notification.created_at)}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 cursor-pointer"
                      aria-label="Delete notification"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Hidden on all screen sizes */}
      {notifications.length > 0 && (
        <div className="hidden px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 text-center">
          <button 
            onClick={() => setShowAllModal(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            View All
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

