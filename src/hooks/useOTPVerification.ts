'use client';

import { useState, useCallback } from 'react';
import { generateOTP, storeOTPSession, verifyOTP, canResendOTP, incrementResendCount, updateOTPInSession, getResendAttemptsRemaining } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/emailjs';

interface UseOTPVerificationProps {
  email: string;
  userName: string;
  phone?: string;
}

export const useOTPVerification = ({ email, userName, phone }: UseOTPVerificationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [resendAttempts, setResendAttempts] = useState(getResendAttemptsRemaining());

  /**
   * Send initial OTP
   */
  const sendOTP = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError('');

    try {
      const otp = generateOTP();
      
      // Send OTP via email
      const result = await sendOTPEmail(email, otp, userName);

      if (!result.success) {
        setError(result.error || 'Failed to send OTP');
        return false;
      }

      // Store OTP session
      storeOTPSession(email, otp, phone);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending OTP');
      return false;
    } finally {
      setLoading(false);
    }
  }, [email, userName, phone]);

  /**
   * Resend OTP
   */
  const resendOTP = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError('');

    try {
      // Check if resend is allowed
      const { canResend, error: resendError } = canResendOTP();
      
      if (!canResend) {
        setError(resendError || 'Cannot resend OTP');
        return false;
      }

      // Generate new OTP
      const newOTP = generateOTP();

      // Send new OTP via email
      const result = await sendOTPEmail(email, newOTP, userName);

      if (!result.success) {
        setError(result.error || 'Failed to resend OTP');
        return false;
      }

      // Update OTP in session and increment resend count
      updateOTPInSession(newOTP);
      incrementResendCount();
      
      // Update local state
      setResendAttempts(getResendAttemptsRemaining());

      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred while resending OTP');
      return false;
    } finally {
      setLoading(false);
    }
  }, [email, userName]);

  /**
   * Verify entered OTP
   */
  const verifyEnteredOTP = useCallback((inputOTP: string): { valid: boolean; error?: string } => {
    setError('');

    const result = verifyOTP(inputOTP);

    if (!result.valid && result.error) {
      setError(result.error);
    }

    return result;
  }, []);

  return {
    sendOTP,
    resendOTP,
    verifyEnteredOTP,
    loading,
    error,
    resendAttempts,
    setError,
  };
};


