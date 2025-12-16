import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, AlertCircle, Upload, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const studentAssignments = [
  {
    id: 1,
    title: "Data Structures Final Project",
    course: "CS301 - Data Structures",
    dueDate: "2024-12-15",
    status: "pending",
    points: 100,
    description: "Implement a balanced BST with visualization",
  },
  {
    id: 2,
    title: "Research Paper - AI Ethics",
    course: "PHI201 - Ethics in Technology",
    dueDate: "2024-12-10",
    status: "submitted",
    points: 50,
    submittedDate: "2024-12-08",
    description: "Write a 2000-word paper on AI ethics",
  },
  {
    id: 3,
    title: "Database Design Assignment",
    course: "CS302 - Database Systems",
    dueDate: "2024-12-05",
    status: "graded",
    points: 75,
    grade: 68,
    feedback: "Good work! Minor improvements needed in normalization.",
  },
  {
    id: 4,
    title: "Web Development Lab",
    course: "CS401 - Web Technologies",
    dueDate: "2024-12-20",
    status: "pending",
    points: 40,
    description: "Build a responsive dashboard using React",
  },
];

const facultyAssignments = [
  {
    id: 1,
    title: "Data Structures Final Project",
    course: "CS301 - Data Structures",
    dueDate: "2024-12-15",
    totalSubmissions: 45,
    pendingGrading: 12,
    totalStudents: 50,
  },
  {
    id: 2,
    title: "Midterm Exam",
    course: "CS301 - Data Structures",
    dueDate: "2024-11-20",
    totalSubmissions: 48,
    pendingGrading: 0,
    totalStudents: 50,
  },
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

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="text-warning border-warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    case "submitted":
      return <Badge variant="outline" className="text-info border-info"><CheckCircle className="w-3 h-3 mr-1" /> Submitted</Badge>;
    case "graded":
      return <Badge variant="outline" className="text-success border-success"><CheckCircle className="w-3 h-3 mr-1" /> Graded</Badge>;
    case "overdue":
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>;
    default:
      return null;
  }
}

function getDaysUntilDue(dueDate: string) {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function AssignmentsPage() {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

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
          <h1 className="text-2xl md:text-3xl font-display font-bold">Assignments</h1>
          <p className="text-muted-foreground">
            {isStudent ? "Track and submit your assignments" : "Manage and grade assignments"}
          </p>
        </div>
        {!isStudent && (
          <Button className="bg-gradient-to-r from-primary to-accent">
            <FileText className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        )}
      </motion.div>

      {isStudent ? (
        /* Student View */
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <motion.div variants={containerVariants} className="grid gap-4">
              {studentAssignments.map((assignment) => {
                const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                
                return (
                  <motion.div
                    key={assignment.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="glass rounded-xl p-6 border border-border/50"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground">{assignment.course}</p>
                            <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </div>
                          {assignment.status === "pending" && daysUntilDue > 0 && (
                            <span className={`text-xs ${daysUntilDue <= 3 ? "text-warning" : "text-muted-foreground"}`}>
                              {daysUntilDue} days remaining
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{assignment.points} points</span>
                            {assignment.status === "graded" && (
                              <span className="text-success">• {assignment.grade}/{assignment.points}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(assignment.status)}
                          {assignment.status === "pending" && (
                            <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                              <Upload className="w-4 h-4 mr-1" />
                              Submit
                            </Button>
                          )}
                          {assignment.status === "graded" && (
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View Feedback
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {assignment.status === "graded" && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">Score:</span>
                          <Progress value={(assignment.grade! / assignment.points) * 100} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{Math.round((assignment.grade! / assignment.points) * 100)}%</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-4">
              {studentAssignments.filter(a => a.status === "pending").map((assignment) => (
                <motion.div
                  key={assignment.id}
                  variants={itemVariants}
                  className="glass rounded-xl p-6 border border-border/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.course}</p>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                      <Upload className="w-4 h-4 mr-1" />
                      Submit
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submitted">
            <div className="grid gap-4">
              {studentAssignments.filter(a => a.status === "submitted").map((assignment) => (
                <motion.div
                  key={assignment.id}
                  variants={itemVariants}
                  className="glass rounded-xl p-6 border border-border/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">Submitted on {assignment.submittedDate}</p>
                    </div>
                    {getStatusBadge("submitted")}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="graded">
            <div className="grid gap-4">
              {studentAssignments.filter(a => a.status === "graded").map((assignment) => (
                <motion.div
                  key={assignment.id}
                  variants={itemVariants}
                  className="glass rounded-xl p-6 border border-border/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-success">Grade: {assignment.grade}/{assignment.points}</p>
                    </div>
                    <Button size="sm" variant="outline">View Feedback</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        /* Faculty View */
        <motion.div variants={containerVariants} className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {facultyAssignments.map((assignment) => (
              <motion.div
                key={assignment.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="glass rounded-xl p-6 border border-border/50"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">{assignment.course}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{assignment.totalSubmissions}</div>
                      <div className="text-xs text-muted-foreground">Submissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning">{assignment.pendingGrading}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{assignment.totalStudents}</div>
                      <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                    
                    <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                      Grade Submissions
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Progress value={(assignment.totalSubmissions / assignment.totalStudents) * 100} className="h-2" />
                  <span className="text-xs text-muted-foreground mt-1">
                    {Math.round((assignment.totalSubmissions / assignment.totalStudents) * 100)}% submitted
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
