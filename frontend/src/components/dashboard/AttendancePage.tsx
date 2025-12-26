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
      className="space-y-4 md:space-y-6 p-3 md:p-4" 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" variants={itemVariants}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            My Attendance
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            {selectedCourse ? `${selectedCourse.course.courseCode} - ${selectedCourse.course.courseName}` : 'View your attendance records across all courses'}
          </p>
        </div>
        {selectedCourse && (
          <Button 
            onClick={handleBackToCourses}
            variant="outline"
            className="border-primary/50 hover:bg-primary/10 w-full sm:w-auto"
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
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="text-center py-8 md:py-12">
                  <Calendar className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg md:text-xl font-bold mb-2">No attendance records yet</h3>
                  <p className="text-muted-foreground text-sm md:text-base">Your attendance will appear here once your instructors mark it</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" variants={containerVariants}>
              {attendanceData.statistics.map((stat: any) => (
                <motion.div key={stat.course._id} variants={itemVariants}>
                  <Card className="bg-card border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-colors">
                          <Calendar className="h-5 w-5 md:h-6 md:w-6 text-cyan-500" />
                        </div>
                        <span className="line-clamp-1">{stat.course.courseCode}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold mb-1 line-clamp-2">{stat.course.courseName}</h3>
                      </div>
                      <div className="space-y-2 text-sm bg-secondary/50 p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total Classes:</span>
                          <span className="font-semibold">{stat.totalClasses}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Present:</span>
                          <span className="font-semibold text-green-500">{stat.present}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Absent:</span>
                          <span className="font-semibold text-red-500">{stat.absent}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Late:</span>
                          <span className="font-semibold text-yellow-500">{stat.late}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-muted-foreground">Attendance:</span>
                          <span className={`font-bold text-base md:text-lg ${
                            parseFloat(stat.percentage) >= 75 
                              ? 'text-green-500' 
                              : parseFloat(stat.percentage) >= 60
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }`}>
                            {stat.percentage}%
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewCourse(stat)}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium"
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
          <div className="space-y-4 md:space-y-6">
            {/* Statistics Cards */}
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" variants={itemVariants}>
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Total Classes</p>
                      <p className="text-xl md:text-2xl font-bold">{courseAttendance.statistics.totalClasses}</p>
                    </div>
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 text-cyan-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-lg">
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Present</p>
                      <p className="text-xl md:text-2xl font-bold text-green-500">{courseAttendance.statistics.present}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-lg">
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Absent</p>
                      <p className="text-xl md:text-2xl font-bold text-red-500">{courseAttendance.statistics.absent}</p>
                    </div>
                    <XCircle className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-lg">
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Attendance %</p>
                      <p className={`text-xl md:text-2xl font-bold ${
                        parseFloat(courseAttendance.statistics.percentage) >= 75 
                          ? 'text-green-500' 
                          : parseFloat(courseAttendance.statistics.percentage) >= 60
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}>
                        {courseAttendance.statistics.percentage}%
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Attendance Records */}
            <motion.div variants={itemVariants}>
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Attendance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {courseAttendance.records.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No attendance records yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {courseAttendance.records.map((record: any) => (
                        <div key={record._id} className="border border-border rounded-lg p-3 md:p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 md:gap-4">
                              <div>
                                <h4 className="font-semibold text-sm md:text-base">
                                  {format(new Date(record.date), 'MMMM dd, yyyy')}
                                </h4>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  {format(new Date(record.date), 'EEEE')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {record.status === 'present' && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-500 font-semibold text-xs md:text-sm">
                                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                                  Present
                                </span>
                              )}
                              {record.status === 'absent' && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-500 font-semibold text-xs md:text-sm">
                                  <XCircle className="h-3 w-3 md:h-4 md:w-4" />
                                  Absent
                                </span>
                              )}
                              {record.status === 'late' && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-semibold text-xs md:text-sm">
                                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                  Late
                                </span>
                              )}
                            </div>
                          </div>
                          {record.remarks && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-xs md:text-sm text-muted-foreground">
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
