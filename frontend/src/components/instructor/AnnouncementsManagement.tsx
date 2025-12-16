import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Bell, AlertCircle } from 'lucide-react';

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

export default function AnnouncementsManagement() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    course: courseId || '',
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const coursesRes = await instructorService.getMyCourses();
      setCourses(coursesRes.data);
      
      if (courseId) {
        const announcementsRes = await instructorService.getCourseAnnouncements(courseId);
        setAnnouncements(announcementsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await instructorService.createAnnouncement(formData);
      setShowCreateForm(false);
      setFormData({ course: courseId || '', title: '', content: '', priority: 'medium' });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating announcement');
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
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold text-white">Announcements</h1>
          <p className="text-gray-400 mt-1">Post updates and announcements</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Announcement
        </Button>
      </motion.div>

      {showCreateForm && (
        <motion.div variants={itemVariants}>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Create New Announcement</CardTitle>
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
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-200">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-gray-200">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Announcement content..."
                  required
                  rows={4}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-gray-200">Priority *</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Announcement
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
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

      {announcements.length > 0 ? (
        <motion.div className="space-y-4" variants={containerVariants}>
          {announcements.map((announcement) => (
            <motion.div key={announcement._id} variants={itemVariants}>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white text-lg">{announcement.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        announcement.priority === 'high'
                          ? 'bg-red-900/50 text-red-200 border border-red-700'
                          : announcement.priority === 'medium'
                          ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-700'
                          : 'bg-blue-900/50 text-blue-200 border border-blue-700'
                      }`}>
                        {announcement.priority}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{announcement.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Bell className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No announcements yet</h3>
            <p className="text-gray-400 mb-4">Create your first announcement to get started</p>
          </CardContent>
        </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
