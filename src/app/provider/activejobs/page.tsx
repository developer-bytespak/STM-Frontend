'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ActiveJobsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified Jobs page
    router.replace('/provider/total_jobs');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Redirecting to Jobs page...</p>
      </div>
    </div>
  );
}
