import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import uniEdLogo from "@/assets/UniEdlogoo.png";
import eduBg3 from "@/assets/edu-bg-3.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import authService from "@/services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      setIsSubmitted(true);
      
      // Show different message if in development mode with token
      if (response.resetToken) {
        toast({
          title: "Development Mode",
          description: "Email service not configured. Check browser console and server logs for reset link.",
          duration: 8000,
        });
        console.log('Reset Token:', response.resetToken);
        console.log('Reset URL:', `${window.location.origin}/reset-password?token=${response.resetToken}`);
      } else {
        toast({
          title: "Success",
          description: "Password reset link sent to your email",
        });
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={eduBg3}
            alt="Education"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
        </motion.div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold font-display mb-4">
              Reset Your Password
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Quick & Secure</p>
                  <p className="text-sm text-white/80">Reset link expires in 1 hour</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-8">
              <img src={uniEdLogo} alt="UniEd" className="w-16 h-10 object-contain" />
              <span className="font-display text-2xl font-bold">UniEd</span>
            </Link>

            {!isSubmitted ? (
              <>
                <h1 className="text-3xl font-bold font-display mb-2">
                  Forgot Password?
                </h1>
                <p className="text-muted-foreground mb-8">
                  No worries, we'll send you reset instructions.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                    {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold font-display">
                  Check Your Email
                </h1>
                <p className="text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary hover:underline"
                  >
                    try again
                  </button>
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="mt-4"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Login
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
