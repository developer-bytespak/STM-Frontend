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

export interface PendingServiceRequest {
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
      phone_number: string;
    };
  };
  created_at: string;
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

export interface ProviderInRegion {
  id: number;
  businessName: string;
  status: string;
  rating: number;
  experience: number;
  totalJobs: number;
  rejectionReason: string | null;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  serviceAreas: string[];
  services: Array<{
    name: string;
    category: string;
  }>;
  documentCount: number;
  jobCount: number;
  created_at: string;
}

export interface ProvidersInRegionResponse {
  total: number;
  status: string;
  providers: ProviderInRegion[];
}

export interface DisputeChatMessage {
  id: number;
  senderType: string;
  message: string;
  messageType: string;
  createdAt: string;
}

export interface Dispute {
  id: number;
  job: {
    id: number;
    service: string;
    price: number;
  };
  customer: {
    id: number;
    name: string;
  };
  provider: {
    id: number;
    businessName: string;
  };
  raisedBy: string;
  status: 'pending' | 'under_review' | 'resolved';
  chatStatus: {
    lsmInvited: boolean;
    lsmJoined: boolean;
  } | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface DisputeDetail {
  dispute: {
    id: number;
    status: string;
    raisedBy: string;
    resolvedBy: number | null;
    createdAt: string;
    resolvedAt: string | null;
  };
  job: {
    id: number;
    service: string;
    category: string;
    price: number;
    status: string;
    scheduledAt: string | null;
    completedAt: string | null;
    answersJson: any;
  };
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  provider: {
    id: number;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
  };
  chatStatus: {
    chatId: number;
    lsmInvited: boolean;
    lsmJoined: boolean;
    lsmJoinedAt: string | null;
  } | null;
  chatHistory: DisputeChatMessage[];
}

export interface DisputesResponse {
  data: Dispute[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DisputeFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProviderReview {
  id: number;
  rating: number;
  feedback: string;
  punctualityRating: number | null;
  responseTime: number | null;
  customer: {
    name: string;
    email: string;
  };
  job: {
    id: number;
    service: string;
    category: string;
    completedAt: string | null;
    price: number;
  };
  createdAt: string;
}

export interface ProviderReviewsResponse {
  provider: {
    id: number;
    businessName: string;
    rating: number;
    totalJobs: number;
  };
  data: ProviderReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProviderReviewStats {
  provider: {
    id: number;
    businessName: string;
    totalJobs: number;
  };
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

export interface ReviewFilters {
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
}

export interface ProviderDetailResponse {
  provider: {
    id: number;
    businessName: string;
    user: {
      name: string;
      email: string;
      phone: string;
      joinedAt: string;
      lastLogin: string | null;
    };
    status: string;
    rating: number;
    experience: number;
    experienceLevel: string;
    description: string;
    location: string;
    warnings: number;
    totalJobs: number;
    earnings: number;
    approvedAt: string | null;
    createdAt: string;
  };
  statistics: {
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    activeJobs: number;
    averageRating: number;
    totalReviews: number;
  };
  documents: Array<{
    id: number;
    fileName: string;
    filePath: string;
    status: string;
    verifiedBy: number | null;
    verifiedAt: string | null;
    uploadedAt: string;
  }>;
  serviceAreas: string[];
  services: Array<{
    name: string;
    category: string;
  }>;
  recentJobs: Array<{
    id: number;
    service: string;
    customer: string;
    status: string;
    price: number;
    createdAt: string;
    completedAt: string | null;
  }>;
  recentFeedback: Array<{
    id: number;
    rating: number;
    feedback: string;
    customer: string;
    createdAt: string;
  }>;
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
   * Get pending service requests awaiting LSM approval
   * Endpoint: GET /lsm/service-requests/pending
   */
  async getPendingServiceRequests(): Promise<PendingServiceRequest[]> {
    const response = await apiClient.request<PendingServiceRequest[]>('/lsm/service-requests/pending');
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

  /**
   * Get all providers in LSM's region with optional status filter
   * Endpoint: GET /lsm/providers?status=pending|active|inactive|banned|rejected
   */
  async getProvidersInRegion(status?: string): Promise<ProvidersInRegionResponse> {
    const url = status ? `/lsm/providers?status=${status}` : '/lsm/providers';
    const response = await apiClient.request<ProvidersInRegionResponse>(url);
    return response;
  }

  /**
   * Get detailed provider profile
   * Endpoint: GET /lsm/providers/:id
   */
  async getProviderDetails(providerId: number): Promise<ProviderDetailResponse> {
    const response = await apiClient.request<ProviderDetailResponse>(`/lsm/providers/${providerId}`);
    return response;
  }

  /**
   * Set provider status (active/inactive)
   * Endpoint: POST /lsm/providers/:id/set-status
   */
  async setProviderStatus(
    providerId: number, 
    status: 'active' | 'inactive',
    force?: boolean
  ): Promise<{
    id: number;
    status: string;
    message: string;
  }> {
    const response = await apiClient.request<{
      id: number;
      status: string;
      message: string;
    }>(`/lsm/providers/${providerId}/set-status`, {
      method: 'POST',
      body: JSON.stringify({ status, force: force || false })
    });
    return response;
  }

  /**
   * Request admin to ban a provider
   * Endpoint: POST /lsm/providers/:id/request-ban
   */
  async requestBan(
    providerId: number,
    reason: string
  ): Promise<{
    id: number;
    message: string;
    banRequestId: number;
  }> {
    const response = await apiClient.request<{
      id: number;
      message: string;
      banRequestId: number;
    }>(`/lsm/providers/${providerId}/request-ban`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    return response;
  }

  /**
   * Get all disputes in LSM region with filters
   * Endpoint: GET /lsm/disputes
   */
  async getDisputes(filters?: DisputeFilters): Promise<DisputesResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const url = `/lsm/disputes${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.request<DisputesResponse>(url);
    return response;
  }

  /**
   * Get dispute details with chat history
   * Endpoint: GET /lsm/disputes/:id
   */
  async getDisputeDetails(disputeId: number): Promise<DisputeDetail> {
    const response = await apiClient.request<DisputeDetail>(`/lsm/disputes/${disputeId}`);
    return response;
  }

  /**
   * Join dispute chat
   * Endpoint: POST /lsm/disputes/:id/join-chat
   */
  async joinDisputeChat(disputeId: number): Promise<{
    message: string;
    chatId: number;
  }> {
    const response = await apiClient.request<{
      message: string;
      chatId: number;
    }>(`/lsm/disputes/${disputeId}/join-chat`, {
      method: 'POST'
    });
    return response;
  }

  /**
   * Resolve dispute with resolution notes
   * Endpoint: POST /lsm/disputes/:id/resolve
   */
  async resolveDispute(
    disputeId: number,
    resolutionNotes: string
  ): Promise<{
    id: number;
    status: string;
    message: string;
  }> {
    const response = await apiClient.request<{
      id: number;
      status: string;
      message: string;
    }>(`/lsm/disputes/${disputeId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes })
    });
    return response;
  }

  /**
   * Get all reviews for a specific provider
   * Endpoint: GET /lsm/providers/:id/reviews
   */
  async getProviderReviews(
    providerId: number,
    filters?: ReviewFilters
  ): Promise<ProviderReviewsResponse> {
    const params = new URLSearchParams();
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.maxRating) params.append('maxRating', filters.maxRating.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const url = `/lsm/providers/${providerId}/reviews${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.request<ProviderReviewsResponse>(url);
    return response;
  }

  /**
   * Get review statistics for a provider
   * Endpoint: GET /lsm/providers/:id/reviews/stats
   */
  async getProviderReviewStats(providerId: number): Promise<ProviderReviewStats> {
    const response = await apiClient.request<ProviderReviewStats>(`/lsm/providers/${providerId}/reviews/stats`);
    return response;
  }

  // TODO: Add other LSM API methods as backend endpoints are ready
}

// Export singleton instance
export const lsmApi = new LsmApi();

