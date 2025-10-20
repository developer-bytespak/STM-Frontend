'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { OfficeSpace, OfficeStatus } from '@/types/office';
import { officeSpaceApi } from '@/api/officeBooking';
import { useAlert } from '@/hooks/useAlert';

interface EditOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  office: OfficeSpace | null;
  onSuccess?: () => void;
}

export default function EditOfficeModal({ isOpen, onClose, office, onSuccess }: EditOfficeModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useAlert();
  
  const [formData, setFormData] = useState({
    name: '',
    status: 'available' as OfficeStatus,
    description: '',
    capacity: 0,
    area: 0,
    dailyRate: 0,
  });

  // Initialize form data when office changes
  useEffect(() => {
    if (office) {
      setFormData({
        name: office.name || '',
        status: (office.status || 'available') as OfficeStatus,
        description: office.description || '',
        capacity: office.capacity || 0,
        area: office.area || 0,
        dailyRate: office.pricing?.daily || 0,
      });
    }
  }, [office]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumericInput = (field: string, value: string, isFloat: boolean = false) => {
    const numericValue = isFloat 
      ? value.replace(/[^0-9.]/g, '')
      : value.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      handleInputChange(field, 0);
      return;
    }
    
    const numValue = isFloat ? parseFloat(numericValue) : parseInt(numericValue);
    
    if (!isNaN(numValue)) {
      handleInputChange(field, numValue);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Office name must be at least 2 characters';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1 person';
    }

    if (!formData.area || formData.area < 10) {
      newErrors.area = 'Area must be at least 10 sq ft';
    }

    if (!formData.dailyRate || formData.dailyRate < 0.01) {
      newErrors.dailyRate = 'Daily rate must be at least $0.01';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm() || !office) {
      return;
    }

    setLoading(true);

    try {
      // Prepare update data
      const updateData = {
        name: formData.name,
        status: formData.status,
        description: formData.description,
        capacity: formData.capacity,
        area: formData.area,
        pricing: {
          daily: formData.dailyRate,
        },
      };

      // Call API to update office
      await officeSpaceApi.updateOffice(office.id, updateData);
      
      showAlert({
        title: 'Success',
        message: 'Office space updated successfully!',
        type: 'success'
      });
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error updating office space:', error);
      
      let errorMessage = 'Failed to update office space. Please try again.';
      
      if (error?.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error?.response?.status === 403) {
        errorMessage = 'You do not have permission to update office spaces.';
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
    setErrors({});
    setIsStatusDropdownOpen(false);
    onClose();
  };

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'booked', label: 'Booked' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="lg" title="Edit Office Space">
      <div className="space-y-4 sm:space-y-6">
        {/* Compact form layout optimized for mobile */}
        <form className="space-y-4 sm:space-y-6">
          {/* Update office space details section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Update office space details:</h3>
            
            <Input
              label="Office Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Executive Private Office"
              required
            />
            {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">
                Status
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 focus:outline-none text-xs sm:text-sm bg-white text-left flex items-center justify-between"
                >
                  <span>{statusOptions.find(option => option.value === formData.status)?.label}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isStatusDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          handleInputChange('status', option.value as OfficeStatus);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          formData.status === option.value ? 'bg-navy-50 text-navy-700' : 'text-gray-900'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the office space..."
                rows={3}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 focus:outline-none text-xs sm:text-sm"
                required
              />
              {errors.description && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Details section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Details:</h3>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Capacity (people)"
                type="number"
                value={formData.capacity || ''}
                onChange={(e) => handleNumericInput('capacity', e.target.value, false)}
                placeholder="e.g., 5, 10, 25"
                min={1}
                max={1000}
                required
              />
              {errors.capacity && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.capacity}</p>}
              
              <Input
                label="Area (sq ft)"
                type="number"
                value={formData.area || ''}
                onChange={(e) => handleNumericInput('area', e.target.value, false)}
                placeholder="e.g., 200, 500, 1000"
                min={10}
                max={100000}
                required
              />
              {errors.area && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.area}</p>}
            </div>
          </div>

          {/* Pricing section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pricing:</h3>
            
            <Input
              label="Daily Rate ($)"
              type="number"
              value={formData.dailyRate || ''}
              onChange={(e) => handleNumericInput('dailyRate', e.target.value, true)}
              placeholder="e.g., 50.00, 150.00, 300.00"
              required
              min={0.01}
              max={10000}
              step="0.01"
            />
            {errors.dailyRate && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.dailyRate}</p>}
          </div>
        </form>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          
          <Button 
            type="button" 
            loading={loading}
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}