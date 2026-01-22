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
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log('📁 Files selected:', files.length);
    
    // Check total image count
    if (images.length + files.length > 10) {
      alert(`You can only upload a maximum of 10 images. Currently uploaded: ${images.length}`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    
    try {
      // Create FormData and append all files
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
        console.log('📤 Adding to FormData:', file.name, file.size, 'bytes');
      });

      // Upload to backend using apiClient for proper authentication
      console.log('🚀 Uploading to backend...');
      const response = await customerApi.uploadJobImages(formData);
      console.log('✅ Upload successful! Vercel Blob URLs:', response.imageUrls);
      
      // Add Vercel Blob URLs to images
      setImages([...images, ...response.imageUrls]);
      
      // Reset the file input so the same files can be selected again
      e.target.value = '';
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe the service you need';
    }
    if (mode === 'customer-booking' && !agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
      alert('Please agree to the terms and conditions to continue.');
      return;
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
          images: images,  // Customer uploaded images
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
        setImages([]);
        setAgreedToTerms(false);
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

          {/* Image Upload */}
          {mode === 'customer-booking' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Images (Optional)
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Add photos to help the provider better understand your needs (max 5MB per image)
              </p>
              
              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  id="image-upload"
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                    uploading
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-navy-300 bg-navy-50 hover:bg-navy-100 hover:border-navy-400'
                  }`}
                >
                  <svg className="w-6 h-6 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium text-navy-700">
                    {uploading ? 'Uploading...' : 'Choose Images'}
                  </span>
                </label>
              </div>
              
              {uploading && (
                <div className="mt-3 flex items-center gap-2 text-navy-600">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-medium">Uploading images...</span>
                </div>
              )}
              
              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((url, index) => (
                      <div 
                        key={`${url}-${index}`} 
                        className="group relative aspect-square rounded-xl overflow-hidden bg-white border-2 border-gray-200 hover:border-navy-400 transition-all shadow-sm hover:shadow-md"
                      >
                        <img 
                          src={url} 
                          alt={`Upload ${index + 1}`} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                          style={{ zIndex: 1 }}
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', url);
                          }}
                          onError={(e) => {
                            console.error('❌ Failed to load image:', url);
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 2 }} />
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Terms and Conditions */}
          {mode === 'customer-booking' && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-navy-600 border-gray-300 rounded focus:ring-navy-500 cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                I agree to the{' '}
                <a
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-600 hover:text-navy-800 underline font-medium"
                >
                  Terms and Conditions
                </a>
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || uploading || (mode === 'customer-booking' && !agreedToTerms)}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading
              ? 'Uploading Images...'
              : isSubmitting 
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

