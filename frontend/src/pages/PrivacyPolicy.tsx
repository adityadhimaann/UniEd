import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mb-12 text-lg">
              Last updated: February 21, 2026
            </p>

            <div className="space-y-12">
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Introduction</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  At UniEd ("we", "our", or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our educational platform.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By using UniEd, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Information Collection</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We collect several different types of information for various purposes to provide and improve our Service to you:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Personal Data:</strong> Email address, first name, last name, and educational institution.</li>
                  <li><strong>Usage Data:</strong> Information on how the Service is accessed and used, including your computer's IP address, browser type, and pages visited.</li>
                  <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to track activity on our Service and hold certain information.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Data Security</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures including SSL encryption, salted password hashing, and regular security audits to ensure your educational data remains private and protected.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Your Data Rights</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  UniEd aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. You have the right to access, update, or delete the information we have on you.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact our support team.
                </p>
              </section>

              <section className="pt-8 border-t border-border">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground mb-2">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>By email: support@unied.com</li>
                  <li>By visiting our website: uniedplatform.vercel.app/contact</li>
                </ul>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
