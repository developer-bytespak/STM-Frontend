import { User, Address } from './user';
import { Provider } from './provider';

export type JobStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ServiceCategory = 'cleaning' | 'maintenance' | 'repair' | 'consultation' | 'delivery' | 'other';

export interface Job {
  id: string;
  title: string;
  description: string;
  serviceCategory: ServiceCategory;
  customerId: string;
  customer: User;
  providerId?: string;
  provider?: Provider;
  status: JobStatus;
  priority: JobPriority;
  location: JobLocation;
  scheduledDate?: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  price: JobPricing;
  requirements?: string[];
  images?: string[];
  documents?: JobDocument[];
  timeline: JobTimelineEntry[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface JobLocation {
  type: 'customer_location' | 'provider_location' | 'office_space' | 'other';
  address: Address;
  instructions?: string;
  accessCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface JobPricing {
  basePrice: number;
  additionalFees?: AdditionalFee[];
  discount?: number;
  totalPrice: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'disputed';
  paymentMethod?: string;
}

export interface AdditionalFee {
  type: 'travel' | 'materials' | 'overtime' | 'emergency' | 'other';
  description: string;
  amount: number;
}

export interface JobDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface JobTimelineEntry {
  id: string;
  status: JobStatus;
  timestamp: string;
  description: string;
  updatedBy: string;
  metadata?: Record<string, any>;
}

// Job creation and update types
export interface CreateJobData {
  title: string;
  description: string;
  serviceCategory: ServiceCategory;
  location: JobLocation;
  scheduledDate?: string;
  estimatedDuration: number;
  price: {
    basePrice: number;
    additionalFees?: AdditionalFee[];
    discount?: number;
  };
  requirements?: string[];
  images?: File[];
  documents?: File[];
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  serviceCategory?: ServiceCategory;
  location?: JobLocation;
  scheduledDate?: string;
  estimatedDuration?: number;
  price?: {
    basePrice?: number;
    additionalFees?: AdditionalFee[];
    discount?: number;
  };
  requirements?: string[];
  status?: JobStatus;
  providerId?: string;
}

// Job search and filtering types
export interface JobSearchFilters {
  status?: JobStatus[];
  serviceCategory?: ServiceCategory[];
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
    radius?: number; // in miles
  };
  priceRange?: {
    min: number;
    max: number;
  };
  scheduledDate?: {
    start: string;
    end: string;
  };
  providerId?: string;
  customerId?: string;
  sortBy?: 'created_at' | 'scheduled_date' | 'price' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

// Job assignment types
export interface JobAssignment {
  jobId: string;
  providerId: string;
  assignedAt: string;
  assignedBy: string;
  notes?: string;
  estimatedStartTime?: string;
  estimatedEndTime?: string;
}

export interface JobBid {
  id: string;
  jobId: string;
  providerId: string;
  provider: Provider;
  amount: number;
  message: string;
  estimatedDuration: number;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// Job completion types
export interface JobCompletion {
  jobId: string;
  providerId: string;
  completedAt: string;
  actualDuration: number;
  completionNotes: string;
  beforeImages?: string[];
  afterImages?: string[];
  materialsUsed?: MaterialUsed[];
  customerSatisfaction?: number; // 1-5 rating
}

export interface MaterialUsed {
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

// Job dispute types
export interface JobDispute {
  id: string;
  jobId: string;
  raisedBy: string; // customer or provider
  raisedByUserId: string;
  reason: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  evidence?: DisputeEvidence[];
}

export interface DisputeEvidence {
  type: 'image' | 'document' | 'message' | 'other';
  url: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
}

// API response types
export interface JobResponse {
  job: Job;
  timeline: JobTimelineEntry[];
  bids?: JobBid[];
}

export interface JobsListResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  filters: JobSearchFilters;
}

export interface JobStatsResponse {
  totalJobs: number;
  pendingJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  totalRevenue: number;
  averageJobValue: number;
  averageCompletionTime: number;
}

// Job notification types
export interface JobNotification {
  id: string;
  jobId: string;
  userId: string;
  type: 'assignment' | 'status_change' | 'reminder' | 'dispute' | 'completion';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Job analytics types
export interface JobAnalytics {
  period: {
    start: string;
    end: string;
  };
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  averageRating: number;
  totalRevenue: number;
  topServices: {
    category: ServiceCategory;
    count: number;
    revenue: number;
  }[];
  performanceMetrics: {
    averageResponseTime: number;
    completionRate: number;
    customerSatisfaction: number;
  };
}


