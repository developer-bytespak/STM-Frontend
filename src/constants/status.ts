// Status constants for various entities
export const STATUS = {
  // General status
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  FAILED: 'failed',
  
  // Job status
  JOB: {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    DISPUTED: 'disputed',
  },
  
  // Payment status
  PAYMENT: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    DISPUTED: 'disputed',
  },
  
  // User status
  USER: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING_VERIFICATION: 'pending_verification',
    VERIFIED: 'verified',
  },
  
  // Provider status
  PROVIDER: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended',
    UNDER_REVIEW: 'under_review',
  },
  
  // Booking status
  BOOKING: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  },
  
  // Notification status
  NOTIFICATION: {
    UNREAD: 'unread',
    READ: 'read',
    ARCHIVED: 'archived',
  },
  
  // Verification status
  VERIFICATION: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
  },
  
  // Payout status
  PAYOUT: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
  
  // Office booking status
  OFFICE_BOOKING: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_USE: 'in_use',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
} as const;

// Priority levels
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Service categories
export const SERVICE_CATEGORIES = {
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  REPAIR: 'repair',
  CONSULTATION: 'consultation',
  DELIVERY: 'delivery',
  OTHER: 'other',
} as const;

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  ADMIN: 'admin',
  LSM: 'lsm',
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  WALLET: 'wallet',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// File upload types
export const UPLOAD_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
} as const;

// Allowed file extensions
export const ALLOWED_EXTENSIONS = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv'],
  AUDIO: ['mp3', 'wav', 'aac', 'ogg'],
} as const;

// Status color mappings
export const STATUS_COLORS = {
  // Job status colors
  'job:pending': 'bg-yellow-100 text-yellow-800',
  'job:assigned': 'bg-blue-100 text-blue-800',
  'job:in_progress': 'bg-green-100 text-green-800',
  'job:completed': 'bg-green-100 text-green-800',
  'job:cancelled': 'bg-red-100 text-red-800',
  'job:disputed': 'bg-red-100 text-red-800',
  
  // Payment status colors
  'payment:pending': 'bg-yellow-100 text-yellow-800',
  'payment:processing': 'bg-blue-100 text-blue-800',
  'payment:completed': 'bg-green-100 text-green-800',
  'payment:failed': 'bg-red-100 text-red-800',
  'payment:cancelled': 'bg-red-100 text-red-800',
  'payment:refunded': 'bg-gray-100 text-gray-800',
  'payment:disputed': 'bg-red-100 text-red-800',
  
  // User status colors
  'user:active': 'bg-green-100 text-green-800',
  'user:inactive': 'bg-gray-100 text-gray-800',
  'user:suspended': 'bg-red-100 text-red-800',
  'user:pending_verification': 'bg-yellow-100 text-yellow-800',
  'user:verified': 'bg-green-100 text-green-800',
  
  // Provider status colors
  'provider:pending': 'bg-yellow-100 text-yellow-800',
  'provider:approved': 'bg-green-100 text-green-800',
  'provider:rejected': 'bg-red-100 text-red-800',
  'provider:suspended': 'bg-red-100 text-red-800',
  'provider:under_review': 'bg-blue-100 text-blue-800',
  
  // Booking status colors
  'booking:pending': 'bg-yellow-100 text-yellow-800',
  'booking:confirmed': 'bg-green-100 text-green-800',
  'booking:in_progress': 'bg-blue-100 text-blue-800',
  'booking:completed': 'bg-green-100 text-green-800',
  'booking:cancelled': 'bg-red-100 text-red-800',
  'booking:no_show': 'bg-red-100 text-red-800',
  
  // Notification status colors
  'notification:unread': 'bg-blue-100 text-blue-800',
  'notification:read': 'bg-gray-100 text-gray-800',
  'notification:archived': 'bg-gray-100 text-gray-800',
  
  // Verification status colors
  'verification:pending': 'bg-yellow-100 text-yellow-800',
  'verification:approved': 'bg-green-100 text-green-800',
  'verification:rejected': 'bg-red-100 text-red-800',
  'verification:expired': 'bg-red-100 text-red-800',
  
  // Payout status colors
  'payout:pending': 'bg-yellow-100 text-yellow-800',
  'payout:processing': 'bg-blue-100 text-blue-800',
  'payout:completed': 'bg-green-100 text-green-800',
  'payout:failed': 'bg-red-100 text-red-800',
  
  // Office booking status colors
  'office_booking:pending': 'bg-yellow-100 text-yellow-800',
  'office_booking:confirmed': 'bg-green-100 text-green-800',
  'office_booking:in_use': 'bg-blue-100 text-blue-800',
  'office_booking:completed': 'bg-green-100 text-green-800',
  'office_booking:cancelled': 'bg-red-100 text-red-800',
} as const;

// Priority color mappings
export const PRIORITY_COLORS = {
  [PRIORITY.LOW]: 'bg-gray-100 text-gray-800',
  [PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800',
  [PRIORITY.HIGH]: 'bg-orange-100 text-orange-800',
  [PRIORITY.URGENT]: 'bg-red-100 text-red-800',
} as const;

// Status icons
export const STATUS_ICONS = {
  // Job status icons
  'job:pending': '⏳',
  'job:assigned': '👤',
  'job:in_progress': '🔄',
  'job:completed': '✅',
  'job:cancelled': '❌',
  'job:disputed': '⚠️',
  
  // Payment status icons
  'payment:pending': '⏳',
  'payment:processing': '🔄',
  'payment:completed': '✅',
  'payment:failed': '❌',
  'payment:cancelled': '❌',
  'payment:refunded': '↩️',
  'payment:disputed': '⚠️',
  
  // User status icons
  'user:active': '✅',
  'user:inactive': '⏸️',
  'user:suspended': '🚫',
  'user:pending_verification': '⏳',
  'user:verified': '✅',
  
  // Provider status icons
  'provider:pending': '⏳',
  'provider:approved': '✅',
  'provider:rejected': '❌',
  'provider:suspended': '🚫',
  'provider:under_review': '🔍',
  
  // Booking status icons
  'booking:pending': '⏳',
  'booking:confirmed': '✅',
  'booking:in_progress': '🔄',
  'booking:completed': '✅',
  'booking:cancelled': '❌',
  'booking:no_show': '❌',
  
  // Notification status icons
  'notification:unread': '🔵',
  'notification:read': '⚪',
  'notification:archived': '📁',
  
  // Verification status icons
  'verification:pending': '⏳',
  'verification:approved': '✅',
  'verification:rejected': '❌',
  'verification:expired': '⏰',
  
  // Payout status icons
  'payout:pending': '⏳',
  'payout:processing': '🔄',
  'payout:completed': '✅',
  'payout:failed': '❌',
  
  // Office booking status icons
  'office_booking:pending': '⏳',
  'office_booking:confirmed': '✅',
  'office_booking:in_use': '🔄',
  'office_booking:completed': '✅',
  'office_booking:cancelled': '❌',
} as const;

// Helper functions
export function getStatusColor(status: string, type?: string): string {
  if (type) {
    const key = `${type}:${status}` as keyof typeof STATUS_COLORS;
    return STATUS_COLORS[key] || 'bg-gray-100 text-gray-800';
  }
  return (STATUS_COLORS as any)[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  return (PRIORITY_COLORS as any)[priority] || 'bg-gray-100 text-gray-800';
}

export function getStatusIcon(status: string, type?: string): string {
  if (type) {
    const key = `${type}:${status}` as keyof typeof STATUS_ICONS;
    return STATUS_ICONS[key] || '❓';
  }
  return (STATUS_ICONS as any)[status] || '❓';
}

export function isActiveStatus(status: string): boolean {
  return ([STATUS.ACTIVE, STATUS.APPROVED, STATUS.COMPLETED] as string[]).includes(status);
}

export function isPendingStatus(status: string): boolean {
  return status === STATUS.PENDING || status.includes('pending');
}

export function isCompletedStatus(status: string): boolean {
  return status === STATUS.COMPLETED || status === STATUS.APPROVED;
}

export function isCancelledStatus(status: string): boolean {
  return status === STATUS.CANCELLED || status === STATUS.REJECTED;
}

// Status transitions
export const STATUS_TRANSITIONS = {
  'job:pending': ['job:assigned', 'job:cancelled'],
  'job:assigned': ['job:in_progress', 'job:cancelled'],
  'job:in_progress': ['job:completed', 'job:cancelled', 'job:disputed'],
  'job:completed': [],
  'job:cancelled': [],
  'job:disputed': ['job:completed', 'job:cancelled'],
  
  'payment:pending': ['payment:processing', 'payment:cancelled'],
  'payment:processing': ['payment:completed', 'payment:failed'],
  'payment:completed': ['payment:refunded'],
  'payment:failed': ['payment:pending'],
  'payment:cancelled': [],
  'payment:refunded': [],
  'payment:disputed': ['payment:completed', 'payment:refunded'],
  
  'booking:pending': ['booking:confirmed', 'booking:cancelled'],
  'booking:confirmed': ['booking:in_progress', 'booking:cancelled'],
  'booking:in_progress': ['booking:completed', 'booking:cancelled', 'booking:no_show'],
  'booking:completed': [],
  'booking:cancelled': [],
  'booking:no_show': [],
} as const;

export function canTransitionTo(fromStatus: string, toStatus: string, type?: string): boolean {
  const key = type ? `${type}:${fromStatus}` : fromStatus;
  const transitions = (STATUS_TRANSITIONS as any)[key];
  if (!transitions) return false;
  
  const targetKey = type ? `${type}:${toStatus}` : toStatus;
  return transitions.includes(targetKey);
}


