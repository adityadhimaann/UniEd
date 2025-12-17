import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, Users, Award, ArrowRight, Sparkles } from "lucide-react";
import uniEdLogo from "@/assets/UniEdlogoo.png";
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Welcome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('edu_user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.firstName || user.name || 'there');
    }
  }, []);

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      // Mark onboarding as complete
      await api.post('/auth/complete-onboarding');
      
      // Update local storage
      const userData = localStorage.getItem('edu_user');
      if (userData) {
        const user = JSON.parse(userData);
        user.hasCompletedOnboarding = true;
        localStorage.setItem('edu_user', JSON.stringify(user));
      }

      navigate('/dashboard');
      window.location.reload();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete setup. Redirecting to dashboard...',
        variant: 'destructive',
      });
      // Still redirect to dashboard even if API fails
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload();
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Learning",
      description: "Access courses, assignments, and study materials all in one place",
      color: "text-blue-500",
      delay: 0.2
    },
    {
      icon: Users,
      title: "Collaborative Environment",
      description: "Connect with peers, join study groups, and learn together",
      color: "text-purple-500",
      delay: 0.4
    },
    {
      icon: Award,
      title: "Track Your Progress",
      description: "Monitor your grades, attendance, and achievements in real-time",
      color: "text-green-500",
      delay: 0.6
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-5xl w-full relative z-10">
        {/* Header with logo */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.img
              src={uniEdLogo}
              alt="UniEd"
              className="w-20 h-16 object-contain"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <h1 className="font-display text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              UniEd
            </h1>
          </div>
        </motion.div>

        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-primary/10 px-6 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Your Journey Begins</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="font-display text-4xl md:text-5xl font-bold mb-4"
          >
            Welcome, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{userName}</span>!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
          >
            You're all set! Get ready to experience a unified platform designed to enhance your educational journey.
          </motion.p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: feature.delay + 0.2 }}
                className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </motion.div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* About section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h3 className="font-display text-2xl font-bold">About UniEd</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            UniEd is your all-in-one education management platform. We bring together students, faculty, and parents 
            in a seamless digital environment. Whether you're attending classes, submitting assignments, checking grades, 
            or communicating with your peers, everything you need is right here.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our mission is to make education more accessible, engaging, and effective through technology. 
            Join thousands of learners and educators who are already experiencing the future of education.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-lg px-8 py-6"
          >
            {isLoading ? "Loading..." : "Let's Get Started"}
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
