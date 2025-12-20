import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle, AlertCircle, Upload, Eye, Filter, Plus, Edit2, Trash2, X, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { studentService } from "@/services/studentService";
import { instructorService } from "@/services/instructorService";
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
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // Submission modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  
  // View submission modal state
  const [showViewSubmissionModal, setShowViewSubmissionModal] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      if (isStudent) {
        const response = await studentService.getMyAssignments();
        console.log('=== FETCH ASSIGNMENTS RESPONSE ===');
        console.log('Response:', response);
        const assignmentsData = response?.data || response || [];
        console.log('Assignments data:', assignmentsData);
        console.log('First assignment:', assignmentsData[0]);
        if (assignmentsData[0]) {
          console.log('First assignment submissions:', assignmentsData[0].submissions);
        }
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      } else {
        // For faculty, we need to get assignments from all their courses
        const coursesResponse = await instructorService.getMyCourses();
        const courses = coursesResponse?.data || coursesResponse || [];
        
        // Fetch assignments for each course
        const allAssignments: any[] = [];
        for (const course of courses) {
          try {
            const assignmentsResponse = await instructorService.getCourseAssignments(course._id);
            const courseAssignments = assignmentsResponse?.data || assignmentsResponse || [];
            allAssignments.push(...courseAssignments.map((a: any) => ({
              ...a,
              courseName: course.courseName,
              courseCode: course.courseCode,
            })));
          } catch (error) {
            console.error(`Error fetching assignments for course ${course._id}:`, error);
          }
        }
        setAssignments(allAssignments);
      }
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast.error(error.response?.data?.message || 'Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    const assignment = assignments.find(a => a._id === assignmentId);
    if (!assignment) return;
    
    setSelectedAssignment(assignment);
    setSubmissionText("");
    setSubmissionFile(null);
    setSubmissionUrl("");
    setShowSubmitModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      setSubmissionFile(file);
    }
  };

  const handleSubmitSubmission = async () => {
    if (!selectedAssignment) return;
    
    // Validate that at least one field is filled
    if (!submissionText.trim() && !submissionFile && !submissionUrl.trim()) {
      toast.error('Please provide submission text, file, or URL');
      return;
    }

    try {
      setSubmitting(true);
      
      let fileUrl = submissionUrl;
      
      // Upload file if provided
      if (submissionFile) {
        const formData = new FormData();
        formData.append('file', submissionFile);
        
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication token not found. Please login again.');
          return;
        }
        
        const uploadResponse = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData.data.url;
        } else {
          const errorText = await uploadResponse.text();
          console.error('Upload failed:', errorText);
          
          if (uploadResponse.status === 401) {
            toast.error('Your session has expired. Please logout and login again.');
            return;
          }
          
          toast.error('File upload failed');
          return;
        }
      }

      // Submit assignment
      const submissionData = {
        submissionText: submissionText.trim(),
        submissionUrl: fileUrl || undefined,
        comments: submissionText.trim() || undefined,
      };

      console.log('Submitting assignment with data:', submissionData);
      const response = await studentService.submitAssignment(selectedAssignment._id, submissionData);
      console.log('Submission response:', response);
      console.log('Response data:', response.data);
      
      // Close modal and clear state
      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSubmissionText("");
      setSubmissionFile(null);
      setSubmissionUrl("");
      
      // Show success message
      toast.success('Assignment submitted successfully! Refreshing...');
      
      // Immediately refresh assignments
      setLoading(true);
      try {
        const refreshResponse = await studentService.getMyAssignments();
        console.log('Refresh response:', refreshResponse);
        const assignmentsData = refreshResponse?.data || refreshResponse || [];
        console.log('Refreshed assignments:', assignmentsData);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
        toast.success('Assignment list updated!');
      } catch (refreshError) {
        console.error('Error refreshing:', refreshError);
        toast.error('Please refresh the page to see updated status');
      } finally {
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit assignment';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewFeedback = (assignment: any) => {
    const submission = getSubmissionForStudent(assignment);
    setSelectedFeedback({
      assignment,
      submission,
    });
    setShowFeedbackModal(true);
  };

  const handleViewSubmission = (assignment: any) => {
    const submission = getSubmissionForStudent(assignment);
    setViewingSubmission({
      assignment,
      submission,
    });
    setShowViewSubmissionModal(true);
  };

  const getAssignmentStatus = (assignment: any) => {
    if (isStudent) {
      console.log(`Checking status for assignment: ${assignment.title}`);
      console.log('Assignment submissions:', assignment.submissions);
      console.log('Current user ID:', user?.id);
      
      // Check if student has submitted using the new structure
      const submission = assignment.submissions?.find((s: any) => {
        const studentId = s.student?._id || s.student;
        const currentUserId = user?.id; // Use user.id instead of user._id
        console.log(`Comparing: ${studentId} === ${currentUserId}`);
        return studentId?.toString() === currentUserId?.toString();
      });
      
      console.log('Found submission:', submission);
      
      if (submission) {
        if (submission.grade !== undefined && submission.grade !== null) {
          console.log('Status: graded');
          return 'graded';
        }
        console.log('Status: submitted');
        return 'submitted';
      }
      // Check if overdue
      if (new Date(assignment.dueDate) < new Date()) {
        console.log('Status: overdue');
        return 'overdue';
      }
      console.log('Status: pending');
      return 'pending';
    }
    return 'active';
  };

  const getSubmissionForStudent = (assignment: any) => {
    if (!isStudent) return null;
    return assignment.submissions?.find((s: any) => {
      const studentId = s.student?._id || s.student;
      const currentUserId = user?.id; // Use user.id instead of user._id
      return studentId?.toString() === currentUserId?.toString();
    });
  };

  const filterAssignments = (status: string) => {
    if (status === 'all') return assignments;
    return assignments.filter(a => getAssignmentStatus(a) === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/loadicon.gif" alt="Loading" className="h-48 w-48" />
      </div>
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Assignments</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isStudent ? "Track and submit your assignments" : "Manage and grade assignments"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchAssignments()}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {!isStudent && (
            <Button className="bg-gradient-to-r from-primary to-accent">
              <FileText className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </div>
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
            {filterAssignments('all').length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                <p className="text-muted-foreground">Check back later for new assignments</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} className="grid gap-4">
                {filterAssignments('all').map((assignment) => {
                  const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                  const status = getAssignmentStatus(assignment);
                  const submission = getSubmissionForStudent(assignment);
                  
                  return (
                    <motion.div
                      key={assignment._id}
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
                              <p className="text-sm text-muted-foreground">
                                {assignment.course?.courseName || assignment.courseName}
                              </p>
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
                            {status === "pending" && daysUntilDue > 0 && (
                              <span className={`text-xs ${daysUntilDue <= 3 ? "text-warning" : "text-muted-foreground"}`}>
                                {daysUntilDue} days remaining
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{assignment.totalMarks} points</span>
                              {status === "graded" && submission && (
                                <span className="text-success">• {submission.grade}/{assignment.totalMarks}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getStatusBadge(status)}
                            {status === "pending" && (
                              <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-primary to-accent"
                                onClick={() => handleSubmitAssignment(assignment._id)}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Submit
                              </Button>
                            )}
                            {status === "submitted" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewSubmission(assignment)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Submission
                              </Button>
                            )}
                            {status === "graded" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewFeedback(assignment)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Feedback
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {status === "graded" && submission && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">Score:</span>
                            <Progress value={(submission.grade / assignment.totalMarks) * 100} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{Math.round((submission.grade / assignment.totalMarks) * 100)}%</span>
                          </div>
                          {submission.feedback && (
                            <div className="mt-2 p-3 bg-secondary/50 rounded-lg">
                              <p className="text-sm text-muted-foreground"><strong>Feedback:</strong> {submission.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-4">
              {filterAssignments('pending').length === 0 ? (
                <div className="glass rounded-xl p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No pending assignments</p>
                </div>
              ) : (
                filterAssignments('pending').map((assignment) => {
                  const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                  return (
                    <motion.div
                      key={assignment._id}
                      variants={itemVariants}
                      className="glass rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{assignment.course?.courseName || assignment.courseName}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                            {daysUntilDue > 0 && (
                              <span className={`text-xs px-2 py-1 rounded ${daysUntilDue <= 3 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                                {daysUntilDue} days left
                              </span>
                            )}
                            <span className="text-sm text-muted-foreground">{assignment.totalMarks} points</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-primary to-accent"
                          onClick={() => handleSubmitAssignment(assignment._id)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Submit
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="submitted">
            <div className="grid gap-4">
              {filterAssignments('submitted').length === 0 ? (
                <div className="glass rounded-xl p-12 text-center">
                  <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No submitted assignments</h3>
                  <p className="text-muted-foreground">Assignments you submit will appear here</p>
                </div>
              ) : (
                filterAssignments('submitted').map((assignment) => {
                  const submission = getSubmissionForStudent(assignment);
                  return (
                    <motion.div
                      key={assignment._id}
                      variants={itemVariants}
                      className="glass rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {assignment.course?.courseName || assignment.courseName}
                          </p>
                          <p className="text-sm text-info mt-1">
                            Submitted on {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-sm text-warning mt-1">Awaiting grade...</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge("submitted")}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewSubmission(assignment)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Submission
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="graded">
            <div className="grid gap-4">
              {filterAssignments('graded').length === 0 ? (
                <div className="glass rounded-xl p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No graded assignments</h3>
                  <p className="text-muted-foreground">Graded assignments will appear here</p>
                </div>
              ) : (
                filterAssignments('graded').map((assignment) => {
                  const submission = getSubmissionForStudent(assignment);
                  return (
                    <motion.div
                      key={assignment._id}
                      variants={itemVariants}
                      className="glass rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{assignment.title}</h3>
                          <p className="text-sm text-success">
                            Grade: {submission?.grade}/{assignment.totalMarks} ({Math.round((submission?.grade / assignment.totalMarks) * 100)}%)
                          </p>
                          {submission?.feedback && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Feedback:</strong> {submission.feedback}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewFeedback(assignment)}
                        >
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
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

          {assignments.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
              <p className="text-muted-foreground">Create assignments from your course pages</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => {
                const totalSubmissions = assignment.submissions?.length || 0;
                const gradedSubmissions = assignment.submissions?.filter((s: any) => s.grade !== undefined && s.grade !== null).length || 0;
                const pendingGrading = totalSubmissions - gradedSubmissions;
                const totalStudents = assignment.course?.enrollmentCount || 0;
                
                return (
                  <motion.div
                    key={assignment._id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="glass rounded-xl p-6 border border-border/50"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{assignment.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {assignment.courseCode || assignment.course?.courseCode}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{assignment.courseName || assignment.course?.courseName}</p>
                        <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{assignment.totalMarks} points</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{totalSubmissions}</div>
                          <div className="text-xs text-muted-foreground">Submissions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-warning">{pendingGrading}</div>
                          <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success">{gradedSubmissions}</div>
                          <div className="text-xs text-muted-foreground">Graded</div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-primary to-accent"
                          onClick={() => toast.info('Grade submissions feature coming soon!')}
                        >
                          Grade Submissions
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          Submission Progress
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {totalStudents > 0 ? Math.round((totalSubmissions / totalStudents) * 100) : 0}% submitted
                        </span>
                      </div>
                      <Progress 
                        value={totalStudents > 0 ? (totalSubmissions / totalStudents) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
      
      {/* Submit Assignment Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Submit Assignment</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedAssignment?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Assignment Details */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Course:</span>
                <span className="text-white font-medium">
                  {selectedAssignment?.course?.courseName || selectedAssignment?.courseName}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Due Date:</span>
                <span className="text-white font-medium">
                  {selectedAssignment?.dueDate ? new Date(selectedAssignment.dueDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Points:</span>
                <span className="text-white font-medium">{selectedAssignment?.totalMarks}</span>
              </div>
            </div>

            {/* Submission Text */}
            <div className="space-y-2">
              <Label htmlFor="submissionText" className="text-white">
                Submission Text / Answer
              </Label>
              <Textarea
                id="submissionText"
                placeholder="Enter your answer or submission notes here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-[150px]"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="submissionFile" className="text-white">
                Upload File (Optional)
              </Label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                {submissionFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-white">{submissionFile.name}</p>
                        <p className="text-xs text-gray-400">
                          {(submissionFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSubmissionFile(null)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="submissionFile" className="flex flex-col items-center cursor-pointer">
                    <Upload className="h-10 w-10 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-300 mb-1">Click to upload file</p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, ZIP up to 10MB</p>
                    <input
                      id="submissionFile"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.zip,.txt,.jpg,.jpeg,.png"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="submissionUrl" className="text-white">
                Submission URL (Optional)
              </Label>
              <Input
                id="submissionUrl"
                type="url"
                placeholder="https://github.com/username/repo or Google Drive link"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">
                Provide a link to your GitHub repo, Google Drive, or other online submission
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
              disabled={submitting}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitSubmission}
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Assignment Feedback</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedFeedback?.assignment?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Grade */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">Your Grade</p>
              <div className="text-4xl font-bold text-white mb-2">
                {selectedFeedback?.submission?.grade || 0} / {selectedFeedback?.assignment?.totalMarks || 0}
              </div>
              <div className="text-2xl font-semibold text-blue-400">
                {selectedFeedback?.assignment?.totalMarks 
                  ? Math.round((selectedFeedback?.submission?.grade / selectedFeedback?.assignment?.totalMarks) * 100)
                  : 0}%
              </div>
              <Progress 
                value={selectedFeedback?.assignment?.totalMarks 
                  ? (selectedFeedback?.submission?.grade / selectedFeedback?.assignment?.totalMarks) * 100
                  : 0} 
                className="mt-4 h-2"
              />
            </div>

            {/* Submission Details */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Submitted On</p>
                <p className="text-sm text-white">
                  {selectedFeedback?.submission?.submittedAt 
                    ? new Date(selectedFeedback.submission.submittedAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
              
              {selectedFeedback?.submission?.submissionText && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Your Submission</p>
                  <p className="text-sm text-white whitespace-pre-wrap">
                    {selectedFeedback.submission.submissionText}
                  </p>
                </div>
              )}
              
              {selectedFeedback?.submission?.files && selectedFeedback.submission.files.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Submission Files</p>
                  {selectedFeedback.submission.files.map((file: string, index: number) => (
                    <a 
                      key={index}
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 underline flex items-center gap-1 mb-1"
                    >
                      <Paperclip className="h-3 w-3" />
                      View File {index + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Feedback */}
            {selectedFeedback?.submission?.feedback && (
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Instructor Feedback</p>
                <p className="text-sm text-white whitespace-pre-wrap">
                  {selectedFeedback.submission.feedback}
                </p>
              </div>
            )}

            {!selectedFeedback?.submission?.feedback && (
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-400">No feedback provided yet</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowFeedbackModal(false)}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Submission Modal */}
      <Dialog open={showViewSubmissionModal} onOpenChange={setShowViewSubmissionModal}>
        <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Your Submission</DialogTitle>
            <DialogDescription className="text-gray-400">
              {viewingSubmission?.assignment?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Assignment Details */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Course:</span>
                <span className="text-white font-medium">
                  {viewingSubmission?.assignment?.course?.courseName || viewingSubmission?.assignment?.courseName}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Due Date:</span>
                <span className="text-white font-medium">
                  {viewingSubmission?.assignment?.dueDate 
                    ? new Date(viewingSubmission.assignment.dueDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Submitted On:</span>
                <span className="text-white font-medium">
                  {viewingSubmission?.submission?.submittedAt 
                    ? new Date(viewingSubmission.submission.submittedAt).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <Badge variant={viewingSubmission?.submission?.status === 'late' ? 'destructive' : 'default'}>
                  {viewingSubmission?.submission?.status || 'submitted'}
                </Badge>
              </div>
            </div>

            {/* Submission Text */}
            {viewingSubmission?.submission?.submissionText && (
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Your Answer / Notes</p>
                <p className="text-sm text-white whitespace-pre-wrap">
                  {viewingSubmission.submission.submissionText}
                </p>
              </div>
            )}

            {/* Submission Files */}
            {viewingSubmission?.submission?.files && viewingSubmission.submission.files.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-3">Submitted Files</p>
                <div className="space-y-2">
                  {viewingSubmission.submission.files.map((file: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-white">Submission File {index + 1}</span>
                      </div>
                      <a 
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                      >
                        View / Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Message */}
            <div className={`rounded-lg p-4 ${
              viewingSubmission?.submission?.status === 'late' 
                ? 'bg-red-900/20 border border-red-700' 
                : 'bg-green-900/20 border border-green-700'
            }`}>
              <p className={`text-sm ${
                viewingSubmission?.submission?.status === 'late' ? 'text-red-400' : 'text-green-400'
              }`}>
                {viewingSubmission?.submission?.status === 'late' 
                  ? '⚠️ This assignment was submitted after the due date'
                  : '✓ Assignment submitted successfully and awaiting review'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowViewSubmissionModal(false)}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
