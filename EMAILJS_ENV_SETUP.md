# EmailJS Environment Variables Setup

## Quick Setup

### Step 1: Create `.env.local` file

In the `STM-Frontend` folder, create a file named `.env.local` with this content:

```env
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Step 2: Add Your Credentials

Replace the placeholder values with your actual EmailJS credentials:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=abcdef123456
```

### Step 3: Restart Dev Server

If your dev server is running, restart it to load the new environment variables:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Important Notes

### ✅ Security
- `.env.local` is already in `.gitignore` - your credentials won't be committed to git
- `NEXT_PUBLIC_` prefix is required for client-side access in Next.js

### ✅ File Location
```
STM-Frontend/
├── .env.local          ← Create this file here
├── src/
├── package.json
└── ...
```

### ✅ Verification

To verify it's working, check the browser console after submitting the signup form. You should see either:
- ✅ OTP sent successfully
- ❌ Error with credential details if something is wrong

---

## Example `.env.local` File

Copy and paste this into your `.env.local` file, then replace with your credentials:

```env
# EmailJS Configuration
# Get these from https://dashboard.emailjs.com/

# Service ID (looks like: service_abc123)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here

# Template ID (looks like: template_xyz789)
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here

# Public Key (looks like: abcdef123456)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

---

## Troubleshooting

**"Failed to send email" error:**
- Check that `.env.local` file exists in `STM-Frontend/` folder
- Verify all three credentials are correct
- Restart the dev server (`npm run dev`)
- Check for typos in variable names (must match exactly)

**Environment variables not loading:**
- File must be named `.env.local` exactly (not `.env.txt` or `.env`)
- File must be in the `STM-Frontend/` root folder
- Server must be restarted after creating/editing `.env.local`
- Variables must start with `NEXT_PUBLIC_` for client-side use

---

## Template Guide

Your EmailJS template should include these variables:

- `{{to_name}}` - Recipient's name
- `{{to_email}}` - Recipient's email (auto-filled by EmailJS)
- `{{otp_code}}` - The 6-digit OTP
- `{{company_name}}` - Set to "ServiceProStars"
- `{{expiry_minutes}}` - Set to "5"

See `EMAILJS_SETUP_QUICK.md` for the complete email template.

