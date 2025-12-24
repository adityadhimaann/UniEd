import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Award, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import pic2Image from "@/assets/pic2.webp";

export function PremiumSection() {
  const features = [
    { icon: Zap, title: "Unlimited Access", desc: "7,000+ courses" },
    { icon: Award, title: "Certificates", desc: "Industry recognized" },
    { icon: TrendingUp, title: "Career Growth", desc: "Job-ready skills" },
    { icon: CheckCircle2, title: "Learn at Pace", desc: "Flexible schedule" },
  ];

  return (
    <section className="py-20 px-4 md:px-8 relative  overflow-hidden">
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
        className="absolute bottom-0 left-0 w-96 h-96  rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-800 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight"
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
                className="text-lg text-foreground/80 mb-8"
              >
                Subscribe to build job-ready skills from world-class institutions.
              </motion.p>

              {/* Feature Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4 mb-8"
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

              {/* Pricing */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                
                viewport={{ once: true }}
                className="mb-6"
              >
                <div className="inline-block bg-gradient-to-r from-primary to-accent p-[2px] rounded-2xl">
                  <div className="bg-background rounded-2xl px-6 py-4">
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ₹2,099<span className="text-lg text-foreground/70">/month</span>
                    </p>
                    <p className="text-sm text-foreground/60 mt-1">Cancel anytime</p>
                  </div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <Button
                  size="lg"
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 text-primary-foreground px-8 py-6 text-lg rounded-xl transition-all group"
                >
                  Start 7-day Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-sm text-primary font-medium flex items-center gap-2">
                  
                  or ₹13,999/year with 14-day money-back guarantee
                </p>
              </motion.div>
            </div>

            {/* Right Image with Floating Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative"
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
                className="absolute -bottom-4 -left-4 w-32 h-32  rounded-full blur-2xl opacity-60"
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
          className="mt-12 flex flex-wrap justify-center gap-8 text-center"
        >
          {[
            { number: "7,000+", label: "Courses" },
            { number: "50,000+", label: "Students" },
            { number: "95%", label: "Success Rate" },
            { number: "24/7", label: "Support" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className="px-6"
            >
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.number}
              </p>
              <p className="text-sm text-foreground/70 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
