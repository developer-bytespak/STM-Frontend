'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
// COMMENTED OUT - Amenities system
// import AmenityIcon from '@/components/ui/AmenityIcon';
import { CreateOfficeSpaceDto, OfficeSpaceType } from '@/types/office';
// COMMENTED OUT - Amenities data
// import { availableAmenities } from '@/data/mockOfficeData';

interface CreateOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// SIMPLIFIED - Just one office type for MVP
const OFFICE_TYPES: { value: OfficeSpaceType; label: string }[] = [
  { value: 'private_office', label: 'Office' },
  // COMMENTED OUT - Multiple office types
  // { value: 'shared_desk', label: 'Shared Desk' },
  // { value: 'meeting_room', label: 'Meeting Room' },
  // { value: 'conference_room', label: 'Conference Room' },
  // { value: 'coworking_space', label: 'Coworking Space' },
];

const DEFAULT_AVAILABILITY = {
  monday: { start: '09:00', end: '18:00', available: true },
  tuesday: { start: '09:00', end: '18:00', available: true },
  wednesday: { start: '09:00', end: '18:00', available: true },
  thursday: { start: '09:00', end: '18:00', available: true },
  friday: { start: '09:00', end: '18:00', available: true },
  saturday: { start: '10:00', end: '16:00', available: false },
  sunday: { start: '00:00', end: '00:00', available: false },
};

export default function CreateOfficeModal({ isOpen, onClose, onSuccess }: CreateOfficeModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    console.log('Step changed to:', currentStep);
    setErrors({}); // Clear errors when step changes
  }, [currentStep]);
  
  const [formData, setFormData] = useState<CreateOfficeSpaceDto>({
    name: '',
    type: 'private_office',
    description: '',
    location: {
      address: '',
      city: '',
      state: 'FL',
      zipCode: '',
    },
    capacity: 1,
    area: 100,
    pricing: {
      // COMMENTED OUT - Complex pricing options
      // hourly: 0,
      daily: 0,
      // weekly: 0,
      // monthly: 0,
    },
    // COMMENTED OUT - Amenities system
    // amenities: [],
    images: [],
    availability: DEFAULT_AVAILABILITY,
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateOfficeSpaceDto] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNumericInput = (field: string, value: string, isFloat: boolean = false) => {
    // Remove any non-numeric characters except decimal point for float
    const numericValue = isFloat 
      ? value.replace(/[^0-9.]/g, '')
      : value.replace(/[^0-9]/g, '');
    
    // Convert to number
    const numValue = isFloat ? parseFloat(numericValue) || 0 : parseInt(numericValue) || 0;
    
    handleInputChange(field, numValue);
  };

  // COMMENTED OUT - Amenities functionality
  // const toggleAmenity = (amenityId: string) => {
  //   setFormData(prev => {
  //     const amenities = prev.amenities.includes(amenityId)
  //       ? prev.amenities.filter(id => id !== amenityId)
  //       : [...prev.amenities, amenityId];
  //     return { ...prev, amenities };
  //   });
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submitted, current step:', currentStep);
    
    // Only submit if we're on the final step
    if (currentStep !== 4) {
      console.log('Not on final step, preventing submission');
      return;
    }
    
    // Validate the final step before submitting
    if (!validateAndSetErrors()) {
      console.log('Final step validation failed');
      return;
    }
    
    console.log('Proceeding with form submission');
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating office space:', formData);
      
      setShowSuccess(true);
      onSuccess?.();
      
      // Auto close after showing success message
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error creating office space:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'private_office',
      description: '',
      location: {
        address: '',
        city: '',
        state: 'FL',
        zipCode: '',
      },
      capacity: 1,
      area: 100,
      pricing: {
        hourly: 0,
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
      amenities: [],
      images: [],
      availability: DEFAULT_AVAILABILITY,
    });
    setCurrentStep(1);
    setShowSuccess(false);
    onClose();
  };

  const validateStep = (step: number): { isValid: boolean; errors: Record<string, string> } => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.name || formData.name.trim().length < 2) {
          stepErrors.name = 'Office name must be at least 2 characters';
        }
        if (!formData.type) {
          stepErrors.type = 'Please select an office type';
        }
        if (!formData.description || formData.description.trim().length < 10) {
          stepErrors.description = 'Description must be at least 10 characters';
        }
        break;

      case 2: // Location
        if (!formData.location.address || formData.location.address.trim().length < 5) {
          stepErrors.address = 'Address must be at least 5 characters';
        }
        if (!formData.location.city || formData.location.city.trim().length < 2) {
          stepErrors.city = 'City must be at least 2 characters';
        }
        if (!formData.location.zipCode || parseInt(formData.location.zipCode) < 100 || parseInt(formData.location.zipCode) > 99999) {
          stepErrors.zipCode = 'ZIP code must be between 100 and 99999';
        }
        if (!formData.location.state || formData.location.state.trim().length < 2) {
          stepErrors.state = 'State must be at least 2 characters';
        }
        break;

      case 3: // Details
        if (!formData.capacity || formData.capacity < 1) {
          stepErrors.capacity = 'Capacity must be at least 1 person';
        }
        if (formData.capacity > 1000) {
          stepErrors.capacity = 'Capacity cannot exceed 1000 people';
        }
        if (!formData.area || formData.area < 10) {
          stepErrors.area = 'Area must be at least 10 sq ft';
        }
        if (formData.area > 100000) {
          stepErrors.area = 'Area cannot exceed 100,000 sq ft';
        }
        // COMMENTED OUT - Amenities validation
        // if (formData.amenities.length === 0) {
        //   stepErrors.amenities = 'Please select at least one amenity';
        // }
        break;

      case 4: // Pricing
        if (!formData.pricing.daily || formData.pricing.daily <= 0) {
          stepErrors.daily = 'Daily rate must be greater than $0';
        }
        if (formData.pricing.daily > 10000) {
          stepErrors.daily = 'Daily rate cannot exceed $10,000';
        }
        if (formData.pricing.hourly && formData.pricing.hourly <= 0) {
          stepErrors.hourly = 'Hourly rate must be greater than $0';
        }
        if (formData.pricing.hourly && formData.pricing.hourly > 1000) {
          stepErrors.hourly = 'Hourly rate cannot exceed $1,000';
        }
        if (formData.pricing.weekly && formData.pricing.weekly <= 0) {
          stepErrors.weekly = 'Weekly rate must be greater than $0';
        }
        if (formData.pricing.monthly && formData.pricing.monthly <= 0) {
          stepErrors.monthly = 'Monthly rate must be greater than $0';
        }
        break;

      default:
        break;
    }

    return {
      isValid: Object.keys(stepErrors).length === 0,
      errors: stepErrors
    };
  };

  const isStepValid = () => {
    const validation = validateStep(currentStep);
    return validation.isValid;
  };

  const validateAndSetErrors = () => {
    const validation = validateStep(currentStep);
    setErrors(validation.errors);
    return validation.isValid;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="2xl" title="Create Office Space">
      <div className="space-y-6">
        <p className="text-sm text-gray-600 -mt-2 mb-4">Add a new office space to your listings</p>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mt-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step ? 'bg-navy-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`h-1 w-12 ${
                  currentStep > step ? 'bg-navy-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2 text-xs text-gray-600">
          {['Basic Info', 'Location', 'Details', 'Pricing'].map((label, index) => (
            <div key={label} className="flex items-center">
              <span className="text-center w-10">{label}</span>
              {index < 3 && <div className="w-12" />}
            </div>
          ))}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">Office Space Created Successfully!</h3>
              <p className="text-sm text-green-700 mt-1">
                Your new office space &ldquo;{formData.name}&rdquo; has been added to the listings.
              </p>
            </div>
          </div>
        )}

        {/* Form Content */}
        {!showSuccess && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                label="Office Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Executive Private Office"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Office Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 focus:outline-none appearance-none bg-white"
                  required
                >
                  {OFFICE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the office space..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 focus:outline-none"
                  required
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Input
                label="Street Address"
                value={formData.location.address}
                onChange={(e) => handleInputChange('location.address', e.target.value)}
                placeholder="123 Business Plaza, Suite 500"
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  placeholder="Miami"
                  required
                />
                
                <Input
                  label="State"
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  placeholder="FL"
                  required
                />
              </div>

              <Input
                label="ZIP Code"
                type="number"
                value={formData.location.zipCode}
                onChange={(e) => handleNumericInput('location.zipCode', e.target.value, false)}
                placeholder="33131"
                min={100}
                max={99999}
                required
              />
              {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Capacity (people)"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleNumericInput('capacity', e.target.value, false)}
                  min={1}
                  max={1000}
                  required
                />
                {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
                
                <Input
                  label="Area (sq ft)"
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleNumericInput('area', e.target.value, false)}
                  min={10}
                  max={100000}
                  required
                />
                {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
              </div>

              {/* COMMENTED OUT - Amenities */}
              {/* <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Amenities
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar border border-gray-300 rounded-lg p-3">
                  {availableAmenities.map((amenity) => (
                    <label key={amenity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              amenities: [...prev.amenities, amenity.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              amenities: prev.amenities.filter(id => id !== amenity.id)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 checked:bg-blue-600 checked:border-blue-600"
                      />
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <AmenityIcon iconType={amenity.icon} className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Selected: {formData.amenities.length} amenities
                </p>
                {errors.amenities && <p className="text-red-500 text-sm mt-1">{errors.amenities}</p>}
              </div> */}
            </div>
          )}

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {/* SIMPLIFIED - Daily rate only */}
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Daily Rate ($)"
                  type="number"
                  value={formData.pricing.daily}
                  onChange={(e) => handleNumericInput('pricing.daily', e.target.value, true)}
                  required
                  min={0.01}
                  max={10000}
                  step="0.01"
                />
                {errors.daily && <p className="text-red-500 text-sm mt-1">{errors.daily}</p>}
              </div>

              {/* COMMENTED OUT - Complex pricing options */}
              {/* <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Hourly Rate ($)"
                  type="number"
                  value={formData.pricing.hourly || ''}
                  onChange={(e) => handleNumericInput('pricing.hourly', e.target.value, true)}
                  placeholder="Optional"
                  min={0}
                  max={1000}
                  step="0.01"
                />
                {errors.hourly && <p className="text-red-500 text-sm mt-1">{errors.hourly}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Weekly Rate ($)"
                  type="number"
                  value={formData.pricing.weekly || ''}
                  onChange={(e) => handleNumericInput('pricing.weekly', e.target.value, true)}
                  placeholder="Optional"
                  min={0}
                  max={50000}
                  step="0.01"
                />
                {errors.weekly && <p className="text-red-500 text-sm mt-1">{errors.weekly}</p>}
                
                <Input
                  label="Monthly Rate ($)"
                  type="number"
                  value={formData.pricing.monthly || ''}
                  onChange={(e) => handleNumericInput('pricing.monthly', e.target.value, true)}
                  placeholder="Optional"
                  min={0}
                  max={200000}
                  step="0.01"
                />
                {errors.monthly && <p className="text-red-500 text-sm mt-1">{errors.monthly}</p>}
              </div> */}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={() => {
                    console.log('Next clicked, current step:', currentStep);
                    if (validateAndSetErrors()) {
                      setCurrentStep(prev => prev + 1);
                    }
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" loading={loading}>
                  Create Office Space
                </Button>
              )}
            </div>
          </div>
        </form>
        )}
      </div>
    </Modal>
  );
}

