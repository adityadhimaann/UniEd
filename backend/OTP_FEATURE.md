# OTP Email Verification Feature

## Overview
This feature implements OTP (One-Time Password) email verification for new user registrations. When a user signs up with a new email, they receive a 6-digit OTP code that must be verified before they can access the platform.

## Backend Implementation

### 1. OTP Model (`backend/src/models/OTP.js`)
- Stores OTP codes with email, type, expiration time, and verification status
- Automatically deletes expired OTPs using MongoDB TTL index
- Tracks failed verification attempts (max 5 attempts)
- OTP expires after 10 minutes

### 2. OTP Service (`backend/src/services/otpService.js`)
- `generateOTP()`: Generates a random 6-digit OTP
- `createAndSendOTP(email, type)`: Creates OTP and sends via email
- `verifyOTP(email, otpCode, type)`: Verifies the OTP code
- `resendOTP(email, type)`: Resends OTP with 1-minute cooldown

### 3. Email Service Updates (`backend/src/services/emailService.js`)
- `sendOTPEmail(email, otp)`: Sends OTP for email verification
- `sendPasswordResetOTP(email, otp)`: Sends OTP for password reset
- Beautiful HTML email templates with OTP display

### 4. Auth Service Updates (`backend/src/services/authService.js`)
- Modified `register()`: Creates user with `isVerified: false` and sends OTP
- Added `verifyEmailOTP()`: Verifies OTP and marks user as verified, returns tokens
- Modified `login()`: Checks if email is verified before allowing login

### 5. Auth Controller Updates (`backend/src/controllers/authController.js`)
- `verifyOTP`: Endpoint to verify OTP code
- `resendOTP`: Endpoint to resend OTP code

### 6. Auth Routes Updates (`backend/src/routes/authRoutes.js`)
- `POST /auth/verify-otp`: Verify OTP code
- `POST /auth/resend-otp`: Resend OTP code

## Frontend Implementation

### 1. Auth Service Updates (`frontend/src/services/authService.ts`)
- `register()`: Returns email and message instead of tokens
- `verifyOTP(email, otp)`: Verifies OTP and returns user data with tokens
- `resendOTP(email)`: Requests a new OTP

### 2. Auth Context Updates (`frontend/src/contexts/AuthContext.tsx`)
- Modified `signup()`: Returns response for OTP verification flow
- Updated return type to `Promise<{ email: string; message: string }>`

### 3. Verify OTP Page (`frontend/src/pages/VerifyOTP.tsx`)
- Beautiful UI for OTP input
- 6-digit OTP input field
- Resend OTP button with 60-second cooldown
- Auto-redirect to dashboard after successful verification
- Error handling with attempt tracking

### 4. Signup Page Updates (`frontend/src/pages/Signup.tsx`)
- Redirects to `/verify-otp` after successful registration
- Passes email via navigation state

### 5. Router Updates (`frontend/src/App.tsx`)
- Added `/verify-otp` route

## User Flow

1. **Registration**:
   - User fills out signup form
   - Backend creates user with `isVerified: false`
   - OTP is generated and sent to user's email
   - User is redirected to OTP verification page

2. **OTP Verification**:
   - User enters 6-digit OTP from email
   - Backend verifies OTP and marks user as verified
   - User receives access and refresh tokens
   - User is redirected to dashboard

3. **Login**:
   - User attempts to login
   - Backend checks if email is verified
   - If not verified, login is blocked with message to verify email
   - If verified, login proceeds normally

## Security Features

- OTP expires after 10 minutes
- Maximum 5 verification attempts per OTP
- 1-minute cooldown between OTP resend requests
- OTPs are automatically deleted after expiration (MongoDB TTL)
- Email verification required before login

## Email Configuration

Make sure to configure email settings in `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="UniEd <noreply@unied.com>"
FRONTEND_URL=http://localhost:5173
```

## Testing

### Development Mode
In development, if email sending fails, the OTP is logged to the console:
```
🔐 OTP for user@example.com: 123456
```

### API Endpoints

1. **Register**:
```bash
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

2. **Verify OTP**:
```bash
POST /api/v1/auth/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
}
```

3. **Resend OTP**:
```bash
POST /api/v1/auth/resend-otp
{
  "email": "user@example.com"
}
```

## Future Enhancements

- SMS OTP option
- OTP for password reset (already implemented in service)
- Configurable OTP expiration time
- Rate limiting for OTP requests
- Two-factor authentication (2FA)
