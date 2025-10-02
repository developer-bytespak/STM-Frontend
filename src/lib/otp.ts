/**
 * OTP Utility Functions
 */

export interface OTPSession {
  otp: string;
  email: string;
  phone?: string;
  expiresAt: number;
  attempts: number;
  resendCount: number;
  createdAt: number;
}

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RESEND_ATTEMPTS = 3;
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP session in localStorage
 */
export const storeOTPSession = (
  email: string,
  otp: string,
  phone?: string
): OTPSession => {
  const now = Date.now();
  const session: OTPSession = {
    otp,
    email,
    phone,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    resendCount: 0,
    createdAt: now,
  };

  localStorage.setItem('otp_session', JSON.stringify(session));
  return session;
};

/**
 * Get current OTP session
 */
export const getOTPSession = (): OTPSession | null => {
  const sessionStr = localStorage.getItem('otp_session');
  if (!sessionStr) return null;

  try {
    const session: OTPSession = JSON.parse(sessionStr);
    return session;
  } catch {
    return null;
  }
};

/**
 * Verify OTP against stored session
 */
export const verifyOTP = (
  inputOTP: string
): { valid: boolean; error?: string; session?: OTPSession } => {
  const session = getOTPSession();

  if (!session) {
    return { valid: false, error: 'No active OTP session found' };
  }

  // Check if expired
  if (Date.now() > session.expiresAt) {
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }

  // Check attempts
  if (session.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    clearOTPSession();
    return { 
      valid: false, 
      error: 'Too many failed attempts. Please start over.' 
    };
  }

  // Increment attempts
  session.attempts += 1;
  localStorage.setItem('otp_session', JSON.stringify(session));

  // Verify OTP
  if (session.otp === inputOTP) {
    return { valid: true, session };
  }

  const attemptsLeft = MAX_VERIFICATION_ATTEMPTS - session.attempts;
  return {
    valid: false,
    error: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
  };
};

/**
 * Check if OTP can be resent
 */
export const canResendOTP = (): { canResend: boolean; error?: string } => {
  const session = getOTPSession();

  if (!session) {
    return { canResend: false, error: 'No active session' };
  }

  if (session.resendCount >= MAX_RESEND_ATTEMPTS) {
    return {
      canResend: false,
      error: `Maximum resend limit (${MAX_RESEND_ATTEMPTS}) reached. Please try again later.`,
    };
  }

  return { canResend: true };
};

/**
 * Increment resend count
 */
export const incrementResendCount = (): OTPSession | null => {
  const session = getOTPSession();
  if (!session) return null;

  session.resendCount += 1;
  session.attempts = 0; // Reset attempts on resend
  session.expiresAt = Date.now() + OTP_EXPIRY_MS; // Reset expiry
  localStorage.setItem('otp_session', JSON.stringify(session));

  return session;
};

/**
 * Update OTP in existing session (for resend)
 */
export const updateOTPInSession = (newOTP: string): OTPSession | null => {
  const session = getOTPSession();
  if (!session) return null;

  session.otp = newOTP;
  session.expiresAt = Date.now() + OTP_EXPIRY_MS;
  session.attempts = 0;
  localStorage.setItem('otp_session', JSON.stringify(session));

  return session;
};

/**
 * Clear OTP session
 */
export const clearOTPSession = (): void => {
  localStorage.removeItem('otp_session');
};

/**
 * Get time remaining for OTP
 */
export const getOTPTimeRemaining = (): number => {
  const session = getOTPSession();
  if (!session) return 0;

  const remaining = session.expiresAt - Date.now();
  return Math.max(0, Math.floor(remaining / 1000)); // Return seconds
};

/**
 * Check if OTP is expired
 */
export const isOTPExpired = (): boolean => {
  const session = getOTPSession();
  if (!session) return true;

  return Date.now() > session.expiresAt;
};

/**
 * Mask email for display
 * Example: john.doe@gmail.com -> j***@gmail.com
 */
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;

  const maskedUsername = username.charAt(0) + '***';
  return `${maskedUsername}@${domain}`;
};

/**
 * Mask phone for display
 * Example: +923001234567 -> +92******67
 */
export const maskPhone = (phone: string): string => {
  if (phone.length < 4) return phone;

  const start = phone.slice(0, 3);
  const end = phone.slice(-2);
  const masked = '*'.repeat(phone.length - 5);

  return `${start}${masked}${end}`;
};

/**
 * Get resend attempts remaining
 */
export const getResendAttemptsRemaining = (): number => {
  const session = getOTPSession();
  if (!session) return MAX_RESEND_ATTEMPTS;

  return Math.max(0, MAX_RESEND_ATTEMPTS - session.resendCount);
};


