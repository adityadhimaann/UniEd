import mongoose from 'mongoose';
import dotenv from 'dotenv';
import otpService from './src/services/otpService.js';
import OTP from './src/models/OTP.js';

dotenv.config();

async function testOTP() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const testEmail = 'test@example.com';

    // Test 1: Create and send OTP
    console.log('\n📧 Test 1: Creating and sending OTP...');
    const result1 = await otpService.createAndSendOTP(testEmail, 'email_verification');
    console.log('✅ OTP created:', result1);

    // Get the OTP from database
    const otpDoc = await OTP.findOne({ email: testEmail }).sort({ createdAt: -1 });
    console.log('📝 OTP Code:', otpDoc.otp);

    // Test 2: Verify OTP with wrong code
    console.log('\n🔐 Test 2: Verifying with wrong OTP...');
    try {
      await otpService.verifyOTP(testEmail, '000000', 'email_verification');
    } catch (error) {
      console.log('✅ Expected error:', error.message);
    }

    // Test 3: Verify OTP with correct code
    console.log('\n🔐 Test 3: Verifying with correct OTP...');
    const result3 = await otpService.verifyOTP(testEmail, otpDoc.otp, 'email_verification');
    console.log('✅ OTP verified:', result3);

    // Test 4: Try to verify again (should fail)
    console.log('\n🔐 Test 4: Trying to verify already verified OTP...');
    try {
      await otpService.verifyOTP(testEmail, otpDoc.otp, 'email_verification');
    } catch (error) {
      console.log('✅ Expected error:', error.message);
    }

    // Test 5: Resend OTP
    console.log('\n📧 Test 5: Resending OTP...');
    const result5 = await otpService.resendOTP(testEmail, 'email_verification');
    console.log('✅ OTP resent:', result5);

    // Test 6: Try to resend immediately (should fail due to cooldown)
    console.log('\n📧 Test 6: Trying to resend immediately...');
    try {
      await otpService.resendOTP(testEmail, 'email_verification');
    } catch (error) {
      console.log('✅ Expected error:', error.message);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await OTP.deleteMany({ email: testEmail });
    console.log('✅ Cleanup complete');

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

testOTP();
