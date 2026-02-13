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

export interface AvailabilityRemindersStats {
  success: number;
  failed: number;
  total: number;
}

export interface AvailabilityRemindersResponse {
  success: boolean;
  message: string;
  stats: AvailabilityRemindersStats;
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
      const data = response?.data || [];
      console.log('Admin providers API response:', data);
      // Log the structure of first provider to see what fields are available
      if (data && data.length > 0) {
        console.log('First provider fields:', Object.keys(data[0]));
        console.log('First provider earnings field:', {
          totalEarnings: data[0].totalEarnings,
          total_earnings: data[0].total_earnings,
          earnings: data[0].earnings,
          earned_amount: data[0].earned_amount,
        });
      }
      return data;
    } catch (error) {
      // If endpoint not implemented yet, fallback to mock data
      console.warn('Providers endpoint not implemented, using mock data');
      throw error;
    }
  }

  /**
   * Get provider details by ID
   */
  async getProviderDetails(providerId: number): Promise<any> {
    try {
      const response = await apiClient.request<ApiResponse<any>>(`/admin/providers/${providerId}`);
      
      console.log('🔍 Raw API response object:', response);
      console.log('🔍 response?.data:', response?.data);
      
      // Try different ways to extract data
      const data = response?.data || response || null;
      
      console.log('✅ Final extracted data:', {
        id: data?.id,
        businessName: data?.businessName,
        hasDocuments: !!data?.documents,
        documentsLength: data?.documents?.length || 0,
        documentsArray: data?.documents,
      });
      
      return data;
    } catch (error) {
      console.error(`❌ Failed to fetch provider details for ID ${providerId}:`, error);
      throw error;
    }
  }

  /**
   * Get/view a provider document
   */
  async getProviderDocument(providerId: number, documentId: number): Promise<any> {
    try {
      console.log(`🌐 API CALL: GET /admin/providers/${providerId}/documents/${documentId}`);
      const response = await apiClient.request<ApiResponse<any>>(`/admin/providers/${providerId}/documents/${documentId}`);
      
      console.log(`🌐 RAW RESPONSE from apiClient:`, response);
      console.log(`🌐 response?.data:`, response?.data);
      console.log(`🌐 typeof response:`, typeof response);
      console.log(`🌐 response keys:`, response ? Object.keys(response) : 'null');
      
      // Try to extract data - it might be response.data or the response itself
      const data = response?.data !== undefined ? response.data : response;
      
      console.log(`🌐 EXTRACTED DATA:`, data);
      console.log(`🌐 Data keys:`, data ? Object.keys(data) : 'null');
      
      if (!data) {
        console.warn(`🌐 WARNING: Data is null/undefined`);
      }
      
      return data;
    } catch (error) {
      console.error(`🌐 API ERROR - Failed to fetch document ${documentId} for provider ${providerId}:`, error);
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
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.request<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
      return response?.data || {
        activeJobs: 0,
        activeUsers: 0,
        revenueToday: 0,
        pendingApprovals: 0,
        totalProviders: 0,
        totalLSMs: 0,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get recent activity
   */
  async getActivities(limit: number = 10, type?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (type) params.append('type', type);
      
      const response = await apiClient.request<ApiResponse<any[]>>(
        `/admin/activities?${params.toString()}`
      );
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      throw error;
    }
  }

  /**
   * Get revenue chart data
   */
  async getRevenue(period: string = '7days'): Promise<any> {
    try {
      const response = await apiClient.request<ApiResponse<any>>(
        `/admin/revenue?period=${period}`
      );
      return response?.data || {};
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      throw error;
    }
  }

  /**
   * Get jobs distribution grouped by status and date
   */
  async getJobsDistribution(period: string = '7d'): Promise<any> {
    try {
      const response = await apiClient.request<ApiResponse<any>>(
        `/admin/jobs-distribution?period=${period}`
      );
      return response?.data || response || {};
    } catch (error) {
      console.error('Failed to fetch jobs distribution:', error);
      throw error;
    }
  }


  /**
   * Get provider details
   * TODO: Implement backend endpoint GET /admin/providers/:id
   */
  

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

  /**
   * Trigger availability reminders for all active providers (Testing endpoint)
   * Endpoint: POST /admin/test/send-availability-reminders
   */
  async triggerAvailabilityReminders(): Promise<AvailabilityRemindersResponse> {
    const response = await apiClient.request<AvailabilityRemindersResponse>(
      '/admin/test/send-availability-reminders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }
    );
    return response;
  }
}

// Export singleton instance
export const adminApi = new AdminApi();

