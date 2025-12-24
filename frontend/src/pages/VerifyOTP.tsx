import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, Shield, CheckCircle2 } from 'lucide-react';
import uniEdLogo from "@/assets/UniEdlogoo.png";
import eduBg1 from "@/assets/edu-bg-1.jpg";
import eduBg2 from "@/assets/edu-bg-2.jpg";
import eduBg3 from "@/assets/edu-bg-3.jpg";
import eduBg4 from "@/assets/edu-bg-4.jpg";

const securityContent = [
  {
    image: eduBg1,
    title: "Secure Email Verification",
    description: "Your account security is our top priority. Verify your email to unlock full access to UniEd's features."
  },
  {
    image: eduBg2,
    title: "Protected Access",
    description: "One-time passwords ensure that only you can access your account and educational resources."
  },
  {
    image: eduBg3,
    title: "Safe & Encrypted",
    description: "All verification codes are encrypted and expire after 10 minutes for maximum security."
  },
  {
    image: eduBg4,
    title: "Almost There!",
    description: "Just one more step to join thousands of students and educators on UniEd platform."
  }
];

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentContentIndex((prev) => (prev + 1) % securityContent.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyOTP(email, otp);
      setSuccess('Email verified successfully! Redirecting...');
      
      // Store tokens and user data
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Transform backend user to frontend user format
      const userData = {
        id: response.user._id,
        email: response.user.email,
        role: response.user.role,
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        name: `${response.user.firstName || ''} ${response.user.lastName || ''}`.trim(),
        avatar: response.user.avatar,
        studentId: response.user.studentId,
        employeeId: response.user.employeeId,
        department: response.user.department,
        semester: response.user.semester,
      };
      
      localStorage.setItem('edu_user', JSON.stringify(userData));
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      await authService.resendOTP(email);
      setSuccess('OTP resent successfully! Check your email.');
      setCountdown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Dynamic Content with Purple Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-indigo-900/90 to-purple-800/95 z-10" />
        <motion.img
          key={currentContentIndex}
          src={securityContent[currentContentIndex].image}
          alt={securityContent[currentContentIndex].title}
          className="object-cover w-full h-full opacity-20"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-30">
          {/* Branding with Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <Shield className="w-10 h-10 text-purple-300" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={uniEdLogo} alt="UniEd" className="h-12 w-auto" />
              <h1 className="font-display text-5xl font-bold text-white">UniEd</h1>
            </div>
            <p className="text-white/90 text-xl font-medium mb-2">Secure Verification</p>
            <div className="w-24 h-1 bg-purple-400 mx-auto rounded-full" />
          </motion.div>

          {/* Dynamic Content */}
          <motion.div
            key={currentContentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center max-w-lg mb-8"
          >
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Safe & Encrypted
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              All verification codes are encrypted and expire after 10 minutes for maximum security.
            </p>
          </motion.div>

          {/* Security badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex gap-8"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 bg-green-500/20 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-white/70">Encrypted</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 bg-green-500/20 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-white/70">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 bg-green-500/20 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-white/70">Private</span>
            </div>
          </motion.div>

          {/* Content indicators */}
          <div className="flex gap-2 mt-12">
            {securityContent.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentContentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentContentIndex
                    ? "bg-purple-400 w-8"
                    : "bg-white/30 w-2 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form with Dark Background */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-950">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo and Back Button */}
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={uniEdLogo} alt="UniEd" className="h-8 w-auto" />
              <span className="font-display text-2xl font-bold text-white">UniEd</span>
            </Link>
            <Link to="/signup" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Signup
            </Link>
          </div>

          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                <Mail className="h-10 w-10 text-indigo-400" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2 text-white">Verify Your Email</h1>
            <p className="text-gray-400">
              We've sent a 6-digit OTP to<br />
              <span className="font-semibold text-indigo-400">{email}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-500/10 border-green-500/50 text-green-400">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-gray-300">
                Enter OTP
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                className="text-center text-3xl tracking-[0.5em] font-bold bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500 text-center">
                ⏰ OTP expires in 10 minutes
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-6 text-lg"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-400">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOTP}
                disabled={resendLoading || countdown > 0}
                className="w-full bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : countdown > 0 ? (
                  `Resend OTP in ${countdown}s`
                ) : (
                  'Resend OTP'
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <a href="mailto:support@unied.com" className="text-indigo-400 hover:text-indigo-300">
                Contact Support
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
