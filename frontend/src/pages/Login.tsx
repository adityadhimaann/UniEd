import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import uniEdLogo from "@/assets/UniEdlogoo.png";
import eduBg1 from "@/assets/edu-bg-1.jpg";
import eduBg2 from "@/assets/edu-bg-2.jpg";
import eduBg3 from "@/assets/edu-bg-3.jpg";
import eduBg4 from "@/assets/edu-bg-4.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const educationContent = [
  {
    image: eduBg1,
    title: "Transform Your Learning Experience",
    description: "Join thousands of students discovering a new way to learn, engage, and succeed in their educational journey."
  },
  {
    image: eduBg2,
    title: "Connect. Learn. Grow. Together.",
    description: "Building bridges between students, educators, and knowledge through innovative educational technology."
  },
  {
    image: eduBg3,
    title: "Empowering Education for Tomorrow",
    description: "Revolutionizing how students and teachers interact, collaborate, and achieve academic excellence."
  },
  {
    image: eduBg4,
    title: "Your Gateway to Academic Success",
    description: "Comprehensive tools and resources designed to support every step of your educational journey."
  }
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentContentIndex((prev) => (prev + 1) % educationContent.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show error message if redirected from OAuth with error
    if (errorParam) {
      let errorMessage = 'Authentication failed';
      
      if (errorParam === 'account_exists') {
        errorMessage = 'An account with this email already exists. Please login with your email and password instead.';
      } else if (errorParam === 'google_auth_failed' || errorParam === 'auth_failed') {
        errorMessage = 'Google authentication failed. Please try again.';
      }
      
      toast({
        title: 'Authentication Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // Clear the error from URL
      navigate('/login', { replace: true });
    }
  }, [errorParam, toast, navigate]);

  useEffect(() => {
    // Show error message if present in URL
    if (errorParam) {
      toast({
        title: "Error",
        description: errorParam,
        variant: "destructive",
      });
    }
  }, [errorParam, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Dynamic Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/80 z-10" />
        <motion.img
          key={currentContentIndex}
          src={educationContent[currentContentIndex].image}
          alt={educationContent[currentContentIndex].title}
          className="object-cover w-full h-full"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-20" />
        
        {/* Website branding and content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-30">
          {/* Central Branding */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="font-display text-5xl font-bold text-white">UniEd</h1>
            </div>
            <p className="text-white/90 text-xl font-medium mb-2">Unified Education Platform</p>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
          </motion.div>

          {/* Dynamic Content */}
          <motion.div
            key={currentContentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center max-w-lg"
          >
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              {educationContent[currentContentIndex].title}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              {educationContent[currentContentIndex].description}
            </p>
          </motion.div>

          {/* Content indicators */}
          <div className="flex gap-2 mt-8">
            {educationContent.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentContentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentContentIndex
                    ? "bg-accent scale-125"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo and Back Button */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/">
              <span className="font-display text-2xl font-bold">UniEd</span>
            </Link>
            <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
            >
              {isLoading ? "Signing in..." : "Sign in"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="glass"
              onClick={() => {
                const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5001';
                window.location.href = `${apiUrl}/api/v1/oauth/google`;
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              className="glass"
              onClick={() => {
                const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5001';
                window.location.href = `${apiUrl}/api/v1/oauth/microsoft`;
              }}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1024px-Microsoft_logo.svg.png" 
                alt="Microsoft" 
                className="w-5 h-5 mr-2 object-contain"
              />
              Microsoft
            </Button>
          </div>

          {/* Sign up link */}
          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
