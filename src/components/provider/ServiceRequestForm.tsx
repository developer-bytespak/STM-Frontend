'use client';

import { useState } from 'react';
import { RequestServiceDto } from '@/api/provider';
import { SERVICES, searchServices, getGranularServices } from '@/data/services';

interface ServiceRequestFormProps {
  onSubmit: (data: RequestServiceDto) => Promise<void>;
  loading?: boolean;
}

export default function ServiceRequestForm({ onSubmit, loading }: ServiceRequestFormProps) {
  const [formData, setFormData] = useState<RequestServiceDto>({
    serviceName: '',
    category: '',
    description: '',
    suggestedQuestions: []
  });

  const [questions, setQuestions] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceSuggestions, setServiceSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get all categories from services.ts
  const categories = Object.keys(SERVICES);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.serviceName.trim()) {
      newErrors.serviceName = 'Service name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Filter out empty questions
    const filteredQuestions = questions.filter(q => q.trim() !== '');

    await onSubmit({
      ...formData,
      suggestedQuestions: filteredQuestions.length > 0 ? filteredQuestions : undefined
    });
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Handle service name input with autocomplete
  const handleServiceNameChange = (value: string) => {
    setFormData({ ...formData, serviceName: value });
    setErrors({ ...errors, serviceName: '' });
    
    if (value.length >= 2) {
      const results = searchServices(value);
      const suggestions = results.map(result => 
        result.isGranular ? result.granularService! : result.category
      );
      setServiceSuggestions(suggestions.slice(0, 10)); // Limit to 10 suggestions
      setShowSuggestions(true);
    } else {
      setServiceSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle service suggestion selection
  const handleServiceSelect = (service: string) => {
    setFormData({ ...formData, serviceName: service });
    setServiceSuggestions([]);
    setShowSuggestions(false);
    
    // Auto-select category if it's a granular service
    const category = Object.keys(SERVICES).find(cat => 
      SERVICES[cat].includes(service)
    );
    if (category) {
      setFormData(prev => ({ ...prev, category }));
    }
  };

  // Handle category change - update service suggestions
  const handleCategoryChange = (category: string) => {
    setFormData({ ...formData, category });
    setErrors({ ...errors, category: '' });
    
    // If service name is empty, show granular services for this category
    if (!formData.serviceName && category) {
      const granularServices = getGranularServices(category);
      setServiceSuggestions(granularServices);
      setShowSuggestions(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Name */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Service Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.serviceName}
          onChange={(e) => handleServiceNameChange(e.target.value)}
          onFocus={() => {
            if (serviceSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking on them
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder="e.g., Pool Maintenance, Window Washing, Pest Control"
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.serviceName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        
        {/* Service Suggestions Dropdown */}
        {showSuggestions && serviceSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {serviceSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleServiceSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
              >
                <div className="font-medium text-gray-900">{suggestion}</div>
                <div className="text-sm text-gray-500">
                  {SERVICES[suggestion] ? 'Category' : 'Service'}
                </div>
              </button>
            ))}
          </div>
        )}
        
        {errors.serviceName && (
          <p className="text-sm text-red-500 mt-1">{errors.serviceName}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Start typing to see available services and categories
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-sm text-red-500 mt-1">{errors.category}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Service Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            setErrors({ ...errors, description: '' });
          }}
          placeholder="Provide a detailed description of the service you want to offer..."
          rows={5}
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Explain what this service includes, typical scope of work, and any specializations.
        </p>
      </div>

      {/* Suggested Questions (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Suggested Customer Questions (Optional)
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Add questions you&apos;d like customers to answer when booking this service (e.g., &quot;What is the pool size?&quot;, &quot;How many windows?&quot;)
        </p>

        {questions.map((question, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              placeholder={`Question ${index + 1}`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          + Add Question
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Service Request'}
        </button>
      </div>

      <p className="text-sm text-gray-600 text-center">
        Your request will be reviewed by the Local Service Manager and Admin before being approved.
      </p>
    </form>
  );
}

