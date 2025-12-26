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
    <section className="py-8 md:py-20 px-3 md:px-8 relative overflow-hidden">
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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-800 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-12 border border-white/50"
        >
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center md:text-left">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6 text-foreground leading-tight whitespace-nowrap"
              >
                Achieve your career goals with{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
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
                {/* Pricing - Desktop only */}
                <div className="hidden md:block mb-6">
                  <div className="inline-block bg-gradient-to-r from-primary to-accent p-[2px] rounded-2xl">
                    <div className="bg-background rounded-2xl px-6 py-4">
                      <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ₹2,099<span className="text-lg text-foreground/70">/month</span>
                      </p>
                      <p className="text-sm text-foreground/60 mt-1">Cancel anytime</p>
                    </div>
                  </div>
                </div>

                {/* Mobile: Combined pricing button */}
                <Button
                  size="lg"
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 text-primary-foreground px-4 md:px-8 py-4 md:py-6 text-sm md:text-lg rounded-xl transition-all group"
                >
                  <span className="md:hidden">₹2,099/mo • </span>
                  Start 7-day Free Trial
                  <ArrowRight className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs md:text-sm text-primary font-medium">
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
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          viewport={{ once: true }}
          className="mt-6 md:mt-12 grid grid-cols-4 gap-2 md:flex md:flex-wrap md:justify-center md:gap-8 text-center"
        >
          {[
            { number: "7,000+", label: "Courses" },
            { number: "50,000+", label: "Students" },
            { number: "95%", label: "Success" },
            { number: "24/7", label: "Support" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className="px-1 md:px-6"
            >
              <p className="text-base md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.number}
              </p>
              <p className="text-[10px] md:text-sm text-foreground/70 mt-0.5 md:mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
