import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Award, BookOpen, Download, Calendar, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { studentService } from "@/services/studentService";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [gradesData, setGradesData] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseBreakdown, setCourseBreakdown] = useState<any>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    if (isStudent) {
      fetchGrades();
      fetchUpcomingEvents();
    }
  }, [isStudent]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await studentService.getDetailedGrades();
      setGradesData(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseBreakdown = async (courseId: string) => {
    try {
      setBreakdownLoading(true);
      setSelectedCourse(courseId);
      const response = await studentService.getCourseGradeBreakdown(courseId);
      setCourseBreakdown(response.data);
    } catch (error) {
      console.error('Error fetching course breakdown:', error);
      toast.error('Failed to load course details');
    } finally {
      setBreakdownLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await studentService.getUpcomingEvents();
      setUpcomingEvents(response.data);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  const getGradeColor = (letterGrade: string) => {
    if (letterGrade.startsWith('A')) return 'text-green-500';
    if (letterGrade.startsWith('B')) return 'text-blue-500';
    if (letterGrade.startsWith('C')) return 'text-yellow-500';
    if (letterGrade.startsWith('D')) return 'text-orange-500';
    return 'text-red-500';
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 90) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (percentage >= 70) return <TrendingUp className="w-5 h-5 text-blue-500" />;
    return <TrendingDown className="w-5 h-5 text-orange-500" />;
  };

  const exportTranscript = () => {
    if (!gradesData) return;

    // Create transcript content
    const transcriptContent = `
OFFICIAL ACADEMIC TRANSCRIPT
UniEd - Unified Education Platform
=====================================

Student Information:
Name: ${user?.name || 'Student'}
Email: ${user?.email || ''}
Student ID: ${user?.id || ''}

Academic Summary:
Cumulative GPA: ${gradesData.gpa.toFixed(2)} / 4.0
Total Credits: ${gradesData.totalCredits}
Total Courses: ${gradesData.totalCourses}
Average Score: ${gradesData.avgScore.toFixed(1)}%

Course Grades:
${gradesData.grades.map((grade: any, index: number) => `
${index + 1}. ${grade.course.code} - ${grade.course.name}
   Credits: ${grade.course.credits}
   Grade: ${grade.letterGrade} (${grade.overallPercentage.toFixed(1)}%)
   GPA Points: ${grade.gradePoint.toFixed(2)}
   Instructor: ${grade.course.faculty?.firstName || ''} ${grade.course.faculty?.lastName || ''}
   Enrolled: ${new Date(grade.enrolledAt).toLocaleDateString()}
`).join('\n')}

Grade Distribution:
${gradesData.gradeDistribution.map((item: any) => 
  `${item.grade}: ${item.count} course(s)`
).join('\n')}

Generated on: ${new Date().toLocaleString()}
=====================================

This is an unofficial transcript for reference purposes only.
For official transcripts, please contact the registrar's office.
    `.trim();

    // Create and download as text file
    const blob = new Blob([transcriptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript_${user?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Transcript exported successfully');
  };

  if (loading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Grades</h1>
            <p className="text-muted-foreground">Track your academic performance</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <img src="/loadicon.gif" alt="Loading" className="h-32 w-32 mx-auto" />
            <p className="text-muted-foreground mt-4">Loading your grades...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isStudent) {
    return (
      <motion.div variants={itemVariants} className="glass rounded-xl p-6 border border-border/50">
        <h3 className="font-semibold text-lg mb-4">Grade Management</h3>
        <p className="text-muted-foreground">Faculty grade management coming soon.</p>
      </motion.div>
    );
  }

  if (!gradesData || gradesData.grades.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Grades</h1>
            <p className="text-muted-foreground">Track your academic performance</p>
          </div>
        </div>
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No Grades Yet</h3>
            <p className="text-gray-400">Your grades will appear here once assignments are graded</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
          <p className="text-muted-foreground">Track your academic performance</p>
        </div>
        <Button variant="outline" onClick={exportTranscript}>
          <Download className="w-4 h-4 mr-2" />
          Export Transcript
        </Button>
      </motion.div>

      {/* GPA Overview */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6 border border-border/50 flex flex-col items-center justify-center">
          <GradeCircle gpa={gradesData.gpa} />
          <div className="flex items-center gap-2 mt-4">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Cumulative GPA</span>
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <h3 className="font-semibold mb-4">Grade Distribution</h3>
          <div className="space-y-3">
            {gradesData.gradeDistribution.map((item: any) => (
              <div key={item.grade} className="flex items-center gap-3">
                <span className={`w-8 font-medium ${getGradeColor(item.grade)}`}>{item.grade}</span>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / gradesData.totalCourses) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
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
              <div className="text-2xl font-bold gradient-text">{gradesData.totalCredits}</div>
              <div className="text-xs text-muted-foreground">Credits</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-success/10">
              <div className="text-2xl font-bold text-success">{gradesData.totalCourses}</div>
              <div className="text-xs text-muted-foreground">Courses</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-info/10">
              <div className="text-2xl font-bold text-info">{gradesData.avgScore.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-warning/10">
              <div className="text-2xl font-bold text-warning">{gradesData.gpa.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">GPA</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Course Grades */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="glass rounded-xl border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <h3 className="font-semibold text-lg">Course Grades</h3>
              </div>
              <div className="divide-y divide-border/50">
                {gradesData.grades.map((grade: any, index: number) => (
                  <motion.div
                    key={grade.course._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => fetchCourseBreakdown(grade.course._id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{grade.course.code} - {grade.course.name}</h4>
                          <span className="text-sm text-muted-foreground">{grade.course.credits} Credits</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="w-48">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Score</span>
                            <span className="text-sm font-semibold">{grade.overallPercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={grade.overallPercentage} className="h-2" />
                        </div>
                        
                        <div className="flex items-center gap-2 min-w-[80px] justify-center">
                          <span className={`text-2xl font-bold w-12 text-center ${getGradeColor(grade.letterGrade)}`}>
                            {grade.letterGrade}
                          </span>
                          {getTrendIcon(grade.overallPercentage)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="mt-6">
            {breakdownLoading ? (
              <Card className="border-gray-700 bg-gray-800">
                <CardContent className="p-12 text-center">
                  <img src="/loadicon.gif" alt="Loading" className="h-24 w-24 mx-auto" />
                  <p className="text-gray-400 mt-4">Loading course details...</p>
                </CardContent>
              </Card>
            ) : selectedCourse && courseBreakdown ? (
              <Card className="border-gray-700 bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Grade Breakdown</CardTitle>
                  <CardDescription className="text-gray-400">
                    Detailed breakdown of your performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                      <div className="text-sm text-gray-400">Overall</div>
                      <div className="text-2xl font-bold text-white mt-1">
                        {courseBreakdown.overallPercentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                      <div className="text-sm text-gray-400">Assignments</div>
                      <div className="text-2xl font-bold text-white mt-1">
                        {courseBreakdown.assignmentPercentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                      <div className="text-sm text-gray-400">Attendance</div>
                      <div className="text-2xl font-bold text-white mt-1">
                        {courseBreakdown.attendancePercentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                      <div className="text-sm text-gray-400">Grade</div>
                      <div className={`text-2xl font-bold mt-1 ${getGradeColor(courseBreakdown.letterGrade)}`}>
                        {courseBreakdown.letterGrade}
                      </div>
                    </div>
                  </div>

                  {/* Assignment List */}
                  <div>
                    <h4 className="font-semibold text-white mb-4">Assignment Grades</h4>
                    <div className="space-y-3">
                      {courseBreakdown.assignments.map((assignment: any) => (
                        <div key={assignment.assignmentId} className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-white">{assignment.title}</h5>
                            <span className={`text-sm font-semibold ${
                              assignment.status === 'graded' ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              {assignment.status === 'graded' 
                                ? `${assignment.earnedMarks}/${assignment.totalMarks}` 
                                : assignment.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {assignment.status === 'graded' && (
                            <Progress value={assignment.percentage} className="h-2" />
                          )}
                          {assignment.feedback && (
                            <p className="text-sm text-gray-400 mt-2">{assignment.feedback}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-700 bg-gray-800">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Select a course to view detailed breakdown</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Academic Calendar */}
      <motion.div variants={itemVariants} className="glass rounded-xl p-6 border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Upcoming Events</h3>
        </div>
        {eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <img src="/loadicon.gif" alt="Loading" className="h-20 w-20" />
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event: any, index: number) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
              >
                <div className={`p-2 rounded-lg ${
                  event.type === 'assignment' ? 'bg-blue-500/10' :
                  event.type === 'exam' ? 'bg-red-500/10' :
                  'bg-green-500/10'
                }`}>
                  {event.type === 'assignment' ? (
                    <BookOpen className={`w-5 h-5 ${
                      event.type === 'assignment' ? 'text-blue-500' :
                      event.type === 'exam' ? 'text-red-500' :
                      'text-green-500'
                    }`} />
                  ) : event.type === 'exam' ? (
                    <Target className="w-5 h-5 text-red-500" />
                  ) : (
                    <Calendar className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.courseName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.daysUntil === 0 ? 'Today' : 
                         event.daysUntil === 1 ? 'Tomorrow' : 
                         `${event.daysUntil} days`}
                      </div>
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No upcoming events</p>
          </div>
        )}
      </motion.div>

      {/* Achievements */}
      {gradesData.gpa >= 3.5 && (
        <motion.div variants={itemVariants} className="glass rounded-xl p-6 border border-border/50">
          <h3 className="font-semibold text-lg mb-4">Achievements</h3>
          <div className="flex flex-wrap gap-4">
            {gradesData.gpa >= 3.8 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20">
                <Award className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Dean's List</span>
              </div>
            )}
            {gradesData.gpa >= 3.5 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">High Achiever</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
