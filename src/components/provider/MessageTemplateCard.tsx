'use client';

import React, { useEffect, useState } from 'react';
import { providerApi, MessageTemplate } from '@/api/provider';

interface MessageTemplateCardProps {
  className?: string;
}

const VARIABLES = [
  { label: '[CUSTOMER_NAME]', example: 'John Smith' },
  { label: '[SERVICE_NAME]', example: 'House Cleaning' },
  { label: '[LOCATION]', example: '123 Main St' },
  { label: '[SCHEDULED_DATE]', example: '2026-02-15' }
];

const MAX_LENGTH = 2000;

export default function MessageTemplateCard({ className = '' }: MessageTemplateCardProps) {
  const [template, setTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const data = await providerApi.getMessageTemplate();
      setTemplate(data.first_message_template || '');
      setCharCount(data.first_message_template?.length || 0);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load message template:', err);
      setError('Failed to load template. Please try again.');
      setTemplate('');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, MAX_LENGTH);
    setTemplate(value);
    setCharCount(value.length);
    setError(null);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('messageTemplate') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = template.slice(0, start) + variable + template.slice(end);
      
      if (newText.length <= MAX_LENGTH) {
        setTemplate(newText);
        setCharCount(newText.length);
        
        // Set cursor position after inserted variable
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + variable.length;
          textarea.focus();
        }, 0);
      }
    }
  };

  const handleSave = async () => {
    if (!template.trim()) {
      setError('Message template cannot be empty');
      return;
    }

    if (template.length > MAX_LENGTH) {
      setError(`Message too long (max ${MAX_LENGTH} characters)`);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await providerApi.updateMessageTemplate({
        first_message_template: template
      });
      setSuccess('Message template saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to save template:', err);
      setError(err.message || 'Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset to default? This will remove your custom message template.')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await providerApi.resetMessageTemplate();
      setTemplate('');
      setCharCount(0);
      setSuccess('Message template reset to default!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to reset template:', err);
      setError(err.message || 'Failed to reset template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-2xl">📧</span>
          Welcome Message Template
        </h2>
        <p className="text-sm text-gray-600">
          Customize the automatic welcome message sent to customers when they create a job request
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Variable Helper Buttons */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Available Variables:</p>
        <div className="flex flex-wrap gap-2">
          {VARIABLES.map((variable, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertVariable(variable.label)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md text-sm font-medium text-blue-700 transition-colors"
              title={`Inserts ${variable.label} (e.g., ${variable.example})`}
            >
              <code className="text-xs">{variable.label}</code>
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <textarea
          id="messageTemplate"
          value={template}
          onChange={handleTemplateChange}
          placeholder="Hi [CUSTOMER_NAME]! Thanks for your [SERVICE_NAME] request. We're reviewing your request and will respond shortly."
          maxLength={MAX_LENGTH}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
        />
      </div>

      {/* Character Counter */}
      <div className="mb-6 flex justify-end">
        <span className={`text-sm ${charCount > MAX_LENGTH * 0.9 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
          {charCount} / {MAX_LENGTH}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !template.trim()}
          className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Message'}
        </button>
        <button
          onClick={handleReset}
          disabled={saving || !template.trim()}
          className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-medium rounded-lg transition-colors"
        >
          Reset to Default
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> Use the variable buttons above to insert placeholders. They'll be automatically replaced with actual job details when the message is sent to customers.
        </p>
      </div>
    </div>
  );
}
