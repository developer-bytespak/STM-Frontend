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
 * Validate phone number (American format or E.164 international format)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove spaces, dashes, and parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Debug logging
  console.log('Phone validation - Input:', phone, 'Cleaned:', cleanPhone, 'Length:', cleanPhone.length);

  // Check for E.164 format: +1234567890 (international format)
  // E.164 allows 7-15 digits total (including country code)
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  if (e164Regex.test(cleanPhone)) {
    console.log('Phone validation - E.164 format matched');
    return { valid: true };
  }

  // Check for American format: (XXX) XXX-XXXX or XXX-XXX-XXXX or XXXXXXXXXX
  // This handles both 10-digit and 11-digit (with country code) formats
  // American format: 10 digits (no country code) or 11 digits (with 1 country code)
  const americanRegex = /^1?[2-9]\d{2}[2-9]\d{6}$/;
  if (americanRegex.test(cleanPhone)) {
    console.log('Phone validation - American format matched');
    return { valid: true };
  }

  // Additional check for American numbers that might have been formatted with +1
  // If it starts with +1 and has 11 digits after, it's a valid US number
  if (cleanPhone.startsWith('+1') && cleanPhone.length === 12) {
    const withoutPlus = cleanPhone.substring(1); // Remove the +
    if (/^1[2-9]\d{2}[2-9]\d{6}$/.test(withoutPlus)) {
      console.log('Phone validation - +1 American format matched');
      return { valid: true };
    }
  }

  console.log('Phone validation - No format matched');
  return { 
    valid: false, 
    error: 'Please enter a valid phone number (e.g., (555) 123-4567 or +1234567890)' 
  };
};

/**
 * Validate zip code
 */
export const validateZipCode = (zipCode: string): ValidationResult => {
  if (!zipCode) {
    return { valid: false, error: 'ZIP code is required' };
  }

  const clean = zipCode.replace(/\D/g, '').slice(0, 5);
  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(clean)) {
    return { valid: false, error: 'ZIP must be exactly 5 digits' };
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
  console.log('formatPhoneToE164 - Input:', phone);
  
  // If already in E.164 format (starts with +), validate and return
  if (phone.startsWith('+')) {
    const digits = phone.replace(/\D/g, '');
    const result = `+${digits}`;
    console.log('formatPhoneToE164 - E.164 format, result:', result);
    return result;
  }
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  console.log('formatPhoneToE164 - Digits only:', digits, 'Length:', digits.length);
  
  // If it starts with 1 (US country code), add +
  if (digits.startsWith('1') && digits.length === 11) {
    const result = `+${digits}`;
    console.log('formatPhoneToE164 - US with country code, result:', result);
    return result;
  }
  
  // If it's 10 digits (US number without country code), add +1
  if (digits.length === 10) {
    const result = `+1${digits}`;
    console.log('formatPhoneToE164 - US without country code, result:', result);
    return result;
  }
  
  // For any other international format, add + if not present
  const result = `+${digits}`;
  console.log('formatPhoneToE164 - Other format, result:', result);
  return result;
};


