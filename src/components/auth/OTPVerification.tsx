'use client';

import React, { useState, useEffect } from 'react';
import { OTPInput } from './OTPInput';
import { useOTPTimer } from '@/hooks/useOTPTimer';
import { useOTPVerification } from '@/hooks/useOTPVerification';
import { maskEmail, maskPhone, getOTPTimeRemaining } from '@/lib/otp';
import { validateOTPFormat } from '@/lib/validation';

interface OTPVerificationProps {
  email: string;
  userName: string;
  phone?: string;
  onVerificationSuccess: () => void;
  onBack?: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  userName,
  phone,
  onVerificationSuccess,
  onBack,
}) => {
  const [otpValue, setOtpValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const { timeLeft, isActive, canResend, startTimer } = useOTPTimer(60);
  
  const {
    resendOTP,
    verifyEnteredOTP,
    loading: sendingOTP,
    error: sendError,
    resendAttempts,
    setError,
  } = useOTPVerification({ email, userName, phone });

  // Start timer on mount and get initial time remaining
  useEffect(() => {
    const remaining = getOTPTimeRemaining();
    if (remaining > 0) {
      startTimer();
    }
  }, [startTimer]);

  const handleOTPComplete = async (otp: string) => {
    setOtpValue(otp);
    setVerificationError('');

    // Validate format
    const formatValidation = validateOTPFormat(otp);
    if (!formatValidation.valid) {
      setVerificationError(formatValidation.error || 'Invalid OTP format');
      return;
    }

    // Verify OTP
    setVerifying(true);
    
    setTimeout(() => {
      const result = verifyEnteredOTP(otp);

      if (result.valid) {
        // OTP is correct
        onVerificationSuccess();
      } else {
        // OTP is incorrect
        setVerificationError(result.error || 'Invalid OTP');
        setOtpValue('');
      }
      
      setVerifying(false);
    }, 500); // Small delay for better UX
  };

  const handleResend = async () => {
    if (!canResend || sendingOTP) return;

    setVerificationError('');
    setError('');
    setOtpValue('');

    const success = await resendOTP();
    
    if (success) {
      startTimer();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-navy-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600">
          We&apos;ve sent a 6-digit code to
        </p>
        <p className="text-navy-600 font-semibold mt-1">
          {maskEmail(email)}
        </p>
        {phone && (
          <p className="text-gray-500 text-sm mt-1">
            and {maskPhone(phone)}
          </p>
        )}
      </div>

      {/* OTP Input */}
      <div className="mb-6">
        <OTPInput
          length={6}
          onComplete={handleOTPComplete}
          disabled={verifying || sendingOTP}
          error={!!verificationError}
        />
      </div>

      {/* Error Message */}
      {(verificationError || sendError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">
            {verificationError || sendError}
          </p>
        </div>
      )}

      {/* Verifying State */}
      {verifying && (
        <div className="mb-4 flex items-center justify-center gap-2 text-navy-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-navy-600 border-t-transparent"></div>
          <span className="text-sm font-medium">Verifying...</span>
        </div>
      )}

      {/* Timer and Resend */}
      <div className="text-center mb-6">
        {isActive ? (
          <p className="text-sm text-gray-600">
            Resend code in{' '}
            <span className="font-semibold text-navy-600">
              {formatTime(timeLeft)}
            </span>
          </p>
        ) : (
          <div>
            <button
              onClick={handleResend}
              disabled={!canResend || sendingOTP || resendAttempts === 0}
              className={`
                text-sm font-medium
                ${
                  canResend && !sendingOTP && resendAttempts > 0
                    ? 'text-navy-600 hover:text-navy-700 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {sendingOTP ? 'Sending...' : "Didn't receive code? Resend"}
            </button>
            {resendAttempts > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {resendAttempts} {resendAttempts === 1 ? 'attempt' : 'attempts'} remaining
              </p>
            )}
            {resendAttempts === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Maximum resend limit reached. Please try again later.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        <p>Code expires in 5 minutes</p>
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          disabled={verifying || sendingOTP}
          className="mt-6 w-full text-center text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          ← Back to form
        </button>
      )}
    </div>
  );
};


