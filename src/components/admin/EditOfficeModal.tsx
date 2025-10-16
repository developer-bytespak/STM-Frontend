'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
// COMMENTED OUT - Amenities system
// import AmenityIcon from '@/components/ui/AmenityIcon';
import { OfficeSpace, OfficeStatus } from '@/types/office';
// import { availableAmenities } from '@/data/mockOfficeData';

interface EditOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  office: OfficeSpace | null;
  onSuccess?: () => void;
}

const OFFICE_STATUS: { value: OfficeStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'booked', label: 'Booked' },
];

export default function EditOfficeModal({ isOpen, onClose, office, onSuccess }: EditOfficeModalProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<Partial<OfficeSpace>>({});

  useEffect(() => {
    if (office) {
      setFormData({
        ...office,
        amenities: office.amenities || [],
      });
    }
  }, [office]);

  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof OfficeSpace] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleAmenity = (amenity: any) => {
    setFormData(prev => {
      const amenities = prev.amenities || [];
      const hasAmenity = amenities.some(a => a.id === amenity.id);
      
      return {
        ...prev,
        amenities: hasAmenity
          ? amenities.filter(a => a.id !== amenity.id)
          : [...amenities, amenity],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Updating office space:', formData);
      
      setShowSuccess(true);
      onSuccess?.();
      
      // Auto close after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error updating office space:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!office) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="3xl" title="Edit Office Space">
      <div className="space-y-6">
        <p className="text-sm text-gray-600 -mt-2 mb-4">Update office space details</p>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">Office Space Updated Successfully!</h3>
              <p className="text-sm text-green-700 mt-1">
                Your changes to &ldquo;{formData.name}&rdquo; have been saved.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {!showSuccess && (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <Input
              label="Office Name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Status
              </label>
              <select
                value={formData.status || 'available'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 focus:outline-none appearance-none bg-white"
              >
                {OFFICE_STATUS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Capacity & Area */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Capacity (people)"
                type="number"
                value={formData.capacity || ''}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                min={1}
              />
              
              <Input
                label="Area (sq ft)"
                type="number"
                value={formData.area || ''}
                onChange={(e) => handleInputChange('area', parseInt(e.target.value))}
                min={1}
              />
            </div>
          </div>

          {/* SIMPLIFIED - Pricing (Daily Rate Only) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Daily Rate ($)"
                type="number"
                value={formData.pricing?.daily || ''}
                onChange={(e) => handleInputChange('pricing.daily', parseFloat(e.target.value) || 0)}
                min={0}
                step="0.01"
                required
              />
            </div>

            {/* COMMENTED OUT - Complex pricing options */}
            {/* <div className="grid grid-cols-2 gap-4">
              <Input
                label="Hourly Rate ($)"
                type="number"
                value={formData.pricing?.hourly || ''}
                onChange={(e) => handleInputChange('pricing.hourly', parseFloat(e.target.value) || 0)}
                min={0}
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Weekly Rate ($)"
                type="number"
                value={formData.pricing?.weekly || ''}
                onChange={(e) => handleInputChange('pricing.weekly', parseFloat(e.target.value) || 0)}
                min={0}
                step="0.01"
              />
              
              <Input
                label="Monthly Rate ($)"
                type="number"
                value={formData.pricing?.monthly || ''}
                onChange={(e) => handleInputChange('pricing.monthly', parseFloat(e.target.value) || 0)}
                min={0}
                step="0.01"
              />
            </div> */}
          </div>

          {/* Amenities */}
          {/* COMMENTED OUT - Amenities */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar border border-gray-300 rounded-lg p-3">
                  {availableAmenities.map((amenity) => {
                    const isSelected = (formData.amenities || []).some(a => a.id === amenity.id);
                    
                    return (
                      <label key={amenity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                amenities: [...(prev.amenities || []), amenity]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                amenities: (prev.amenities || []).filter(a => a.id !== amenity.id)
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
                    );
                  })}
            </div>
            <p className="text-sm text-gray-500">
              Selected: {(formData.amenities || []).length} amenities
            </p>
          </div> */}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
        )}
      </div>
    </Modal>
  );
}

