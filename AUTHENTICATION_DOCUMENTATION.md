# 🔐 Authentication System Documentation

## 📋 Overview

This document provides a complete overview of the authentication system built for ServiceProStars, including all signup flows, login processes, and user role management using localStorage.

---

## 🎯 System Architecture

### **User Roles & Hierarchy**
```
Admin
├── Local Service Manager (LSM)
│   ├── Service Provider (requires LSM approval)
│   └── Customer
```

### **Authentication Flow Types**
1. **Customer Signup & Login** - Simple email/password with OTP verification
2. **Service Provider Signup & Login** - Complex multi-step with LSM approval
3. **LSM Creation & Login** - Admin-created accounts with standard login
4. **Admin Creation & Login** - Separate secure login with OTP verification

---

## 📱 Complete Authentication Flows

### **1. Customer Authentication Flow**

#### **Signup Process:**
```
1. Visit: /customer/signup
2. Fill Form: firstName, lastName, email, phone, address, password
3. OTP Verification: EmailJS sends verification code
4. Success: Redirect to login page
5. Login: Use credentials at /login
6. Dashboard: Redirect to /customer/dashboard
```

#### **Required Fields:**
- ✅ First Name *
- ✅ Last Name *
- ✅ Email Address *
- ✅ Phone Number *
- ✅ Address *
- ✅ Password *

#### **Data Stored in localStorage:**
```json
{
  "id": "timestamp",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+92-300-1234567",
  "address": "123 Main St, City",
  "password": "password123",
  "role": "customer",
  "isEmailVerified": true,
  "approvalStatus": "approved",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### **2. Service Provider Authentication Flow**

#### **Signup Process:**
```
1. Visit: /serviceprovider/signup
2. Fill Personal Info: firstName, lastName, email, phone, password
3. Fill Service Info: serviceType, experience, location, minPrice, maxPrice
4. Optional: description, credibility documents
5. OTP Verification: EmailJS sends verification code
6. Success: Account created with approvalStatus: 'pending'
7. Login: Use credentials at /login
8. Dashboard: Redirect to /provider/dashboard?status=pending
9. Wait for LSM approval via email notification
```

#### **Required Fields:**
- ✅ First Name *
- ✅ Last Name *
- ✅ Email Address *
- ✅ Phone Number *
- ✅ Password *
- ✅ Primary Service Type *
- ✅ Experience Level *
- ✅ Service Area/Location *
- ✅ Minimum Price (PKR) *
- ✅ Maximum Price (PKR) *

#### **Optional Fields:**
- 📝 Tell About Yourself (Optional)
- 📎 Credibility Documents (Optional)
  - Upload File * (required if document added)
  - Document Description * (required if document added)

#### **Data Stored in localStorage:**
```json
{
  "id": "timestamp",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+92-300-1234568",
  "password": "password123",
  "role": "service_provider",
  "serviceType": "plumbing",
  "experience": "3-5 years",
  "description": "Professional plumber with 5 years experience",
  "location": "Karachi, Pakistan",
  "minPrice": 2000,
  "maxPrice": 5000,
  "documents": [
    {
      "fileName": "certificate.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "description": "Professional Plumbing Certificate"
    }
  ],
  "isEmailVerified": true,
  "approvalStatus": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### **3. LSM (Local Service Manager) Authentication Flow**

#### **Creation Process:**
```
1. Visit: /admin/create-test-lsm
2. Fill Form: firstName, lastName, email, phone, password
3. Create Account: Stored in localStorage with role: 'local_service_manager'
4. Login: Use credentials at /login
5. Dashboard: Redirect to /lsm/dashboard
```

#### **Required Fields:**
- ✅ First Name
- ✅ Last Name
- ✅ Email
- ✅ Phone
- ✅ Password

#### **Data Stored in localStorage:**
```json
{
  "id": "timestamp",
  "firstName": "Local",
  "lastName": "Manager",
  "email": "lsm@serviceprostars.com",
  "phone": "03001234568",
  "password": "lsm123",
  "role": "local_service_manager",
  "isEmailVerified": true,
  "approvalStatus": "approved",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### **4. Admin Authentication Flow**

#### **Creation Process:**
```
1. Visit: /admin/create-test-admin
2. Fill Form: firstName, lastName, email, phone, password
3. Create Account: Stored in localStorage with role: 'admin'
4. Login: Use credentials at /admin/login
5. OTP Verification: EmailJS sends verification code
6. Success: Redirect to /admin/dashboard
```

#### **Required Fields:**
- ✅ First Name
- ✅ Last Name
- ✅ Email
- ✅ Phone
- ✅ Password

#### **Data Stored in localStorage:**
```json
{
  "id": "timestamp",
  "firstName": "System",
  "lastName": "Admin",
  "email": "admin@serviceprostars.com",
  "phone": "03001234567",
  "password": "admin123",
  "role": "admin",
  "isEmailVerified": true,
  "approvalStatus": "approved",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔐 Login Processes

### **1. Generic Login (`/login`)**
**Used by:** Customers, Service Providers, LSM

#### **Process:**
```
1. Enter Email & Password
2. Validate against localStorage
3. Check email verification status
4. Redirect based on role and approval status
```

#### **Redirect Logic:**
```javascript
switch (role) {
  case 'customer':
    → /customer/dashboard
  case 'service_provider':
    if (approvalStatus === 'pending') → /provider/dashboard?status=pending
    else if (approvalStatus === 'approved') → /provider/dashboard
  case 'local_service_manager':
    → /lsm/dashboard
  case 'admin':
    → /admin/dashboard
}
```

### **2. Admin Login (`/admin/login`)**
**Used by:** Admin only

#### **Process:**
```
1. Enter Admin Email & Password
2. Validate admin credentials
3. Send OTP via EmailJS
4. Verify OTP
5. Redirect to /admin/dashboard
```

---

## 🔄 Password Reset Flow

### **Process:**
```
1. Visit: /forgot-password
2. Enter Email Address
3. Validate email exists in localStorage
4. Send OTP via EmailJS
5. Verify OTP
6. Enter New Password (twice for confirmation)
7. Update password in localStorage
8. Success: Redirect to login
```

---

## 📊 Complete URL Structure

### **Authentication URLs:**
| Purpose | URL | Method |
|---------|-----|--------|
| **Home Page** | `/` | GET |
| **Generic Login** | `/login` | GET/POST |
| **Admin Login** | `/admin/login` | GET/POST |
| **Customer Signup** | `/customer/signup` | GET/POST |
| **Service Provider Signup** | `/serviceprovider/signup` | GET/POST |
| **Forgot Password** | `/forgot-password` | GET/POST |
| **OTP Verification** | `/verify-otp` | GET/POST |

### **Dashboard URLs:**
| Role | URL |
|------|-----|
| **Customer** | `/customer/dashboard` |
| **Service Provider (Pending)** | `/provider/dashboard?status=pending` |
| **Service Provider (Approved)** | `/provider/dashboard` |
| **LSM** | `/lsm/dashboard` |
| **Admin** | `/admin/dashboard` |

### **Development Tools:**
| Purpose | URL |
|---------|-----|
| **Create Test Admin** | `/admin/create-test-admin` |
| **Create Test LSM** | `/admin/create-test-lsm` |

---

## 🛡️ Security Features

### **Authentication Security:**
- ✅ **Email Verification:** OTP required for all signups
- ✅ **Password Validation:** Both email and password checked together
- ✅ **Role-Based Access:** Different login flows for different roles
- ✅ **Admin Security:** Separate domain with additional OTP verification
- ✅ **Input Sanitization:** All inputs sanitized before processing

### **Data Storage:**
- ✅ **localStorage:** All user data stored locally for development
- ✅ **Session Management:** Tokens stored for authentication state
- ✅ **OTP Sessions:** Temporary OTP storage with expiration

---

## 📋 Form Validation

### **Email Validation:**
- Format validation
- Uniqueness check against existing users
- Required field with asterisk (*)

### **Password Validation:**
- Minimum 6 characters
- Required field with asterisk (*)
- Show/hide toggle functionality

### **Phone Validation:**
- Pakistani phone number format
- Required field with asterisk (*)

### **Required Field Indicators:**
- ✅ Red asterisk (*) for required fields
- ✅ Gray "(Optional)" text for optional fields

---

## 🔧 Technical Implementation

### **Key Components:**
- `OTPVerification` - Reusable OTP verification component
- `SuccessScreen` - Success confirmation component
- `authManager` - Authentication state management
- EmailJS integration for OTP delivery

### **Libraries Used:**
- Next.js 14 with App Router
- React Hooks (useState, useEffect)
- Tailwind CSS for styling
- EmailJS for email delivery

### **Data Flow:**
```
User Input → Validation → localStorage Storage → OTP Verification → Authentication → Role-Based Redirect
```

---

## 🧪 Testing Guide

### **Complete Testing Flow:**

1. **Test Customer Flow:**
   ```
   /customer/signup → Fill form → OTP → /login → /customer/dashboard
   ```

2. **Test Service Provider Flow:**
   ```
   /serviceprovider/signup → Fill form → OTP → /login → /provider/dashboard?status=pending
   ```

3. **Test LSM Flow:**
   ```
   /admin/create-test-lsm → Create → /login → /lsm/dashboard
   ```

4. **Test Admin Flow:**
   ```
   /admin/create-test-admin → Create → /admin/login → OTP → /admin/dashboard
   ```

5. **Test Password Reset:**
   ```
   /forgot-password → Email → OTP → New password → /login
   ```

---

## 📈 Statistics

### **Pages Created:** 12
1. `/` - Home page with navigation
2. `/login` - Generic login
3. `/admin/login` - Admin login
4. `/customer/signup` - Customer registration
5. `/serviceprovider/signup` - Service provider registration
6. `/forgot-password` - Password reset
7. `/customer/dashboard` - Customer dashboard
8. `/provider/dashboard` - Service provider dashboard
9. `/lsm/dashboard` - LSM dashboard
10. `/admin/dashboard` - Admin dashboard
11. `/admin/create-test-admin` - Admin creation utility
12. `/admin/create-test-lsm` - LSM creation utility

### **User Roles Supported:** 4
- Customer
- Service Provider
- Local Service Manager (LSM)
- Admin

### **Authentication Methods:** 2
- Generic Login (Customer, Provider, LSM)
- Secure Admin Login with OTP

### **Signup Flows:** 2
- Simple Customer Signup
- Complex Service Provider Signup with document upload

---

## 🚀 Future Enhancements

### **Backend Integration:**
- Replace localStorage with API calls
- Implement proper password hashing
- Add session management
- Database integration

### **Additional Features:**
- LSM approval workflow for service providers
- Email notifications for approval status
- Profile management
- Document management system

---

*This documentation covers the complete authentication system built for ServiceProStars using localStorage for development purposes.*
