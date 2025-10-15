import Link from 'next/link';

export default function CustomerPayments() {
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Dashboard */}
        <Link href="/customer/dashboard" className="text-navy-600 hover:text-navy-700 text-sm mb-4 inline-flex items-center gap-1">
          ← Back to Dashboard
        </Link>
        
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
          <p className="text-gray-600">View your payment history and transaction details</p>
          {/* Payments page will be implemented here */}
        </div>
      </div>
    </div>
  );
}