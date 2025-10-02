# Customer Authentication Setup Guide

## Overview

This customer authentication system implements a secure OTP-based signup and login flow using EmailJS for email delivery. The system includes:

- ✅ Customer Signup with OTP verification
- ✅ Customer Login with OTP verification
- ✅ Multi-step form flow (Form → OTP → Success)
- ✅ Email masking for security
- ✅ Resend limits (3 attempts)
- ✅ 5-minute OTP expiry
- ✅ Navy & White theme
- ✅ Mock API for backend simulation
- ✅ localStorage session management

## 🚀 Quick Start

### 1. EmailJS Configuration

#### Step 1: Create EmailJS Account
1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

#### Step 2: Add Email Service
1. Go to **Email Services** in your dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the connection instructions
5. Copy your **Service ID** (e.g., `service_abc123`)

#### Step 3: Create Email Template
1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template structure:

**Subject:**
```
Your OTP Code for ServiceProStars
```

**Content:**
```html
<h2>Hello {{to_name}},</h2>

<p>Your verification code is:</p>

<h1 style="color: #1e3a8a; font-size: 32px; letter-spacing: 5px;">
  {{otp_code}}
</h1>

<p>This code will expire in <strong>{{expiry_minutes}} minutes</strong>.</p>

<p>If you didn't request this code, please ignore this email.</p>

<hr>
<p style="color: #666; font-size: 12px;">
  Best regards,<br>
  {{company_name}} Team
</p>
```

4. Save and copy your **Template ID** (e.g., `template_xyz789`)

#### Step 4: Get Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `abcdef123456`)

#### Step 5: Update Configuration
Edit `STM-Frontend/src/lib/emailjs.ts`:

```typescript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_abc123',      // Your Service ID
  TEMPLATE_ID: 'template_xyz789',    // Your Template ID
  PUBLIC_KEY: 'abcdef123456',        // Your Public Key
};
```

### 2. Running the Application

```bash
cd STM-Frontend
npm install
npm run dev
```

Visit:
- **Signup:** http://localhost:3000/customer/signup
- **Login:** http://localhost:3000/customer/login
- **Dashboard:** http://localhost:3000/customer/dashboard

## 📁 Project Structure

```
STM-Frontend/
├── src/
│   ├── app/
│   │   ├── customer/
│   │   │   ├── signup/page.tsx       # Signup page with multi-step flow
│   │   │   ├── login/page.tsx        # Login page with OTP
│   │   │   └── dashboard/page.tsx    # Customer dashboard
│   │   └── globals.css               # Navy theme styles
│   │
│   ├── components/
│   │   └── auth/
│   │       ├── OTPInput.tsx          # 6-digit OTP input component
│   │       ├── OTPVerification.tsx   # OTP verification UI
│   │       └── SuccessScreen.tsx     # Success animation
│   │
│   ├── lib/
│   │   ├── emailjs.ts                # EmailJS configuration
│   │   ├── otp.ts                    # OTP generation & validation
│   │   ├── validation.ts             # Form validation utilities
│   │   └── mockAuthApi.ts            # Mock backend API
│   │
│   ├── hooks/
│   │   ├── useOTPTimer.ts            # OTP countdown timer
│   │   └── useOTPVerification.ts     # OTP verification logic
│   │
│   └── types/
│       └── auth.ts                   # TypeScript type definitions
```

## 🔐 Authentication Flow

### Signup Flow
```
1. User fills signup form (Name, Email, Phone, Password, T&C)
2. System validates all fields
3. System checks if email already exists
4. System generates 6-digit OTP
5. System sends OTP via EmailJS
6. System stores OTP session (localStorage)
7. User enters OTP (6 digits)
8. System validates OTP
9. System activates user account
10. Redirect to dashboard
```

### Login Flow
```
1. User enters email
2. System checks if user exists and is active
3. System generates 6-digit OTP
4. System sends OTP via EmailJS
5. System stores OTP session (localStorage)
6. User enters OTP
7. System validates OTP
8. System creates auth session
9. Redirect to dashboard
```

## 🎨 Theme Customization

The application uses a **Navy & White** color scheme defined in `globals.css`:

```css
--navy-50: #f8fafc;   /* Light background */
--navy-100: #e0e7ff;  /* Very light navy */
--navy-600: #1e3a8a;  /* Primary navy */
--navy-900: #0f172a;  /* Dark navy */
```

## ✅ Features Implemented

### Form Validation
- ✅ Email format validation
- ✅ Password strength indicator (weak/medium/strong)
- ✅ Phone number validation (Pakistani format)
- ✅ Name validation
- ✅ Terms & Conditions checkbox requirement
- ✅ Real-time error messages

### OTP Verification
- ✅ 6-digit OTP input with auto-focus
- ✅ Paste support (Ctrl+V)
- ✅ Keyboard navigation (Arrow keys, Backspace)
- ✅ Email masking (j***@gmail.com)
- ✅ Phone masking (+92******67)
- ✅ 60-second resend timer
- ✅ 3 resend attempts limit
- ✅ 5 verification attempts per OTP
- ✅ 5-minute OTP expiry
- ✅ Clear error messages

### Edge Cases Handled
- ✅ Email already registered → Suggest login
- ✅ OTP expired → Allow resend
- ✅ Wrong OTP → Show attempts remaining
- ✅ Max resend limit → Show error message
- ✅ Network errors → Retry with error banner
- ✅ Session timeout → Return to signup
- ✅ User not found → Suggest signup

### UX Enhancements
- ✅ Success animation with checkmark
- ✅ Auto-redirect countdown (2 seconds)
- ✅ Loading states for all async operations
- ✅ Smooth transitions and animations
- ✅ Responsive design (mobile-first)
- ✅ Accessibility (ARIA labels, keyboard support)

## 🧪 Testing the System

### Test Signup Flow
1. Go to `/customer/signup`
2. Fill in valid details:
   - Name: John Doe
   - Email: your-test-email@gmail.com
   - Phone: 03001234567
   - Password: Test1234
   - Accept terms
3. Click "Create Account"
4. Check your email for OTP
5. Enter OTP on verification screen
6. Success! Redirected to dashboard

### Test Login Flow
1. Go to `/customer/login`
2. Enter registered email
3. Click "Send Verification Code"
4. Check email for OTP
5. Enter OTP
6. Success! Redirected to dashboard

### Test Edge Cases
- **Email exists:** Try signing up with existing email
- **Wrong OTP:** Enter incorrect code
- **Expired OTP:** Wait 5+ minutes before entering code
- **Resend limit:** Click resend 3+ times
- **Network error:** Disconnect internet and try

## 📝 Mock API Details

The system uses `localStorage` to simulate a backend:

### Data Storage Keys
- `otp_session` - Current OTP session data
- `mock_users_db` - All registered users
- `auth_token` - User authentication token
- `user_email` - Logged in user's email
- `user_role` - User's role (customer)

### User Object Structure
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;  // Not hashed (mock only!)
  status: 'pending' | 'active';
  role: 'customer';
  createdAt: string;
}
```

## 🔄 Integration with Real Backend

When ready to integrate with your NestJS backend:

1. **Replace Mock API Calls**
   - Edit `STM-Frontend/src/lib/mockAuthApi.ts`
   - Replace functions with actual API calls

2. **Backend Endpoints Needed**
   ```
   POST /auth/signup          - Register user
   POST /auth/verify-otp      - Verify OTP
   POST /auth/login           - Login user
   POST /auth/resend-otp      - Resend OTP
   GET  /auth/check-email     - Check if email exists
   ```

3. **Move OTP Generation to Backend**
   - Currently OTP is generated client-side
   - Move `generateOTP()` logic to backend
   - Backend should store OTP with expiry in database

4. **Session Management**
   - Replace localStorage with httpOnly cookies
   - Implement JWT tokens
   - Add refresh token mechanism

## 🚨 Security Notes

**Current Implementation (Development Only):**
- OTP is generated client-side (not secure for production)
- Passwords are stored plain-text in localStorage
- No rate limiting on API calls
- Sessions stored in localStorage (vulnerable to XSS)

**Production Requirements:**
- Move OTP generation to backend
- Hash passwords with bcrypt
- Implement CSRF protection
- Use httpOnly cookies for sessions
- Add rate limiting on endpoints
- Implement IP-based blocking for brute force
- Use HTTPS only
- Add captcha for signup/login

## 📧 EmailJS Template Variables

Available variables in your template:
- `{{to_name}}` - User's name
- `{{to_email}}` - User's email
- `{{otp_code}}` - 6-digit OTP
- `{{company_name}}` - "ServiceProStars"
- `{{expiry_minutes}}` - "5"

## 🎯 Next Steps

1. ✅ Configure EmailJS credentials
2. ✅ Test signup and login flows
3. ⏳ Design customer dashboard features
4. ⏳ Integrate with real backend API
5. ⏳ Implement proper session management
6. ⏳ Add password reset functionality
7. ⏳ Add social login (Google, Facebook)
8. ⏳ Add two-factor authentication
9. ⏳ Implement email preferences
10. ⏳ Add profile management

## 🐛 Troubleshooting

### EmailJS Not Sending
- Check your service is connected
- Verify template ID and service ID
- Check email quota (free tier: 200/month)
- Ensure template variables match exactly

### OTP Not Received
- Check spam folder
- Verify email service connection
- Test with different email provider
- Check EmailJS dashboard for errors

### OTP Verification Fails
- Check OTP is not expired (5 minutes)
- Ensure correct email is being used
- Clear localStorage and try again
- Check browser console for errors

### Cannot Access Dashboard
- Check if auth_token exists in localStorage
- Verify login was successful
- Clear all localStorage and re-login

## 📞 Support

For issues or questions:
- Check browser console for errors
- Review EmailJS dashboard logs
- Test with different browsers
- Clear cache and localStorage

---

**Built with:** Next.js 15, React 19, TypeScript, Tailwind CSS, EmailJS
**Theme:** Navy & White
**Company:** ServiceProStars


