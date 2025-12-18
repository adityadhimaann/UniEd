import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Users, BookOpen, UserPlus, Check, X, Clock } from 'lucide-react';

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

export default function CoursesManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: 3,
    semester: 1,
    department: '',
  });

  useEffect(() => {
    fetchCourses();
    fetchEnrollmentRequests();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getMyCourses();
      console.log('Instructor courses response:', response);
      // API returns { success, data, message } - data contains the courses array
      const coursesData = response?.data || response || [];
      console.log('Instructor courses data:', coursesData);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentRequests = async () => {
    try {
      const response = await instructorService.getEnrollmentRequests('pending');
      const requestsData = response?.data || response || [];
      setEnrollmentRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error('Error fetching enrollment requests:', error);
      setEnrollmentRequests([]);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      console.log('Approving request:', requestId);
      const response = await instructorService.respondToEnrollmentRequest(requestId, 'approved');
      console.log('Approve response:', response);
      await fetchEnrollmentRequests();
      alert('✅ Enrollment request approved successfully!');
    } catch (error: any) {
      console.error('Error approving request:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error approving request';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const responseMessage = prompt('Enter rejection reason (optional):');
    try {
      console.log('Rejecting request:', requestId);
      const response = await instructorService.respondToEnrollmentRequest(requestId, 'rejected', responseMessage || undefined);
      console.log('Reject response:', response);
      await fetchEnrollmentRequests();
      alert('Enrollment request rejected.');
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error rejecting request';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await instructorService.createCourse(formData);
      setShowCreateForm(false);
      setFormData({ code: '', name: '', description: '', credits: 3, semester: 1, department: '' });
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating course');
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setFormData({
      code: course.courseCode,
      name: course.courseName,
      description: course.description || '',
      credits: course.credits,
      semester: course.semester,
      department: course.department || '',
    });
    setShowCreateForm(false);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      await instructorService.updateCourse(editingCourse._id, {
        name: formData.name,
        description: formData.description,
        credits: formData.credits,
        semester: formData.semester,
        department: formData.department,
      });
      setEditingCourse(null);
      setFormData({ code: '', name: '', description: '', credits: 3, semester: 1, department: '' });
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating course');
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setFormData({ code: '', name: '', description: '', credits: 3, semester: 1, department: '' });
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await instructorService.deleteCourse(courseId);
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting course');
    }
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.courseCode?.toLowerCase().includes(query) ||
      course.courseName?.toLowerCase().includes(query) ||
      course.department?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/loadicon.gif" alt="Loading..." className="h-48 w-48" />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <p className="text-gray-400 mt-1">Manage your courses</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </motion.div>

      {/* Search Input */}
      {!showCreateForm && !editingCourse && (
        <motion.div variants={itemVariants}>
          <Input
            placeholder="Search courses by code, name, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </motion.div>
      )}

      {/* Edit Course Form */}
      {editingCourse && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-white">Edit Course</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      disabled
                      className="bg-gray-700 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400">Course code cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Course Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Introduction to Programming"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Course description..."
                    required
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits *</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      min="1"
                      max="6"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester (1-12) *</Label>
                    <Input
                      id="semester"
                      type="number"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                      min="1"
                      max="12"
                      placeholder="1"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Computer Science"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Update Course
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create Course Form */}
      {showCreateForm && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Course</CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CS101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Introduction to Programming"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course description..."
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits *</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    min="1"
                    max="6"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester (1-12) *</Label>
                  <Input
                    id="semester"
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    min="1"
                    max="12"
                    placeholder="1"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Computer Science"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Course
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </motion.div>
      )}

      {/* Pending Enrollment Requests */}
      {enrollmentRequests.length > 0 && (
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-white">Pending Enrollment Requests</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-orange-900 text-orange-300">
                  {enrollmentRequests.length} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enrollmentRequests.map((request: any, index: number) => (
                  <motion.div 
                    key={request._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900 rounded-lg p-4 flex items-center justify-between gap-4 hover:bg-gray-850 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {request.student?.avatar ? (
                        <img 
                          src={request.student.avatar} 
                          alt={request.student?.firstName} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {request.student?.firstName?.[0]}{request.student?.lastName?.[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">
                            {request.student?.firstName} {request.student?.lastName}
                          </h4>
                          <span className="text-xs text-gray-400">{request.student?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-300">{request.course?.name || request.course?.courseName}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-blue-400">{request.course?.code || request.course?.courseCode}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900 text-purple-300">
                            {request.enrollmentType}
                          </span>
                        </div>
                        {request.message && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{request.message}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(request.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request._id)}
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Courses List */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {filteredCourses.map((course) => (
          <motion.div key={course._id} variants={itemVariants}>
            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-600">{course.courseCode}</span>
                    </div>
                    <CardTitle className="mt-2 text-white">{course.courseName}</CardTitle>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.isActive
                      ? 'bg-green-900 text-green-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{course.credits} Credits</span>
                <span>{course.semester}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.location.href = `/instructor/courses/${course._id}`}
                >
                  <Users className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCourse(course)}
                >
                  <Edit2 className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCourse(course._id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredCourses.length === 0 && !showCreateForm && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? 'No courses found' : 'No courses yet'}
              </h3>
              <p className="text-gray-400 mb-4">
                {searchQuery 
                  ? `No courses match "${searchQuery}"`
                  : 'Get started by creating your first course'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
