'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
// COMMENTED OUT - Amenities system
// import AmenityIcon from '@/components/ui/AmenityIcon';
import { CreateOfficeSpaceDto, OfficeSpaceType } from '@/types/office';
import { officeSpaceApi, transformCreateOfficeData } from '@/api/officeBooking';
import { useAlert } from '@/hooks/useAlert';
// COMMENTED OUT - Amenities data
// import { availableAmenities } from '@/data/mockOfficeData';

interface CreateOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// FIXED - Only private_office type supported by backend
// const OFFICE_TYPES: { value: OfficeSpaceType; label: string }[] = [
//   { value: 'private_office', label: 'Office' },
// ];

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
  const { showAlert } = useAlert();
  
  useEffect(() => {
    console.log('Step changed to:', currentStep);
    setErrors({}); // Clear errors when step changes
  }, [currentStep]);
  
  const [formData, setFormData] = useState<CreateOfficeSpaceDto>({
    name: '',
    type: 'private_office', // Fixed - only type supported by backend
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
      daily: 0,
    },
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent form submission on Enter key - only allow button clicks
    return false;
  };

  const handleCreateOffice = async () => {
    console.log('Create office clicked, current step:', currentStep);
    console.log('Form data:', formData);
    
    // Only submit if we're on the final step
    if (currentStep !== 6) {
      console.log('Not on final step, preventing submission');
      return;
    }
    
    // Validate the final step before submitting
    const validation = validateStep(currentStep);
    console.log('Step 6 validation result:', validation);
    
    if (!validation.isValid) {
      console.log('Final step validation failed:', validation.errors);
      setErrors(validation.errors);
      return;
    }
    
    console.log('Proceeding with form submission');
    setLoading(true);

    try {
      const backendData = transformCreateOfficeData(formData);
      console.log('Transformed backend data:', backendData);
      
      // Call the API to create office
      const createdOffice = await officeSpaceApi.createOffice(backendData);
      console.log('Office created successfully:', createdOffice);
      
      // Show success message
      setShowSuccess(true);
      showAlert({
        title: 'Success',
        message: 'Office space created successfully!',
        type: 'success'
      });
      
      // Call success callback to refresh the list
      onSuccess?.();
      
      // Auto close after showing success message
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error: any) {
      console.error('Error creating office space:', error);
      
      // Better error handling
      let errorMessage = 'Failed to create office space. Please try again.';
      
      if (error?.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error?.response?.status === 403) {
        errorMessage = 'You do not have permission to create office spaces.';
      } else if (error?.response?.status === 400) {
        errorMessage = 'Invalid data. Please check all fields and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showAlert({
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'private_office', // Fixed - always private_office
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
        daily: 0,
      },
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
        // Type is fixed to 'private_office', no validation needed
        if (!formData.description || formData.description.trim().length < 10) {
          stepErrors.description = 'Description must be at least 10 characters';
        }
        break;

      case 2: // Images (now step 2, optional)
        // Images are optional, no validation needed
        break;

      case 3: // Location (was step 2)
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

      case 4: // Details (was step 3)
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

      case 5: // Pricing (was step 4)
        if (!formData.pricing.daily || formData.pricing.daily <= 0) {
          stepErrors.daily = 'Daily rate must be greater than $0';
        }
        if (formData.pricing.daily > 10000) {
          stepErrors.daily = 'Daily rate cannot exceed $10,000';
        }
        break;

      case 6: // Availability (was step 5)
        // Validate availability structure - only check days that are marked as available
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const day of days) {
          const dayAvailability = formData.availability[day as keyof typeof formData.availability];
          if (dayAvailability.available && (!dayAvailability.start || !dayAvailability.end)) {
            stepErrors[`${day}Time`] = `${day.charAt(0).toUpperCase() + day.slice(1)} start and end times are required when available`;
          }
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
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step ? 'bg-navy-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 6 && (
                <div className={`h-1 w-12 ${
                  currentStep > step ? 'bg-navy-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2 text-xs text-gray-600">
          {['Basic Info', 'Images', 'Location', 'Details', 'Pricing', 'Availability'].map((label, index) => (
            <div key={label} className="flex items-center">
              <span className="text-center w-10">{label}</span>
              {index < 5 && <div className="w-12" />}
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
        <form onSubmit={handleFormSubmit} className="space-y-6">
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
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                  Private Office (Fixed)
                </div>
                <p className="text-xs text-gray-500 mt-1">Only private office type is supported</p>
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

          {/* Step 2: Images (moved from step 6) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Images (Optional)</h3>
              <p className="text-sm text-gray-600">
                Upload images to showcase your office space. You can add images later.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-2">Add images to your office space</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                    <p className="text-xs text-blue-600 mt-1">Images will be stored permanently</p>
                  </div>
                </label>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    
                    // Check file sizes (10MB limit)
                    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);                                                          
                    if (oversizedFiles.length > 0) {
                      showAlert({
                        title: 'Error',
                        message: 'Some files are too large. Please select files under 10MB each.',
                        type: 'error'
                      });                                             
                      return;
                    }
                    
                    const imagePromises = files.map(file => {
                      return new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          resolve(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      });
                    });
                    
                    try {
                      const base64Images = await Promise.all(imagePromises);                                                                            
                      handleInputChange('images', [...(formData.images || []), ...base64Images]);                                                       
                      showAlert({
                        title: 'Success',
                        message: `${files.length} image(s) added successfully`,
                        type: 'success'
                      });                                                              
                    } catch (error) {
                      console.error('Error processing images:', error); 
                      showAlert({
                        title: 'Error',
                        message: 'Error processing images. Please try again.',
                        type: 'error'
                      });                                                                 
                    }
                  }}
                />
              </div>

              {/* Image Preview */}
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Office ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index);
                          handleInputChange('images', newImages);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Location (was step 2) */}
          {currentStep === 3 && (
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

          {/* Step 4: Details (was step 3) */}
          {currentStep === 4 && (
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

          {/* Step 5: Pricing (was step 4) */}
          {currentStep === 5 && (
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
            </div>
          )}

          {/* Step 6: Availability (was step 5) */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Set Availability Schedule</h3>
              <p className="text-sm text-gray-600">Configure when this office space is available for booking.</p>
              
              <div className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </label>
              </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.availability[day as keyof typeof formData.availability].available}
                        onChange={(e) => {
                          const newAvailability = {
                            ...formData.availability[day as keyof typeof formData.availability],
                            available: e.target.checked,
                            start: e.target.checked ? formData.availability[day as keyof typeof formData.availability].start : '00:00',
                            end: e.target.checked ? formData.availability[day as keyof typeof formData.availability].end : '00:00',
                          };
                          handleInputChange(`availability.${day}`, newAvailability);
                        }}
                        className="w-4 h-4 text-navy-600 border-gray-300 rounded focus:ring-navy-500"
                      />
                      <span className="text-sm text-gray-600">Available</span>
              </div>

                    {formData.availability[day as keyof typeof formData.availability].available && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={formData.availability[day as keyof typeof formData.availability].start}
                          onChange={(e) => {
                            const newAvailability = {
                              ...formData.availability[day as keyof typeof formData.availability],
                              start: e.target.value,
                            };
                            handleInputChange(`availability.${day}`, newAvailability);
                          }}
                          className="w-32"
                        />
                        <span className="text-gray-500">to</span>
                <Input
                          type="time"
                          value={formData.availability[day as keyof typeof formData.availability].end}
                          onChange={(e) => {
                            const newAvailability = {
                              ...formData.availability[day as keyof typeof formData.availability],
                              end: e.target.value,
                            };
                            handleInputChange(`availability.${day}`, newAvailability);
                          }}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
              
              {currentStep < 6 ? (
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
                <Button 
                  type="button" 
                  loading={loading}
                  onClick={handleCreateOffice}
                >
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

