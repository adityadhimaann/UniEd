import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PricingSection() {
  return (
    <section className="py-20 px-4 md:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose your learning path
          </h2>
          <p className="text-lg text-muted-foreground">
            Flexible pricing options to match your goals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Single Learning Program */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="glass border-border/50 h-full hover:border-primary/50 transition-all">
              <CardHeader className="text-center pb-8">
                <h3 className="text-2xl font-bold mb-3">
                  Single learning program
                </h3>
                <p className="text-muted-foreground mb-6">
                  Learn a single topic or skill and earn a credential
                </p>
                <div className="text-center">
                  <span className="text-4xl font-bold">₹1,774</span>
                  <span className="text-2xl text-muted-foreground"> – </span>
                  <span className="text-4xl font-bold">₹1,774</span>
                  <p className="text-muted-foreground mt-1">/month</p>
                </div>
                <p className="text-sm text-muted-foreground mt-4 font-medium">
                  Visit an individual course or Specialization page to purchase.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <p className="text-sm">
                    Access all courses within the learning program
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <p className="text-sm">
                    Earn a certificate upon completion after your trial ends
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* UniEd Plus Monthly - Most Popular */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="glass border-2 border-blue-500 h-full relative overflow-hidden shadow-xl shadow-blue-500/20">
              {/* Most Popular Badge */}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2 font-semibold text-sm">
                Most popular
              </div>
              
              <CardHeader className="text-center pb-8 pt-12">
                <h3 className="text-2xl font-bold mb-3">
                  UniEd Plus Monthly
                </h3>
                <p className="text-muted-foreground mb-6">
                  Complete multiple courses and earn credentials in the short term
                </p>
                <div className="text-center">
                  <span className="text-5xl font-bold">₹2,099</span>
                  <p className="text-muted-foreground mt-1">/month</p>
                </div>
                <Button
                  size="lg"
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-base"
                >
                  Start 7-day free trial
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Cancel anytime
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <p className="text-sm">
                    Access 10,000+ courses and Specializations from 170+ leading companies and universities
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <p className="text-sm">
                    Earn unlimited certificates after your trial ends
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <p className="text-sm">
                    Learn job-relevant skills and tools with 1,000+ applied projects and hands-on labs
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* UniEd Plus Annual */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="glass border-border/50 h-full hover:border-primary/50 transition-all">
              <CardHeader className="text-center pb-8">
                <h3 className="text-2xl font-bold mb-3">
                  UniEd Plus Annual
                </h3>
                <p className="text-muted-foreground mb-6">
                  Combine flexibility and savings with long-term learning goals
                </p>
                <div className="text-center">
                  <span className="text-5xl font-bold">₹13,999</span>
                  <p className="text-muted-foreground mt-1">/year</p>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full mt-6 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-6 text-base transition-all"
                >
                  Try UniEd Plus Annual
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  14-day money-back guarantee
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-semibold mb-4">
                  Everything included in the monthly plan, plus:
                </p>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <p className="text-sm">
                    Save when you pay up front for the year
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <p className="text-sm">
                    Enjoy maximum flexibility to achieve work/life balance and learn at your own pace
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            All plans include access to our world-class learning platform, expert instructors, 
            and a community of millions of learners worldwide.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
