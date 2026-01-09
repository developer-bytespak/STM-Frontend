import { apiClient } from './index';

/**
 * Auth API endpoints for password reset and email verification
 */

export const authApi = {
  /**
   * Send OTP to email for password reset
   * @param email User's email address
   * @returns Promise with response containing message and email
   */
  async sendPasswordResetOTP(email: string) {
    try {
      const response = await apiClient.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    } catch (error: any) {
      throw {
        message: error?.message || 'Failed to send verification code. Please try again.',
        status: error?.status,
      };
    }
  },

  /**
   * Verify OTP for password reset
   * @param email User's email address
   * @param otp 6-digit OTP code
   * @returns Promise with verification result
   */
  async verifyPasswordResetOTP(email: string, otp: string) {
    try {
      const response = await apiClient.request('/auth/verify-password-reset-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      return response;
    } catch (error: any) {
      throw {
        message: error?.message || 'Invalid OTP. Please try again.',
        status: error?.status,
      };
    }
  },

  /**
   * Reset password with verified OTP
   * @param email User's email address
   * @param otp Verified OTP code
   * @param newPassword New password
   * @returns Promise with reset confirmation and user data
   */
  async resetPassword(email: string, otp: string, newPassword: string) {
    try {
      const response = await apiClient.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      return response;
    } catch (error: any) {
      throw {
        message: error?.message || 'Failed to reset password. Please try again.',
        status: error?.status,
      };
    }
  },

  /**
   * Resend OTP for password reset
   * @param email User's email address
   * @returns Promise with new OTP sent confirmation
   */
  async resendPasswordResetOTP(email: string) {
    try {
      const response = await apiClient.request('/auth/resend-password-reset-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    } catch (error: any) {
      throw {
        message: error?.message || 'Failed to resend verification code. Please try again.',
        status: error?.status,
      };
    }
  },

  /**
   * Verify email (for registration/email verification)
   * @param email User's email address
   * @returns Promise with OTP sent confirmation
   */
  async sendEmailVerificationOTP(email: string) {
    try {
      const response = await apiClient.request('/auth/send-email-verification-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    } catch (error: any) {
      throw {
        message: error?.message || 'Failed to send verification code.',
        status: error?.status,
      };
    }
  },

  /**
   * Verify email with OTP
   * @param email User's email address
   * @param otp 6-digit OTP code
   * @returns Promise with verification result
   */
  async verifyEmailOTP(email: string, otp: string) {
    try {
      const response = await apiClient.request('/auth/verify-email-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      return response;
    } catch (error: any) {
      throw {
        message: error?.message || 'Invalid verification code.',
        status: error?.status,
      };
    }
  },
};
