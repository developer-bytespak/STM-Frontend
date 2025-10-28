/**
 * Homepage Search API Service Layer
 * Handles all homepage search API calls with data transformation
 */

import { apiClient } from './index';
import type {
  ServiceSearchResult,
  CategoryServicesResponse,
  LocationResult,
  ProviderSearchResult,
  ProviderSearchParams,
  HomepageProvider,
  ProviderDetail,
} from '@/types/homepage';
import { generateProviderSlug } from '@/lib/slug';

// ==================== BACKEND RESPONSE TYPES ====================
// These match the exact backend API responses

interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface BackendServiceSearchResult {
  type: 'category' | 'service';
  category: string;
  name?: string;
  id: number;
  description: string;
}

interface BackendCategoryServicesResponse {
  category: string;
  services: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

interface BackendLocationResult {
  zipCode: string;
  formattedAddress: string;
}

interface BackendProviderSearchResult {
  providers: Array<{
    id: number;
    businessName: string;
    ownerName: string;
    rating: number;
    totalJobs: number;
    experience: number;
    description: string;
    location: string;
    minPrice: number;
    maxPrice: number;
    phoneNumber: string;
    serviceAreas: string[];
    services: Array<{
      id: number;
      name: string;
      category: string;
    }>;
  }>;
  count: number;
  service: {
    id: number;
    name: string;
    category: string;
  };
  location: string;
}

// ==================== TRANSFORMATION FUNCTIONS ====================

/**
 * Transform backend provider to homepage provider format
 */
function transformProvider(backend: BackendProviderSearchResult['providers'][0]): HomepageProvider {
  return {
    id: backend.id,
    businessName: backend.businessName,
    slug: generateProviderSlug(backend.businessName, backend.id),
    ownerName: backend.ownerName,
    rating: backend.rating,
    totalJobs: backend.totalJobs,
    experience: backend.experience,
    description: backend.description,
    location: backend.location,
    phoneNumber: backend.phoneNumber,
    priceRange: {
      min: backend.minPrice,
      max: backend.maxPrice,
    },
    services: backend.services,
    serviceAreas: backend.serviceAreas,
  };
}

// ==================== HOMEPAGE API CLASS ====================

class HomepageApi {
  /**
   * Search for services/categories (autocomplete)
   * @param query - Search query (minimum 3 characters)
   * @returns Array of service search results
   */
  async searchServices(query: string): Promise<ServiceSearchResult[]> {
    try {
      const response = await apiClient.request<BackendResponse<BackendServiceSearchResult[]>>(
        `/homepage/search/services?query=${encodeURIComponent(query)}`
      );

      // Unwrap backend response
      if (response.success && response.data) {
        return response.data;
      }

      // Handle error response
      if (response.error) {
        throw new Error(response.error.message);
      }

      return [];
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  }

  /**
   * Get all services under a category
   * @param category - Category name
   * @returns Category with services list
   */
  async getCategoryServices(category: string): Promise<CategoryServicesResponse> {
    try {
      const response = await apiClient.request<BackendResponse<BackendCategoryServicesResponse>>(
        `/homepage/search/services/category/${encodeURIComponent(category)}`
      );

      // Unwrap backend response
      if (response.success && response.data) {
        return response.data;
      }

      // Handle error response
      if (response.error) {
        throw new Error(response.error.message);
      }

      throw new Error('Failed to fetch category services');
    } catch (error) {
      console.error('Error fetching category services:', error);
      throw error;
    }
  }

  /**
   * Search for locations by ZIP code (autocomplete)
   * @param query - Search query (minimum 2 characters)
   * @param limit - Maximum number of results (default: 10)
   * @returns Array of location results
   */
  async searchLocations(query: string, limit: number = 10): Promise<LocationResult[]> {
    try {
      const response = await apiClient.request<BackendResponse<BackendLocationResult[]>>(
        `/homepage/search/locations?query=${encodeURIComponent(query)}&limit=${limit}`
      );

      // Unwrap backend response
      if (response.success && response.data) {
        return response.data;
      }

      // Handle error response
      if (response.error) {
        throw new Error(response.error.message);
      }

      return [];
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }

  /**
   * Search for providers by service and location
   * @param params - Search parameters (service, zipcode, filters)
   * @returns Provider search results
   */
  async searchProviders(params: ProviderSearchParams): Promise<ProviderSearchResult> {
    try {
      const response = await apiClient.request<BackendResponse<BackendProviderSearchResult>>(
        '/homepage/search/providers',
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      );

      // Unwrap backend response
      if (response.success && response.data) {
        // Transform providers to homepage format
        return {
          providers: response.data.providers.map(transformProvider),
          count: response.data.count,
          service: response.data.service,
          location: response.data.location,
        };
      }

      // Handle error response
      if (response.error) {
        throw new Error(response.error.message);
      }

      throw new Error('Failed to search providers');
    } catch (error) {
      console.error('Error searching providers:', error);
      throw error;
    }
  }

  /**
   * Get detailed provider information by slug
   * @param slug - Provider slug (e.g., "joes-plumbing-11")
   * @returns Detailed provider information
   */
  async getProviderBySlug(slug: string): Promise<ProviderDetail> {
    try {
      // TODO: Replace with actual backend endpoint when ready
      // For now, this will be implemented when backend is ready
      const response = await apiClient.request<BackendResponse<any>>(
        `/providers/${encodeURIComponent(slug)}`
      );

      // Unwrap backend response
      if (response.success && response.data) {
        // Transform backend data to ProviderDetail format
        const provider = response.data;
        
        return {
          id: provider.id,
          businessName: provider.businessName,
          slug: generateProviderSlug(provider.businessName, provider.id),
          ownerName: provider.ownerName,
          rating: provider.rating,
          totalJobs: provider.totalJobs,
          experience: provider.experience,
          description: provider.description,
          location: provider.location,
          phoneNumber: provider.phoneNumber,
          email: provider.email,
          priceRange: {
            min: provider.minPrice,
            max: provider.maxPrice,
          },
          services: provider.services || [],
          serviceAreas: provider.serviceAreas || [],
          address: provider.address,
          workingHours: provider.workingHours,
          certifications: provider.certifications,
          isAvailable: provider.isAvailable ?? true,
          reviews: provider.reviews,
          websiteUrl: provider.websiteUrl,
        };
      }

      // Handle error response
      if (response.error) {
        throw new Error(response.error.message);
      }

      throw new Error('Failed to fetch provider details');
    } catch (error) {
      console.error('Error fetching provider by slug:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const homepageApi = new HomepageApi();

