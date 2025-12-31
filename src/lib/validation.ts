/**
 * Form Validation Utilities
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ==================== AI CHAT VALIDATION ====================

/**
 * Validate US zipcode
 * Supports both 5-digit and ZIP+4 formats
 */
export function isValidZipcode(zipcode: string): boolean {
  // Must be exactly 5 digits
  const fiveDigit = /^\d{5}$/;
  // ZIP+4 format: 12345-6789 (optional support)
  const zipPlusFour = /^\d{5}-\d{4}$/;
  
  if (!fiveDigit.test(zipcode) && !zipPlusFour.test(zipcode)) {
    return false;
  }
  
  // Extract 5-digit portion
  const zip = zipcode.split('-')[0];
  const zipNum = parseInt(zip, 10);
  
  // US zipcodes range from 00501 to 99950
  // Reject invalid ranges
  if (zipNum < 501 || zipNum > 99950) {
    return false;
  }
  
  // Reject all zeros or all nines (invalid)
  if (zip === '00000' || zip === '99999') {
    return false;
  }
  
  return true;
}

/**
 * Typical price ranges for common services (for budget validation suggestions)
 */
const SERVICE_PRICE_RANGES: Record<string, { min: number; max: number; typical: string }> = {
  'House Cleaning': { min: 80, max: 300, typical: '$80-$300' },
  'Office Cleaning': { min: 100, max: 500, typical: '$100-$500' },
  'Plumbing': { min: 75, max: 400, typical: '$75-$400' },
  'Electrical': { min: 100, max: 500, typical: '$100-$500' },
  'Electrician': { min: 100, max: 500, typical: '$100-$500' },
  'HVAC': { min: 150, max: 800, typical: '$150-$800' },
  'Painting': { min: 200, max: 1000, typical: '$200-$1,000' },
  'Landscaping': { min: 100, max: 500, typical: '$100-$500' },
  'Roofing': { min: 500, max: 5000, typical: '$500-$5,000' },
  'Carpet Cleaning': { min: 75, max: 250, typical: '$75-$250' },
  'Moving': { min: 150, max: 1000, typical: '$150-$1,000' },
  'Handyman': { min: 60, max: 300, typical: '$60-$300' },
  'Pool Service': { min: 80, max: 300, typical: '$80-$300' },
  'Pest Control': { min: 100, max: 400, typical: '$100-$400' },
  'Window Cleaning': { min: 60, max: 200, typical: '$60-$200' },
};

/**
 * Get suggested price range for a service
 */
export function getServicePriceRange(serviceName: string | null): { min: number; max: number; typical: string } | null {
  if (!serviceName) return null;
  
  // Try exact match first
  if (SERVICE_PRICE_RANGES[serviceName]) {
    return SERVICE_PRICE_RANGES[serviceName];
  }
  
  // Try case-insensitive partial match
  const lowerService = serviceName.toLowerCase();
  for (const [key, value] of Object.entries(SERVICE_PRICE_RANGES)) {
    if (key.toLowerCase().includes(lowerService) || lowerService.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Default range if service not found
  return { min: 50, max: 500, typical: '$50-$500' };
}

/**
 * Validate budget amount with service-specific suggestions
 * Checks if budget is within reasonable range for services
 * 
 * @param budget - The budget string to validate
 * @param serviceName - Optional service name for dynamic price range (deprecated, use validateBudgetAsync)
 */
export function isValidBudget(budget: string, serviceName?: string | null): ValidationResult {
  // Extract numeric value (remove $, commas, etc.)
  const numericBudget = budget.replace(/[$,\s]/g, '');
  const amount = parseFloat(numericBudget);
  
  if (isNaN(amount)) {
    return { valid: false, error: 'Budget must be a valid number. Example: $100 or 250' };
  }
  
  // Get hardcoded service-specific price range (fallback if async not available)
  const priceRange = getServicePriceRange(serviceName);
  
  // Minimum budget: $10 (or service minimum if available)
  const minBudget = priceRange ? priceRange.min : 10;
  if (amount < minBudget) {
    const suggestion = priceRange 
      ? `Budget is too low for ${serviceName}. Typical price range: ${priceRange.typical}. Please enter at least $${minBudget}.`
      : `Budget must be at least $${minBudget}`;
    return { valid: false, error: suggestion };
  }
  
  // Maximum budget: $100,000 (reasonable for most services)
  if (amount > 100000) {
    return { valid: false, error: 'Budget cannot exceed $100,000. Please enter a reasonable amount.' };
  }
  
  return { valid: true };
}

/**
 * Validate budget with real-time provider price data from API
 * This is the preferred method - use this instead of isValidBudget when possible
 */
export async function validateBudgetAsync(
  budget: string,
  serviceName: string | null,
  getPriceRange: (service: string) => Promise<{ minPrice: number; maxPrice: number; avgPrice: number; providerCount: number }>
): Promise<ValidationResult> {
  // Extract numeric value
  const numericBudget = budget.replace(/[$,\s]/g, '');
  const amount = parseFloat(numericBudget);
  
  if (isNaN(amount)) {
    return { valid: false, error: 'Budget must be a valid number. Example: $100 or 250' };
  }
  
  // Get real provider prices if service is provided
  let minBudget = 10;
  let suggestion = '';
  
  if (serviceName) {
    try {
      const priceData = await getPriceRange(serviceName);
      minBudget = priceData.minPrice;
      
      if (amount < minBudget) {
        if (priceData.providerCount > 0) {
          suggestion = `Budget is too low for ${serviceName}. Our ${priceData.providerCount} providers typically charge $${priceData.minPrice}-$${priceData.maxPrice} (average: $${priceData.avgPrice}). Please enter at least $${minBudget}.`;
        } else {
          suggestion = `Budget is too low for ${serviceName}. Typical range is $${priceData.minPrice}-$${priceData.maxPrice}. Please enter at least $${minBudget}.`;
        }
      }
    } catch (error) {
      // Fallback to static validation
      return isValidBudget(budget, serviceName);
    }
  }
  
  if (amount < minBudget) {
    return { valid: false, error: suggestion || `Budget must be at least $${minBudget}` };
  }
  
  if (amount > 100000) {
    return { valid: false, error: 'Budget cannot exceed $100,000. Please enter a reasonable amount.' };
  }
  
  return { valid: true };
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Detect if a message is a question
 */
export function isQuestion(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  
  // Check if ends with question mark
  if (trimmed.endsWith('?')) {
    return true;
  }
  
  // Check if starts with question words
  const questionWords = [
    'what', 'why', 'how', 'when', 'where', 'who', 'which',
    'can', 'could', 'would', 'should', 'will', 'shall',
    'do', 'does', 'did', 'is', 'are', 'was', 'were',
    'has', 'have', 'had', 'may', 'might', 'must'
  ];
  
  return questionWords.some(word => trimmed.startsWith(word + ' '));
}

/**
 * Fuzzy match service names
 * Returns similarity score (0-1)
 */
export function fuzzyMatchService(input: string, serviceName: string): number {
  const inputLower = input.toLowerCase().trim();
  const serviceLower = serviceName.toLowerCase();
  
  // Exact match
  if (inputLower === serviceLower) {
    return 1.0;
  }
  
  // Contains match
  if (serviceLower.includes(inputLower) || inputLower.includes(serviceLower)) {
    return 0.8;
  }
  
  // Word-level matching
  const inputWords = inputLower.split(/\s+/);
  const serviceWords = serviceLower.split(/\s+/);
  
  let matchedWords = 0;
  for (const inputWord of inputWords) {
    for (const serviceWord of serviceWords) {
      if (inputWord === serviceWord || serviceWord.includes(inputWord) || inputWord.includes(serviceWord)) {
        matchedWords++;
        break;
      }
    }
  }
  
  if (matchedWords > 0) {
    return 0.5 + (matchedWords / Math.max(inputWords.length, serviceWords.length)) * 0.3;
  }
  
  return 0;
}

/**
 * Detect vague/unclear user requests that need service selection
 */
export function isVagueRequest(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  const vaguePatterns = [
    /^(hi|hello|hey|help|service|looking for|need|want|i need|i want)/i,
    /^(can you help|could you help|looking for help|need help)/i,
    /help with (my|the|a)/i,
    /^(assistance|support)/i,
    /^(show me|tell me about)/i
  ];
  
  return vaguePatterns.some(pattern => pattern.test(trimmed));
}

// ==================== FORM VALIDATION ====================

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

  // Check for E.164 format: +1234567890 (international format)
  // E.164 allows 7-15 digits total (including country code)
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  if (e164Regex.test(cleanPhone)) {
    return { valid: true };
  }

  // Check for American format: (XXX) XXX-XXXX or XXX-XXX-XXXX or XXXXXXXXXX
  // This handles both 10-digit and 11-digit (with country code) formats
  // American format: 10 digits (no country code) or 11 digits (with 1 country code)
  const americanRegex = /^1?[2-9]\d{2}[2-9]\d{6}$/;
  if (americanRegex.test(cleanPhone)) {
    return { valid: true };
  }

  // Additional check for American numbers that might have been formatted with +1
  // If it starts with +1 and has 11 digits after, it's a valid US number
  if (cleanPhone.startsWith('+1') && cleanPhone.length === 12) {
    const withoutPlus = cleanPhone.substring(1); // Remove the +
    if (/^1[2-9]\d{2}[2-9]\d{6}$/.test(withoutPlus)) {
      return { valid: true };
    }
  }
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
  // If already in E.164 format (starts with +), validate and return
  if (phone.startsWith('+')) {
    const digits = phone.replace(/\D/g, '');
    return `+${digits}`;
  }
  
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
  
  // For any other international format, add + if not present
  return `+${digits}`;
};


