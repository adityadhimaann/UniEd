import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { PremiumSection } from "@/components/landing/PremiumSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTASection } from "@/components/landing/CTASection";
import { NewsletterSection } from "@/components/landing/NewsletterSection";
import { Footer } from "@/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import eduBg1 from "@/assets/edu-bg-1.jpg";
import eduBg2 from "@/assets/edu-bg-2.jpg";
import eduBg3 from "@/assets/edu-bg-3.jpg";
import eduBg4 from "@/assets/edu-bg-4.jpg";

const backgroundImages = [eduBg1, eduBg2, eduBg3, eduBg4];

const Index = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Fixed rotating background */}
      <div className="fixed inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={backgroundImages[currentImageIndex]}
              alt="Education background"
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <PremiumSection />
          <PricingSection />
          <FeaturesSection />
          <IntegrationsSection />
          <StatsSection />
          <TestimonialsSection />
          <CTASection />
          <NewsletterSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
