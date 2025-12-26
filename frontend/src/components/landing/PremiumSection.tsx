import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import pic2Image from "@/assets/pic2.webp";
import { useEffect, useState } from "react";

export function PremiumSection() {
  const features = [
    { icon: Zap, title: "Unlimited Access", desc: "7,000+ courses" },
    { icon: Award, title: "Certificates", desc: "Industry recognized" },
    { icon: TrendingUp, title: "Career Growth", desc: "Job-ready skills" },
    { icon: CheckCircle2, title: "Learn at Pace", desc: "Flexible schedule" },
  ];

  const [currentFeature, setCurrentFeature] = useState(0);

  // Auto-slide features on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="py-6 md:py-12 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
      />

      <div className="relative z-10">
        {/* Main Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-800 backdrop-blur-xl p-4 md:p-8"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 md:gap-48 items-center justify-between">
            {/* Left Content */}
            <div className="text-center md:text-left">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-6 text-foreground leading-tight"
              >
                Achieve your career goals with{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  UniEd Plus
                </span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-sm md:text-lg text-foreground/80 mb-4 md:mb-8"
              >
                Subscribe to build job-ready skills from world-class institutions.
              </motion.p>

              {/* Feature Grid - Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="hidden md:grid grid-cols-2 gap-4 mb-8"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-xl border border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <feature.icon className="w-6 h-6 text-primary mb-2" />
                    <h4 className="font-semibold text-foreground text-sm mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-foreground/70">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Feature Slider - Mobile */}
              <div className="md:hidden mb-4">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-3 rounded-xl border border-primary/20">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    {(() => {
                      const Feature = features[currentFeature];
                      return (
                        <>
                          <Feature.icon className="w-7 h-7 text-primary flex-shrink-0" />
                          <div className="text-left">
                            <h4 className="font-semibold text-foreground text-sm">
                              {Feature.title}
                            </h4>
                            <p className="text-xs text-foreground/70">{Feature.desc}</p>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                </div>
                {/* Slider Indicators */}
                <div className="flex justify-center gap-1.5 mt-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentFeature
                          ? "bg-primary w-4"
                          : "bg-foreground/30 w-1.5"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                {/* Desktop: Pricing and Button side by side */}
                <div className="hidden md:flex items-stretch gap-4">
                  <div className="relative inline-block bg-gradient-to-r from-primary to-accent p-[2px] rounded-2xl">
                    <div className="bg-background rounded-2xl px-6 h-full flex items-center justify-center">
                      <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
                        ₹2,099<span className="text-lg text-foreground/70">/month</span>
                      </p>
                    </div>
                    <span className="absolute -top-2 -right-2 bg-foreground/10 backdrop-blur-sm text-foreground/70 text-xs px-2 py-1 rounded-full">
                      Cancel anytime
                    </span>
                  </div>

                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 text-primary-foreground px-8 py-6 text-lg rounded-xl transition-all group whitespace-nowrap"
                  >
                    Start 7-day Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Mobile: Combined pricing button */}
                <Button
                  size="lg"
                  className="w-full md:hidden bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 text-primary-foreground px-4 py-4 text-sm rounded-xl transition-all group"
                >
                  ₹2,099/mo • Start 7-day Free Trial
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-xs md:text-sm text-primary font-medium text-center md:text-left">
                  or ₹13,999/year with 14-day money-back guarantee
                </p>
              </motion.div>
            </div>

            {/* Right Image - Hidden on Mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative hidden md:block"
            >
              {/* Decorative Elements */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-60"
              />
              <motion.div
                animate={{
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full blur-2xl opacity-60"
              />
              
              {/* Main Image */}
              <div className="relative z-10">
                <img
                  src={pic2Image}
                  alt="Students achieving success"
                  className="w-full h-auto object-contain"
                  style={{
                    filter: 'drop-shadow(0 10px 20px rgba(6, 182, 212, 0.25)) drop-shadow(0 5px 10px rgba(34, 211, 238, 0.2))'
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>


      </div>
    </section>
  );
}
