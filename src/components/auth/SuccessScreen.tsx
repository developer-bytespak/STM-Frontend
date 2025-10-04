'use client';

import React, { useEffect, useState } from 'react';

interface SuccessScreenProps {
  title: string;
  message: string;
  redirectTo: string;
  redirectDelay?: number;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  title,
  message,
  redirectTo,
  redirectDelay = 2000,
}) => {
  const [countdown, setCountdown] = useState(Math.ceil(redirectDelay / 1000));

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    // Redirect after delay - use window.location for full reload
    const redirectTimer = setTimeout(() => {
      window.location.href = redirectTo;
    }, redirectDelay);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [redirectTo, redirectDelay]);

  return (
    <div className="w-full max-w-md mx-auto text-center">
      {/* Success Animation */}
      <div className="mb-6">
        <div className="relative w-24 h-24 mx-auto">
          {/* Animated Circle */}
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
          
          {/* Static Circle */}
          <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
            {/* Checkmark */}
            <svg
              className="w-12 h-12 text-white animate-checkmark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
        {title}
      </h2>
      <p className="text-gray-600 mb-6">
        {message}
      </p>

      {/* Redirect Message */}
      <div className="bg-navy-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-navy-700">
          Redirecting to your dashboard in{' '}
          <span className="font-bold text-navy-900">{countdown}</span>{' '}
          {countdown === 1 ? 'second' : 'seconds'}...
        </p>
      </div>

      {/* Manual Redirect Button */}
      <button
        onClick={() => window.location.href = redirectTo}
        className="text-navy-600 hover:text-navy-700 text-sm font-medium"
      >
        Go to Dashboard Now →
      </button>
    </div>
  );
};


