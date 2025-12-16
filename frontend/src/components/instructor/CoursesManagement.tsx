import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Users, BookOpen } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: 3,
    semester: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await instructorService.getMyCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await instructorService.createCourse(formData);
      setShowCreateForm(false);
      setFormData({ code: '', name: '', description: '', credits: 3, semester: '' });
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating course');
    }
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
                  <Label htmlFor="semester">Semester *</Label>
                  <Input
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    placeholder="Fall 2024"
                    required
                  />
                </div>
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

      {/* Courses List */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {courses.map((course) => (
          <motion.div key={course._id} variants={itemVariants}>
            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-600">{course.code}</span>
                    </div>
                    <CardTitle className="mt-2 text-white">{course.name}</CardTitle>
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

      {courses.length === 0 && !showCreateForm && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No courses yet</h3>
              <p className="text-gray-400 mb-4">Get started by creating your first course</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
