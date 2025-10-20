'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NotificationBell } from '@/components/notifications';

interface HeaderProps {
  userRole?: 'customer' | 'service_provider' | 'admin' | 'local_service_manager';
  userName?: string;
  onLogout?: () => void;
}

export default function Header({ userRole, userName, onLogout }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Create return URL for login/signup (skip if already on auth pages)
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || 
                     pathname?.startsWith('/provider/signup');
  const returnUrl = !isAuthPage && pathname ? `?returnUrl=${encodeURIComponent(pathname)}` : '';

  // Map backend role names to frontend route names
  const getRoleRoute = (role: string) => {
    switch (role) {
      case 'customer':
        return 'customer';
      case 'service_provider':
        return 'provider';
      case 'admin':
        return 'admin';
      case 'local_service_manager':
        return 'lsm';
      default:
        return 'customer';
    }
  };

  const roleRoute = userRole ? getRoleRoute(userRole) : '';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-navy-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">CA</span>
              </div>
              <h1 className="text-xl font-bold text-navy-900 hidden sm:block">ConnectAgain</h1>
            </Link>
          </div>

          {/* Right Side - User Menu or Auth Buttons */}
          <div className="flex items-center space-x-2">
            {/* Pricing Link - Always visible */}
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-navy-600 font-medium transition-colors text-sm px-3 py-2 hidden sm:inline-block"
            >
              Pricing
            </Link>
            
            {userRole && userName ? (
              <>
                {/* Notification Bell - Only for authenticated users */}
                <NotificationBell userRole={userRole} />
                
                {/* Authenticated User Menu */}
                <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <span className="text-sm text-gray-700 hidden sm:inline">Welcome, {userName}</span>
                  <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole} Account</p>
                    </div>
                    <Link
                      href={`/${roleRoute}/dashboard`}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href={`/${roleRoute}/profile`}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile</span>
                    </Link>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </>
            ) : (
              // Unauthenticated Auth Buttons
              <>
                <Link
                  href={`/login${returnUrl}`}
                  className="text-gray-600 hover:text-navy-600 font-medium transition-colors text-sm px-3 py-2 cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  href={`/register${returnUrl}`}
                  className="hidden sm:inline-block bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors text-sm cursor-pointer"
                >
                  Sign Up
                </Link>
                <Link
                  href={`/provider/signup${returnUrl}`}
                  className="hidden lg:inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer"
                >
                  Become a Provider
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && userRole && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="px-3 py-2 text-sm text-gray-500">
              Signed in as <span className="font-medium text-gray-900 capitalize">{userRole}</span>
            </div>
            <Link
              href={`/${roleRoute}/dashboard`}
              className="flex items-center space-x-2 px-3 py-2 text-base text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link
              href={`/${roleRoute}/profile`}
              className="flex items-center space-x-2 px-3 py-2 text-base text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>My Profile</span>
            </Link>
            <div className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-base text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu for Unauthenticated */}
        {mobileMenuOpen && !userRole && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link
                href="/pricing"
                className="block w-full text-center text-gray-600 hover:text-navy-600 px-4 py-3 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                View Pricing Plans
              </Link>
              <Link
                href={`/register${returnUrl}`}
                className="block w-full text-center bg-navy-600 text-white px-4 py-3 rounded-lg hover:bg-navy-700 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up as Customer
              </Link>
                <Link
                href={`/provider/signup${returnUrl}`}
                className="block w-full text-center bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Become a Provider
                </Link>
          </div>
        </div>
        )}
      </div>
    </nav>
  );
}