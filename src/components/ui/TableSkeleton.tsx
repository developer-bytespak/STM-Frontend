export default function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>

      {/* Filters/Actions Bar */}
      <div className="mb-6 flex gap-4">
        <div className="h-10 bg-gray-200 rounded w-40"></div>
        <div className="h-10 bg-gray-200 rounded w-40"></div>
        <div className="h-10 bg-gray-200 rounded w-32 ml-auto"></div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Table Rows */}
        {[...Array(8)].map((_, rowIndex) => (
          <div key={rowIndex} className="border-b border-gray-100 px-6 py-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              {[...Array(5)].map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`h-4 bg-gray-200 rounded ${
                    colIndex === 0 ? 'w-3/4' : colIndex === 4 ? 'w-1/2' : ''
                  }`}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-8"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
}

