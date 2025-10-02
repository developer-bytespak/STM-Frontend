import Link from 'next/link';

export default function Signup() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">STM</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Choose Your Account Type
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select how you&apos;d like to use ServiceHub
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/customer/signup"
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors block text-center"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <div className="text-lg font-bold">Customer</div>
              <div className="text-sm opacity-90">Find service providers</div>
            </div>
          </Link>
          
          <Link
            href="/serviceprovider/signup"
            className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors block text-center"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🔧</div>
              <div className="text-lg font-bold">Service Provider</div>
              <div className="text-sm opacity-90">Offer your services</div>
            </div>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
