import Link from 'next/link';

export default function Footer() {
  return (
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
              <li><Link href="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Find Providers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Providers</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/provider/signup" className="hover:text-white transition-colors">Join as Provider</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/provider/dashboard" className="hover:text-white transition-colors">Provider Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 ServiceProStars. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}