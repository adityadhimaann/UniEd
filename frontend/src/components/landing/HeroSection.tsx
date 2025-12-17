import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import eduBg1 from "@/assets/edu-bg-1.jpg";
import eduBg2 from "@/assets/edu-bg-2.jpg";
import eduBg3 from "@/assets/edu-bg-3.jpg";
import eduBg4 from "@/assets/edu-bg-4.jpg";
import macImage from "@/assets/macvid.gif";
import mobileImage from "@/assets/mobilevid.gif";
import demoVideo from "@/assets/UniEdanime.mp4";

const backgroundImages = [eduBg1, eduBg2, eduBg3, eduBg4];

const stats = [
  { value: "10,000+", label: "Students" },
  { value: "500+", label: "Courses" },
  { value: "50+", label: "Institutions" },
];

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showDemo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDemo]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Image indicators */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? "bg-primary w-8" 
                : "bg-muted-foreground/50 hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>

      <div className="container relative z-10 px-4 py-25">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 text-foreground"
            >
              Education{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Unified.</span>
              <br />
              Learning{" "}
              <span className="gradient-text">Amplified.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-foreground/80 max-w-xl mx-auto lg:mx-0 mb-8"
            >
              One platform to manage courses, grades, assignments, and collaboration 
              across your entire institution.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
                <Link to="/signup">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
              <Button onClick={() => setShowDemo(true)} size="lg" variant="outline" className="group glass border-foreground/20 text-foreground hover:bg-gradient-to-r from-primary to-accent duration-500">
                <Play className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats ticker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-8 justify-center lg:justify-start mt-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold font-display gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-foreground/70">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Device mockups */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* Mac mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative"
            >
              <img 
                src={macImage} 
                alt="UniEd Platform on Desktop"
                className="w-full h-auto drop-shadow-2xl rounded-lg"
              />
            </motion.div>

            {/* Mobile mockup - positioned in front on right side */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute bottom-0 right-0 w-1/3 z-10"
            >
              <img 
                src={mobileImage} 
                alt="UniEd Mobile App"
                className="w-full h-auto drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
      >
        <span className="text-sm text-foreground/70">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-foreground/70" />
        </motion.div>
      </motion.div>

      {/* Demo Video Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowDemo(false)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>

              {/* Video container */}
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={macImage}
                  alt="UniEd Demo"
                  className="w-full h-full object-contain bg-gray-900"
                />
              </div>

              {/* Demo description */}
              <div className="mt-6 text-center">
                <h3 className="text-2xl font-bold font-display gradient-text mb-2">
                  Welcome to UniEd
                </h3>
                <p className="text-foreground/70">
                  Discover how UniEd simplifies course management, grading, assignments, and collaboration for your entire institution.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
