import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Calendar as CalendarIcon, Users, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
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
  const [coursesData, setCoursesData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showMarkDialog, setShowMarkDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchAllCoursesData();
    
    // Socket.IO for real-time attendance notifications
    const socket = getSocket();
    if (socket) {
      socket.on('attendance:marked', (data) => {
        toast.success('Attendance updated in real-time');
        fetchAllCoursesData();
      });
    }

    return () => {
      if (socket) {
        socket.off('attendance:marked');
      }
    };
  }, []);

  const fetchAllCoursesData = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getMyCourses();
      const coursesList = response.data || [];
      setCourses(coursesList);

      // Fetch attendance data for all courses
      const allCoursesData: Record<string, any> = {};
      
      for (const course of coursesList) {
        try {
          const [studentsRes, statsRes, historyRes] = await Promise.all([
            instructorService.getCourseStudents(course._id),
            instructorService.getAttendanceStats(course._id),
            instructorService.getCourseAttendance(course._id),
          ]);

          allCoursesData[course._id] = {
            course,
            students: studentsRes.data,
            stats: statsRes.data,
            history: historyRes.data,
          };
        } catch (error) {
          console.error(`Error fetching data for course ${course._id}:`, error);
        }
      }

      setCoursesData(allCoursesData);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error(error.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = (course: any) => {
    setSelectedCourse(course);
    const courseData = coursesData[course._id];
    if (courseData) {
      // Initialize attendance records for all students
      const initialRecords: Record<string, AttendanceRecord> = {};
      courseData.students.forEach((student: Student) => {
        initialRecords[student._id] = {
          student: student._id,
          status: 'present',
        };
      });
      setAttendanceRecords(initialRecords);
    }
    setShowMarkDialog(true);
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
      setSelectedCourse(null);
      fetchAllCoursesData();
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
          <p className="text-gray-400 mt-1">View and manage attendance for all your courses</p>
        </div>
      </motion.div>

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
        <div className="space-y-8">
          {courses.map((course) => {
            const courseData = coursesData[course._id];
            if (!courseData) return null;

            const { stats, students, history } = courseData;

            return (
              <motion.div key={course._id} variants={itemVariants} className="space-y-4">
                {/* Course Header */}
                <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-white">
                          {course.courseCode} - {course.courseName}
                        </CardTitle>
                        <p className="text-gray-400 mt-1">{course.description}</p>
                      </div>
                      <Button 
                        onClick={() => handleMarkAttendance(course)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Mark Attendance
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Students</p>
                          <p className="text-2xl font-bold text-white">{students?.length || 0}</p>
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
                          <p className="text-2xl font-bold text-white">{stats?.totalSessions || 0}</p>
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
                            {stats?.students?.length > 0
                              ? (
                                  stats.students.reduce((sum: number, s: any) => sum + parseFloat(s.attendancePercentage), 0) /
                                  stats.students.length
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
                          <p className="text-lg font-bold text-white truncate">{course.courseCode}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-cyan-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Student Attendance Table */}
                <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Student Attendance Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.students?.length > 0 ? (
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
                            {stats.students.map((student: any) => (
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

                {/* Attendance History */}
                <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Attendance History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {history?.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No attendance records yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {history?.map((record: any) => (
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
            );
          })}
        </div>
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
              {selectedCourse && coursesData[selectedCourse._id]?.students.map((student: Student) => (
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
                  setSelectedCourse(null);
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
