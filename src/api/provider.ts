/**
 * Provider API Service Layer
 * Handles all provider-specific API calls
 */

import { apiClient } from './index';

// ==================== TYPE DEFINITIONS ====================

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
  businessName?: string;
  description?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  experience?: number;
  serviceAreas?: string[];
}

export interface UpdateProfileResponse {
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
    const response = await apiClient.request<ServiceRequestResponse>('/providers/request-new-service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
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
    const endpoint = queryString ? `/providers/reviews?${queryString}` : '/providers/reviews';
    
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
    const response = await apiClient.request<ReviewStats>('/providers/reviews/stats', {
      method: 'GET'
    });
    return response;
  }

  /**
   * Get specific review details
   * Endpoint: GET /providers/reviews/:id
   */
  async getReviewById(reviewId: number): Promise<ReviewDetail> {
    const response = await apiClient.request<ReviewDetail>(`/providers/reviews/${reviewId}`, {
      method: 'GET'
    });
    return response;
  }


  /**
   * Get provider profile
   * Endpoint: GET /providers/profile
   */
  async getProfile(): Promise<ProfileData> {
    const response = await apiClient.request<ProfileData>('/providers/profile', {
      method: 'GET'
    });
    return response;
  }

  /**
   * Update provider profile and service areas
   * Endpoint: PUT /providers/profile
   */
  async updateProfile(dto: UpdateProfileDto): Promise<UpdateProfileResponse> {
    const response = await apiClient.request<UpdateProfileResponse>('/providers/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dto)
    });
    return response;
  }

  // TODO: Add other provider API methods as backend endpoints are ready
}

// Export singleton instance
export const providerApi = new ProviderApi();

