/**
 * Customer API Service Layer
 * Handles all customer-specific API calls
 */

import { apiClient } from './index';

// ==================== TYPE DEFINITIONS ====================

export interface CustomerDashboard {
  stats: {
    activeJobs: number;
    completedJobs: number;
    totalSpent: number;
    pendingFeedback: number;
  };
  recentJobs: CustomerJob[];
  upcomingAppointments?: Appointment[];
}

export interface CustomerJob {
  id: number;
  serviceName: string;
  serviceCategory?: string;
  provider: {
    id: number;
    businessName: string;
    phone?: string;
    rating?: number;
  };
  status: string;
  price: number;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  canCancel?: boolean;
  canReassign?: boolean;
  needsFeedback?: boolean;
  timeline?: JobTimelineEvent[];
}

export interface JobTimelineEvent {
  id: number;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
}

export interface Appointment {
  id: number;
  jobId: number;
  serviceName: string;
  providerName: string;
  scheduledAt: string;
  address: string;
}

export interface CreateJobDto {
  serviceId: number;  // Required - numeric service ID
  providerId: string; // Required - provider ID as string (backend expects numeric string)
  price?: number;     // Optional - customer's budget as number
  location: string;  // Required - customer's address
  zipcode: string;   // Required - customer's zipcode
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
}

export interface JobActionDto {
  action: 'approve_edits' | 'close_deal' | 'cancel';
  reason?: string;
}

export interface ReassignJobDto {
  newProviderId: number;
  reason: string;
}

export interface SubmitFeedbackDto {
  rating: number;
  comment: string;
  wouldRecommend: boolean;
}

export interface FileDisputeDto {
  jobId: number;
  reason: string;
  description: string;
}

export interface RequestNewServiceDto {
  serviceName: string;
  description: string;
  region: string;
}

export interface UpdateCustomerProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
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
   * Endpoint: GET /customers/jobs
   */
  async getJobs(): Promise<CustomerJob[]> {
    const response = await apiClient.request<CustomerJob[]>('/customers/jobs');
    return response;
  }

  /**
   * Get job details by ID
   * Endpoint: GET /customers/jobs/:id
   */
  async getJobDetails(jobId: number): Promise<CustomerJob> {
    const response = await apiClient.request<CustomerJob>(`/customers/jobs/${jobId}`);
    return response;
  }

  /**
   * Create a new job booking
   * Endpoint: POST /jobs/create
   */
  async createJob(data: CreateJobDto): Promise<{ id: number; message: string; job: CustomerJob }> {
    const response = await apiClient.request<{ id: number; message: string; job: CustomerJob }>('/jobs/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Perform job action (approve, cancel, close)
   * Endpoint: POST /customers/jobs/:id/action
   */
  async performJobAction(jobId: number, data: JobActionDto): Promise<{ message: string }> {
    const response = await apiClient.request<{ message: string }>(`/customers/jobs/${jobId}/action`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Reassign job to different provider
   * Endpoint: POST /customers/jobs/:id/reassign
   */
  async reassignJob(jobId: number, data: ReassignJobDto): Promise<{ message: string }> {
    const response = await apiClient.request<{ message: string }>(`/customers/jobs/${jobId}/reassign`, {
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
  async getPendingFeedback(): Promise<CustomerJob[]> {
    const response = await apiClient.request<CustomerJob[]>('/customers/pending-feedback');
    return response;
  }

  /**
   * File a dispute
   * Endpoint: POST /customers/disputes
   */
  async fileDispute(data: FileDisputeDto): Promise<{ id: number; message: string }> {
    const response = await apiClient.request<{ id: number; message: string }>('/customers/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Get customer profile
   * Endpoint: GET /customers/profile
   */
  async getProfile(): Promise<any> {
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
}

// Export singleton instance
export const customerApi = new CustomerApi();

