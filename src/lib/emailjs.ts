import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Credentials are loaded from environment variables (.env.local)
export const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
};

// Initialize EmailJS
export const initEmailJS = () => {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
};

/**
 * Send OTP via EmailJS
 * @param email - Recipient email address
 * @param otp - 6-digit OTP code
 * @param userName - User's name for personalization
 * @returns Promise with send result
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  userName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Template parameters that will be used in your EmailJS template
    const templateParams = {
      to_email: email,
      to_name: userName,
      otp_code: otp,
      company_name: 'ServiceProStars',
      expiry_minutes: '5',
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    if (response.status === 200) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to send email' };
    }
  } catch (error: any) {
    console.error('EmailJS Error:', error);
    return { 
      success: false, 
      error: error?.text || 'Network error. Please try again.' 
    };
  }
};

/**
 * EmailJS Template Structure Guide:
 * 
 * Create a template in your EmailJS dashboard with these variables:
 * 
 * Subject: Your OTP Code for ServiceProStars
 * 
 * Body:
 * Hello {{to_name}},
 * 
 * Your OTP code is: {{otp_code}}
 * 
 * This code will expire in {{expiry_minutes}} minutes.
 * 
 * If you didn't request this code, please ignore this email.
 * 
 * Best regards,
 * {{company_name}} Team
 */


