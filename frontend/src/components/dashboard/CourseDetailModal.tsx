import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  Send,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import { studentService } from "@/services/studentService";
import { instructorService } from "@/services/instructorService";

interface Course {
  _id?: string;
  id?: number;
  courseName?: string;
  name?: string;
  courseCode?: string;
  code?: string;
  faculty?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  instructor?: string;
  instructorImage?: string;
  image?: string;
  titleImage?: string;
  maxStudents?: number;
  students?: number;
  description?: string;
  credits?: number;
  department?: string;
  semester?: number;
  isEnrolled?: boolean;
}

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseDetailModal({ course, isOpen, onClose }: CourseDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [enrollmentType, setEnrollmentType] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && course) {
      fetchCourseData();
    }
  }, [isOpen, course]);

  const fetchCourseData = async () => {
    if (!course) return;
    
    try {
      setLoading(true);
      const courseId = course._id || course.id;
      
      // Fetch assignments for this course
      try {
        const assignmentsRes = await instructorService.getCourseAssignments(courseId as string);
        setAssignments(assignmentsRes.data || []);
      } catch (error) {
        console.log('Could not fetch assignments:', error);
      }

      // Fetch enrolled students count
      try {
        const studentsRes = await instructorService.getCourseStudents(courseId as string);
        setStudents(studentsRes.data || []);
      } catch (error) {
        console.log('Could not fetch students:', error);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enrollmentType) {
      toast.error("Please select an enrollment type");
      return;
    }

    setIsSubmitting(true);
    try {
      const courseId = course._id || course.id;
      
      const response = await api.post('/course-enrollment-requests', {
        courseId,
        enrollmentType,
        message: message.trim(),
      });

      if (response.data?.success || response.status === 200 || response.status === 201) {
        toast.success("🎉 Enrollment request submitted successfully!", {
          description: "Your request is pending instructor approval.",
          duration: 5000,
        });
        
        setMessage("");
        setEnrollmentType("");
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
        onClose();
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      const errorMessage = error.response?.data?.message || "Failed to submit enrollment request";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const enrolledCount = students.length || course.students || 0;
  const assignmentCount = assignments.length || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl glass-strong border border-border/50"
          >
            {/* Header with Image */}
            <div className="relative h-48 overflow-hidden">
              {course.titleImage || course.image ? (
                <img 
                  src={course.titleImage || course.image} 
                  alt={course.courseName || course.name || 'Course'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.style.background = 'linear-gradient(to bottom right, rgb(37, 99, 235), rgb(147, 51, 234))';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="absolute bottom-4 left-6">
                <Badge className="mb-2">{course.courseCode || course.code}</Badge>
                <h2 className="text-3xl font-bold mb-2">{course.courseName || course.name}</h2>
                <div className="flex items-center gap-3">
                  {course.faculty ? (
                    <>
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {course.faculty.firstName?.[0]}{course.faculty.lastName?.[0]}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{course.faculty.firstName} {course.faculty.lastName}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">{course.instructor || 'TBA'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-12rem)] p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="enroll">Enroll</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">About This Course</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {course.description || 'No description available for this course.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {course.department && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span><strong>Department:</strong> {course.department}</span>
                        </div>
                      )}
                      {course.credits && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          <span><strong>Credits:</strong> {course.credits}</span>
                        </div>
                      )}
                      {course.semester && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span><strong>Semester:</strong> {course.semester}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Assignments</p>
                        <p className="font-semibold text-xl">{assignmentCount}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Enrolled</p>
                        <p className="font-semibold text-xl">{enrolledCount}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="w-6 h-6 mx-auto mb-2 text-accent" />
                        <p className="text-sm text-muted-foreground">Max Students</p>
                        <p className="font-semibold text-xl">{course.maxStudents || 60}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Course Assignments</h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-muted-foreground mt-2">Loading assignments...</p>
                    </div>
                  ) : assignments.length > 0 ? (
                    <div className="space-y-3">
                      {assignments.map((assignment: any) => (
                        <Card key={assignment._id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <FileText className="w-5 h-5 text-primary mt-1" />
                                <div className="flex-1">
                                  <p className="font-medium">{assignment.title}</p>
                                  {assignment.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {assignment.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                    <span>Points: {assignment.totalMarks}</span>
                                    <span>Submissions: {assignment.submissions?.length || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No assignments yet</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          Assignments will appear here once the instructor creates them
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="enroll" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Enrollment Options</h3>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <Card
                        className={`cursor-pointer transition-all ${enrollmentType === 'free-trial' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                        onClick={() => setEnrollmentType('free-trial')}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold mb-2">FREE</div>
                          <p className="text-sm text-muted-foreground mb-4">Trial Access</p>
                          <ul className="text-sm text-left space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>Limited course access</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>View course materials</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all border-primary/50 ${enrollmentType === 'purchase' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                        onClick={() => setEnrollmentType('purchase')}
                      >
                        <CardContent className="p-6 text-center">
                          <Badge className="mb-2">Recommended</Badge>
                          <div className="text-3xl font-bold mb-2">FULL</div>
                          <p className="text-sm text-muted-foreground mb-4">Complete Access</p>
                          <ul className="text-sm text-left space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>Full course access</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>Submit assignments</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>Get grades & feedback</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${enrollmentType === 'audit' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                        onClick={() => setEnrollmentType('audit')}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold mb-2">AUDIT</div>
                          <p className="text-sm text-muted-foreground mb-4">View Only</p>
                          <ul className="text-sm text-left space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>View all materials</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>No assignments</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>No certificate</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Message to Instructor (Optional)
                        </label>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell the instructor why you want to enroll in this course..."
                          rows={4}
                          maxLength={500}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {message.length}/500 characters
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={!enrollmentType || isSubmitting}
                        className="w-full bg-gradient-to-r from-primary to-accent"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Submit Enrollment Request
                          </div>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        Your request will be reviewed by the instructor. You'll be notified once it's approved.
                      </p>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
