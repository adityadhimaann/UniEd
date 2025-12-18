import { motion } from "framer-motion";
import { useState } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  TrendingUp, 
  FileText, 
  Calendar 
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    description: "Access all your academic tools from a single, intuitive interface",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: BookOpen,
    title: "Smart Course Management",
    description: "Organize courses, materials, and schedules effortlessly",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Connect with peers and faculty through integrated messaging",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Grade Analytics",
    description: "Track performance with detailed analytics and insights",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "Assignment Hub",
    description: "Submit, grade, and manage assignments seamlessly",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Calendar,
    title: "Attendance Tracking",
    description: "Automated attendance with detailed reports",
    gradient: "from-pink-500 to-rose-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function FeaturesSection() {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate total scroll distance based on features length
  // Each feature card is approximately 350px wide (85vw on mobile ≈ 320px + gap)
  const scrollDistance = -(features.length * 350);

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need in{" "}
            <span className="gradient-text">One Place</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to streamline your educational experience 
            and boost productivity.
          </p>
        </motion.div>

        {/* Mobile: Horizontal smooth auto-scroll */}
        <div className="md:hidden relative overflow-hidden">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <motion.div
            className="flex gap-6"
            animate={isHovered ? {} : { x: [0, scrollDistance] }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
          >
            {/* Duplicate features for seamless loop */}
            {[...features, ...features, ...features].map((feature, index) => (
              <motion.div
                key={`${feature.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * (index % features.length) }}
                className="group relative flex-shrink-0 w-[85vw] max-w-[350px]"
              >
                <div className="glass rounded-2xl p-6 h-full transition-all duration-300 hover:bg-card/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 border border-border/50">
                  {/* Icon container */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>

                  {/* Hover gradient border effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-10`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Desktop: Staggered scrolling rows */}
        <div className="hidden md:block space-y-6">
          {/* First row - Left to Right scroll */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <motion.div
              className="flex gap-6"
              animate={isHovered ? {} : { x: [0, -1200] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {[...features.slice(0, 3), ...features.slice(0, 3), ...features.slice(0, 3), ...features.slice(0, 3)].map((feature, index) => (
                <motion.div
                  key={`row1-${feature.title}-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * (index % 3) }}
                  className="group relative flex-shrink-0 w-[350px]"
                >
                  <div className="glass rounded-2xl p-6 h-full transition-all duration-300 hover:bg-card/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 border border-border/50">
                    {/* Icon container */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>

                    {/* Hover gradient border effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-10`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Second row - Right to Left scroll */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <motion.div
              className="flex gap-6"
              animate={isHovered ? {} : { x: [-1200, 0] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {[...features.slice(3, 6), ...features.slice(3, 6), ...features.slice(3, 6), ...features.slice(3, 6)].map((feature, index) => (
                <motion.div
                  key={`row2-${feature.title}-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * (index % 3) }}
                  className="group relative flex-shrink-0 w-[350px]"
                >
                  <div className="glass rounded-2xl p-6 h-full transition-all duration-300 hover:bg-card/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 border border-border/50">
                    {/* Icon container */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>

                    {/* Hover gradient border effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-10`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}