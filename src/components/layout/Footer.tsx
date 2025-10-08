import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-navy-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">STM</span>
              </div>
              <h3 className="text-xl font-bold text-white">ServiceProStars</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Connecting customers with trusted service providers in your local area. 
              Quality services, reliable providers, seamless experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/lsm/dashboard" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/lsm/sp-request" className="text-sm text-gray-300 hover:text-white transition-colors">
                  SP Requests
                </Link>
              </li>
              <li>
                <Link href="/lsm/providers" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Providers
                </Link>
              </li>
              <li>
                <Link href="/lsm/jobs" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/lsm/disputes" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Disputes
                </Link>
              </li>
              <li>
                <Link href="/lsm/sp-feedbacks" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-300">Help Center</span>
              </li>
              <li>
                <span className="text-sm text-gray-300">Contact Us</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              © 2024 ServiceProStars. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-sm text-gray-400 hover:text-gray-300 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-sm text-gray-400 hover:text-gray-300 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}