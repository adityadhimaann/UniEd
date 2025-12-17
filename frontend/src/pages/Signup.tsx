import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, ArrowRight, Check, ArrowLeft } from "lucide-react";
import uniEdLogo from "@/assets/UniEdlogoo.png";
import eduBg1 from "@/assets/edu-bg-1.jpg";
import eduBg2 from "@/assets/edu-bg-2.jpg";
import eduBg3 from "@/assets/edu-bg-3.jpg";
import eduBg4 from "@/assets/edu-bg-4.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { id: "student", label: "Student", icon: "🎓", description: "Access courses, submit assignments, track grades" },
  { id: "faculty", label: "Faculty", icon: "📚", description: "Create courses, manage students, grade work" },
  { id: "admin", label: "Administrator", icon: "⚙️", description: "Manage institution, users, and settings" },
];

const educationContent = [
  {
    image: eduBg1,
    title: "Begin Your Academic Journey",
    description: "Create your account and unlock access to cutting-edge educational tools designed for modern learning."
  },
  {
    image: eduBg2,
    title: "Join the Learning Revolution",
    description: "Connect with peers, collaborate on projects, and experience education like never before with UniEd."
  },
  {
    image: eduBg3,
    title: "Shape Your Future Today",
    description: "Access personalized learning paths, track your progress, and achieve your academic goals efficiently."
  },
  {
    image: eduBg4,
    title: "Education Without Boundaries",
    description: "Break traditional learning barriers with our comprehensive suite of educational management tools."
  }
];

export default function Signup() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "" as UserRole | "",
    department: "",
    studentId: "",
    employeeId: "",
    semester: 1,
  });

  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentContentIndex((prev) => (prev + 1) % educationContent.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const passwordStrength = () => {
    const { password } = formData;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 25) return "bg-destructive";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-accent";
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Error",
        description: "Please enter your first and last name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    if (!formData.role) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength() < 50) {
      toast({
        title: "Weak Password",
        description: "Please use a stronger password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role as UserRole,
        department: formData.department || undefined,
        studentId: formData.role === "student" ? formData.studentId || undefined : undefined,
        employeeId: formData.role !== "student" ? formData.employeeId || undefined : undefined,
        semester: formData.role === "student" ? formData.semester : undefined,
      });

      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      
      // Redirect based on role
      if (formData.role === "faculty" || formData.role === "admin") {
        navigate("/instructor");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed. Please try again.",
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
        <div className="absolute inset-0 bg-gradient-to-br from-accent/90 via-primary/70 to-primary/80 z-10" />
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
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <span className="font-display text-2xl font-bold">UniEd</span>
            </Link>
            <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of 3</span>
              <span>{step === 1 ? "Basic Info" : step === 2 ? "Select Role" : "Details"}</span>
            </div>
            <Progress value={(step / 3) * 100} className="h-2" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              {step === 1 && "Enter your basic information"}
              {step === 2 && "Select your role in the platform"}
              {step === 3 && "Complete your profile details"}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10 bg-secondary/50 border-border/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="pl-10 bg-secondary/50 border-border/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-secondary/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 bg-secondary/50 border-border/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1">
                      <div className={`h-1 rounded-full transition-all ${getStrengthColor()}`} style={{ width: `${passwordStrength()}%` }} />
                      <p className="text-xs text-muted-foreground">
                        {passwordStrength() <= 25 && "Weak"}
                        {passwordStrength() > 25 && passwordStrength() <= 50 && "Fair"}
                        {passwordStrength() > 50 && passwordStrength() <= 75 && "Good"}
                        {passwordStrength() > 75 && "Strong"}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.role === role.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50 bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{role.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{role.label}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </div>
                      {formData.role === role.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 3: Additional Details */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="bg-secondary/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">
                    {formData.role === "student" ? "Student ID (Optional)" : "Employee ID (Optional)"}
                  </Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder={`Enter your ${formData.role === "student" ? "student" : "employee"} ID`}
                    value={formData.role === "student" ? formData.studentId : formData.employeeId}
                    onChange={(e) => 
                      formData.role === "student"
                        ? setFormData({ ...formData, studentId: e.target.value })
                        : setFormData({ ...formData, employeeId: e.target.value })
                    }
                    className="bg-secondary/50 border-border/50"
                  />
                </div>

                {formData.role === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      type="number"
                      min="1"
                      max="10"
                      placeholder="e.g., 1"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1" disabled={isLoading}>
                  Back
                </Button>
              )}
              <Button
                type={step === 3 ? "submit" : "button"}
                onClick={step < 3 ? nextStep : undefined}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                {isLoading ? "Creating..." : step === 3 ? "Create Account" : "Continue"}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </form>

          {/* Social Login Options */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5001';
                    window.location.href = `${apiUrl}/api/v1/oauth/google`;
                  }}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5001';
                    window.location.href = `${apiUrl}/api/v1/oauth/microsoft`;
                  }}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M1 1h10v10H1z" />
                    <path fill="#00a4ef" d="M13 1h10v10H13z" />
                    <path fill="#7fba00" d="M1 13h10v10H1z" />
                    <path fill="#ffb900" d="M13 13h10v10H13z" />
                  </svg>
                  Microsoft
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
