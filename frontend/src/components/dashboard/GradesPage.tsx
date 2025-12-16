import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Award, BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

const courseGrades = [
  { course: "CS301 - Data Structures", grade: "A", percentage: 92, credits: 4, trend: "up" },
  { course: "CS302 - Database Systems", grade: "A-", percentage: 88, credits: 3, trend: "up" },
  { course: "PHI201 - Ethics in Technology", grade: "B+", percentage: 85, credits: 3, trend: "down" },
  { course: "CS401 - Web Technologies", grade: "A", percentage: 94, credits: 4, trend: "up" },
  { course: "MTH301 - Discrete Mathematics", grade: "B", percentage: 82, credits: 3, trend: "stable" },
];

const gradeDistribution = [
  { grade: "A", count: 2, color: "bg-success" },
  { grade: "A-", count: 1, color: "bg-success/80" },
  { grade: "B+", count: 1, color: "bg-info" },
  { grade: "B", count: 1, color: "bg-info/80" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function GradeCircle({ gpa }: { gpa: number }) {
  const percentage = (gpa / 4) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="url(#gpaGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="gpaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-display">{gpa.toFixed(2)}</span>
        <span className="text-xs text-muted-foreground">GPA</span>
      </div>
    </div>
  );
}

export function GradesPage() {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const currentGPA = 3.68;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Grades</h1>
          <p className="text-muted-foreground">
            {isStudent ? "Track your academic performance" : "View and manage student grades"}
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Transcript
        </Button>
      </motion.div>

      {isStudent ? (
        <>
          {/* GPA Overview */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6 border border-border/50 flex flex-col items-center justify-center">
              <GradeCircle gpa={currentGPA} />
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm text-success">+0.12 from last semester</span>
              </div>
            </div>

            <div className="glass rounded-xl p-6 border border-border/50">
              <h3 className="font-semibold mb-4">Grade Distribution</h3>
              <div className="space-y-3">
                {gradeDistribution.map((item) => (
                  <div key={item.grade} className="flex items-center gap-3">
                    <span className="w-8 font-medium">{item.grade}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / 5) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-6 border border-border/50 space-y-4">
              <h3 className="font-semibold">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold gradient-text">17</div>
                  <div className="text-xs text-muted-foreground">Credits</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <div className="text-2xl font-bold text-success">5</div>
                  <div className="text-xs text-muted-foreground">Courses</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-info/10">
                  <div className="text-2xl font-bold text-info">92%</div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-warning/10">
                  <div className="text-2xl font-bold text-warning">Top 10%</div>
                  <div className="text-xs text-muted-foreground">Class Rank</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Course Grades */}
          <motion.div variants={itemVariants} className="glass rounded-xl border border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-semibold text-lg">Course Grades</h3>
            </div>
            <div className="divide-y divide-border/50">
              {courseGrades.map((course, index) => (
                <motion.div
                  key={course.course}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{course.course}</h4>
                        <span className="text-sm text-muted-foreground">{course.credits} Credits</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="w-48">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Score</span>
                          <span className="text-sm font-semibold">{course.percentage}%</span>
                        </div>
                        <Progress value={course.percentage} className="h-2" />
                      </div>
                      
                      <div className="flex items-center gap-2 min-w-[80px] justify-center">
                        <span className="text-2xl font-bold gradient-text w-12 text-center">{course.grade}</span>
                        {course.trend === "up" && <TrendingUp className="w-5 h-5 text-success" />}
                        {course.trend === "down" && <TrendingDown className="w-5 h-5 text-destructive" />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={itemVariants} className="glass rounded-xl p-6 border border-border/50">
            <h3 className="font-semibold text-lg mb-4">Achievements</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Award, label: "Dean's List", color: "text-warning" },
                { icon: TrendingUp, label: "Consistent Improver", color: "text-success" },
                { icon: BookOpen, label: "Perfect Attendance", color: "text-info" },
              ].map((achievement) => (
                <div key={achievement.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50">
                  <achievement.icon className={`w-4 h-4 ${achievement.color}`} />
                  <span className="text-sm font-medium">{achievement.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      ) : (
        /* Faculty View */
        <motion.div variants={itemVariants} className="glass rounded-xl p-6 border border-border/50">
          <h3 className="font-semibold text-lg mb-4">Grade Management</h3>
          <p className="text-muted-foreground">Select a course to view and manage student grades.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {["CS301 - Data Structures", "CS302 - Database Systems", "CS401 - Web Technologies"].map((course) => (
              <Button key={course} variant="outline" className="h-auto py-4 justify-start">
                <BookOpen className="w-5 h-5 mr-3" />
                <span>{course}</span>
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
