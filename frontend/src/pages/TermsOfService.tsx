import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Gavel, Scale, FileCheck, HelpCircle } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mb-12 text-lg">
              Last updated: February 21, 2026
            </p>

            <div className="space-y-12">
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Gavel className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using UniEd, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  These terms apply to all visitors, users, and others who access or use the Service, including students, instructors, and administrators.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">2. User Accounts</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">3. Acceptable Use</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the Service. Prohibited activities include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Attempting to gain unauthorized access to any portion of the Service.</li>
                  <li>Using the Service for any fraudulent or deceptive purposes.</li>
                  <li>Uploading or transmitting viruses, malware, or other malicious code.</li>
                  <li>Impersonating any person or entity, including UniEd employees or other users.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <HelpCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">4. Termination</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  All provisions of the Terms which by their nature should survive termination shall survive termination, including ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                </p>
              </section>

              <section className="pt-8 border-t border-border">
                <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions regarding these Terms, please reach out to us at legal@unied.com.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
