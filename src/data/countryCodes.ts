/**
 * Country Codes and Phone Validation Rules
 */

export interface CountryCode {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format: string;
  placeholder: string;
  minLength: number;
  maxLength: number;
  pattern?: RegExp;
}

export const COUNTRY_CODES: CountryCode[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    dialCode: '+1',
    format: '(XXX) XXX-XXXX',
    placeholder: '(555) 123-4567',
    minLength: 10,
    maxLength: 10,
    pattern: /^[2-9][0-9]{9}$/,
  },
  {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    dialCode: '+92',
    format: 'XXX XXXXXXX',
    placeholder: '300 1234567',
    minLength: 10,
    maxLength: 10,
    pattern: /^[3][0-9]{9}$/,
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    dialCode: '+91',
    format: 'XXXXX XXXXX',
    placeholder: '98765 43210',
    minLength: 10,
    maxLength: 10,
    pattern: /^[6-9][0-9]{9}$/,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    dialCode: '+44',
    format: 'XXXX XXXXXX',
    placeholder: '7911 123456',
    minLength: 10,
    maxLength: 10,
    pattern: /^[1-9][0-9]{9}$/,
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    dialCode: '+971',
    format: 'XX XXX XXXX',
    placeholder: '50 123 4567',
    minLength: 9,
    maxLength: 9,
    pattern: /^[5][0-9]{8}$/,
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    dialCode: '+1',
    format: '(XXX) XXX-XXXX',
    placeholder: '(416) 555-0199',
    minLength: 10,
    maxLength: 10,
    pattern: /^[2-9][0-9]{9}$/,
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    dialCode: '+61',
    format: 'XXX XXX XXX',
    placeholder: '412 345 678',
    minLength: 9,
    maxLength: 9,
    pattern: /^[4][0-9]{8}$/,
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    dialCode: '+86',
    format: 'XXX XXXX XXXX',
    placeholder: '138 1234 5678',
    minLength: 11,
    maxLength: 11,
    pattern: /^[1][0-9]{10}$/,
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    dialCode: '+966',
    format: 'XX XXX XXXX',
    placeholder: '50 123 4567',
    minLength: 9,
    maxLength: 9,
    pattern: /^[5][0-9]{8}$/,
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    dialCode: '+49',
    format: 'XXX XXXXXXXX',
    placeholder: '152 12345678',
    minLength: 10,
    maxLength: 11,
    pattern: /^[1-9][0-9]{9,10}$/,
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    dialCode: '+33',
    format: 'X XX XX XX XX',
    placeholder: '6 12 34 56 78',
    minLength: 9,
    maxLength: 9,
    pattern: /^[6-7][0-9]{8}$/,
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    dialCode: '+55',
    format: 'XX XXXXX-XXXX',
    placeholder: '11 98765-4321',
    minLength: 11,
    maxLength: 11,
    pattern: /^[1-9][0-9]{10}$/,
  },
];

export const getCountryByDialCode = (dialCode: string): CountryCode | undefined => {
  return COUNTRY_CODES.find(country => country.dialCode === dialCode);
};

export const getCountryByCode = (code: string): CountryCode | undefined => {
  return COUNTRY_CODES.find(country => country.code === code);
};

export const validatePhoneForCountry = (phone: string, countryCode: string): { valid: boolean; error?: string } => {
  const country = getCountryByCode(countryCode);
  
  if (!country) {
    return { valid: false, error: 'Invalid country code' };
  }

  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Check length
  if (cleanPhone.length < country.minLength) {
    return { 
      valid: false, 
      error: `Phone number must be at least ${country.minLength} digits for ${country.name}` 
    };
  }

  if (cleanPhone.length > country.maxLength) {
    return { 
      valid: false, 
      error: `Phone number must be at most ${country.maxLength} digits for ${country.name}` 
    };
  }

  // Check pattern if defined
  if (country.pattern && !country.pattern.test(cleanPhone)) {
    return { 
      valid: false, 
      error: `Please enter a valid ${country.name} phone number (e.g., ${country.placeholder})` 
    };
  }

  return { valid: true };
};

export const formatPhoneWithCountry = (phone: string, countryCode: string): string => {
  const country = getCountryByCode(countryCode);
  if (!country) return phone;

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Return in E.164 format
  return `${country.dialCode}${cleanPhone}`;
};

