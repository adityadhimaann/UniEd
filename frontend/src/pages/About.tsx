import { motion } from "framer-motion";
import { 
  Mail, 
  Linkedin, 
  Github, 
  Code, 
  Globe, 
  Award, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Video,
  Bot,
  Zap,
  Users,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import myImg from "@/assets/myimgs.jpeg";

const features = [
  {
    title: "Comprehensive Courses",
    description: "Expertly curated curriculum spanning technology, business, and arts, designed for mastery.",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Interactive Assignments",
    description: "Hands-on projects and real-time assessments to bridge the gap between theory and practice.",
    icon: ClipboardList,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Direct Messaging",
    description: "Seamless 1:1 communication between students and instructors for personalized guidance.",
    icon: MessageSquare,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Live Lectures",
    description: "Immersive real-time sessions with interactive whiteboards and collaborative tools.",
    icon: Video,
    color: "text-red-500",
    bg: "bg-red-500/10"
  },
  {
    title: "LISA: AI Tutor",
    description: "Your 24/7 AI companion that helps solve doubts, explains concepts, and tracks progress.",
    icon: Bot,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    title: "Smart Analytics",
    description: "Data-driven insights into your learning journey with personalized recommendations.",
    icon: Zap,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10"
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background z-0" />
          <div className="container relative z-10 mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight">
                Empowering the Future of{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                  Learning
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
                UniEd is a sophisticated ecosystem engineered to transform the educational landscape. We combine cutting-edge technology with intuitive design to create the ultimate learning environment.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid - Detailed Showcase */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Ecosystem</h2>
              <p className="text-muted-foreground">Everything you need to excel in your academic journey.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 shadow-xl shadow-primary/5"
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Creator Section */}
        <section className="py-0 relative overflow-hidden bg-secondary/30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-stretch gap-16 max-w-6xl mx-auto text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative shrink-0 flex items-end"
              >
                <div className="relative z-10 w-96 h-[500px] group transition-all duration-700">
                  <div className="w-full h-full overflow-hidden flex items-end">
                    <img 
                      src={myImg} 
                      alt="Aditya" 
                      className="w-full h-full object-contain object-bottom mix-blend-normal brightness-105"
                    />
                  </div>
                </div>
              </motion.div>

              <div className="flex-1 py-32 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
                    
                    MEET THE ARCHITECT
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">Aditya Kumar</h2>
                  <p className="text-xl font-medium text-accent mb-6 uppercase tracking-[0.2em]">Founder & Lead Developer</p>
                  <p className="text-lg text-muted-foreground mb-10 leading-relaxed italic border-l-4 border-primary/30 pl-6 py-2">
                    "I built UniEd to solve the disconnect between modern technology and traditional education. It's not just a portal; it's a living ecosystem designed to make learning feel like a superpower."
                  </p>
                  
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl gap-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300" asChild>
                      <a href="mailto:dhimanaditya56@gmail.com">
                        <Mail className="w-5 h-5" />
                        Get in Touch
                      </a>
                    </Button>
                    <Button variant="outline" className="h-14 px-8 rounded-2xl gap-2 border-[#0077B5]/20 hover:border-[#0077B5] hover:bg-[#0077B5] hover:text-white group transition-all duration-300" asChild>
                      <a href="https://www.linkedin.com/in/adityadhimaann" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-5 h-5 text-[#0077B5] group-hover:text-white transition-colors" />
                        Connect on LinkedIn
                      </a>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Impact / Mission */}
        <section className="py-24 bg-card/50 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                To bridge the global education gap by providing a modern, accessible, and intelligent platform that empowers learners and educators worldwide.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
