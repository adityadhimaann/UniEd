import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  FileText,
  Users,
  Clock,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

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
  maxStudents?: number;
  students?: number;
  progress?: number;
  status?: string;
  isActive?: boolean;
  nextClass?: string;
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

  if (!course) return null;

  // Mock data - in real app, this would come from API
  const attendanceRequirement = 75; // minimum percentage required
  
  const courseDetails = {
    description: "Master fundamental data structures and algorithms essential for software development. Learn to analyze, design, and implement efficient solutions to complex problems.",
    duration: "16 weeks",
    lessons: 48,
    assignments: 12,
    attendance: attendanceRequirement,
    price: 299,
    trialDuration: "7 days",
    syllabus: [
      { week: 1, topic: "Introduction to Arrays and Strings", completed: true },
      { week: 2, topic: "Linked Lists and Stacks", completed: true },
      { week: 3, topic: "Queues and Trees", completed: false },
      { week: 4, topic: "Graphs and Hash Tables", completed: false },
    ],
    videos: [
      { id: 1, title: "Introduction to Data Structures", duration: "15:30", watched: true },
      { id: 2, title: "Arrays Deep Dive", duration: "22:45", watched: true },
      { id: 3, title: "Linked Lists Fundamentals", duration: "18:20", watched: false },
      { id: 4, title: "Stack Operations", duration: "20:15", watched: false },
    ],
    assessments: [
      { id: 1, title: "Arrays Quiz", type: "Quiz", dueDate: "Jan 15", status: "Completed", score: 85 },
      { id: 2, title: "Linked List Assignment", type: "Assignment", dueDate: "Jan 22", status: "Pending" },
      { id: 3, title: "Midterm Exam", type: "Exam", dueDate: "Feb 05", status: "Upcoming" },
    ],
    requirements: [
      "Basic programming knowledge (Python/Java/C++)",
      "Understanding of basic mathematics",
      "Dedication of 10-12 hours per week",
      `Minimum ${attendanceRequirement}% attendance required`,
    ],
    learningOutcomes: [
      "Implement and analyze common data structures",
      "Design efficient algorithms for problem-solving",
      "Understand time and space complexity",
      "Apply data structures in real-world scenarios",
    ],
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enrollmentType) {
      toast.error("Please select an enrollment type");
      return;
    }

    setIsSubmitting(true);
    try {
      // Use _id if available, fallback to id
      const courseId = (course as any)._id || course.id;
      
      console.log('Submitting enrollment request:', { courseId, enrollmentType, message: message.trim() });
      
      const response = await api.post('/course-enrollment-requests', {
        courseId,
        enrollmentType,
        message: message.trim(),
      });

      console.log('Enrollment response:', response);

      // Check if the response indicates success
      if (response.data?.success || response.status === 200 || response.status === 201) {
        toast.success("🎉 Enrollment request submitted successfully!", {
          description: "Your request is pending instructor approval. You'll be notified once approved.",
          duration: 5000,
        });
        
        setMessage("");
        setEnrollmentType("");
        
        // Refresh the page after a short delay to show updated enrollment status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
        onClose();
      } else {
        throw new Error(response.data?.message || 'Enrollment request failed');
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit enrollment request";
      toast.error(errorMessage, {
        description: "Please try again or contact support if the issue persists.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl glass-strong border border-border/50"
          >
            {/* Header with Image */}
            <div className="relative h-48 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600" />
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
                    <>
                      <img
                        src={course.instructorImage || 'https://via.placeholder.com/32'}
                        alt={course.instructor || 'Instructor'}
                        className="w-8 h-8 rounded-full border-2 border-background"
                      />
                      <span className="text-sm text-muted-foreground">{course.instructor || 'TBA'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-12rem)] p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="assessments">Assessments</TabsTrigger>
                  <TabsTrigger value="enroll">Enroll</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">About This Course</h3>
                    <p className="text-muted-foreground">{course.description || courseDetails.description}</p>
                    {course.department && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Department:</strong> {course.department} • <strong>Credits:</strong> {course.credits} • <strong>Semester:</strong> {course.semester}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold">{courseDetails.duration}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Play className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Lessons</p>
                        <p className="font-semibold">{courseDetails.lessons}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Assignments</p>
                        <p className="font-semibold">{courseDetails.assignments}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Students</p>
                        <p className="font-semibold">{course.maxStudents || course.students || 0}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {courseDetails.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">What You'll Learn</h3>
                    <ul className="space-y-2">
                      {courseDetails.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Award className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Course Syllabus</h3>
                    <div className="space-y-3">
                      {courseDetails.syllabus.map((item) => (
                        <Card key={item.week}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.completed ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                {item.week}
                              </div>
                              <div>
                                <p className="font-medium">Week {item.week}</p>
                                <p className="text-sm text-muted-foreground">{item.topic}</p>
                              </div>
                            </div>
                            {item.completed && (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Video Lectures</h3>
                    <div className="space-y-3">
                      {courseDetails.videos.map((video) => (
                        <Card key={video.id}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Play className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{video.title}</p>
                                <p className="text-sm text-muted-foreground">{video.duration}</p>
                              </div>
                            </div>
                            {video.watched && (
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                Watched
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assessments" className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Assessments & Exams</h3>
                  <div className="space-y-3">
                    {courseDetails.assessments.map((assessment) => (
                      <Card key={assessment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium">{assessment.title}</p>
                                <p className="text-sm text-muted-foreground">{assessment.type}</p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                assessment.status === "Completed"
                                  ? "default"
                                  : assessment.status === "Pending"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              {assessment.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              Due: {assessment.dueDate}
                            </span>
                            {assessment.score && (
                              <span className="font-medium text-primary">Score: {assessment.score}%</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardContent className="p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-500 mb-1">Attendance Requirement</p>
                        <p className="text-sm text-muted-foreground">
                          You must maintain a minimum of {courseDetails.attendance}% attendance to be eligible for final assessments and certification.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
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
                          <p className="text-sm text-muted-foreground mb-4">{courseDetails.trialDuration} Trial</p>
                          <ul className="text-sm text-left space-y-2 text-muted-foreground">
                            <li>• Access to first 3 lessons</li>
                            <li>• Sample assessments</li>
                            <li>• Community access</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all border-primary/50 ${enrollmentType === 'purchase' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                        onClick={() => setEnrollmentType('purchase')}
                      >
                        <CardContent className="p-6 text-center">
                          <Badge className="mb-2">Most Popular</Badge>
                          <div className="text-3xl font-bold mb-2">${courseDetails.price}</div>
                          <p className="text-sm text-muted-foreground mb-4">One-time Purchase</p>
                          <ul className="text-sm text-left space-y-2 text-muted-foreground">
                            <li>• Full course access</li>
                            <li>• All assessments</li>
                            <li>• Certificate on completion</li>
                            <li>• Lifetime access</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${enrollmentType === 'subscription' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                        onClick={() => setEnrollmentType('subscription')}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold mb-2">$49</div>
                          <p className="text-sm text-muted-foreground mb-4">Per Month</p>
                          <ul className="text-sm text-left space-y-2 text-muted-foreground">
                            <li>• Access all courses</li>
                            <li>• Priority support</li>
                            <li>• Exclusive content</li>
                            <li>• Cancel anytime</li>
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
                        Your request will be sent to {course.instructor}. You'll be notified once it's reviewed.
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
