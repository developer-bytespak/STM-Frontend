export type UserRole = 'customer' | 'provider' | 'admin' | 'lsm';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends User {
  role: 'customer';
  address?: Address;
  preferences?: CustomerPreferences;
  totalSpent?: number;
  totalBookings?: number;
}

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
}

export interface Admin extends User {
  role: 'admin';
  permissions: AdminPermission[];
  lastLogin?: string;
}

export interface LSM extends User {
  role: 'lsm';
  managedProviders: string[];
  region: string;
  performance?: LSMPerformance;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface CustomerPreferences {
  preferredServices?: string[];
  preferredTimes?: string[];
  preferredProviders?: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  duration: number; // in minutes
  isActive: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  completedAt: string;
}

export interface AdminPermission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface LSMPerformance {
  managedProviders: number;
  completedJobs: number;
  averageRating: number;
  revenue: number;
}

// Form types
export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface ProviderProfileUpdateData extends UserProfileUpdateData {
  businessName?: string;
  businessType?: string;
  description?: string;
  address?: Address;
  services?: Service[];
  hourlyRate?: number;
  experience?: string;
  certifications?: string[];
}

// API response types
export interface UserResponse {
  user: User;
  token: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegistrationData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
  error: string | null;
}


