import OTP from '../models/OTP.js';
import ApiError from '../utils/ApiError.js';
import emailService from './emailService.js';

class OTPService {
  // Generate a 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Normalize email to avoid casing/spacing mismatches
  normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  // Create and send OTP
  async createAndSendOTP(email, type = 'email_verification') {
    const normalizedEmail = this.normalizeEmail(email);

    // Delete any existing OTPs for this email and type
    await OTP.deleteMany({ email: normalizedEmail, type });

    // Generate new OTP
    const otpCode = this.generateOTP();

    // Save OTP to database
    await OTP.create({
      email: normalizedEmail,
      otp: otpCode,
      type,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // ALWAYS log OTP to console for easy access
    console.log('\n' + '='.repeat(60));
    console.log('🔐 OTP CODE FOR VERIFICATION');
    console.log('='.repeat(60));
    console.log(`📧 Email: ${normalizedEmail}`);
    console.log(`🔢 OTP: ${otpCode}`);
    console.log(`⏰ Expires: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}`);
    console.log('⏱️  Valid for: 10 minutes');
    console.log('='.repeat(60) + '\n');

    // Send OTP via email and fail the request if delivery fails
    try {
      if (type === 'email_verification') {
        await emailService.sendOTPEmail(normalizedEmail, otpCode);
        console.log(`✅ OTP email sent successfully to ${normalizedEmail}`);
      } else if (type === 'password_reset') {
        await emailService.sendPasswordResetOTP(normalizedEmail, otpCode);
        console.log(`✅ Password reset OTP sent successfully to ${normalizedEmail}`);
      } else {
        throw new Error(`Unsupported OTP type: ${type}`);
      }
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error?.message || error);

      // Remove OTP record if email was not sent to avoid unusable OTPs in DB
      await OTP.deleteMany({ email: normalizedEmail, type });

      throw ApiError.internal('Failed to send OTP email. Please verify email settings and try again.');
    }

    return {
      message: 'OTP sent successfully',
      expiresIn: 600, // 10 minutes in seconds
    };
  }

  // Verify OTP
  async verifyOTP(email, otpCode, type = 'email_verification') {
    const normalizedEmail = this.normalizeEmail(email);

    const otp = await OTP.findOne({
      email: normalizedEmail,
      type,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otp) {
      throw ApiError.badRequest('OTP not found or already verified');
    }

    // Check if OTP is expired
    if (otp.expiresAt < Date.now()) {
      await OTP.deleteOne({ _id: otp._id });
      throw ApiError.badRequest('OTP has expired. Please request a new one');
    }

    // Check attempts
    if (otp.attempts >= 5) {
      await OTP.deleteOne({ _id: otp._id });
      throw ApiError.badRequest('Too many failed attempts. Please request a new OTP');
    }

    // Verify OTP
    if (otp.otp !== otpCode) {
      otp.attempts += 1;
      await otp.save();
      throw ApiError.badRequest(`Invalid OTP. ${5 - otp.attempts} attempts remaining`);
    }

    // Mark as verified
    otp.verified = true;
    await otp.save();

    return {
      message: 'OTP verified successfully',
      verified: true,
    };
  }

  // Resend OTP
  async resendOTP(email, type = 'email_verification') {
    const normalizedEmail = this.normalizeEmail(email);

    // Check if there's a recent OTP (within last 1 minute)
    const recentOTP = await OTP.findOne({
      email: normalizedEmail,
      type,
      createdAt: { $gte: Date.now() - 60 * 1000 },
    });

    if (recentOTP) {
      throw ApiError.badRequest('Please wait 1 minute before requesting a new OTP');
    }

    return this.createAndSendOTP(normalizedEmail, type);
  }

  // Clean up expired OTPs (optional, as MongoDB TTL index handles this)
  async cleanupExpiredOTPs() {
    const result = await OTP.deleteMany({
      expiresAt: { $lt: Date.now() },
    });
    return result.deletedCount;
  }
}

export default new OTPService();
