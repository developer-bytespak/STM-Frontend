'use client';

import React, { useState } from 'react';
import { homepageApi } from '@/api/homepage';
import ServiceSearch from './ServiceSearch';
import CitySearch from './CitySearch';

export interface SmartSearchFormValues {
  serviceId: number | '';
  serviceName: string;
  zipcode: string;
  budget: string;
  projectSizeSqft: string;
  /** For re-display when coming back to form */
  category?: string;
  locationDisplay?: string;
}

export interface SmartSearchInitialValues {
  selectedService: string;
  selectedCategory: string;
  selectedLocation: string;
  budget: string;
  projectSizeSqft: string;
}

interface SmartSearchFormProps {
  onSubmit: (values: SmartSearchFormValues) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  /** When coming back from results (or after reload), form is pre-filled with these */
  initialValues?: Partial<SmartSearchInitialValues>;
}

export default function SmartSearchForm({ onSubmit, onBack, isSubmitting = false, initialValues }: SmartSearchFormProps) {
  const [selectedService, setSelectedService] = useState(initialValues?.selectedService ?? '');
  const [selectedCategory, setSelectedCategory] = useState(initialValues?.selectedCategory ?? '');
  const [selectedLocation, setSelectedLocation] = useState(initialValues?.selectedLocation ?? '');
  const [budget, setBudget] = useState(initialValues?.budget ?? '');
  const [projectSizeSqft, setProjectSizeSqft] = useState(initialValues?.projectSizeSqft ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleServiceSelect = (service: string, category?: string) => {
    setSelectedService(service);
    setSelectedCategory(category || '');
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
  };

  const handleClearAll = () => {
    setSelectedService('');
    setSelectedCategory('');
    setSelectedLocation('');
    setBudget('');
    setProjectSizeSqft('');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedService.trim()) newErrors.service = 'Please select a service';
    if (!selectedLocation.trim()) newErrors.location = 'Please select a location / zipcode';
    if (!budget.trim()) newErrors.budget = 'Budget is required';
    const budgetNum = parseFloat(budget);
    if (budget.trim() && (Number.isNaN(budgetNum) || budgetNum < 0)) {
      newErrors.budget = 'Please enter a valid budget (e.g. 200)';
    }
    if (projectSizeSqft.trim()) {
      const sqft = parseFloat(projectSizeSqft);
      if (Number.isNaN(sqft) || sqft < 0) newErrors.projectSizeSqft = 'Please enter a valid number';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Resolve service name → serviceId (same as main flow: use GET /services)
    let serviceId: number | '' = '';
    try {
      const services = await homepageApi.getAllServices();
      const match = services.find((s) => s.name === selectedService.trim());
      if (match) serviceId = match.id;
      else newErrors.service = 'Could not find selected service. Please choose again.';
    } catch {
      newErrors.service = 'Failed to load services. Please try again.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // Extract zipcode from location string (same as main flow in HierarchicalSearch)
    const zipMatch = selectedLocation.match(/^\d+/);
    const zipcode = zipMatch ? zipMatch[0] : selectedLocation.trim();

    if (!zipcode) {
      setErrors((prev) => ({ ...prev, location: 'Please enter a valid zipcode.' }));
      return;
    }

    onSubmit({
      serviceId,
      serviceName: selectedService.trim(),
      zipcode,
      budget: budget.trim(),
      projectSizeSqft: projectSizeSqft.trim(),
      category: selectedCategory || undefined,
      locationDisplay: selectedLocation || undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Smart Search</h3>
        <button type="button" onClick={onBack} className="text-sm text-navy-600 hover:text-navy-800 font-medium">
          ← Back to search
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Get the best matching providers by service, location, and budget.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Reuse main flow: Service search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Service <span className="text-red-500">*</span>
          </label>
          <ServiceSearch
            onServiceSelect={handleServiceSelect}
            onClear={handleClearAll}
            selectedService={selectedService}
            selectedCategory={selectedCategory}
          />
          {errors.service && <p className="text-sm text-red-500 mt-1">{errors.service}</p>}
        </div>

        {/* Reuse main flow: Location / zipcode search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Zipcode / Location <span className="text-red-500">*</span>
          </label>
          <CitySearch
            onLocationSelect={handleLocationSelect}
            onClear={handleClearAll}
            selectedLocation={selectedLocation}
            disabled={false}
          />
          {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Budget ($) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              min={0}
              step={1}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 200"
              className={`w-full pl-8 pr-4 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                errors.budget ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget}</p>}
        </div>

        {/* Project size (optional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Project size (sq ft) <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={projectSizeSqft}
            onChange={(e) => setProjectSizeSqft(e.target.value)}
            placeholder="e.g. 300"
            className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500 ${
              errors.projectSizeSqft ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.projectSizeSqft && <p className="text-sm text-red-500 mt-1">{errors.projectSizeSqft}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-navy-600 text-white py-3 rounded-lg font-semibold hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Finding providers...' : 'Find best providers'}
        </button>
      </form>
    </div>
  );
}
