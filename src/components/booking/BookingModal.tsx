'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChat, BookingFormData } from '@/contexts/ChatContext';
import { customerApi } from '@/api/customer';
import { useAuth } from '@/hooks/useAuth';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  serviceType: string;
  serviceId?: number;  // Backend service ID
  providerServiceAreas?: string[];  // Provider's zip codes
  mode?: 'customer-booking' | 'sp-quote';
  initialData?: BookingFormData;
  customerName?: string;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  providerId, 
  providerName, 
  serviceType,
  serviceId,
  providerServiceAreas,
  mode = 'customer-booking',
  initialData,
  customerName
}: BookingModalProps) {
  const { createConversation } = useChat();
  const { user } = useAuth();
  const router = useRouter();
  const [blockedUnpaidJob, setBlockedUnpaidJob] = useState<{ id: string; message?: string } | null>(null);
  const [formData, setFormData] = useState<BookingFormData & { address?: string; zipcode?: string }>(() => {
    if (mode === 'sp-quote' && initialData) {
      return initialData;
    }
    return {
      serviceType: serviceType,
      description: '',
      dimensions: '',
      budget: '',
      preferredDate: '',
      urgency: '3-7 days',
      additionalDetails: '',
      address: (user as any)?.address || '',
      zipcode: (user as any)?.zipcode || ''
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe the service you need';
    }
    // TODO: Re-enable budget validation when ready to make it required again
    // if (!formData.budget.trim()) {
    //   newErrors.budget = 'Please provide your budget';
    // }
    if (mode === 'customer-booking') {
      if (!formData.address?.trim()) {
        newErrors.address = 'Please provide your address';
      }
      if (!formData.zipcode?.trim()) {
        newErrors.zipcode = 'Please provide your zipcode';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (mode === 'customer-booking') {
      setIsSubmitting(true);
      setErrors({});
      
      try {
        // ==================== CREATE JOB IN BACKEND ====================
        
        // Validate required fields
        if (!serviceId) {
          throw new Error('Service ID is required. Please select a service first.');
        }
        
        const jobResponse = await customerApi.createJob({
          serviceId: serviceId,  // Numeric service ID (required)
          providerId: providerId,  // Provider ID as string (backend validates numeric string)
          customerBudget: parseFloat(formData.budget) || 0,  // Customer budget as number (backend expects customerBudget)
          location: formData.address || '',  // From form input
          zipcode: formData.zipcode || '',   // From form input
          answers: {                   // Wrapped answers object (required)
            description: formData.description,
            urgency: formData.urgency,
            dimensions: formData.dimensions,
            additionalDetails: formData.additionalDetails,
            budget: formData.budget,  // Keep in answers for reference
          },
          preferredDate: formData.preferredDate || undefined,
          requiresInPersonVisit: false,
        });

        // Backend returns: { job: { id: ... }, chat: { id: ... } }
        const jobId = jobResponse.job?.id || jobResponse.id; // Handle both response formats
        const chatId = jobResponse.chat?.id; // ✅ Get real chatId from backend

        if (!chatId) {
          throw new Error('Backend did not return chat ID. Please contact support.');
        }

        // ==================== CREATE CHAT WITH REAL CHAT ID ====================
        createConversation(providerId, providerName, formData, jobId, chatId);
        
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
          additionalDetails: '',
          address: '',
          zipcode: ''
        });
      } catch (error: any) {
        console.error('Failed to create job error:', error);
        console.error('Error response:', error?.response?.data);
        
        // If backend indicates an unpaid job blocks booking, surface a dialog instead of inline error
        const requiresPayment = error?.response?.data?.requiresPayment;
        let unpaidJobId = error?.response?.data?.unpaidJobId 
          || error?.response?.data?.unpaid_job_id 
          || error?.response?.data?.unpaid_job
          || error?.response?.data?.unpaidJob;
        const unpaidMessage = error?.response?.data?.message || error?.message || '';

        // Try to extract unpaid job id from message text (e.g. "#40" or "(40)")
        if (!unpaidJobId && typeof unpaidMessage === 'string') {
          const hashMatch = unpaidMessage.match(/#(\d+)/);
          if (hashMatch) unpaidJobId = hashMatch[1];
          else {
            const parenMatch = unpaidMessage.match(/\((\d+)\)/);
            if (parenMatch) unpaidJobId = parenMatch[1];
          }
        }

        // Check if the message itself contains "unpaid" keyword as another indicator
        const isUnpaidJob = requiresPayment || (typeof unpaidMessage === 'string' && unpaidMessage.toLowerCase().includes('unpaid'));
        
        if (isUnpaidJob || unpaidJobId) {
          if (unpaidJobId) {
            console.log('Unpaid job detected:', unpaidJobId);
            setBlockedUnpaidJob({ id: String(unpaidJobId), message: unpaidMessage });
          } else {
            setBlockedUnpaidJob(null);
          }
          setErrors({ description: unpaidMessage || 'You have an unpaid job. Please complete payment before booking.' });
          return;
        }

        setBlockedUnpaidJob(null);
        setErrors({
          description: error.message || 'Failed to create job request. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'sp-quote') {
      // Handle SP quote submission
      alert(`Sending quote to ${customerName}:\n\nService: ${formData.serviceType}\nBudget: $${formData.budget}\n\nIn production, this will:\n- Send quote to customer\n- Update request status to 'quoted'\n- Notify customer via email/SMS`);
      onClose();
    }
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

  // If there's an unpaid job blocking, show that dialog on top
  if (blockedUnpaidJob) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl">
          <h3 className="text-lg font-bold mb-2 text-gray-900">Unpaid Job Blocking Booking</h3>
          <p className="text-sm text-gray-700 mb-4">
            {blockedUnpaidJob.message || `You have an unpaid job (#${blockedUnpaidJob.id}). Please complete payment before booking with another provider.`}
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`/customer/bookings/${blockedUnpaidJob.id}`)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              View Unpaid Job
            </button>
            <button
              type="button"
              onClick={() => setBlockedUnpaidJob(null)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full mx-2 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-navy-600 rounded-full flex items-center justify-center text-white font-bold">
              {mode === 'sp-quote' ? 'SP' : providerName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'sp-quote' ? 'Send Quote to Customer' : 'Request A Quote'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'sp-quote' ? `Replying to ${customerName}` : providerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Type
            </label>
            <input
              type="text"
              value={formData.serviceType}
              disabled={mode === 'customer-booking'}
              onChange={mode === 'sp-quote' ? (e) => setFormData({ ...formData, serviceType: e.target.value }) : undefined}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
            />
          </div>

          {/* Service Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {mode === 'sp-quote' ? 'Service Description & Quote Details:' : 'Describe the service you\'re looking to purchase - please be as detailed as possible:'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={mode === 'sp-quote' ? 'Provide detailed quote including scope of work, timeline, and any special notes...' : "I'm looking for..."}
              rows={5}
              maxLength={2500}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">{formData.description.length}/2500</p>
            </div>
            {/* unpaid-job CTA removed from inline form; dialog will show below when needed */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500"
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
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all cursor-pointer ${
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

          {/* Address (Customer Booking Only) */}
          {mode === 'customer-booking' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, Dallas, TX"
                className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
          )}

          {/* Zipcode (Customer Booking Only) */}
          {mode === 'customer-booking' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Area / Zipcode
                <span className="text-red-500 ml-1">*</span>
              </label>
              {providerServiceAreas && providerServiceAreas.length > 0 ? (
                <select
                  value={formData.zipcode || ''}
                  onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                    errors.zipcode ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select service area</option>
                  {providerServiceAreas.map((area, index) => (
                    <option key={index} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.zipcode || ''}
                  onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                  placeholder="75001 - Dallas, TX"
                  className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                    errors.zipcode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
              {errors.zipcode && (
                <p className="text-sm text-red-500 mt-1">{errors.zipcode}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {providerServiceAreas && providerServiceAreas.length > 0 
                  ? 'Select from provider\'s service areas'
                  : 'Format: 75001 - Dallas, TX (must match provider\'s service area)'
                }
              </p>
            </div>
          )}

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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          {/* Budget input (customer can provide budget) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {mode === 'sp-quote' ? 'Your Quote Amount:' : 'What is your budget for this service?'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={formData.budget}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and one decimal point
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setFormData({ ...formData, budget: value });
                  }
                }}
                placeholder="0"
                className={`w-full pl-8 pr-4 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                  errors.budget ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.budget && (
              <p className="text-sm text-red-500 mt-1">{errors.budget}</p>
            )}
            {mode === 'sp-quote' && (
              <p className="text-xs text-blue-600 mt-1">
                💡 You can modify the customer&apos;s requested budget and provide your professional quote
              </p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting 
              ? 'Creating Job Request...' 
              : mode === 'sp-quote' 
              ? 'Send Quote to Customer' 
              : 'Submit Request & Start Chat'
            }
          </button>

          <p className="text-sm text-gray-600 text-center">
            {mode === 'sp-quote' 
              ? 'This will send your quote to the customer for their review and approval'
              : 'After submitting, a chat will open with the provider to discuss your project'
            }
          </p>
        </form>
      </div>
    </div>
  );
}

