/**
 * API Configuration
 */

import { env } from './env';

export const API_CONFIG = {
  BASE_URL: env.API_URL,
  ENDPOINTS: {
    REGISTER: '/auth/register',
    UPLOAD_DOCUMENTS: '/provider-onboarding/documents/upload',
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface RegisterResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface DocumentUploadResponse {
  id: number;
  file_name: string;
  description: string;
  status: string;
  file_size: number;
  created_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'PROVIDER';
  region: string;
  area?: string;
  businessName?: string;
  serviceType?: string;
  experienceLevel?: string;
  description?: string;
  location?: string;
  zipCodes?: string[];
  minPrice?: number;
  maxPrice?: number;
  acceptedTerms?: boolean;
}
