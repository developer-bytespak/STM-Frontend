import { User, Address, Service, PortfolioItem } from './user';

export interface Provider extends User {
  role: 'provider';
  businessName?: string;
  businessType?: string;
  description?: string;
  address?: Address;
  services: Service[];
  rating?: number;
  reviewCount?: number;
  isAvailable: boolean;
  hourlyRate?: number;
  experience?: string;
  certifications?: string[];
  portfolio?: PortfolioItem[];
  workingHours?: WorkingHours;
  availability?: Availability;
  bankDetails?: BankDetails;
  image?: string;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  breaks?: TimeBreak[];
}

export interface TimeBreak {
  startTime: string;
  endTime: string;
  description?: string;
}

export interface Availability {
  isAvailable: boolean;
  nextAvailableDate?: string;
  reason?: string; // vacation, sick, etc.
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings';
}

export interface ProviderStats {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  cancelledJobs: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
  responseTime: number; // in hours
  acceptanceRate: number; // percentage
}

export interface ProviderSearchFilters {
  location?: string;
  serviceType?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: boolean;
  distance?: number; // in miles
  sortBy?: 'rating' | 'price' | 'distance' | 'availability';
  sortOrder?: 'asc' | 'desc';
}

export interface ProviderRegistrationData {
  // Basic info (from user registration)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  // Provider-specific info
  businessName?: string;
  businessType?: string;
  description?: string;
  services: string[];
  hourlyRate?: number;
  experience?: string;
  certifications?: string[];
  address?: Address;
}

export interface ProviderOnboardingData {
  businessName: string;
  businessType: string;
  description: string;
  services: Service[];
  hourlyRate: number;
  experience: string;
  certifications: string[];
  address: Address;
  workingHours: WorkingHours;
  bankDetails: BankDetails;
  portfolio?: PortfolioItem[];
}

export interface ProviderUpdateData {
  businessName?: string;
  businessType?: string;
  description?: string;
  services?: Service[];
  hourlyRate?: number;
  experience?: string;
  certifications?: string[];
  address?: Address;
  workingHours?: WorkingHours;
  availability?: Availability;
  bankDetails?: BankDetails;
  portfolio?: PortfolioItem[];
}

// Provider verification types
export interface ProviderVerification {
  id: string;
  providerId: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: VerificationDocument[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface VerificationDocument {
  type: 'id' | 'business_license' | 'insurance' | 'certification' | 'other';
  name: string;
  url: string;
  uploadedAt: string;
}

// Provider earnings types
export interface ProviderEarnings {
  id: string;
  providerId: string;
  period: {
    start: string;
    end: string;
  };
  grossEarnings: number;
  platformFee: number;
  netEarnings: number;
  totalJobs: number;
  breakdown: EarningsBreakdown[];
}

export interface EarningsBreakdown {
  jobId: string;
  jobTitle: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  completedAt: string;
}

// Provider reviews types
export interface ProviderReview {
  id: string;
  providerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  jobId: string;
  createdAt: string;
  isVerified: boolean;
}

export interface ProviderRating {
  providerId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// API response types
export interface ProviderResponse {
  provider: Provider;
  stats: ProviderStats;
}

export interface ProvidersListResponse {
  providers: Provider[];
  total: number;
  page: number;
  limit: number;
  filters: ProviderSearchFilters;
}

export interface ProviderEarningsResponse {
  earnings: ProviderEarnings[];
  summary: {
    totalEarnings: number;
    totalPlatformFees: number;
    totalNetEarnings: number;
  };
}

export interface ProviderReviewsResponse {
  reviews: ProviderReview[];
  rating: ProviderRating;
  total: number;
  page: number;
  limit: number;
}


