# Authentication Redirect Flow - Implementation Guide

## Overview
This document explains the smart authentication redirect system that provides optimal UX for different user types.

## Authentication Flow Behavior

### 🎯 Role-Based Redirects

#### **Admin & LSM (Management Users)**
- **Always** redirect to dashboard after login/signup
- **Reason**: They're managing the platform, not browsing services
- **Destinations**:
  - Admin → `/admin/dashboard`
  - LSM → `/lsm/dashboard`

#### **Customer & Provider (Consumer Users)**
- **Smart redirect** based on context:
  - **With returnUrl**: Go back to the page they were on
  - **Without returnUrl**: Go to homepage `/`
- **Reason**: They browse services/providers, so should return to where they left off

## How It Works

### 1. **Capturing Current Page (Header Component)**
When a user clicks "Login" or "Sign Up" from any page:

```tsx
// Header.tsx automatically captures current path
const pathname = usePathname();
const returnUrl = !isAuthPage && pathname ? `?returnUrl=${encodeURIComponent(pathname)}` : '';

// Login link becomes: /login?returnUrl=/services/plumbing
<Link href={`/login${returnUrl}`}>Login</Link>
```

### 2. **Reading returnUrl (Login/Signup Pages)**
All auth pages read the returnUrl parameter:

```tsx
const searchParams = useSearchParams();
const returnUrl = searchParams.get('returnUrl');
```

### 3. **Smart Redirect After Auth (useAuth Hook)**
The authentication system decides where to send users:

```tsx
// For Admin/LSM: Always dashboard
if (userData.role === 'admin' || userData.role === 'local_service_manager') {
  redirectBasedOnRole(userData.role);
} else {
  // For Customer/Provider: Return to previous page or homepage
  if (returnUrl) {
    router.push(returnUrl);
  } else {
    router.push('/');
  }
}
```

## User Scenarios

### Scenario 1: Browsing Services
```
1. User on: /services/plumbing
2. Clicks "Login" → Redirects to /login?returnUrl=/services/plumbing
3. Logs in successfully
4. Returns to: /services/plumbing ✅
```

### Scenario 2: Direct Login Page Access
```
1. User navigates directly to: /login
2. Logs in successfully
3. Redirects to: / (homepage) ✅
```

### Scenario 3: Admin Login
```
1. Admin on any page
2. Clicks "Login" → /login?returnUrl=...
3. Logs in successfully
4. Redirects to: /admin/dashboard (ignores returnUrl) ✅
```

### Scenario 4: Protected Page Access
```
1. User tries to access: /customer/dashboard
2. Not authenticated → Redirects to /login?returnUrl=/customer/dashboard
3. Logs in successfully
4. Returns to: /customer/dashboard ✅
```

## Files Modified

### Core Auth Logic
- ✅ `src/hooks/useAuth.tsx` - Smart redirect logic
- ✅ `src/components/forms/LoginForm.tsx` - Test accounts handling

### Signup Pages
- ✅ `src/app/customer/signup/page.tsx` - Customer signup with returnUrl
- ✅ `src/components/forms/ProviderRegisterForm.tsx` - Provider signup with returnUrl
- ✅ `src/components/forms/RegisterForm.tsx` - General register form

### UI Components
- ✅ `src/components/layout/Header.tsx` - Auto-capture current page
- ✅ `src/components/auth/SuccessScreen.tsx` - Generic redirect messaging

### Admin
- ✅ `src/app/admin/login/page.tsx` - Admin-specific dashboard redirect

## Benefits

✨ **Better User Experience**
- Users don't lose their place when logging in
- No need to navigate back to where they were

🎯 **Role-Appropriate Behavior**
- Management users (Admin/LSM) go straight to work
- Consumer users (Customer/Provider) continue browsing

🔒 **Security Compatible**
- Works seamlessly with protected routes
- Supports returnUrl for auth-required pages

## Usage Example

### In Any Component (Adding Login Link)
```tsx
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function MyComponent() {
  const pathname = usePathname();
  const returnUrl = pathname ? `?returnUrl=${encodeURIComponent(pathname)}` : '';
  
  return (
    <Link href={`/login${returnUrl}`}>
      Sign In
    </Link>
  );
}
```

### In Protected Routes (Redirect to Login)
```tsx
// Middleware or component
const currentPath = window.location.pathname;
router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
```

## Testing

### Test Scenarios
1. ✅ Login from homepage → Returns to homepage
2. ✅ Login from service page → Returns to service page
3. ✅ Login from protected route → Returns to protected route
4. ✅ Admin login from anywhere → Goes to admin dashboard
5. ✅ Signup as customer from service page → Returns to service page
6. ✅ Signup as provider from anywhere → Returns to that page

### Test Accounts
```
Customer: customer@test.com / password123
Provider: provider@test.com / password123
Admin: admin@test.com / password123
LSM: lsm@test.com / password123
```

## Best Practices

1. **Always capture returnUrl** when redirecting to login/signup
2. **Use encodeURIComponent** to safely encode URLs
3. **Skip auth pages** - Don't create circular redirects
4. **Respect role** - Admin/LSM always go to dashboard
5. **Fallback to homepage** - If no returnUrl, go to `/`

---

**Implementation Date**: October 2025
**Last Updated**: October 8, 2025

