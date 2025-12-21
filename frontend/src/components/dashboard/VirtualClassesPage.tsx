import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { virtualClassService, VirtualClass } from '@/services/virtualClassService';
import { studentService } from '@/services/studentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Calendar, Clock, Users, Play } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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

export function VirtualClassesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [virtualClasses, setVirtualClasses] = useState<VirtualClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchVirtualClasses();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await studentService.getMyCourses();
      // Extract courses from enrollments
      const enrollments = response.data || [];
      const coursesData = enrollments.map((enrollment: any) => enrollment.course).filter(Boolean);
      setCourses(coursesData);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchVirtualClasses = async () => {
    if (!selectedCourse) return;

    try {
      setLoading(true);
      const response = await virtualClassService.getCourseVirtualClasses(selectedCourse);
      setVirtualClasses(response.data || []);
    } catch (error: any) {
      console.error('Error fetching virtual classes:', error);
      toast.error('Failed to load virtual classes');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = (classId: string, status: string) => {
    if (status !== 'live') {
      toast.error('This class is not live yet');
      return;
    }
    navigate(`/dashboard/virtual-class/${classId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/loadicon.gif" alt="Loading..." className="h-48 w-48" />
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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold">Virtual Classes</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <img src="/loadicon.gif" alt="Loading..." className="h-12 w-12" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No enrolled courses found.
              </div>
            ) : (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md"
              >
                <option value="">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {selectedCourse && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <img src="/loadicon.gif" alt="Loading..." className="h-16 w-16" />
            </div>
          ) : virtualClasses.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No virtual classes scheduled</h3>
                  <p className="text-muted-foreground">Check back later for upcoming classes</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            virtualClasses.map((virtualClass) => (
              <Card key={virtualClass._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg line-clamp-2">{virtualClass.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(virtualClass.status)}`}>
                          {virtualClass.status.toUpperCase()}
                        </span>
                        {virtualClass.status === 'live' && (
                          <span className="flex items-center gap-1 text-xs text-green-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Live Now
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {virtualClass.description && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{virtualClass.description}</p>
                  )}

                  <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-200" style={{ color: 'white' }} />
                      <span className="truncate">{format(new Date(virtualClass.scheduledStartTime), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 md:h-4 md:w-4" style={{ color: 'white' }} />
                      <span className="truncate">
                        {format(new Date(virtualClass.scheduledStartTime), 'h:mm a')} -{' '}
                        {format(new Date(virtualClass.scheduledEndTime), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 md:h-4 md:w-4" style={{ color: 'white' }} />
                      <span>
                        {virtualClass.participants.filter(p => !p.leftAt).length} participants
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {virtualClass.status === 'live' ? (
                      <Button
                        onClick={() => handleJoinClass(virtualClass._id, virtualClass.status)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-sm"
                        size="sm"
                      >
                        <Play className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Join Now
                      </Button>
                    ) : virtualClass.status === 'scheduled' ? (
                      <Button variant="outline" className="w-full text-sm" size="sm" disabled>
                        <Clock className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Scheduled
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full text-sm" size="sm" disabled>
                        Ended
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
