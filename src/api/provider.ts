/**
 * Provider API Service Layer
 * Handles all provider-specific API calls
 */

import { apiClient } from './index';

// ==================== TYPE DEFINITIONS ====================

export interface DashboardSummary {
  totalJobs: number;
  totalEarnings: number;
  averageRating: number;
  warnings: number;
}

export interface JobCounts {
  new: number;
  in_progress: number;
  completed: number;
  paid: number;
  cancelled: number;
  rejected_by_sp: number;
}

export interface PendingActions {
  newJobRequests: number;
  jobsToComplete: number;
  paymentsToMark: number;
}

export interface RecentJob {
  id: number;
  service: string;
  customer: string;
  status: string;
  price: number;
  createdAt: string;
}

export interface RecentFeedback {
  id: number;
  rating: number;
  feedback: string;
  customer: string;
  createdAt: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  jobs: JobCounts;
  pendingActions: PendingActions;
  recentJobs: RecentJob[];
  recentFeedback: RecentFeedback[];
}



export interface RequestServiceDto {
  serviceName: string;
  category: string;
  description: string;
  suggestedQuestions?: string[] | object;
}

export interface ServiceRequestResponse {
  id: number;
  serviceName: string;
  category: string;
  status: string;
  lsm_approved: boolean | null;
  admin_approved: boolean | null;
  created_at: string;
}

export interface ServiceRequest {
  id: number;
  serviceName: string;
  category: string;
  description: string;
  status: string;
  lsm_approved: boolean | null;
  admin_approved: boolean | null;
  lsm_rejection_reason: string | null;
  admin_rejection_reason: string | null;
  created_at: string;
}

export interface MyServiceRequestsResponse {
  requests: ServiceRequest[];
} 

export interface Review {
  id: number;
  rating: number;
  feedback: string;
  punctualityRating: number;
  responseTime: number;
  customer: {
    name: string;
  };
  job: {
    id: number;
    service: string;
    category: string;
    completedAt: string;
  };
  createdAt: string;
}

export interface ReviewsResponse {
  data: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  averagePunctuality: number;
  averageResponseTime: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  percentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewDetail {
  id: number;
  rating: number;
  feedback: string;
  punctualityRating: number;
  responseTime: number;
  customer: {
    name: string;
  };
  job: {
    id: number;
    service: string;
    category: string;
    completedAt: string;
    price: number;
  };
  createdAt: string;
}

export interface Job {
  id: number;
  service: string;
  category: string;
  customer: {
    name: string;
    phone: string;
  };
  status: string;
  price: number;
  paymentStatus: string;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  chatId?: string | null; // Chat ID for opening conversations
}

export interface JobsResponse {
  data: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface JobDetail {
  id: number;
  service: string;
  category: string;
  status: string;
  price: number;
  originalAnswers: any;
  editedAnswers: any;
  spAccepted: boolean;
  pendingApproval: boolean;
  location: string;
  scheduledAt: string | null;
  completedAt: string | null;
  paidAt: string | null;
  responseDeadline: string | null;
  createdAt: string;
}

export interface JobDetailsResponse {
  job: JobDetail;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  payment: {
    amount: number;
    method: string;
    status: string;
    markedAt: string | null;
    notes: string | null;
  } | null;
  chatId: number | null;
  actions: {
    canMarkComplete: boolean;
    canMarkPayment: boolean;
  };
}

export interface ActiveJob {
  id: number;
  status: string;
  service: {
    name: string;
    category: string;
  };
  customer: {
    name: string;
    phone: string;
  };
  location: string;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
}










export interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

export interface BusinessInfo {
  businessName: string;
  description: string;
  location: string;
  zipcode: string;
  minPrice: number | null;
  maxPrice: number | null;
  experience: number;
  experienceLevel: string;
}

export interface ProfileStatus {
  current: string;
  canDeactivate: boolean;
  activeJobsCount: number;
  warnings: number;
}

export interface ServiceInfo {
  id: number;
  name: string;
  category: string;
}

export interface ServiceArea {
  zipcode: string;
  isPrimary: boolean;
}

export interface DocumentInfo {
  id: number;
  fileName: string;
  status: string;
  verifiedAt: string | null;
  uploadedAt: string;
}

export interface DocumentsInfo {
  total: number;
  verified: number;
  pending: number;
  list: DocumentInfo[];
}

export interface ProfileStatistics {
  totalJobs: number;
  earnings: number;
  rating: number;
}

export interface ProfileData {
  user: UserInfo;
  business: BusinessInfo;
  status: ProfileStatus;
  services: ServiceInfo[];
  serviceAreas: ServiceArea[];
  documents: DocumentsInfo;
  statistics: ProfileStatistics;
}

export interface UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  business_name?: string;
  description?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  experience?: number;
  service_areas?: string[];
}

export interface UpdateProfileResponse {
  message: string;
}
export interface SetAvailabilityDto {
  status: 'active' | 'inactive';
}

export interface SetAvailabilityResponse {
  status: string;
  message: string;
}

export interface UpdateJobStatusDto {
  action: 'MARK_COMPLETE' | 'MARK_PAYMENT';
  paymentDetails?: {
    method: string;
    notes?: string;
  };
}

export interface UpdateJobStatusResponse {
  jobId: number;
  status: string;
  completedAt?: string;
  paidAt?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  markedAt?: string;
  message: string;
}

// ==================== PROVIDER API CLASS ====================

class ProviderApi {
  /**
   * Request a new service to be added to the platform
   * Endpoint: POST /providers/request-new-service
   */
  async requestNewService(data: RequestServiceDto): Promise<ServiceRequestResponse> {
    // Try different endpoint paths based on backend configuration
    // Option 1: /providers/request-new-service (if @Controller('providers'))
    // Option 2: /api/providers/request-new-service (if global prefix 'api' exists)
    const response = await apiClient.request<ServiceRequestResponse>('/provider/request-new-service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response;
  }

  /**
   * Get all service requests for current provider
   * Endpoint: GET /provider/my-service-requests
   */
  async getMyServiceRequests(): Promise<ServiceRequest[]> {
    const response = await apiClient.request<ServiceRequest[]>('/provider/my-service-requests', {
      method: 'GET'
    });
    return response;
  }
  
  async getDashboard(): Promise<DashboardResponse> {
    const response = await apiClient.request<DashboardResponse>('/provider/dashboard', {
      method: 'GET'
    });
    return response;
  }

  /**
   * Get all reviews for current provider with filters
   * Endpoint: GET /providers/reviews
   */
  async getReviews(params?: {
    minRating?: number;
    maxRating?: number;
    page?: number;
    limit?: number;
  }): Promise<ReviewsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
    if (params?.maxRating) queryParams.append('maxRating', params.maxRating.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/provider/reviews?${queryString}` : '/provider/reviews';
    
    const response = await apiClient.request<ReviewsResponse>(endpoint, {
      method: 'GET'
    });
    return response;
  }

  /**
   * Get review statistics and rating breakdown
   * Endpoint: GET /providers/reviews/stats
   */
  async getReviewStats(): Promise<ReviewStats> {
    const response = await apiClient.request<ReviewStats>('/provider/reviews/stats', {
      method: 'GET'
    });
    return response;
  }

  /**
   * Get specific review details
   * Endpoint: GET /providers/reviews/:id
   */
  async getReviewById(reviewId: number): Promise<ReviewDetail> {
    const response = await apiClient.request<ReviewDetail>(`/provider/reviews/${reviewId}`, {
      method: 'GET'
    });
    return response;
  }

  /**
   * Get all jobs with filters
   * Endpoint: GET /providers/jobs
   */
  async getJobs(params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<JobsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/provider/jobs?${queryString}` : '/provider/jobs';
    
    const response = await apiClient.request<JobsResponse>(endpoint, {
      method: 'GET'
    });
    return response;
  }

  

  /**
   * Get all active jobs for current provider
   * Endpoint: GET /provider/jobs
   */
  async getProviderJobs(): Promise<ActiveJob[]> {
    const response = await apiClient.request<ActiveJob[]>('/provider/jobs', {
      method: 'GET'
    });
    return response;
  }

  
  /**
   * Get provider profile
   * Endpoint: GET /providers/profile
   */
  async getProfile(): Promise<ProfileData> {
    const response = await apiClient.request<ProfileData>('/provider/profile', {
      method: 'GET'
    });
    return response;
  }

  /**
   * Update provider profile and service areas
   * Endpoint: PUT /providers/profile
   */
  async updateProfile(dto: UpdateProfileDto): Promise<UpdateProfileResponse> {
    const response = await apiClient.request<UpdateProfileResponse>('/provider/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dto)
    });
    return response;
  }
   
  async setAvailability(status: 'active' | 'inactive'): Promise<SetAvailabilityResponse> {
    const response = await apiClient.request<SetAvailabilityResponse>('/provider/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return response;
  }

  /**
   * Get all pending job requests for current provider
   * Endpoint: GET /provider/pending-jobs
   */
  async getPendingJobs(): Promise<any[]> {
    const response = await apiClient.request<any[]>('/provider/pending-jobs', {
      method: 'GET'
    });
    return response;
  }

  /**
   * Get specific job details by ID
   * Endpoint: GET /provider/jobs/:id
   */
  async getJobDetails(jobId: number): Promise<JobDetailsResponse> {
    const response = await apiClient.request<JobDetailsResponse>(`/provider/jobs/${jobId}`, {
      method: 'GET'
    });
    return response;
  }

  /**
   * Respond to a job request (accept, reject, negotiate)
   * Endpoint: POST /provider/jobs/:id/respond
   */
  async respondToJob(jobId: number, action: 'accept' | 'reject' | 'negotiate', data?: {
    reason?: string;
    negotiation?: {
      editedPrice?: number;
      editedSchedule?: string;
      editedAnswers?: any;
      notes: string;
    };
  }): Promise<any> {
    const response = await apiClient.request(`/provider/jobs/${jobId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        ...data
      })
    });
    return response;
  }

  /**
   * Update job status (mark complete or mark payment)
   * Endpoint: POST /provider/jobs/:id/update-status
   */
  async updateJobStatus(jobId: number, action: 'MARK_COMPLETE' | 'MARK_PAYMENT', paymentDetails?: {
    method: string;
    notes?: string;
  }): Promise<UpdateJobStatusResponse> {
    // Map frontend action to backend enum values
    const backendAction = action === 'MARK_COMPLETE' ? 'mark_complete' : 'mark_payment';
    
    const requestBody: any = {
      action: backendAction
    };

    // Include payment details if action is MARK_PAYMENT
    if (action === 'MARK_PAYMENT' && paymentDetails) {
      requestBody.paymentDetails = paymentDetails;
    }

    const response = await apiClient.request<UpdateJobStatusResponse>(`/provider/jobs/${jobId}/update-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    return response;
  }

  // TODO: Add other provider API methods as backend endpoints are ready
}

// Export singleton instance
export const providerApi = new ProviderApi();

