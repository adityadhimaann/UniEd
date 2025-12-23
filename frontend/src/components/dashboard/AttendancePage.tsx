import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { studentService } from '@/services/studentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

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

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseAttendance, setCourseAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await studentService.getMyAttendance();
      setAttendanceData(response.data);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = async (course: any) => {
    try {
      setLoading(true);
      const response = await studentService.getCourseAttendance(course.course._id);
      setCourseAttendance(response.data);
      setSelectedCourse(course);
    } catch (error: any) {
      console.error('Error fetching course attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to load course attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCourseAttendance(null);
  };

  if (loading && !attendanceData) {
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
          <h1 className="text-3xl font-bold text-white">My Attendance</h1>
          <p className="text-gray-400 mt-1">
            {selectedCourse ? `${selectedCourse.course.courseCode} - ${selectedCourse.course.courseName}` : 'View your attendance records across all courses'}
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
          {!attendanceData?.statistics || attendanceData.statistics.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600">
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-bold text-white mb-2">No attendance records yet</h3>
                  <p className="text-gray-400">Your attendance will appear here once your instructors mark it</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
              {attendanceData.statistics.map((stat: any) => (
                <motion.div key={stat.course._id} variants={itemVariants}>
                  <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-blue-400" />
                        <span className="line-clamp-1">{stat.course.courseCode}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{stat.course.courseName}</h3>
                      </div>
                      <div className="space-y-2 text-sm bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-gray-400">Total Classes:</span>
                          <span className="font-semibold">{stat.totalClasses}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Present:</span>
                          <span className="font-semibold text-green-400">{stat.present}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Absent:</span>
                          <span className="font-semibold text-red-400">{stat.absent}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Late:</span>
                          <span className="font-semibold text-yellow-400">{stat.late}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                          <span className="text-gray-400">Attendance:</span>
                          <span className={`font-bold text-lg ${
                            parseFloat(stat.percentage) >= 75 
                              ? 'text-green-400' 
                              : parseFloat(stat.percentage) >= 60
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}>
                            {stat.percentage}%
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewCourse(stat)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      ) : (
        // Detailed Course Attendance View
        courseAttendance && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={itemVariants}>
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Classes</p>
                      <p className="text-2xl font-bold text-white">{courseAttendance.statistics.totalClasses}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Present</p>
                      <p className="text-2xl font-bold text-green-400">{courseAttendance.statistics.present}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Absent</p>
                      <p className="text-2xl font-bold text-red-400">{courseAttendance.statistics.absent}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Attendance %</p>
                      <p className={`text-2xl font-bold ${
                        parseFloat(courseAttendance.statistics.percentage) >= 75 
                          ? 'text-green-400' 
                          : parseFloat(courseAttendance.statistics.percentage) >= 60
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {courseAttendance.statistics.percentage}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Attendance Records */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                  {courseAttendance.records.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No attendance records yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {courseAttendance.records.map((record: any) => (
                        <div key={record._id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <h4 className="font-semibold text-white">
                                  {format(new Date(record.date), 'MMMM dd, yyyy')}
                                </h4>
                                <p className="text-sm text-gray-400">
                                  {format(new Date(record.date), 'EEEE')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {record.status === 'present' && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                                  <CheckCircle className="h-4 w-4" />
                                  Present
                                </span>
                              )}
                              {record.status === 'absent' && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-semibold">
                                  <XCircle className="h-4 w-4" />
                                  Absent
                                </span>
                              )}
                              {record.status === 'late' && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-semibold">
                                  <Clock className="h-4 w-4" />
                                  Late
                                </span>
                              )}
                            </div>
                          </div>
                          {record.remarks && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                              <p className="text-sm text-gray-400">
                                <span className="font-semibold">Remarks:</span> {record.remarks}
                              </p>
                            </div>
                          )}
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
    </motion.div>
  );
}
