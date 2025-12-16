import { motion } from "framer-motion";
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
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative"
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
    </section>
  );
}
