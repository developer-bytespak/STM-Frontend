'use client';

import { use } from 'react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProviderDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const providerId = parseInt(id, 10);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Details</h1>
          <p className="text-gray-600">
            Provider ID: {providerId}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Provider Details</h3>
            <p className="text-gray-600 mb-6">
              Showing details for Provider ID: <span className="font-bold text-blue-600">{providerId}</span>
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Provider information will be displayed here</p>
              <p>• API integration needed for real data</p>
              <p>• This is a basic placeholder page</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
