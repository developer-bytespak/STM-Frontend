/**
 * Homepage Search Types
 * Type definitions for homepage search functionality
 */

// ==================== SERVICE SEARCH ====================

export interface ServiceSearchResult {
  type: 'category' | 'service';
  category: string;
  name?: string;  // for services only
  id: number;
  description: string;
}

export interface CategoryServicesResponse {
  category: string;
  services: CategoryService[];
}

export interface CategoryService {
  id: number;
  name: string;
  description: string;
}

// ==================== LOCATION SEARCH ====================

export interface LocationResult {
  zipCode: string;
  formattedAddress: string;
}

// ==================== PROVIDER SEARCH ====================

export interface HomepageProvider {
  id: number;
  businessName: string;
  ownerName: string;
  rating: number;
  totalJobs: number;
  experience: number;
  description: string;
  location: string;
  phoneNumber: string;
  priceRange: {
    min: number;
    max: number;
  };
  services: ProviderService[];
  serviceAreas: string[];
}

export interface ProviderService {
  id: number;
  name: string;
  category: string;
}

export interface ProviderSearchResult {
  providers: HomepageProvider[];
  count: number;
  service: {
    id: number;
    name: string;
    category: string;
  };
  location: string;
}

export interface ProviderSearchParams {
  service: string;
  zipcode: string;
  filters?: ProviderFilters;
}

export interface ProviderFilters {
  minRating?: number;
  maxPrice?: number;
  minExperience?: number;
}

