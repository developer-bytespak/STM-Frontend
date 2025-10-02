# EmailJS Quick Setup ⚡

## Step 1: Get Your Credentials

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Copy these three values:

```
Service ID:   service_________
Template ID:  template_________
Public Key:   ________________
```

## Step 2: Update Configuration

Edit: `STM-Frontend/src/lib/emailjs.ts`

Replace lines 5-7 with your actual credentials:

```typescript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_abc123',      // ← Your Service ID here
  TEMPLATE_ID: 'template_xyz789',    // ← Your Template ID here
  PUBLIC_KEY: 'abcdef123456',        // ← Your Public Key here
};
```

## Step 3: Email Template

Use this exact template in EmailJS (copy & paste):

### Subject Line
```
Your OTP Code for ServiceProStars
```

### Email Body (HTML)
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1e3a8a;">Hello {{to_name}},</h2>
  
  <p style="font-size: 16px; color: #333;">
    Thank you for choosing ServiceProStars! Your verification code is:
  </p>
  
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
    <h1 style="color: #1e3a8a; font-size: 36px; letter-spacing: 8px; margin: 0;">
      {{otp_code}}
    </h1>
  </div>
  
  <p style="font-size: 14px; color: #666;">
    This code will expire in <strong>{{expiry_minutes}} minutes</strong>.
  </p>
  
  <p style="font-size: 14px; color: #666;">
    If you didn't request this code, please ignore this email.
  </p>
  
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #999; text-align: center;">
    Best regards,<br>
    <strong>{{company_name}}</strong> Team
  </p>
</div>
```

## Step 4: Test

```bash
cd STM-Frontend
npm run dev
```

Go to: http://localhost:3000/customer/signup

---

## Template Variables Reference

Make sure these variables are in your EmailJS template:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{to_name}}` | User's name | "John Doe" |
| `{{to_email}}` | User's email | "john@example.com" |
| `{{otp_code}}` | 6-digit OTP | "123456" |
| `{{company_name}}` | Company name | "ServiceProStars" |
| `{{expiry_minutes}}` | OTP validity | "5" |

---

## Quick Test Checklist

- [ ] EmailJS account created
- [ ] Email service connected (Gmail/Outlook/etc)
- [ ] Email template created with variables above
- [ ] Credentials updated in `emailjs.ts`
- [ ] `npm install` completed
- [ ] `npm run dev` running
- [ ] Test signup works
- [ ] OTP email received
- [ ] OTP verification works
- [ ] Redirects to dashboard

---

## Common Issues

**"Failed to send email"**
- Check credentials are correct
- Verify email service is connected
- Check EmailJS dashboard for errors

**OTP not received**
- Check spam/junk folder
- Try different email provider
- Verify template variables match exactly

**Network error**
- Check internet connection
- Verify EmailJS service is active
- Check browser console for errors

---

Need help? Check `CUSTOMER_AUTH_SETUP.md` for detailed guide.


