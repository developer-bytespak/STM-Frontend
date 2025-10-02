import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-navy-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">STM</span>
              </div>
              <h1 className="text-xl font-bold text-navy-900">ServiceProStars</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-navy-600 font-medium"
              >
                Login
              </Link>
              <Link
                href="/customer/signup"
                className="bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/serviceprovider/signup"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Are you a Service Provider?
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Services
            <span className="text-navy-600 block">At Your Fingertips</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with trusted service providers in your area. From plumbing to electrical work, 
            find the right professional for every job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/customer/signup"
              className="bg-navy-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-navy-700 transition-colors text-lg"
            >
              Find Services
            </Link>
            
            <Link
              href="/serviceprovider/signup"
              className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors text-lg"
            >
              Offer Services
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to get the services you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                For Customers
              </h3>
              <p className="text-gray-600">
                Sign up, describe your service need, and get matched with verified professionals in your area.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                For Service Providers
              </h3>
              <p className="text-gray-600">
                Join our platform, get verified by Local Service Managers, and start earning from your skills.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality Assurance
              </h3>
              <p className="text-gray-600">
                All service providers are verified and managed by Local Service Managers for quality assurance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Development Tools Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Development Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Create Test Admin
                </h3>
                <p className="text-gray-600 mb-4">
                  Create a test admin account for development and testing purposes.
                </p>
                <Link
                  href="/admin/create-test-admin"
                  className="text-navy-600 hover:text-navy-800 font-medium"
                >
                  Create Admin →
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Create Test LSM
                </h3>
                <p className="text-gray-600 mb-4">
                  Create a test Local Service Manager account for development and testing.
                </p>
                <Link
                  href="/admin/create-test-lsm"
                  className="text-navy-600 hover:text-navy-800 font-medium"
                >
                  Create LSM →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                  <span className="text-navy-600 font-bold text-sm">STM</span>
                </div>
                <h3 className="text-xl font-bold">ServiceProStars</h3>
              </div>
              <p className="text-gray-300">
                Connecting customers with trusted service providers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/customer/signup" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/customer/search-providers" className="hover:text-white">Find Providers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Providers</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/serviceprovider/signup" className="hover:text-white">Join as Provider</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/provider/dashboard" className="hover:text-white">Provider Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/terms" className="hover:text-white">Terms & Conditions</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-navy-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 ServiceProStars. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}