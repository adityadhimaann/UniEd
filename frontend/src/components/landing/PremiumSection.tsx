import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, GraduationCap, BookOpen, FlaskConical, Library, Building2, Target, Star, Lightbulb } from "lucide-react";
import colgstudImage from "@/assets/colgstud.png";

const universityLogos = [
  { name: "Stanford", icon: GraduationCap },
  { name: "Harvard", icon: BookOpen },
  { name: "MIT", icon: FlaskConical },
  { name: "Yale", icon: Library },
  { name: "Oxford", icon: Building2 },
  { name: "Cambridge", icon: Target },
  { name: "Berkeley", icon: Star },
  { name: "Princeton", icon: Lightbulb },
];

export function PremiumSection() {
  return (
    <section className="py-2 px-4 md:px-4 relative bg-gray-300">
      <div className="max-w-7.5xl mx-auto">
        {/* Main Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="p-4 md:p-6 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-4 text-gray-800"
              >
                Achieve your career goals with <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">UniEd Plus</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-lg text-gray-600 mb-6"
              >
                Subscribe to build job-ready skills from world-class institutions.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-2xl font-semibold mb-6 text-gray-800"
              >
                ₹2,099/month, cancel anytime
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg rounded-xl"
                >
                  Start 7-day Free Trial
                </Button>
                <p className="text-sm text-blue-600 font-medium">
                  or ₹13,999/year with 14-day money-back guarantee
                </p>
              </motion.div>
            </div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src={colgstudImage}
                alt="College student studying"
                className="w-full h-auto max-w-md mx-auto"
                style={{ mixBlendMode: 'multiply' }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
