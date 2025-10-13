/**
 * Admin API Service Layer
 * Handles all admin-specific API calls with data transformation
 */

import { apiClient } from './index';
import type { ApiResponse } from './client';

// ==================== TYPE DEFINITIONS ====================

export interface DashboardStats {
  activeJobs: number;
  activeUsers: number;
  revenueToday: number;
  pendingApprovals: number;
  totalProviders: number;
  totalLSMs: number;
}

export interface ServiceRequest {
  id: number;
  serviceName: string;
  category: string;
  description: string;
  questions_json: any;
  region: string;
  provider: {
    id: number;
    businessName: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  lsm: {
    name: string;
    region: string;
  };
  lsm_reviewed_at: string;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  status: string;
  is_popular: boolean;
  activeProviders: number;
  totalJobs: number;
  created_at: string;
}

export interface PendingAction {
  id: number;
  type: 'service_request' | 'document' | 'dispute' | 'provider';
  title: string;
  description: string;
  count?: number;
  priority: 'high' | 'medium' | 'low';
  link: string;
}

// ==================== ADMIN API CLASS ====================

class AdminApi {
  // ==================== SERVICE REQUEST MANAGEMENT ====================

  /**
   * Get LSM-approved service requests pending admin approval
   */
  async getPendingServiceRequests(): Promise<ServiceRequest[]> {
    const response = await apiClient.request<ServiceRequest[]>(
      '/admin/service-requests/pending'
    );
    return response;
  }

  /**
   * Approve service request and create service
   */
  async approveServiceRequest(requestId: number): Promise<ApiResponse> {
    return apiClient.request(`/admin/service-requests/${requestId}/approve`, {
      method: 'POST',
    });
  }

  /**
   * Reject service request
   */
  async rejectServiceRequest(
    requestId: number,
    reason: string
  ): Promise<ApiResponse> {
    return apiClient.request(`/admin/service-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ==================== SERVICE MANAGEMENT ====================

  /**
   * Get all services
   */
  async getAllServices(): Promise<Service[]> {
    const response = await apiClient.request<Service[]>('/admin/services');
    return response;
  }

  /**
   * Update a service
   */
  async updateService(
    serviceId: number,
    data: {
      name?: string;
      category?: string;
      description?: string;
      is_popular?: boolean;
    }
  ): Promise<ApiResponse> {
    return apiClient.request(`/admin/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a service (soft delete)
   */
  async deleteService(serviceId: number): Promise<ApiResponse> {
    return apiClient.request(`/admin/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  // ==================== LSM MANAGEMENT ====================

  /**
   * Create a new LSM
   */
  async createLsm(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    region: string;
    area: string;
  }): Promise<ApiResponse> {
    return apiClient.request('/admin/lsm/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== PROVIDER MANAGEMENT ====================

  /**
   * Ban a service provider
   */
  async banProvider(
    providerId: number,
    reason: string
  ): Promise<ApiResponse> {
    return apiClient.request(`/admin/providers/${providerId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Unban a service provider
   */
  async unbanProvider(providerId: number): Promise<ApiResponse> {
    return apiClient.request(`/admin/providers/${providerId}/unban`, {
      method: 'POST',
    });
  }

  // ==================== ADDITIONAL PROVIDER METHODS ====================

  /**
   * Get all providers (with filters)
   */
  async getAllProviders(filters?: {
    search?: string;
    region?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.region) params.append('region', filters.region);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.request<ApiResponse<any[]>>(`/admin/providers?${params.toString()}`);
      // Extract the data array from the response object
      return response?.data || [];
    } catch (error) {
      // If endpoint not implemented yet, fallback to mock data
      console.warn('Providers endpoint not implemented, using mock data');
      throw error;
    }
  }

  // ==================== DASHBOARD DATA (TRANSFORMED) ====================

  /**
   * Get pending actions aggregated
   * Transforms backend data into dashboard format
   */
  async getPendingActions(): Promise<PendingAction[]> {
    try {
      // Fetch service requests count
      const serviceRequests = await this.getPendingServiceRequests();
      
      const actions: PendingAction[] = [
        {
          id: 1,
          type: 'service_request',
          title: 'Service Requests',
          description: 'Awaiting admin approval',
          count: serviceRequests.length,
          priority: serviceRequests.length > 0 ? 'high' : 'low',
          link: '/admin/service-requests',
        },
      ];

      // TODO: Add document count when endpoint is available
      // TODO: Add dispute count when endpoint is available
      // TODO: Add provider approval count when endpoint is available

      return actions;
    } catch (error) {
      console.error('Failed to fetch pending actions:', error);
      return [];
    }
  }

  // ==================== PLACEHOLDER METHODS (To be implemented) ====================
  // These methods will be implemented when backend endpoints are ready

  /**
   * Get dashboard statistics
   * TODO: Implement backend endpoint GET /admin/dashboard/stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // This will be implemented once backend endpoint is ready
    throw new Error('Dashboard stats endpoint not implemented yet. Use mock data.');
  }

  /**
   * Get recent activity
   * TODO: Implement backend endpoint GET /admin/dashboard/activities
   */
  async getRecentActivities(limit = 10): Promise<any[]> {
    // This will be implemented once backend endpoint is ready
    throw new Error('Recent activities endpoint not implemented yet. Use mock data.');
  }

  /**
   * Get revenue chart data
   * TODO: Implement backend endpoint GET /admin/dashboard/revenue-chart
   */
  async getRevenueChartData(period = '30d'): Promise<any[]> {
    // This will be implemented once backend endpoint is ready
    throw new Error('Revenue chart endpoint not implemented yet. Use mock data.');
  }

  /**
   * Get jobs distribution
   * TODO: Implement backend endpoint GET /admin/dashboard/jobs-distribution
   */
  async getJobsDistribution(): Promise<any[]> {
    // This will be implemented once backend endpoint is ready
    throw new Error('Jobs distribution endpoint not implemented yet. Use mock data.');
  }


  /**
   * Get provider details
   * TODO: Implement backend endpoint GET /admin/providers/:id
   */
  async getProviderDetails(providerId: number): Promise<any> {
    // This will be implemented once backend endpoint is ready
    throw new Error('Provider details endpoint not implemented yet.');
  }

  /**
   * Get all LSMs
   */
  async getAllLSMs(): Promise<any[]> {
    try {
      const response = await apiClient.request<any>('/admin/lsms');
      // Backend returns array directly, not wrapped in data object
      return Array.isArray(response) ? response : (response?.data || []);
    } catch (error) {
      // Endpoint not implemented yet, throw to trigger fallback to mock data
      throw new Error('LSMs list endpoint not implemented yet.');
    }
  }

  /**
   * Update LSM information
   * @param lsmId - The ID of the LSM to update
   * @param data - The updated LSM data
   */
  async updateLSM(
    lsmId: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
      region?: string;
      area?: string;
      status?: string;
      password?: string;
    }
  ): Promise<ApiResponse> {
    return apiClient.request(`/admin/lsms/${lsmId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Replace LSM - Creates new LSM, reassigns providers, handles old LSM
   * @param oldLsmId - The ID of the LSM to replace
   * @param data - The replacement data
   */
  async replaceLSM(
    oldLsmId: number,
    data: {
      newLsmEmail: string;
      newLsmPassword: string;
      newLsmFirstName: string;
      newLsmLastName: string;
      newLsmPhoneNumber: string;
      oldLsmAction: 'delete' | 'deactivate' | 'reassign';
      newRegionForOldLsm?: string;
      newAreaForOldLsm?: string;
    }
  ): Promise<ApiResponse> {
    return apiClient.request(`/admin/lsms/${oldLsmId}/replace`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete/Deactivate LSM
   * @param lsmId - The ID of the LSM to delete
   */
  async deleteLSM(lsmId: number): Promise<ApiResponse> {
    return apiClient.request(`/admin/lsms/${lsmId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all users
   * TODO: Implement backend endpoint GET /admin/users
   */
  async getAllUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    // This will be implemented once backend endpoint is ready
    throw new Error('Users list endpoint not implemented yet.');
  }

  /**
   * Get all jobs
   * TODO: Implement backend endpoint GET /admin/jobs
   */
  async getAllJobs(filters?: {
    status?: string;
    serviceId?: number;
    region?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    // This will be implemented once backend endpoint is ready
    throw new Error('Jobs list endpoint not implemented yet.');
  }

  /**
   * Get pending documents
   * TODO: Implement backend endpoint GET /admin/documents/pending
   */
  async getPendingDocuments(): Promise<any> {
    // This will be implemented once backend endpoint is ready
    throw new Error('Pending documents endpoint not implemented yet.');
  }

  /**
   * Get all disputes
   * TODO: Implement backend endpoint GET /admin/disputes
   */
  async getAllDisputes(status?: string): Promise<any> {
    // This will be implemented once backend endpoint is ready
    throw new Error('Disputes endpoint not implemented yet.');
  }
}

// Export singleton instance
export const adminApi = new AdminApi();

