'use client';

import React, { useState } from 'react';
import { EMAILJS_CONFIG, sendOTPEmail } from '@/lib/emailjs';
import { generateOTP } from '@/lib/otp';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!email || !name) {
      setResult({ success: false, message: 'Please fill in all fields' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      // Generate test OTP
      const testOTP = generateOTP();
      console.log('Test OTP:', testOTP);

      // Send email
      const response = await sendOTPEmail(email, testOTP, name);

      if (response.success) {
        setResult({
          success: true,
          message: `✅ Email sent successfully! Check ${email} for OTP: ${testOTP}`,
        });
      } else {
        setResult({
          success: false,
          message: `❌ Failed: ${response.error}`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setResult({
        success: false,
        message: `❌ Error: ${errorMessage}`,
      });
    } finally {
      setSending(false);
    }
  };

  // Check if credentials are loaded
  const credentialsLoaded =
    EMAILJS_CONFIG.SERVICE_ID &&
    EMAILJS_CONFIG.TEMPLATE_ID &&
    EMAILJS_CONFIG.PUBLIC_KEY &&
    EMAILJS_CONFIG.SERVICE_ID !== '' &&
    EMAILJS_CONFIG.TEMPLATE_ID !== '' &&
    EMAILJS_CONFIG.PUBLIC_KEY !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            EmailJS Test Page
          </h1>
          <p className="text-gray-600">Test your EmailJS configuration</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Credentials Status */}
          <div className={`mb-6 p-4 rounded-lg ${credentialsLoaded ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {credentialsLoaded ? '✅' : '❌'} Environment Variables
            </h3>
            <div className="text-sm space-y-1">
              <p className={EMAILJS_CONFIG.SERVICE_ID ? 'text-green-700' : 'text-red-600'}>
                Service ID: {EMAILJS_CONFIG.SERVICE_ID ? '✓ Loaded' : '✗ Missing'}
              </p>
              <p className={EMAILJS_CONFIG.TEMPLATE_ID ? 'text-green-700' : 'text-red-600'}>
                Template ID: {EMAILJS_CONFIG.TEMPLATE_ID ? '✓ Loaded' : '✗ Missing'}
              </p>
              <p className={EMAILJS_CONFIG.PUBLIC_KEY ? 'text-green-700' : 'text-red-600'}>
                Public Key: {EMAILJS_CONFIG.PUBLIC_KEY ? '✓ Loaded' : '✗ Missing'}
              </p>
            </div>
          </div>

          {/* Test Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email (to receive test OTP)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
            </div>

            <button
              onClick={handleTest}
              disabled={sending || !credentialsLoaded}
              className="w-full bg-navy-600 text-white py-3 rounded-lg font-semibold hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending Test Email...' : 'Send Test OTP'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-600'}`}>
                {result.message}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <h4 className="font-semibold mb-2">How to Test:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Enter your real email address</li>
              <li>Click &quot;Send Test OTP&quot;</li>
              <li>Check your email inbox (and spam)</li>
              <li>The OTP will be shown on this page too</li>
            </ol>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <a
              href="/customer/signup"
              className="text-navy-600 hover:text-navy-700 text-sm font-medium"
            >
              ← Back to Signup
            </a>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-4 bg-white rounded-lg shadow p-4 text-xs text-gray-500">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <div className="space-y-1 font-mono">
            <p>Service ID starts with: {EMAILJS_CONFIG.SERVICE_ID.substring(0, 8)}...</p>
            <p>Template ID starts with: {EMAILJS_CONFIG.TEMPLATE_ID.substring(0, 8)}...</p>
            <p>Public Key starts with: {EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 8)}...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

