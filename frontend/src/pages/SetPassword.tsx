import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, User, GraduationCap, Briefcase } from "lucide-react";
import uniEdLogo from "@/assets/UniEdlogoo.png";
import eduBg1 from "@/assets/edu-bg-1.jpg";
import eduBg2 from "@/assets/edu-bg-2.jpg";
import eduBg3 from "@/assets/edu-bg-3.jpg";
import eduBg4 from "@/assets/edu-bg-4.jpg";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const educationContent = [
  {
    image: eduBg1,
    title: "Complete Your Account Setup",
    description: "Just one more step to unlock your full learning potential and join our educational community."
  },
  {
    image: eduBg2,
    title: "Secure Your Account",
    description: "Set a strong password to protect your academic data and maintain the integrity of your learning journey."
  },
  {
    image: eduBg3,
    title: "Almost There!",
    description: "Create your password to gain full access to all the amazing features UniEd has to offer."
  },
  {
    image: eduBg4,
    title: "Welcome to UniEd",
    description: "Your journey to academic excellence begins with a secure account. Let's get you started!"
  }
];

const SetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor' | 'faculty' | 'parent'>('student');
  const [studentId, setStudentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentContentIndex((prev) => (prev + 1) % educationContent.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const payload: any = { password, role };
      
      if (role === 'student') {
        if (!studentId || !department || !semester) {
          toast({
            title: 'Error',
            description: 'Please fill in all student fields',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        payload.studentId = studentId;
        payload.department = department;
        payload.semester = parseInt(semester);
      } else if (role === 'instructor' || role === 'faculty') {
        if (!employeeId || !department) {
          toast({
            title: 'Error',
            description: 'Please fill in all required fields',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        payload.employeeId = employeeId;
        payload.department = department;
      }
      // Parent role doesn't require additional fields

      const response = await api.post('/auth/set-password-role', payload);

      // Update local storage with new tokens and role
      if (response.data?.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        const userData = response.data.data.user;
        localStorage.setItem('edu_user', JSON.stringify(userData));
      }

      toast({
        title: 'Success',
        description: 'Account setup completed successfully!',
      });

      navigate('/welcome');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete setup',
        variant: 'destructive',
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
              <img src={uniEdLogo} alt="UniEd" className="w-16 h-12 object-contain" />
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
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-16 h-10 flex items-center justify-center">
                <img src={uniEdLogo} alt="UniEd" className="w-16 h-10 object-contain" />
              </div>
              <span className="font-display text-xl font-bold">UniEd</span>
            </div>
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Set your password and choose your role to get started
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>I am a</Label>
              <RadioGroup value={role} onValueChange={(value: 'student' | 'instructor' | 'faculty' | 'parent') => setRole(value)}>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    htmlFor="student"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      role === 'student'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="student" id="student" />
                    <GraduationCap className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">Student</div>
                      <div className="text-xs text-muted-foreground">Learn & grow</div>
                    </div>
                  </label>
                  
                  <label
                    htmlFor="faculty"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      role === 'faculty'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="faculty" id="faculty" />
                    <Briefcase className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">Faculty</div>
                      <div className="text-xs text-muted-foreground">Teach courses</div>
                    </div>
                  </label>

                  <label
                    htmlFor="instructor"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      role === 'instructor'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="instructor" id="instructor" />
                    <Briefcase className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">Instructor</div>
                      <div className="text-xs text-muted-foreground">Guide students</div>
                    </div>
                  </label>

                  <label
                    htmlFor="parent"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      role === 'parent'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="parent" id="parent" />
                    <User className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">Parent</div>
                      <div className="text-xs text-muted-foreground">Monitor progress</div>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Conditional Fields for Student */}
            {role === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter your student ID"
                    className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g., Computer Science"
                      className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      type="number"
                      min="1"
                      max="12"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="e.g., 3"
                      className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Conditional Fields for Instructor/Faculty */}
            {(role === 'instructor' || role === 'faculty') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Enter your employee ID"
                    className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., Computer Science"
                    className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
            >
              {isLoading ? "Setting Up..." : "Complete Setup"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SetPassword;
