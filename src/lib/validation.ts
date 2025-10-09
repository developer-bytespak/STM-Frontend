/**
 * Form Validation Utilities
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  return { valid: true };
};

/**
 * Get password strength level
 */
export const getPasswordStrength = (
  password: string
): { strength: 'weak' | 'medium' | 'strong'; score: number } => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { strength: 'weak', score };
  if (score <= 4) return { strength: 'medium', score };
  return { strength: 'strong', score };
};

/**
 * Validate phone number (American format)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Check for American format: (XXX) XXX-XXXX or XXX-XXX-XXXX or XXXXXXXXXX
  const phoneRegex = /^(\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { 
      valid: false, 
      error: 'Please enter a valid American phone number (e.g., (555) 123-4567)' 
    };
  }

  return { valid: true };
};

/**
 * Validate zip code
 */
export const validateZipCode = (zipCode: string): ValidationResult => {
  if (!zipCode) {
    return { valid: false, error: 'ZIP code is required' };
  }

  // Remove all non-digit and non-hyphen characters
  const cleanZipCode = zipCode.replace(/[^\d-]/g, '');
  
  // Check if it's a valid US ZIP code (5 digits or 5+4 format)
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!zipRegex.test(cleanZipCode)) {
    return { valid: false, error: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)' };
  }

  return { valid: true };
};

/**
 * Validate name
 */
export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return { valid: false, error: 'Name can only contain letters and spaces' };
  }

  return { valid: true };
};

/**
 * Validate OTP format
 */
export const validateOTPFormat = (otp: string): ValidationResult => {
  if (!otp) {
    return { valid: false, error: 'OTP is required' };
  }

  if (!/^\d{6}$/.test(otp)) {
    return { valid: false, error: 'OTP must be 6 digits' };
  }

  return { valid: true };
};

/**
 * Sanitize input (prevent XSS)
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * Format phone number for display (American format)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  }
  
  // If already formatted or has country code, return as is
  return phone;
};

/**
 * Format phone number to E.164 format for backend API
 */
export const formatPhoneToE164 = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 1 (US country code), add +
  if (digits.startsWith('1') && digits.length === 11) {
    return `+${digits}`;
  }
  
  // If it's 10 digits (US number without country code), add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Otherwise, add + if not present
  return digits.startsWith('+') ? digits : `+${digits}`;
};


