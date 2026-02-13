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

export interface MessageTemplate {
  id: number;
  provider_id: number;
  first_message_template: string | null;
  job_accepted_subject?: string | null;
  job_accepted_body?: string | null;
  negotiation_subject?: string | null;
  negotiation_body?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateMessageTemplateRequest {
  first_message_template?: string;
  job_accepted_subject?: string;
  job_accepted_body?: string;
  negotiation_subject?: string;
  negotiation_body?: string;
}

export interface MessageTemplateResponse {
  success: boolean;
  message: string;
  data?: MessageTemplate;
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
  images?: string[];
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
  websiteUrl?: string;
}

export interface ProfileStatus {
  current: string;
  isActive: boolean; // Business availability toggle
  canDeactivate: boolean;
  activeJobsCount: number;
  warnings: number;
  lastAvailabilityConfirmedAt?: string; // Last confirmation timestamp
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

export interface ProviderImages {
  logoUrl: string | null;
  bannerUrl: string | null;
  galleryImages: Array<{
    id: string;
    url: string;
    caption?: string;
    order: number;
  }>;
}

export interface ProfileData {
  user: UserInfo;
  business: BusinessInfo;
  status: ProfileStatus;
  services: ServiceInfo[];
  serviceAreas: ServiceArea[];
  documents: DocumentsInfo;
  statistics: ProfileStatistics;
  images?: ProviderImages;
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
  websiteUrl?: string;
}

export interface UpdateProfileResponse {
  message: string;
}

export interface ConfirmAvailabilityResponse {
  success: boolean;
  message: string;
  confirmedAt: string;
  provider: {
    id: number;
    name: string;
    status: string;
    is_active: boolean;
  };
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
   * Get all active jobs for current provider (in_progress, completed).
   * Endpoint: GET /provider/jobs (returns { data, pagination })
   */
  async getProviderJobs(): Promise<ActiveJob[]> {
    const response = await apiClient.request<JobsResponse>('/provider/jobs?status=in_progress,completed', {
      method: 'GET'
    });
    if (response?.data && Array.isArray(response.data)) {
      return response.data as unknown as ActiveJob[];
    }
    return [];
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
   * Endpoint: GET /provider/jobs (with optional status filter)
   */
  async getPendingJobs(status?: string): Promise<any[]> {
    try {
      const url = status ? `/provider/jobs?status=${status}` : '/provider/jobs';
      console.log('🌐 Making API call to:', url);
      
      const response = await apiClient.request<any>(url, {
        method: 'GET'
      });
      
      console.log('📡 Raw API Response:', JSON.stringify(response, null, 2));
      console.log('📡 Response type:', typeof response);
      console.log('📡 Is Array?:', Array.isArray(response));
      console.log('📡 Has data property?:', response && 'data' in response);
      console.log('📡 response.data type:', response?.data ? typeof response.data : 'N/A');
      console.log('📡 response.data is Array?:', Array.isArray(response?.data));
      
      // Backend returns: { data: [...], pagination: {...} }
      // Check response.data first (most likely)
      if (response && response.data && Array.isArray(response.data)) {
        console.log('✅ Found jobs in response.data:', response.data.length, 'jobs');
        return response.data;
      }
      
      // Fallback: if response itself is an array
      if (Array.isArray(response)) {
        console.log('✅ Response is array:', response.length, 'jobs');
        return response;
      }
      
      // If response is not in expected format, log and return empty array
      console.error('❌ Unexpected API response format. Full response:', response);
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching pending jobs:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error status:', error.status);
      return []; // Return empty array on error instead of throwing
    }
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

  /**
   * Mark provider as available (reapply after rejection)
   * Endpoint: POST /provider/mark-available
   */
  async markAsAvailable(): Promise<{ message: string; status: string }> {
    const response = await apiClient.request<{ message: string; status: string }>('/provider/mark-available', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  }

  /**
   * Get provider images
   * Endpoint: GET /provider/images
   */
  async getImages(): Promise<ProviderImages> {
    const response = await apiClient.request<ProviderImages>('/provider/images', {
      method: 'GET'
    });
    return response;
  }

  /**
   * Upload logo image
   * Endpoint: POST /provider/images/logo
   */
  async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.upload<{ logoUrl: string }>('/provider/images/logo', formData);
    return response;
  }

  /**
   * Upload banner image
   * Endpoint: POST /provider/images/banner
   */
  async uploadBanner(file: File): Promise<{ bannerUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.upload<{ bannerUrl: string }>('/provider/images/banner', formData);
    return response;
  }

  /**
   * Upload gallery image
   * Endpoint: POST /provider/images/gallery
   */
  async uploadGalleryImage(file: File, caption?: string): Promise<{
    image: {
      id: string;
      url: string;
      caption?: string;
      order: number;
    };
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    const response = await apiClient.upload<{
      image: {
        id: string;
        url: string;
        caption?: string;
        order: number;
      };
    }>('/provider/images/gallery', formData);
    return response;
  }

  /**
   * Delete gallery image
   * Endpoint: DELETE /provider/images/gallery/:imageId
   */
  async deleteGalleryImage(imageId: string): Promise<{ success: boolean }> {
    const response = await apiClient.request<{ success: boolean }>(`/provider/images/gallery/${imageId}`, {
      method: 'DELETE'
    });
    return response;
  }

  /**
   * Reorder gallery images
   * Endpoint: PUT /provider/images/gallery/reorder
   */
  async reorderGalleryImages(imageIds: string[]): Promise<{ success: boolean }> {
    const response = await apiClient.request<{ success: boolean }>('/provider/images/gallery/reorder', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageIds })
    });
    return response;
  }

  /**
   * Get provider's message template
   * Endpoint: GET /provider/email-templates
   */
  async getMessageTemplate(): Promise<MessageTemplate> {
    const response = await apiClient.request<MessageTemplate>('/provider/email-templates', {
      method: 'GET'
    });
    return response;
  }

  /**
   * Update provider's message template
   * Endpoint: PUT /provider/email-templates
   */
  async updateMessageTemplate(templateData: UpdateMessageTemplateRequest): Promise<MessageTemplateResponse> {
    const response = await apiClient.request<MessageTemplateResponse>('/provider/email-templates', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });
    return response;
  }

  /**
   * Reset message template to default
   * Endpoint: DELETE /provider/email-templates
   */
  async resetMessageTemplate(): Promise<MessageTemplateResponse> {
    const response = await apiClient.request<MessageTemplateResponse>('/provider/email-templates', {
      method: 'DELETE'
    });
    return response;
  }

  /**
   * Confirm availability - Provider confirms their availability weekly
   * Endpoint: POST /provider/confirm-availability
   */
  async confirmAvailability(): Promise<ConfirmAvailabilityResponse> {
    const response = await apiClient.request<ConfirmAvailabilityResponse>('/provider/confirm-availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    return response;
  }
}

// Export singleton instance
export const providerApi = new ProviderApi();

