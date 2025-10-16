export default function ProviderProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Back Button */}
      <div className="mb-6">
        <div className="h-5 bg-gray-200 rounded w-48"></div>
      </div>

      {/* Provider Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gray-300 rounded-full flex-shrink-0"></div>

          {/* Info */}
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
            
            <div className="flex items-center gap-6">
              <div className="h-5 bg-gray-200 rounded w-24"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-5 bg-gray-200 rounded w-40"></div>
            </div>
          </div>

          {/* Button */}
          <div className="h-12 bg-gray-200 rounded-lg w-32"></div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-7 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-7 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-full w-32"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-gray-100 border-2 border-gray-200 rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4 mx-auto"></div>
            <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

