// Application routes configuration
export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  HELP: '/help',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  PRICING: '/pricing',
  
  // Authentication routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_OTP: '/verify-otp',
  
  // Customer routes
  CUSTOMER: {
    DASHBOARD: '/customer/dashboard',
    BOOKINGS: '/customer/bookings',
    BOOKING_DETAILS: (id: string) => `/customer/bookings/${id}`,
    NEW_BOOKING: '/customer/bookings/new',
    SEARCH_PROVIDERS: '/', // Updated to use homepage search
    PAYMENTS: '/customer/payments',
    PROFILE: '/customer/profile',
    SETTINGS: '/customer/settings',
    NOTIFICATIONS: '/customer/notifications',
    FEEDBACK: '/customer/feedback',
    AVAILED_JOBS: '/customer/avalied-jobs',
  },
  
  // Provider routes
  PROVIDER: {
    DASHBOARD: '/provider/dashboard',
    ONBOARDING: '/provider/onboarding',
    JOBS: '/provider/jobs',
    JOB_DETAILS: (id: string) => `/provider/jobs/${id}`,
    EARNINGS: '/provider/earnings',
    OFFICE_BOOKING: '/provider/office-booking',
    PROFILE: '/provider/profile',
    SETTINGS: '/provider/settings',
    VERIFICATION: '/provider/verification',
    PORTFOLIO: '/provider/portfolio',
    REVIEWS: '/provider/reviews',
    AVAILABILITY: '/provider/availability',
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PROVIDERS: '/admin/providers',
    JOBS: '/admin/jobs',
    FINANCES: '/admin/finances',
    OFFICES: '/admin/offices',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
    REPORTS: '/admin/reports',
    AUDIT_LOGS: '/admin/audit-logs',
    SYSTEM_HEALTH: '/admin/system-health',
  },
  
  // LSM routes
  LSM: {
    DASHBOARD: '/lsm/dashboard',
    PROVIDERS: '/lsm/providers',
    JOBS: '/lsm/jobs',
    ANALYTICS: '/lsm/analytics',
    SETTINGS: '/lsm/settings',
  },
  
  // API routes
  API: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      VERIFY_EMAIL: '/api/auth/verify-email',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    USERS: {
      BASE: '/api/users',
      PROFILE: '/api/users/profile',
      UPDATE: '/api/users/update',
      DELETE: '/api/users/delete',
    },
    JOBS: {
      BASE: '/api/jobs',
      CREATE: '/api/jobs/create',
      UPDATE: (id: string) => `/api/jobs/${id}`,
      DELETE: (id: string) => `/api/jobs/${id}`,
      SEARCH: '/api/jobs/search',
      ASSIGN: (id: string) => `/api/jobs/${id}/assign`,
      COMPLETE: (id: string) => `/api/jobs/${id}/complete`,
      CANCEL: (id: string) => `/api/jobs/${id}/cancel`,
    },
    PROVIDERS: {
      BASE: '/api/providers',
      SEARCH: '/api/providers/search',
      VERIFY: (id: string) => `/api/providers/${id}/verify`,
      REVIEWS: (id: string) => `/api/providers/${id}/reviews`,
      AVAILABILITY: (id: string) => `/api/providers/${id}/availability`,
    },
    BOOKINGS: {
      BASE: '/api/bookings',
      CREATE: '/api/bookings/create',
      UPDATE: (id: string) => `/api/bookings/${id}`,
      CANCEL: (id: string) => `/api/bookings/${id}/cancel`,
    },
    PAYMENTS: {
      BASE: '/api/payments',
      CREATE: '/api/payments/create',
      REFUND: (id: string) => `/api/payments/${id}/refund`,
      PAYOUT: '/api/payments/payout',
    },
    OFFICES: {
      BASE: '/api/offices',
      BOOK: '/api/offices/book',
      AVAILABILITY: '/api/offices/availability',
    },
    UPLOAD: '/api/upload',
    NOTIFICATIONS: '/api/notifications',
    ANALYTICS: '/api/analytics',
  },
} as const;

// Route groups for navigation
export const NAVIGATION_ROUTES = {
  CUSTOMER: [
    { name: 'Dashboard', path: ROUTES.CUSTOMER.DASHBOARD, icon: '🏠' },
    { name: 'Bookings', path: ROUTES.CUSTOMER.BOOKINGS, icon: '📅' },
    { name: 'Completed Jobs', path: ROUTES.CUSTOMER.AVAILED_JOBS, icon: '✅' },
    { name: 'Find Providers', path: ROUTES.CUSTOMER.SEARCH_PROVIDERS, icon: '🔍' },
    { name: 'Payments', path: ROUTES.CUSTOMER.PAYMENTS, icon: '💳' },
    { name: 'Profile', path: ROUTES.CUSTOMER.PROFILE, icon: '👤' },
  ],
  PROVIDER: [
    { name: 'Dashboard', path: ROUTES.PROVIDER.DASHBOARD, icon: '🏠' },
    { name: 'Onboarding', path: ROUTES.PROVIDER.ONBOARDING, icon: '📝' },
    { name: 'Jobs', path: ROUTES.PROVIDER.JOBS, icon: '💼' },
    { name: 'Earnings', path: ROUTES.PROVIDER.EARNINGS, icon: '💰' },
    { name: 'Office Booking', path: ROUTES.PROVIDER.OFFICE_BOOKING, icon: '🏢' },
    { name: 'Profile', path: ROUTES.PROVIDER.PROFILE, icon: '👤' },
  ],
  ADMIN: [
    { name: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD, icon: '🏠' },
    { name: 'Users', path: ROUTES.ADMIN.USERS, icon: '👥' },
    { name: 'Providers', path: ROUTES.ADMIN.PROVIDERS, icon: '🔧' },
    { name: 'Jobs', path: ROUTES.ADMIN.JOBS, icon: '💼' },
    { name: 'Finances', path: ROUTES.ADMIN.FINANCES, icon: '💰' },
    { name: 'Offices', path: ROUTES.ADMIN.OFFICES, icon: '🏢' },
    { name: 'Analytics', path: ROUTES.ADMIN.ANALYTICS, icon: '📊' },
  ],
  LSM: [
    { name: 'Dashboard', path: ROUTES.LSM.DASHBOARD, icon: '🏠' },
    { name: 'Providers', path: ROUTES.LSM.PROVIDERS, icon: '🔧' },
    { name: 'Jobs', path: ROUTES.LSM.JOBS, icon: '💼' },
  ],
} as const;

// Protected routes configuration
export const PROTECTED_ROUTES = {
  CUSTOMER: [
    ROUTES.CUSTOMER.DASHBOARD,
    ROUTES.CUSTOMER.BOOKINGS,
    ROUTES.CUSTOMER.SEARCH_PROVIDERS,
    ROUTES.CUSTOMER.PAYMENTS,
    ROUTES.CUSTOMER.PROFILE,
    ROUTES.CUSTOMER.SETTINGS,
  ],
  PROVIDER: [
    ROUTES.PROVIDER.DASHBOARD,
    ROUTES.PROVIDER.ONBOARDING,
    ROUTES.PROVIDER.JOBS,
    ROUTES.PROVIDER.EARNINGS,
    ROUTES.PROVIDER.OFFICE_BOOKING,
    ROUTES.PROVIDER.PROFILE,
    ROUTES.PROVIDER.SETTINGS,
  ],
  ADMIN: [
    ROUTES.ADMIN.DASHBOARD,
    ROUTES.ADMIN.USERS,
    ROUTES.ADMIN.PROVIDERS,
    ROUTES.ADMIN.JOBS,
    ROUTES.ADMIN.FINANCES,
    ROUTES.ADMIN.OFFICES,
    ROUTES.ADMIN.ANALYTICS,
    ROUTES.ADMIN.SETTINGS,
  ],
  LSM: [
    ROUTES.LSM.DASHBOARD,
    ROUTES.LSM.PROVIDERS,
    ROUTES.LSM.JOBS,
  ],
} as const;

// Route validation helpers
export function isProtectedRoute(path: string): boolean {
  return Object.values(PROTECTED_ROUTES).some(routes => 
    routes.some(route => path.startsWith(route))
  );
}

export function getRequiredRole(path: string): string | null {
  for (const [role, routes] of Object.entries(PROTECTED_ROUTES)) {
    if (routes.some(route => path.startsWith(route))) {
      return role.toLowerCase();
    }
  }
  return null;
}

export function getRedirectPath(role: string): string {
  switch (role.toLowerCase()) {
    case 'customer':
      return ROUTES.CUSTOMER.DASHBOARD;
    case 'provider':
      return ROUTES.PROVIDER.DASHBOARD;
    case 'admin':
      return ROUTES.ADMIN.DASHBOARD;
    case 'lsm':
      return ROUTES.LSM.DASHBOARD;
    default:
      return ROUTES.HOME;
  }
}


