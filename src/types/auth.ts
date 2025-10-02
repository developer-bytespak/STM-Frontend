/**
 * Authentication Type Definitions
 */

export interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  acceptedTerms: boolean;
}

export interface LoginFormData {
  email: string;
}

export interface OTPVerificationData {
  otp: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    userId?: string;
    email?: string;
    token?: string;
  };
  error?: string;
}

export interface EmailExistsResponse {
  exists: boolean;
  message?: string;
}

export interface UserRegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
  status: 'pending' | 'active';
  role: 'customer';
  createdAt: string;
}

export type SignupStep = 'form' | 'otp' | 'success';
export type LoginStep = 'form' | 'otp' | 'success';

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  acceptedTerms?: string;
  otp?: string;
  general?: string;
}


