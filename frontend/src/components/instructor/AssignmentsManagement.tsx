import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, FileText, Eye, Edit, Trash2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function AssignmentsManagement() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [viewingAssignment, setViewingAssignment] = useState<any>(null);
  const [formData, setFormData] = useState({
    course: courseId || '',
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 100,
  });

  useEffect(() => {
    fetchData();
    // Auto-open create form if courseId is provided
    if (courseId) {
      setShowCreateForm(true);
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      const coursesRes = await instructorService.getMyCourses();
      const coursesData = coursesRes?.data || coursesRes || [];
      console.log('Courses data:', coursesData);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      
      if (courseId) {
        // Update form data with the courseId
        setFormData(prev => ({ ...prev, course: courseId }));
        const assignmentsRes = await instructorService.getCourseAssignments(courseId);
        setAssignments(assignmentsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.course) {
      alert('Please select a course');
      return;
    }
    if (!formData.title || formData.title.trim() === '') {
      alert('Please enter a title');
      return;
    }
    if (!formData.dueDate) {
      alert('Please select a due date');
      return;
    }
    if (!formData.totalPoints || formData.totalPoints < 1) {
      alert('Total points must be at least 1');
      return;
    }
    
    try {
      // Prepare data with proper field names
      const assignmentData: any = {
        course: formData.course,
        title: formData.title.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
        totalPoints: formData.totalPoints,
      };
      
      // Only include description if it's not empty
      if (formData.description.trim()) {
        assignmentData.description = formData.description.trim();
      }
      
      console.log('Submitting assignment:', assignmentData);
      
      if (editingAssignment) {
        await instructorService.updateAssignment(editingAssignment._id, assignmentData);
        alert('Assignment updated successfully!');
        setEditingAssignment(null);
      } else {
        const response = await instructorService.createAssignment(assignmentData);
        console.log('Assignment created:', response);
        alert('Assignment created successfully!');
      }
      
      setShowCreateForm(false);
      setFormData({ course: courseId || '', title: '', description: '', dueDate: '', totalPoints: 100 });
      fetchData();
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Error creating assignment';
      const errorDetails = error.response?.data?.errors 
        ? '\n' + error.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n')
        : '';
      alert(errorMessage + errorDetails);
    }
  };

  const handleEdit = (assignment: any) => {
    setEditingAssignment(assignment);
    setFormData({
      course: assignment.course._id || assignment.course,
      title: assignment.title,
      description: assignment.description || '',
      dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
      totalPoints: assignment.totalMarks,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }
    
    try {
      await instructorService.deleteAssignment(assignmentId);
      alert('Assignment deleted successfully!');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      alert(error.response?.data?.message || 'Error deleting assignment');
    }
  };

  const handleView = (assignment: any) => {
    console.log('=== VIEW BUTTON CLICKED ===');
    console.log('Assignment data:', assignment);
    console.log('Setting viewingAssignment state...');
    setViewingAssignment(assignment);
    setShowCreateForm(false); // Close create form if open
    setEditingAssignment(null); // Close edit mode
    console.log('Scrolling to top...');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingAssignment(null);
    setFormData({ course: courseId || '', title: '', description: '', dueDate: '', totalPoints: 100 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/loadicon.gif" alt="Loading..." className="h-48 w-48" />
      </div>
    );
  }

  console.log('Render - viewingAssignment:', viewingAssignment ? viewingAssignment.title : 'null');
  console.log('Render - showCreateForm:', showCreateForm);

  return (
    <motion.div 
      className="space-y-6" 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold text-white">Assignments</h1>
          <p className="text-gray-400 mt-1">
            Create and manage assignments
            {viewingAssignment && <span className="ml-2 text-blue-400 font-semibold">• Viewing: {viewingAssignment.title}</span>}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAssignment(null);
            setFormData({ course: courseId || '', title: '', description: '', dueDate: '', totalPoints: 100 });
            setShowCreateForm(!showCreateForm);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </motion.div>

      {viewingAssignment && (
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="relative z-50"
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500 shadow-2xl ring-4 ring-blue-500/20">
            <CardHeader className="bg-blue-600/10 border-b border-blue-500/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="h-7 w-7 text-blue-400" />
                  {viewingAssignment.title}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setViewingAssignment(null)}
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-base font-semibold text-blue-400 mb-2">Course</h3>
                <p className="text-white text-lg font-medium">
                  {viewingAssignment.course?.courseCode} - {viewingAssignment.course?.courseName}
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-base font-semibold text-blue-400 mb-2">Description</h3>
                <p className="text-white text-base whitespace-pre-wrap leading-relaxed">
                  {viewingAssignment.description || 'No description provided'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-base font-semibold text-blue-400 mb-2">Due Date</h3>
                  <p className="text-white text-lg font-medium flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    {new Date(viewingAssignment.dueDate).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-base font-semibold text-blue-400 mb-2">Total Points</h3>
                  <p className="text-white text-2xl font-bold">{viewingAssignment.totalMarks}</p>
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-base font-semibold text-blue-400 mb-2">Submissions</h3>
                <p className="text-white text-xl font-semibold">{viewingAssignment.submissions?.length || 0} submissions</p>
              </div>
              {viewingAssignment.attachments && viewingAssignment.attachments.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-base font-semibold text-blue-400 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {viewingAssignment.attachments.map((attachment: string, index: number) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-base font-medium block underline"
                      >
                        📎 Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    handleEdit(viewingAssignment);
                    setViewingAssignment(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Assignment
                </Button>
                <Button
                  onClick={() => {
                    setViewingAssignment(null);
                    handleDelete(viewingAssignment._id);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-base"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete Assignment
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {showCreateForm && (
        <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500 shadow-xl">
          <CardHeader className="bg-blue-600/10 border-b border-blue-500/30">
            <CardTitle className="text-2xl font-bold text-white">
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course" className="text-gray-200">Course *</Label>
                <select
                  id="course"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white"
                  required
                  disabled={!!courseId}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </select>
                {courseId && <p className="text-xs text-gray-400">Course pre-selected from course details</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-200">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Assignment title"
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-200">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Assignment description (optional)..."
                  rows={4}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-gray-200">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalPoints" className="text-gray-200">Total Points *</Label>
                  <Input
                    id="totalPoints"
                    type="number"
                    value={formData.totalPoints}
                    onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) })}
                    min="1"
                    required
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}
                  className="border-gray-700 text-gray-200 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </motion.div>
      )}

      {assignments.length > 0 ? (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
          {assignments.map((assignment) => (
            <motion.div key={assignment._id} variants={itemVariants}>
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-400" />
                  <span className="line-clamp-1">{assignment.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-base mb-3 line-clamp-2 min-h-[3rem]">
                  {assignment.description || 'No description provided'}
                </p>
                <div className="space-y-2.5 text-base bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-gray-400">Due:</span>
                    <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-sm text-gray-400">Points:</span>
                    <span className="font-semibold text-lg text-blue-400">{assignment.totalMarks}</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-sm text-gray-400">Submissions:</span>
                    <span className="font-semibold text-lg text-green-400">{assignment.submissions?.length || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('View button clicked for:', assignment.title);
                      handleView(assignment);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEdit(assignment)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(assignment._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600">
          <CardContent className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">No assignments yet</h3>
            <p className="text-gray-300 text-lg mb-4">Create your first assignment to get started</p>
          </CardContent>
        </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
