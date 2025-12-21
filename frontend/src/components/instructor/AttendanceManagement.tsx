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
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
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
        if (data.courseId === selectedCourse) {
          toast.success('Attendance updated in real-time');
          fetchAttendanceData();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('attendance:marked');
      }
    };
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse) {
      fetchAttendanceData();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getMyCourses();
      console.log('Courses response:', response);
      setCourses(response.data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    if (!selectedCourse) return;

    try {
      setLoading(true);
      const [studentsRes, statsRes, historyRes] = await Promise.all([
        instructorService.getCourseStudents(selectedCourse),
        instructorService.getAttendanceStats(selectedCourse),
        instructorService.getCourseAttendance(selectedCourse),
      ]);

      setStudents(studentsRes.data);
      setAttendanceStats(statsRes.data);
      setAttendanceHistory(historyRes.data);

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
      console.error('Error fetching attendance data:', error);
      toast.error(error.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
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
      
      await instructorService.markAttendance(selectedCourse, selectedDate, records);
      
      // Emit socket event for real-time update
      const socket = getSocket();
      if (socket) {
        socket.emit('attendance:mark', {
          courseId: selectedCourse,
          date: selectedDate,
        });
      }

      toast.success('Attendance marked successfully');
      setShowMarkDialog(false);
      fetchAttendanceData();
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
      className="space-y-6" 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
        </div>
        <Button 
          onClick={handleMarkAttendance}
          disabled={!selectedCourse}
          className="bg-gradient-to-r from-primary to-accent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
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
                No courses found. Please create a course first.
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
                    {course.courseCode || course.code} - {course.courseName || course.name}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {selectedCourse && attendanceStats && (
        <>
          {/* Statistics Cards */}
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{attendanceStats.students?.length || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold">{attendanceStats.totalSessions || 0}</p>
                  </div>
                  <CalendarIcon className="h-8 w-8" style={{ color: 'white' }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Attendance</p>
                    <p className="text-2xl font-bold">
                      {attendanceStats.students?.length > 0
                        ? (
                            attendanceStats.students.reduce((sum: number, s: any) => sum + parseFloat(s.attendancePercentage), 0) /
                            attendanceStats.students.length
                          ).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="text-lg font-bold truncate">{attendanceStats.course?.code}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Student Attendance Table */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">Student</th>
                        <th className="text-center py-3 px-4">Total Classes</th>
                        <th className="text-center py-3 px-4">Present</th>
                        <th className="text-center py-3 px-4">Absent</th>
                        <th className="text-center py-3 px-4">Late</th>
                        <th className="text-center py-3 px-4">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceStats.students?.map((student: any) => (
                        <tr key={student.student._id} className="border-b border-border/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{student.student.firstName} {student.student.lastName}</p>
                              <p className="text-sm text-muted-foreground">{student.student.email}</p>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">{student.totalClasses}</td>
                          <td className="text-center py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-green-500">
                              <CheckCircle className="h-4 w-4" />
                              {student.present}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-red-500">
                              <XCircle className="h-4 w-4" />
                              {student.absent}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-yellow-500">
                              <Clock className="h-4 w-4" />
                              {student.late}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className={`font-bold ${
                              parseFloat(student.attendancePercentage) >= 75 
                                ? 'text-green-500' 
                                : parseFloat(student.attendancePercentage) >= 60
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}>
                              {student.attendancePercentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attendance History */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attendanceHistory.map((record: any) => (
                      <div key={record._id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{format(new Date(record.date), 'MMMM dd, yyyy')}</h4>
                          <span className="text-sm text-muted-foreground">
                            {record.records.length} students marked
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-500">
                            Present: {record.records.filter((r: any) => r.status === 'present').length}
                          </span>
                          <span className="text-red-500">
                            Absent: {record.records.filter((r: any) => r.status === 'absent').length}
                          </span>
                          <span className="text-yellow-500">
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
        </>
      )}

      {!selectedCourse && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4" style={{ color: 'white' }} />
              <h3 className="text-lg font-semibold mb-2">Select a course</h3>
              <p className="text-muted-foreground">
                Choose a course to view and manage attendance records
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mark Attendance Dialog */}
      <Dialog open={showMarkDialog} onOpenChange={setShowMarkDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Students</h4>
              {students.map((student) => (
                <div key={student._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={attendanceRecords[student._id]?.status === 'present' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(student._id, 'present')}
                      className={attendanceRecords[student._id]?.status === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceRecords[student._id]?.status === 'late' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(student._id, 'late')}
                      className={attendanceRecords[student._id]?.status === 'late' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Late
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceRecords[student._id]?.status === 'absent' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(student._id, 'absent')}
                      className={attendanceRecords[student._id]?.status === 'absent' ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowMarkDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitAttendance} 
                disabled={marking}
                className="bg-gradient-to-r from-primary to-accent"
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
