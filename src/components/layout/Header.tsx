'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAVIGATION_ROUTES } from '@/constants/routes';

interface HeaderProps {
  userRole?: 'customer' | 'provider' | 'admin' | 'lsm';
  userName?: string;
}

export default function Header({ userRole = 'customer', userName }: HeaderProps) {
  const pathname = usePathname();
  
  const navigationRoutes = NAVIGATION_ROUTES[userRole.toUpperCase() as keyof typeof NAVIGATION_ROUTES] || NAVIGATION_ROUTES.CUSTOMER;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">STM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ServiceHub</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {navigationRoutes.map((route) => {
              const isActive = pathname === route.path;
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{route.icon}</span>
                  <span>{route.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {userName && (
              <span className="text-sm text-gray-700">Welcome, {userName}</span>
            )}
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationRoutes.map((route) => {
              const isActive = pathname === route.path;
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{route.icon}</span>
                  <span>{route.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}