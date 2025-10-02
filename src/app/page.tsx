import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">STM</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to ServiceHub
          </h1>
          <p className="text-gray-600">
            Connect with trusted service providers in your area
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/customer/dashboard"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors block"
          >
            Customer Dashboard
          </Link>
          
          <Link
            href="/provider/dashboard"
            className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors block"
          >
            Provider Dashboard
          </Link>
          
          <Link
            href="/admin/dashboard"
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors block"
          >
            Admin Dashboard
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Choose your role to access the appropriate dashboard
          </p>
        </div>
      </div>
    </div>
  );
}