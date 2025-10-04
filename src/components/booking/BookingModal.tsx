'use client';

import { useState } from 'react';
import { useChat, BookingFormData } from '@/contexts/ChatContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  serviceType: string;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  providerId, 
  providerName, 
  serviceType 
}: BookingModalProps) {
  const { createConversation } = useChat();
  const [formData, setFormData] = useState<BookingFormData>({
    serviceType: serviceType,
    description: '',
    dimensions: '',
    budget: '',
    preferredDate: '',
    urgency: '3-7 days',
    additionalDetails: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe the service you need';
    }
    if (!formData.budget.trim()) {
      newErrors.budget = 'Please provide your budget';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create conversation with form data
    createConversation(providerId, providerName, formData);
    
    // Close modal
    onClose();
    
    // Reset form
    setFormData({
      serviceType: serviceType,
      description: '',
      dimensions: '',
      budget: '',
      preferredDate: '',
      urgency: '3-7 days',
      additionalDetails: ''
    });
  };

  const getServiceSpecificQuestions = () => {
    const lowerService = serviceType.toLowerCase();
    
    if (lowerService.includes('plumb')) {
      return {
        dimensionLabel: 'Number of fixtures/areas affected',
        dimensionPlaceholder: 'e.g., 2 sinks, 1 toilet'
      };
    } else if (lowerService.includes('paint')) {
      return {
        dimensionLabel: 'Area to be painted (sq ft) or number of rooms',
        dimensionPlaceholder: 'e.g., 500 sq ft or 2 bedrooms'
      };
    } else if (lowerService.includes('clean') || lowerService.includes('exterior')) {
      return {
        dimensionLabel: 'Property size or specific area dimensions',
        dimensionPlaceholder: 'e.g., 2000 sq ft roof, 100 ft gutters'
      };
    } else if (lowerService.includes('electric')) {
      return {
        dimensionLabel: 'Number of outlets/fixtures',
        dimensionPlaceholder: 'e.g., 3 outlets, 2 light fixtures'
      };
    } else if (lowerService.includes('hvac')) {
      return {
        dimensionLabel: 'Property size (sq ft)',
        dimensionPlaceholder: 'e.g., 1500 sq ft'
      };
    } else if (lowerService.includes('carpentr') || lowerService.includes('handyman')) {
      return {
        dimensionLabel: 'Project scope/dimensions',
        dimensionPlaceholder: 'e.g., 10ft x 12ft deck'
      };
    } else {
      return {
        dimensionLabel: 'Project size/dimensions',
        dimensionPlaceholder: 'Please specify dimensions or scope'
      };
    }
  };

  const serviceQuestions = getServiceSpecificQuestions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-navy-600 rounded-full flex items-center justify-center text-white font-bold">
              {providerName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Request A Quote</h2>
              <p className="text-sm text-gray-600">{providerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Type
            </label>
            <input
              type="text"
              value={formData.serviceType}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
            />
          </div>

          {/* Service Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Describe the service you&apos;re looking to purchase - please be as detailed as possible:
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="I'm looking for..."
              rows={5}
              maxLength={2500}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">{formData.description.length}/2500</p>
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {serviceQuestions.dimensionLabel}
            </label>
            <input
              type="text"
              value={formData.dimensions}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              placeholder={serviceQuestions.dimensionPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Once you place your order, when would you like your service delivered?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['24 Hours', '3 Days', '7 Days', 'Flexible'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: option })}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    formData.urgency === option
                      ? 'border-navy-600 bg-navy-50 text-navy-700'
                      : 'border-gray-300 text-gray-700 hover:border-navy-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Start Date (Optional)
            </label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What is your budget for this service?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                  errors.budget ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.budget && (
              <p className="text-sm text-red-500 mt-1">{errors.budget}</p>
            )}
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Any additional details or special requirements?
            </label>
            <textarea
              value={formData.additionalDetails}
              onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
              placeholder="e.g., specific materials, access restrictions, scheduling preferences..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
          >
            Submit Request & Start Chat
          </button>

          <p className="text-sm text-gray-600 text-center">
            After submitting, a chat will open with the provider to discuss your project
          </p>
        </form>
      </div>
    </div>
  );
}

