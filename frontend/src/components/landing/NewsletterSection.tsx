import { motion } from "framer-motion";
import { Mail, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/newsletter/subscribe', { email });
      
      toast.success("Successfully Subscribed! 🎉", {
        description: "Check your email for a confirmation message.",
        duration: 5000,
      });
      
      setIsSubscribed(true);
      console.log('Newsletter subscription response:', response.data);
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      const errorMessage = error.response?.data?.message || "Failed to subscribe. Please try again later.";
      toast.error("Subscription Failed", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-3xl p-6 md:p-8 lg:p-10 relative overflow-hidden">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-6"
              >
                <Mail className="w-8 h-8 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              >
                Stay in the{" "}
                <span className="gradient-text">Loop</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Subscribe to our newsletter for the latest updates, educational tips, 
                and exclusive features. Join our community of learners!
              </motion.p>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onSubmit={handleNewsletterSubscribe}
              className="max-w-md mx-auto"
            >
              {!isSubscribed ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="flex-1 h-12 px-4 bg-background/50 border-border/50 focus:border-primary text-base"
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 h-12 px-8"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="relative z-10 flex items-center gap-2">
                            Subscribe
                            <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </span>
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6"
                  >
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">
                    Thank You for Subscribing! 🎉
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We've sent a confirmation email to your inbox.<br />
                    Welcome to the UniEd community!
                  </p>
                  
                  <Button
                    onClick={() => {
                      setIsSubscribed(false);
                      setEmail("");
                    }}
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10"
                  >
                    Subscribe Another Email
                  </Button>
                </motion.div>
              )}
            </motion.form>

            {/* Stats or social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-6 justify-center mt-8 pt-8 border-t border-border/30"
            >
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">10K+</div>
                <div className="text-sm text-muted-foreground">Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">Weekly</div>
                <div className="text-sm text-muted-foreground">Updates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">100%</div>
                <div className="text-sm text-muted-foreground">Free</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
