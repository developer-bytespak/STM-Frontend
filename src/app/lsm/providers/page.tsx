'use client';

export default function LSMProviders() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Management</h1>
          <p className="text-gray-600">
            Manage and monitor service providers in your region
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Providers Found</h3>
            <p className="text-gray-600 mb-6">
              There are no service providers in your region yet. Providers will appear here once they register and get approved.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Providers need to complete registration</p>
              <p>• Documents must be verified</p>
              <p>• Approval from LSM is required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
