// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

// Error response structure
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

export interface SearchResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: Record<string, any>;
  searchQuery?: string;
}

// File upload types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface UploadResponse {
  files: FileUpload[];
  uploadId: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    jobUpdates: boolean;
    payments: boolean;
    promotions: boolean;
    system: boolean;
  };
}

// System health types
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    email: ServiceHealth;
    sms: ServiceHealth;
    payment: ServiceHealth;
  };
  uptime: number;
  version: string;
  timestamp: string;
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
  lastCheck: string;
}

// Audit log types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Configuration types
export interface AppConfig {
  features: {
    enableRegistration: boolean;
    enablePayments: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
  };
  limits: {
    maxFileSize: number;
    maxFilesPerUpload: number;
    maxBookingsPerDay: number;
    maxProvidersPerCustomer: number;
  };
  integrations: {
    stripe: {
      enabled: boolean;
      publicKey: string;
    };
    sendgrid: {
      enabled: boolean;
      apiKey: string;
    };
    twilio: {
      enabled: boolean;
      accountSid: string;
    };
  };
  pricing: {
    platformFeePercentage: number;
    minimumPayoutAmount: number;
    currency: string;
  };
}

// Statistics types
export interface PlatformStats {
  users: {
    total: number;
    active: number;
    customers: number;
    providers: number;
    admins: number;
  };
  jobs: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  payments: {
    totalVolume: number;
    totalTransactions: number;
    successRate: number;
  };
  performance: {
    averageResponseTime: number;
    uptime: number;
    errorRate: number;
  };
  period: {
    start: string;
    end: string;
  };
}

// Rate limiting types
export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

export interface JobUpdateMessage {
  type: 'job_update';
  data: {
    jobId: string;
    status: string;
    message: string;
  };
}

export interface PaymentUpdateMessage {
  type: 'payment_update';
  data: {
    paymentId: string;
    status: string;
    amount: number;
  };
}

export interface NotificationMessage {
  type: 'notification';
  data: {
    notification: Notification;
  };
}

// API client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

// Request/Response interceptors
export interface RequestInterceptor {
  onRequest?: (config: any) => any;
  onRequestError?: (error: any) => any;
}

export interface ResponseInterceptor {
  onResponse?: (response: any) => any;
  onResponseError?: (error: any) => any;
}

// Cache types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
  tags?: string[];
}

export interface CacheItem<T> {
  data: T;
  expires: number;
  tags?: string[];
}

// Bulk operations
export interface BulkOperation<T> {
  items: T[];
  operation: 'create' | 'update' | 'delete';
}

export interface BulkOperationResult<T> {
  successful: T[];
  failed: {
    item: T;
    error: string;
  }[];
  total: number;
  successCount: number;
  failureCount: number;
}

// Export/Import types
export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  fields?: string[];
  filters?: Record<string, any>;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportResult {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt: string;
  createdAt: string;
}


