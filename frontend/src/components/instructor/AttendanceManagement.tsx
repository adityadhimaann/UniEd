import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

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

export default function AttendanceManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

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
          <h1 className="text-3xl font-bold text-white">Attendance</h1>
          <p className="text-gray-400 mt-1">Track and manage student attendance</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Select Course</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white"
          >
            <option value="">Choose a course...</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="text-center py-12">
          <CalendarIcon className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {selectedCourse ? 'No attendance records' : 'Select a course'}
          </h3>
          <p className="text-gray-400">
            {selectedCourse 
              ? 'Mark attendance to get started'
              : 'Choose a course to view attendance records'}
          </p>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
