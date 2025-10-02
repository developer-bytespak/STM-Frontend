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
 * Validate phone number (Pakistani format)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');

  // Check for Pakistani format: +92XXXXXXXXXX or 03XXXXXXXXX
  const phoneRegex = /^(\+92|92|0)?3[0-9]{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { 
      valid: false, 
      error: 'Please enter a valid Pakistani phone number (e.g., 03001234567)' 
    };
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
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Convert to +92 format if starts with 0
  if (cleanPhone.startsWith('0')) {
    return '+92' + cleanPhone.substring(1);
  }
  
  // Add +92 if not present
  if (!cleanPhone.startsWith('+92') && !cleanPhone.startsWith('92')) {
    return '+92' + cleanPhone;
  }
  
  // Add + if starts with 92
  if (cleanPhone.startsWith('92') && !cleanPhone.startsWith('+')) {
    return '+' + cleanPhone;
  }
  
  return cleanPhone;
};


