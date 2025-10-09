'use client';

interface SPRequestStatsProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export default function SPRequestStats({ pendingCount, approvedCount, rejectedCount }: SPRequestStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="text-3xl mr-4">⏳</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="text-3xl mr-4">✅</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Approved</h3>
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="text-3xl mr-4">❌</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
