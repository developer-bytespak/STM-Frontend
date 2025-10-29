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
  slug: string;  // SEO-friendly URL slug (e.g., "joes-plumbing-11")
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
  logoUrl?: string;
  bannerUrl?: string;
}

export interface ProviderService {
  id: number;
  name: string;
  category: string;
  isActive?: boolean;  // Whether service is currently active/offered
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

// ==================== PROVIDER DETAIL ====================

/**
 * Detailed provider information for provider detail page
 * Includes all information from HomepageProvider plus additional fields
 */
export interface ServiceImage {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface ProviderDetail extends HomepageProvider {
  email?: string;
  address?: {
    street?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  workingHours?: {
    monday?: WorkingDay;
    tuesday?: WorkingDay;
    wednesday?: WorkingDay;
    thursday?: WorkingDay;
    friday?: WorkingDay;
    saturday?: WorkingDay;
    sunday?: WorkingDay;
  };
  certifications?: string[];
  isAvailable?: boolean;
  reviews?: ProviderReview[];
  websiteUrl?: string;
  galleryImages?: ServiceImage[];
}

export interface WorkingDay {
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
}

export interface ProviderReview {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  jobType?: string;
}

