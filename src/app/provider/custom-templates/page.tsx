'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { providerApi, MessageTemplate } from '@/api/provider';

const VARIABLES_FIRST_MESSAGE = [
  { label: '[CUSTOMER_NAME]', example: 'John Smith' },
  { label: '[SERVICE_NAME]', example: 'House Cleaning' },
  { label: '[LOCATION]', example: '123 Main St' },
  { label: '[SCHEDULED_DATE]', example: '2026-02-15' }
];

const VARIABLES_JOB_ACCEPTED = [
  { label: '[CUSTOMER_NAME]', example: 'John Smith' },
  { label: '[SERVICE_NAME]', example: 'House Cleaning' },
  { label: '[PROVIDER_NAME]', example: 'Clean Pro Services' },
  { label: '[PRICE]', example: '150' },
  { label: '[JOB_ID]', example: '12345' }
];

const VARIABLES_NEGOTIATION = [
  { label: '[CUSTOMER_NAME]', example: 'John Smith' },
  { label: '[PROVIDER_NAME]', example: 'Clean Pro Services' },
  { label: '[SERVICE_NAME]', example: 'House Cleaning' },
  { label: '[ORIGINAL_PRICE]', example: '150' },
  { label: '[NEW_PRICE]', example: '120' },
  { label: '[NEW_SCHEDULE]', example: '2026-02-20' },
  { label: '[PROVIDER_NOTES]', example: 'Special discount available' },
  { label: '[JOB_ID]', example: '12345' }
];

const MAX_LENGTH = 2000;
const MAX_SUBJECT_LENGTH = 200;

interface FormData {
  first_message_template: string;
  job_accepted_subject: string;
  job_accepted_body: string;
  negotiation_subject: string;
  negotiation_body: string;
}

export default function CustomTemplatesPage() {
  const [templates, setTemplates] = useState<FormData>({
    first_message_template: '',
    job_accepted_subject: '',
    job_accepted_body: '',
    negotiation_subject: '',
    negotiation_body: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [charCounts, setCharCounts] = useState({
    first_message_template: 0,
    job_accepted_subject: 0,
    job_accepted_body: 0,
    negotiation_subject: 0,
    negotiation_body: 0
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await providerApi.getMessageTemplate();
      setTemplates({
        first_message_template: data.first_message_template || '',
        job_accepted_subject: data.job_accepted_subject || '',
        job_accepted_body: data.job_accepted_body || '',
        negotiation_subject: data.negotiation_subject || '',
        negotiation_body: data.negotiation_body || ''
      });
      updateCharCounts({
        first_message_template: data.first_message_template || '',
        job_accepted_subject: data.job_accepted_subject || '',
        job_accepted_body: data.job_accepted_body || '',
        negotiation_subject: data.negotiation_subject || '',
        negotiation_body: data.negotiation_body || ''
      });
      setError(null);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateCharCounts = (formData: FormData) => {
    setCharCounts({
      first_message_template: formData.first_message_template?.length || 0,
      job_accepted_subject: formData.job_accepted_subject?.length || 0,
      job_accepted_body: formData.job_accepted_body?.length || 0,
      negotiation_subject: formData.negotiation_subject?.length || 0,
      negotiation_body: formData.negotiation_body?.length || 0
    });
  };

  const handleChange = (field: keyof FormData, value: string) => {
    const maxLen = field.includes('subject') ? MAX_SUBJECT_LENGTH : MAX_LENGTH;
    const trimmed = value.slice(0, maxLen);
    
    const newData = { ...templates, [field]: trimmed };
    setTemplates(newData);
    updateCharCounts(newData);
    setError(null);
    // Clear field error when user starts typing
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSaveIndividual = async (fieldsToSave: (keyof FormData)[]) => {
    // Validate email subjects are not empty
    const newFieldErrors: Record<string, string> = {};
    
    if (fieldsToSave.includes('job_accepted_subject') && !templates.job_accepted_subject.trim()) {
      newFieldErrors['job_accepted_subject'] = 'Email Subject cannot be empty';
    }
    if (fieldsToSave.includes('negotiation_subject') && !templates.negotiation_subject.trim()) {
      newFieldErrors['negotiation_subject'] = 'Email Subject cannot be empty';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});

      const dataToSave: Partial<FormData> = {};
      fieldsToSave.forEach(field => {
        dataToSave[field] = templates[field] || undefined;
      });

      await providerApi.updateMessageTemplate(dataToSave as FormData);
      setSuccess('Template saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to save template:', err);
      setError(err.message || 'Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (field: keyof FormData, variable: string) => {
    const textarea = document.getElementById(field) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const maxLen = field.includes('subject') ? MAX_SUBJECT_LENGTH : MAX_LENGTH;
      const newText = templates[field].slice(0, start) + variable + templates[field].slice(end);
      
      if (newText.length <= maxLen) {
        handleChange(field, newText);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + variable.length;
          textarea.focus();
        }, 0);
      }
    }
  };

  const handleSave = async () => {
    // Validate email subjects are not empty
    const newFieldErrors: Record<string, string> = {};
    
    if (!templates.job_accepted_subject.trim()) {
      newFieldErrors['job_accepted_subject'] = 'Email Subject cannot be empty';
    }
    if (!templates.negotiation_subject.trim()) {
      newFieldErrors['negotiation_subject'] = 'Email Subject cannot be empty';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});

      await providerApi.updateMessageTemplate({
        first_message_template: templates.first_message_template || undefined,
        job_accepted_subject: templates.job_accepted_subject || undefined,
        job_accepted_body: templates.job_accepted_body || undefined,
        negotiation_subject: templates.negotiation_subject || undefined,
        negotiation_body: templates.negotiation_body || undefined
      });

      setSuccess('All templates saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to save templates:', err);
      setError(err.message || 'Failed to save templates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all templates to default? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await providerApi.resetMessageTemplate();
      setTemplates({
        first_message_template: '',
        job_accepted_subject: '',
        job_accepted_body: '',
        negotiation_subject: '',
        negotiation_body: ''
      });
      setCharCounts({
        first_message_template: 0,
        job_accepted_subject: 0,
        job_accepted_body: 0,
        negotiation_subject: 0,
        negotiation_body: 0
      });
      setSuccess('All templates reset to default!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to reset templates:', err);
      setError(err.message || 'Failed to reset templates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-6 bg-gray-200 rounded w-48 mb-3 animate-pulse"></div>
                  <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/provider/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-4xl">✉️</span>
            Custom Message Templates
          </h1>
          <p className="text-gray-600">
            Customize automated messages sent to customers at different stages of job completion
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">📧 Chat Message</p>
            <p className="text-xs text-blue-700 mt-1">Auto-message when customer creates job</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900">✅ Job Accepted Email</p>
            <p className="text-xs text-green-700 mt-1">Sent when job is accepted</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-900">💡 Negotiation Email</p>
            <p className="text-xs text-purple-700 mt-1">Sent when proposing alternative terms</p>
          </div>
        </div>

        {/* Templates Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8">

          {/* 1. First Message Template (Chat) */}
          <div className="border-b border-gray-200 pb-8 last:border-0">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Welcome Chat Message
              </h2>
              <p className="text-sm text-gray-600">
                Automatic message sent in the chat when a customer creates a job request
              </p>
            </div>

            {/* Variables */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {VARIABLES_FIRST_MESSAGE.map((variable, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertVariable('first_message_template', variable.label)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md text-sm font-medium text-blue-700 transition-colors"
                    title={`${variable.label}: ${variable.example}`}
                  >
                    <code className="text-xs">{variable.label}</code>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="mb-4">
              <textarea
                id="first_message_template"
                value={templates.first_message_template}
                onChange={(e) => handleChange('first_message_template', e.target.value)}
                placeholder="Hi [CUSTOMER_NAME]! Thanks for your [SERVICE_NAME] request. We're reviewing your request and will respond shortly."
                maxLength={MAX_LENGTH}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Character Counter */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleSaveIndividual(['first_message_template'])}
                disabled={saving}
                className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed text-blue-600 font-medium rounded-lg transition-colors text-sm"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <span className={`text-sm ${charCounts.first_message_template > MAX_LENGTH * 0.9 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                {charCounts.first_message_template} / {MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* 2. Job Accepted Email */}
          <div className="border-b border-gray-200 pb-8 last:border-0">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Job Accepted Email
              </h2>
              <p className="text-sm text-gray-600">
                Email sent to customer when you've accepted their job request
              </p>
            </div>

            {/* Variables */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {VARIABLES_JOB_ACCEPTED.map((variable, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      insertVariable('job_accepted_subject', variable.label);
                      insertVariable('job_accepted_body', variable.label);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md text-sm font-medium text-green-700 transition-colors"
                    title={`${variable.label}: ${variable.example}`}
                  >
                    <code className="text-xs">{variable.label}</code>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject <span className="text-red-500">*</span></label>
              <input
                id="job_accepted_subject"
                type="text"
                value={templates.job_accepted_subject}
                onChange={(e) => handleChange('job_accepted_subject', e.target.value)}
                placeholder="✅ Your [SERVICE_NAME] is Ready!"
                maxLength={MAX_SUBJECT_LENGTH}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 ${
                  fieldErrors.job_accepted_subject ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.job_accepted_subject && (
                <p className="text-sm text-red-500 mt-1.5">{fieldErrors.job_accepted_subject}</p>
              )}
              <div className="flex justify-end mt-1">
                <span className={`text-sm ${charCounts.job_accepted_subject > MAX_SUBJECT_LENGTH * 0.9 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {charCounts.job_accepted_subject} / {MAX_SUBJECT_LENGTH}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body (HTML supported)</label>
              <textarea
                id="job_accepted_body"
                value={templates.job_accepted_body}
                onChange={(e) => handleChange('job_accepted_body', e.target.value)}
                placeholder="<p>Hi [CUSTOMER_NAME],</p><p>We're excited to work on your [SERVICE_NAME]!</p>"
                maxLength={MAX_LENGTH}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm font-mono text-gray-900 placeholder:text-gray-400"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-sm ${charCounts.job_accepted_body > MAX_LENGTH * 0.9 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {charCounts.job_accepted_body} / {MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Individual Save Button */}
            <div className="pt-2">
              <button
                onClick={() => handleSaveIndividual(['job_accepted_subject', 'job_accepted_body'])}
                disabled={saving}
                className="px-4 py-1.5 bg-green-50 hover:bg-green-100 disabled:bg-gray-100 disabled:cursor-not-allowed text-green-600 font-medium rounded-lg transition-colors text-sm"
              >
                {saving ? 'Saving...' : 'Save This Template'}
              </button>
            </div>
          </div>

          {/* 3. Negotiation Email */}
          <div className="pb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Negotiation Email
              </h2>
              <p className="text-sm text-gray-600">
                Email sent when you propose alternative terms or pricing
              </p>
            </div>

            {/* Variables */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {VARIABLES_NEGOTIATION.map((variable, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      insertVariable('negotiation_subject', variable.label);
                      insertVariable('negotiation_body', variable.label);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md text-sm font-medium text-purple-700 transition-colors"
                    title={`${variable.label}: ${variable.example}`}
                  >
                    <code className="text-xs">{variable.label}</code>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject <span className="text-red-500">*</span></label>
              <input
                id="negotiation_subject"
                type="text"
                value={templates.negotiation_subject}
                onChange={(e) => handleChange('negotiation_subject', e.target.value)}
                placeholder="💡 Better Solution for Your [SERVICE_NAME]"
                maxLength={MAX_SUBJECT_LENGTH}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 ${
                  fieldErrors.negotiation_subject ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.negotiation_subject && (
                <p className="text-sm text-red-500 mt-1.5">{fieldErrors.negotiation_subject}</p>
              )}
              <div className="flex justify-end mt-1">
                <span className={`text-sm ${charCounts.negotiation_subject > MAX_SUBJECT_LENGTH * 0.9 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {charCounts.negotiation_subject} / {MAX_SUBJECT_LENGTH}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body (HTML supported)</label>
              <textarea
                id="negotiation_body"
                value={templates.negotiation_body}
                onChange={(e) => handleChange('negotiation_body', e.target.value)}
                placeholder="<p>Hi [CUSTOMER_NAME],</p><p>We have a better solution for your [SERVICE_NAME]...</p>"
                maxLength={MAX_LENGTH}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm font-mono text-gray-900 placeholder:text-gray-400"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-sm ${charCounts.negotiation_body > MAX_LENGTH * 0.9 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {charCounts.negotiation_body} / {MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Individual Save Button */}
            <div className="pt-2">
              <button
                onClick={() => handleSaveIndividual(['negotiation_subject', 'negotiation_body'])}
                disabled={saving}
                className="px-4 py-1.5 bg-purple-50 hover:bg-purple-100 disabled:bg-gray-100 disabled:cursor-not-allowed text-purple-600 font-medium rounded-lg transition-colors text-sm"
              >
                {saving ? 'Saving...' : 'Save This Template'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save All Templates'}
          </button>
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-medium rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>💡 Tips:</strong> Click variable buttons to insert placeholders. Variables are automatically replaced with actual job data when messages are sent. Chat messages support plain text; emails support HTML formatting.
          </p>
        </div>
      </div>
    </div>
  );
}
