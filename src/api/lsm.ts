/**
 * LSM API Service Layer
 * Handles all LSM-specific API calls
 */

import { apiClient } from './index';

// ==================== TYPE DEFINITIONS ====================

export interface LsmDashboardData {
  region: string;
  summary: {
    totalProviders: number;
    totalJobs: number;
    pendingServiceRequests: number;
    pendingDisputes: number;
  };
  providers: {
    pending: number;
    active: number;
    inactive: number;
    banned: number;
  };
  jobs: {
    new: number;
    in_progress: number;
    completed: number;
    paid: number;
    cancelled: number;
    rejected_by_sp: number;
  };
  disputes: {
    pending: number;
    resolved: number;
  };
  recentActivity: {
    newProviders24h: number;
    completedJobs24h: number;
    documentsVerified24h: number;
  };
}

export interface PendingOnboardingResponse {
  id: number;
  businessName: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  status: string;
  experience: number;
  experienceLevel: string;
  location: string;
  serviceAreas: string[];
  requestedServices: string[];
  documents: {
    total: number;
    verified: number;
    rejected: number;
    pending: number;
    list: Array<{
      id: number;
      fileName: string;
      status: string;
      uploadedAt: string;
    }>;
  };
  readyForActivation: boolean;
  createdAt: string;
}

export interface JobInRegion {
  id: number;
  service: string;
  category: string;
  customer: string;
  provider: string;
  status: string;
  price: number;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface JobsInRegionFilters {
  status?: string;
  providerId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface JobsInRegionResponse {
  data: JobInRegion[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalJobs: number;
    totalValue: number;
  };
}

export interface ServiceRequestHistoryItem {
  id: number;
  serviceName: string;
  category: string;
  description: string;
  provider: {
    id: number;
    businessName: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  lsmApproved: boolean;
  adminApproved: boolean;
  finalStatus: string;
  lsmReviewedAt: string | null;
  adminReviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface ServiceRequestHistoryFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface ServiceRequestHistoryResponse {
  data: ServiceRequestHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== LSM API CLASS ====================

class LsmApi {
  /**
   * Get LSM dashboard with region statistics
   * Endpoint: GET /lsm/dashboard
   */
  async getDashboard(): Promise<LsmDashboardData> {
    const response = await apiClient.request<LsmDashboardData>('/lsm/dashboard');
    return response;
  }

  /**
   * Get pending provider onboarding applications
   * Endpoint: GET /lsm/onboarding/pending
   */
  async getPendingOnboarding(): Promise<PendingOnboardingResponse[]> {
    const response = await apiClient.request<PendingOnboardingResponse[]>('/lsm/onboarding/pending');
    return response;
  }

  /**
   * Get all jobs in LSM region with filters
   * Endpoint: GET /lsm/jobs
   */
  async getJobsInRegion(filters?: JobsInRegionFilters): Promise<JobsInRegionResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.providerId) params.append('providerId', filters.providerId.toString());
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const url = `/lsm/jobs${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.request<JobsInRegionResponse>(url);
    return response;
  }

  /**
   * Get all service requests history in LSM region with filters
   * Endpoint: GET /lsm/service-requests
   */
  async getServiceRequestsHistory(filters?: ServiceRequestHistoryFilters): Promise<ServiceRequestHistoryResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const url = `/lsm/service-requests${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.request<ServiceRequestHistoryResponse>(url);
    return response;
  }

  /**
   * Approve provider onboarding (NEW PROVIDER REGISTRATION)
   * Endpoint: POST /lsm/providers/:id/approve-onboarding
   */
  async approveProviderOnboarding(providerId: number): Promise<{id: number, status: string, message: string}> {
    const response = await apiClient.request<{id: number, status: string, message: string}>(`/lsm/providers/${providerId}/approve-onboarding`, {
      method: 'POST'
    });
    return response;
  }

  /**
   * Reject provider onboarding (NEW PROVIDER REGISTRATION)
   * Endpoint: POST /lsm/providers/:id/reject-onboarding
   */
  async rejectProviderOnboarding(providerId: number, reason: string): Promise<{id: number, status: string, reason: string, message: string}> {
    const response = await apiClient.request<{id: number, status: string, reason: string, message: string}>(`/lsm/providers/${providerId}/reject-onboarding`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    return response;
  }

  /**
   * Approve a service request (EXISTING PROVIDER ADDING NEW SERVICE)
   * Endpoint: POST /lsm/service-requests/:id/approve
   */
  async approveServiceRequest(requestId: number): Promise<{id: number, status: string, message: string}> {
    const response = await apiClient.request<{id: number, status: string, message: string}>(`/lsm/service-requests/${requestId}/approve`, {
      method: 'POST'
    });
    return response;
  }

  /**
   * Reject a service request (EXISTING PROVIDER ADDING NEW SERVICE)
   * Endpoint: POST /lsm/service-requests/:id/reject
   */
  async rejectServiceRequest(requestId: number, reason: string): Promise<{id: number, status: string, reason: string, message: string}> {
    const response = await apiClient.request<{id: number, status: string, reason: string, message: string}>(`/lsm/service-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    return response;
  }

  /**
   * Get/view a provider document
   * Endpoint: GET /lsm/providers/:providerId/documents/:documentId
   */
  async getProviderDocument(providerId: number, documentId: number): Promise<{
    id: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    description: string;
    status: string;
    fileData: string;  // Base64 data URL
    createdAt: string;
  }> {
    const response = await apiClient.request<{
      id: number;
      fileName: string;
      fileType: string;
      fileSize: number;
      description: string;
      status: string;
      fileData: string;
      createdAt: string;
    }>(`/lsm/providers/${providerId}/documents/${documentId}`);
    return response;
  }

  /**
   * Verify a provider document
   * Endpoint: POST /lsm/providers/:providerId/documents/:documentId
   */
  async verifyDocument(providerId: number, documentId: number): Promise<{
    id: number;
    status: string;
    message: string;
  }> {
    const response = await apiClient.request<{
      id: number;
      status: string;
      message: string;
    }>(`/lsm/providers/${providerId}/documents/${documentId}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'verify' })
    });
    return response;
  }

  /**
   * Reject a provider document
   * Endpoint: POST /lsm/providers/:providerId/documents/:documentId
   */
  async rejectDocument(providerId: number, documentId: number, reason?: string): Promise<{
    id: number;
    status: string;
    message: string;
  }> {
    const response = await apiClient.request<{
      id: number;
      status: string;
      message: string;
    }>(`/lsm/providers/${providerId}/documents/${documentId}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', reason: reason || 'Document rejected by LSM' })
    });
    return response;
  }

  // TODO: Add other LSM API methods as backend endpoints are ready
}

// Export singleton instance
export const lsmApi = new LsmApi();

