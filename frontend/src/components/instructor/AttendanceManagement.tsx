import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Calendar as CalendarIcon, Users, TrendingUp, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getSocket } from '@/lib/socket';

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

interface AttendanceRecord {
  student: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AttendanceManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMarkDialog, setShowMarkDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchCourses();
    
    // Socket.IO for real-time attendance notifications
    const socket = getSocket();
    if (socket) {
      socket.on('attendance:marked', (data) => {
        toast.success('Attendance updated in real-time');
        if (selectedCourse && data.courseId === selectedCourse._id) {
          fetchCourseData(selectedCourse._id);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('attendance:marked');
      }
    };
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getMyCourses();
      setCourses(response.data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error(error.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseData = async (courseId: string) => {
    try {
      setLoading(true);
      const [studentsRes, statsRes, historyRes] = await Promise.all([
        instructorService.getCourseStudents(courseId),
        instructorService.getAttendanceStats(courseId),
        instructorService.getCourseAttendance(courseId),
      ]);

      setCourseData({
        students: studentsRes.data,
        stats: statsRes.data,
        history: historyRes.data,
      });

      // Initialize attendance records for all students
      const initialRecords: Record<string, AttendanceRecord> = {};
      studentsRes.data.forEach((student: Student) => {
        initialRecords[student._id] = {
          student: student._id,
          status: 'present',
        };
      });
      setAttendanceRecords(initialRecords);
    } catch (error: any) {
      console.error('Error fetching course data:', error);
      toast.error(error.response?.data?.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course);
    fetchCourseData(course._id);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCourseData(null);
  };

  const handleMarkAttendance = () => {
    if (courseData) {
      setShowMarkDialog(true);
    }
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const submitAttendance = async () => {
    if (!selectedCourse) return;

    try {
      setMarking(true);
      const records = Object.values(attendanceRecords);
      
      await instructorService.markAttendance(selectedCourse._id, selectedDate, records);
      
      // Emit socket event for real-time update
      const socket = getSocket();
      if (socket) {
        socket.emit('attendance:mark', {
          courseId: selectedCourse._id,
          date: selectedDate,
        });
      }

      toast.success('Attendance marked successfully');
      setShowMarkDialog(false);
      fetchCourseData(selectedCourse._id);
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarking(false);
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
      className="space-y-6 p-4" 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold text-white">Attendance Management</h1>
          <p className="text-gray-400 mt-1">
            {selectedCourse ? `${selectedCourse.courseCode} - ${selectedCourse.courseName}` : 'View and manage attendance for your courses'}
          </p>
        </div>
        {selectedCourse && (
          <Button 
            onClick={handleBackToCourses}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            ← Back to Courses
          </Button>
        )}
      </motion.div>

      {!selectedCourse ? (
        // Course Cards View
        <>
          {courses.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600">
                <CardContent className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
                  <p className="text-gray-400">Create a course to start managing attendance</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
              {courses.map((course) => (
                <motion.div key={course._id} variants={itemVariants}>
                  <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-blue-400" />
                        <span className="line-clamp-1">{course.courseCode}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{course.courseName}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2 min-h-[2.5rem]">
                          {course.description || 'No description available'}
                        </p>
                      </div>
                      <div className="space-y-2 text-sm bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-gray-400">Credits:</span>
                          <span className="font-semibold">{course.credits || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-white">
                          <span className="text-gray-400">Semester:</span>
                          <span className="font-semibold">{course.semester || 'N/A'}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewCourse(course)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Attendance
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      ) : (
        // Detailed Attendance View
        courseData && (
          <div className="space-y-6">
            {/* Mark Attendance Button */}
            <motion.div variants={itemVariants} className="flex justify-end">
              <Button 
                onClick={handleMarkAttendance}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={itemVariants}>
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Students</p>
                      <p className="text-2xl font-bold text-white">{courseData.students?.length || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Sessions</p>
                      <p className="text-2xl font-bold text-white">{courseData.stats?.totalSessions || 0}</p>
                    </div>
                    <CalendarIcon className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Avg Attendance</p>
                      <p className="text-2xl font-bold text-white">
                        {courseData.stats?.students?.length > 0
                          ? (
                              courseData.stats.students.reduce((sum: number, s: any) => sum + parseFloat(s.attendancePercentage), 0) /
                              courseData.stats.students.length
                            ).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Course Code</p>
                      <p className="text-lg font-bold text-white truncate">{selectedCourse.courseCode}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Student Attendance Table */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Student Attendance Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {courseData.stats?.students?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-300">Student</th>
                            <th className="text-center py-3 px-4 text-gray-300">Total Classes</th>
                            <th className="text-center py-3 px-4 text-gray-300">Present</th>
                            <th className="text-center py-3 px-4 text-gray-300">Absent</th>
                            <th className="text-center py-3 px-4 text-gray-300">Late</th>
                            <th className="text-center py-3 px-4 text-gray-300">Attendance %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseData.stats.students.map((student: any) => (
                            <tr key={student.student._id} className="border-b border-gray-700/50">
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-white">{student.student.firstName} {student.student.lastName}</p>
                                  <p className="text-sm text-gray-400">{student.student.email}</p>
                                </div>
                              </td>
                              <td className="text-center py-3 px-4 text-white">{student.totalClasses}</td>
                              <td className="text-center py-3 px-4">
                                <span className="inline-flex items-center gap-1 text-green-400">
                                  <CheckCircle className="h-4 w-4" />
                                  {student.present}
                                </span>
                              </td>
                              <td className="text-center py-3 px-4">
                                <span className="inline-flex items-center gap-1 text-red-400">
                                  <XCircle className="h-4 w-4" />
                                  {student.absent}
                                </span>
                              </td>
                              <td className="text-center py-3 px-4">
                                <span className="inline-flex items-center gap-1 text-yellow-400">
                                  <Clock className="h-4 w-4" />
                                  {student.late}
                                </span>
                              </td>
                              <td className="text-center py-3 px-4">
                                <span className={`font-bold ${
                                  parseFloat(student.attendancePercentage) >= 75 
                                    ? 'text-green-400' 
                                    : parseFloat(student.attendancePercentage) >= 60
                                    ? 'text-yellow-400'
                                    : 'text-red-400'
                                }`}>
                                  {student.attendancePercentage}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No students enrolled yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Attendance History */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                  {courseData.history?.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No attendance records yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courseData.history?.map((record: any) => (
                        <div key={record._id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{format(new Date(record.date), 'MMMM dd, yyyy')}</h4>
                            <span className="text-sm text-gray-400">
                              {record.records.length} students marked
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-400">
                              Present: {record.records.filter((r: any) => r.status === 'present').length}
                            </span>
                            <span className="text-red-400">
                              Absent: {record.records.filter((r: any) => r.status === 'absent').length}
                            </span>
                            <span className="text-yellow-400">
                              Late: {record.records.filter((r: any) => r.status === 'late').length}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )
      )}

      {/* Mark Attendance Dialog */}
      <Dialog open={showMarkDialog} onOpenChange={setShowMarkDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Mark Attendance - {selectedCourse?.courseCode} {selectedCourse?.courseName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-white">Students</h4>
              {courseData && courseData.students.map((student: Student) => (
                <div key={student._id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/50">
                  <div>
                    <p className="font-medium text-white">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-400">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={attendanceRecords[student._id]?.status === 'present' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(student._id, 'present')}
                      className={attendanceRecords[student._id]?.status === 'present' ? 'bg-green-500 hover:bg-green-600' : 'border-gray-600 text-gray-300'}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceRecords[student._id]?.status === 'late' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(student._id, 'late')}
                      className={attendanceRecords[student._id]?.status === 'late' ? 'bg-yellow-500 hover:bg-yellow-600' : 'border-gray-600 text-gray-300'}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Late
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceRecords[student._id]?.status === 'absent' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(student._id, 'absent')}
                      className={attendanceRecords[student._id]?.status === 'absent' ? 'bg-red-500 hover:bg-red-600' : 'border-gray-600 text-gray-300'}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowMarkDialog(false);
                }}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={submitAttendance} 
                disabled={marking}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {marking ? 'Marking...' : 'Submit Attendance'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
