/**
 * Customer API Service Layer
 * Handles all customer-specific API calls
 */

import { apiClient } from './index';

// ==================== TYPE DEFINITIONS ====================

export interface CustomerDashboard {
  summary: {
    totalJobs: number;
    totalSpent: number;
    pendingFeedback: number;
  };
  jobs: {
    new: number;
    in_progress: number;
    completed: number;
    paid: number;
    cancelled: number;
    rejected_by_sp: number;
  };
  recentJobs: Array<{
    id: number;
    service: string;
    provider: string;
    status: string;
    price: number;
    createdAt: string;
  }>;
  recentFeedback: Array<{
    id: number;
    rating: number;
    feedback: string;
    provider: string;
    createdAt: string;
  }>;
}

export interface CustomerJob {
  id: number;
  status: string;
  service: {
    id: number;
    name: string;
    category: string;
  };
  provider: {
    id: number;
    businessName: string;
    rating: number;
    user: {
      first_name: string;
      last_name: string;
      phone_number: string;
    };
  };
  location: string;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface CustomerJobDetails {
  job: {
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
    createdAt: string;
  };
  provider: {
    id: number;
    businessName: string;
    ownerName: string;
    phone: string;
    rating: number;
    location: string;
  };
  payment: {
    amount: number;
    status: string;
    method: string | null;
    markedAt: string | null;
  } | null;
  chatId: number | null;
  actions: {
    canApproveEdits: boolean;
    canCloseDeal: boolean;
    canCancel: boolean;
    canGiveFeedback: boolean;
  };
}


export interface CreateJobDto {
  serviceId: number;  // Required - numeric service ID
  providerId: string; // Required - provider ID as string (backend expects numeric string)
  customerBudget?: number; // Optional - customer's budget as number (backend expects customerBudget)
  location: string;  // Required - customer's address
  zipcode: string;   // Required - customer's zipcode
  projectSizeSqft?: number;  // Optional - project size in square feet (sent with job to provider)
  answers: {         // Required - wrapped answers object
    description?: string;
    urgency?: string;
    dimensions?: string;
    additionalDetails?: string;
    budget?: string;
    [key: string]: any;  // Additional dynamic answers
  };
  preferredDate?: string;  // Optional - ISO date string
  requiresInPersonVisit?: boolean;
  inPersonVisitCost?: number;
  images?: string[];  // Optional - array of image URLs from Vercel Blob
}

export interface JobActionDto {
  action: 'approve_edits' | 'close_deal' | 'cancel';
  cancellationReason?: string;  // Backend expects cancellationReason, not reason
}

export interface ReassignJobDto {
  newProviderId: number;
  reason: string;
}

export interface SubmitFeedbackDto {
  rating: number;
  feedback: string;  // Backend expects 'feedback', not 'comment'
  punctualityRating?: number;  // Optional backend field
  responseTime?: number;  // Optional backend field
}

export interface FileDisputeDto {
  jobId: number;
  description: string;
}

export interface RequestNewServiceDto {
  keyword: string;  // Backend expects 'keyword', not 'serviceName'
  description: string;
  region: string;
  zipcode: string;  // Backend requires zipcode
}

export interface UpdateCustomerProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;  // Backend expects 'phone', not 'phoneNumber'
  address?: string;
  zipcode?: string;  // Backend supports zipcode
  region?: string;  // Backend supports region
}

// ==================== CUSTOMER API CLASS ====================

class CustomerApi {
  /**
   * Get customer dashboard with statistics
   * Endpoint: GET /customers/dashboard
   */
  async getDashboard(): Promise<CustomerDashboard> {
    const response = await apiClient.request<CustomerDashboard>('/customers/dashboard');
    return response;
  }

  /**
   * Get all customer jobs
   * Endpoint: GET /customer/jobs
   */
  async getJobs(): Promise<CustomerJob[]> {
    const response = await apiClient.request<CustomerJob[]>('/customer/jobs');
    return response;
  }

  /**
   * Get job details by ID
   * Endpoint: GET /customers/jobs/:id
   */
  async getJobDetails(jobId: number): Promise<CustomerJobDetails> {
    const response = await apiClient.request<CustomerJobDetails>(`/customers/jobs/${jobId}`);
    return response;
  }

  /**
   * Create a new job booking
   * Endpoint: POST /jobs/create
   */
  async createJob(data: CreateJobDto): Promise<{ 
    job: CustomerJob & { id: number }; 
    chat: { id: string; created_at: string }; 
    message: string;
    id?: number; // Legacy support
  }> {
    const response = await apiClient.request<{ 
      job: CustomerJob & { id: number }; 
      chat: { id: string; created_at: string }; 
      message: string 
    }>('/jobs/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Perform job action (approve, cancel, close)
   * Endpoint: POST /customers/jobs/:id/action
   */
  async performJobAction(jobId: number, data: JobActionDto): Promise<any> {
    const response = await apiClient.request<any>(`/customers/jobs/${jobId}/action`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Reassign job to different provider
   * Endpoint: POST /jobs/:id/reassign
   */
  async reassignJob(jobId: number, data: ReassignJobDto): Promise<{ message: string }> {
    const response = await apiClient.request<{ message: string }>(`/jobs/${jobId}/reassign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Submit feedback for completed job
   * Endpoint: POST /customers/jobs/:id/feedback
   */
  async submitFeedback(jobId: number, data: SubmitFeedbackDto): Promise<{ message: string }> {
    const response = await apiClient.request<{ message: string }>(`/customers/jobs/${jobId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Get jobs pending feedback
   * Endpoint: GET /customers/pending-feedback
   */
  async getPendingFeedback(): Promise<{
    pendingCount: number;
    jobs: Array<{
      jobId: number;
      service: string;
      provider: string;
      completedAt: string;
      amount: number;
    }>;
  }> {
    const response = await apiClient.request<any>('/customers/pending-feedback');
    return response;
  }

  /**
   * File a dispute
   * Endpoint: POST /customers/disputes
   */
  async fileDispute(data: FileDisputeDto): Promise<{ disputeId: number; message: string }> {
    const response = await apiClient.request<{ disputeId: number; message: string }>('/customers/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Get customer profile
   * Endpoint: GET /customers/profile
   */
  async getProfile(): Promise<{
    user: {
      name: string;
      email: string;
      phone: string;
    };
    address: string;
    region: string;
    zipcode: string;
    statistics: {
      totalJobs: number;
      totalSpent: number;
    };
  }> {
    const response = await apiClient.request<any>('/customers/profile');
    return response;
  }

  /**
   * Update customer profile
   * Endpoint: PUT /customers/profile
   */
  async updateProfile(data: UpdateCustomerProfileDto): Promise<{ message: string }> {
    const response = await apiClient.request<{ message: string }>('/customers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Get customer dashboard
   * Alias for getDashboard for consistency
   * Endpoint: GET /customers/dashboard
   */
  async getDashboardData(): Promise<CustomerDashboard> {
    return this.getDashboard();
  }

  /**
   * Request a new service (when search returns no results)
   * Endpoint: POST /customers/request-service
   */
  async requestNewService(data: RequestNewServiceDto): Promise<{ message: string }> {
    const response = await apiClient.request<{ message: string }>('/customers/request-service', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Upload job request images
   * Endpoint: POST /jobs/images/upload
   */
  async uploadJobImages(formData: FormData): Promise<{ imageUrls: string[] }> {
    const response = await apiClient.upload<{ imageUrls: string[] }>('/jobs/images/upload', formData);
    return response;
  }
}

// Export singleton instance
export const customerApi = new CustomerApi();

