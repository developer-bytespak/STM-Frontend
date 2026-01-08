'use client';

import { useEffect } from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK'
}: AlertModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    info: {
      bg: 'bg-blue-100',
      iconBg: 'bg-blue-600',
      textColor: 'text-blue-900',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    success: {
      bg: 'bg-green-100',
      iconBg: 'bg-green-600',
      textColor: 'text-green-900',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-100',
      iconBg: 'bg-yellow-600',
      textColor: 'text-yellow-900',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-100',
      iconBg: 'bg-red-600',
      textColor: 'text-red-900',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
        {/* Icon Header */}
        <div className={`${config.bg} rounded-t-xl px-6 pt-6 pb-4`}>
          <div className={`${config.iconBg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
            {config.icon}
          </div>
          {title && (
            <h3 className={`text-xl font-bold text-center ${config.textColor}`}>
              {title}
            </h3>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-center leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full ${config.buttonBg} text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

