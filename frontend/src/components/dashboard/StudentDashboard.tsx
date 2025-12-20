import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { studentService } from '@/services/studentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Bell, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Clock 
} from 'lucide-react';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courseSuggestions, setCourseSuggestions] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboard();
    fetchCourseSuggestions();
    fetchEnrolledCourses();
    
    // Smooth scroll setup for the body
    document.body.style.overflowX = 'hidden';
    return () => { document.body.style.overflowX = 'auto'; };
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await studentService.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseSuggestions = async () => {
    try {
      const response = await studentService.getCourseSuggestions();
      const suggestionsData = response?.data || response || [];
      setCourseSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
    } catch (error) {
      console.error('Error fetching course suggestions:', error);
      setCourseSuggestions([]);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      // Try to fetch with progress first
      const response = await studentService.getEnrolledCoursesWithProgress();
      const coursesData = response?.data || response || [];
      setEnrolledCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error fetching enrolled courses with progress:', error);
      // Fallback to regular courses if progress endpoint fails
      try {
        const response = await studentService.getMyCourses();
        const coursesData = response?.data || response || [];
        const coursesArray = Array.isArray(coursesData) ? coursesData : [];
        // Add empty progress data
        const coursesWithEmptyProgress = coursesArray.map((enrollment: any) => ({
          ...enrollment,
          contentProgress: {
            videosWatched: 0,
            totalVideos: 0,
            materialsViewed: 0,
            totalMaterials: 0,
            videosProgress: 0,
            materialsProgress: 0,
            overallContentProgress: 0,
          },
          assignmentStats: {
            total: 0,
            submitted: 0,
          },
          averageGrade: 0,
          attendancePercentage: 0,
        }));
        setEnrolledCourses(coursesWithEmptyProgress);
      } catch (fallbackError) {
        console.error('Error fetching regular courses:', fallbackError);
        setEnrolledCourses([]);
      }
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 350;
      const target = direction === 'left' 
        ? current.scrollLeft - scrollAmount 
        : current.scrollLeft + scrollAmount;
      
      current.scrollTo({
        left: target,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a]">
        <img src="/loadicon.gif" alt="Loading" className="h-48 w-48" />
      </div>
    );
  }

  const statsCards = [
    { title: 'Enrolled Courses', value: dashboard?.enrolledCourses || 0, description: 'Active courses', icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Total Assignments', value: dashboard?.totalAssignments || 0, description: `${dashboard?.pendingAssignments || 0} pending`, icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Average Grade', value: `${dashboard?.averageGrade || 0}%`, description: 'Overall performance', icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Attendance', value: `${dashboard?.attendancePercentage || 0}%`, description: 'Attendance rate', icon: CheckCircle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ];

  return (
    <motion.div 
      className="p-4 lg:p-6 space-y-6 w-full max-w-[1600px] min-h-screen overflow-x-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl lg:text-3xl font-extrabold text-white tracking-tight">Student Dashboard</h1>
          <p className="text-gray-400 mt-1 text-base lg:text-base">Welcome back! Here's your academic overview.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4" variants={containerVariants}>
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants} whileHover={{ y: -5 }}>
              <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-3 lg:p-6">
                  <CardTitle className="text-xs lg:text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</CardTitle>
                  <div className={`p-1.5 rounded-lg ${stat.bgColor}`}><Icon className={`h-4 w-4 lg:h-4 lg:w-4 ${stat.color}`} /></div>
                </CardHeader>
                <CardContent className="pt-0 p-3 lg:p-6 lg:pt-0">
                  <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs lg:text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Enrolled Courses Progress */}
      <motion.div variants={itemVariants}>
        <Card className="border-gray-700 bg-gray-800 shadow-2xl">
          <CardHeader className="pb-3 p-4 lg:p-6 lg:pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl lg:text-xl text-white">My Enrolled Courses</CardTitle>
                <CardDescription className="text-gray-400 text-sm lg:text-sm">Track your progress and upcoming deadlines</CardDescription>
              </div>
              {enrolledCourses.length > 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllCourses(!showAllCourses)}
                  className="text-xs"
                >
                  {showAllCourses ? 'Show Less' : `View All (${enrolledCourses.length})`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 lg:p-6 pt-0 lg:pt-0">
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400 mb-2">No enrolled courses yet</p>
                <p className="text-sm text-gray-500">Browse available courses to get started</p>
                <Button 
                  className="mt-4"
                  onClick={() => window.location.href = '/dashboard/courses'}
                >
                  Browse Courses
                </Button>
              </div>
            ) : (
              (showAllCourses ? enrolledCourses : enrolledCourses.slice(0, 2)).map((enrollment: any) => {
                const course = enrollment.course;
                if (!course) return null;
                
                const contentProgress = enrollment.contentProgress || {};
                const assignmentStats = enrollment.assignmentStats || {};
                const overallProgress = contentProgress.overallContentProgress || 0;
                
                return (
                  <Card key={enrollment._id} className="border-gray-700 bg-gray-900/50 overflow-hidden">
                    <CardContent className="p-4 lg:p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs lg:text-[10px] font-bold text-blue-400 px-2 py-1 lg:px-1.5 lg:py-0.5 bg-blue-900/30 rounded">{course.courseCode}</span>
                            <span className="text-xs lg:text-[10px] text-green-400">Active</span>
                          </div>
                          <h3 className="text-white font-bold text-lg lg:text-base">{course.courseName}</h3>
                          <p className="text-xs lg:text-[10px] text-gray-400 mt-0.5">
                            {course.faculty?.firstName} {course.faculty?.lastName} • {course.credits} Credits
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl lg:text-xl font-bold text-white">{overallProgress}%</div>
                          <p className="text-xs lg:text-[10px] text-gray-500">Progress</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-800 rounded-full h-2 lg:h-1.5 mb-3 lg:mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 lg:h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${overallProgress}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center mb-3 lg:mb-2">
                        <div className="bg-gray-800 rounded-lg p-2 lg:p-1.5">
                          <div className="text-sm lg:text-xs font-bold text-white">{contentProgress.videosWatched || 0}/{contentProgress.totalVideos || 0}</div>
                          <p className="text-[10px] lg:text-[9px] text-gray-500">Videos</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-2 lg:p-1.5">
                          <div className="text-sm lg:text-xs font-bold text-white">{contentProgress.materialsViewed || 0}/{contentProgress.totalMaterials || 0}</div>
                          <p className="text-[10px] lg:text-[9px] text-gray-500">Materials</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-2 lg:p-1.5">
                          <div className="text-sm lg:text-xs font-bold text-white">{assignmentStats.submitted || 0}/{assignmentStats.total || 0}</div>
                          <p className="text-[10px] lg:text-[9px] text-gray-500">Assignments</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-2 lg:p-1.5">
                          <div className="text-sm lg:text-xs font-bold text-white">{enrollment.averageGrade || 0}%</div>
                          <p className="text-[10px] lg:text-[9px] text-gray-500">Grade</p>
                        </div>
                      </div>

                      <div className="mt-3 lg:mt-2 pt-3 lg:pt-2 border-t border-gray-800">
                        <div className="flex items-center justify-between text-xs lg:text-[10px]">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Calendar className="h-3.5 w-3.5 lg:h-3 lg:w-3" />
                            <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 lg:h-6 text-xs lg:text-[10px] px-3 lg:px-2"
                            onClick={() => window.location.href = `/dashboard/courses/${course._id}`}
                          >
                            View Course
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommended Courses Carousel */}
      {courseSuggestions.length > 0 && (
        <motion.div variants={itemVariants} className="relative">
          <Card className="border-gray-700 bg-gray-800 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 lg:p-6 lg:pb-2">
              <div>
                <CardTitle className="text-xl lg:text-xl text-white">Recommended for You</CardTitle>
                <CardDescription className="text-gray-400 text-sm lg:text-sm">Expand your skills with these top-rated courses</CardDescription>
              </div>
              <div className="hidden sm:flex gap-1.5">
                <Button variant="outline" size="icon" className="border-gray-600 bg-gray-700 hover:bg-gray-600 text-white rounded-full h-8 w-8" onClick={() => scroll('left')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-gray-600 bg-gray-700 hover:bg-gray-600 text-white rounded-full h-8 w-8" onClick={() => scroll('right')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="px-4 lg:px-4 pb-4">
              <div 
                ref={scrollContainerRef}
                className="flex gap-3 lg:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth pt-1 pb-1"
                style={{ 
                  WebkitOverflowScrolling: 'touch', 
                  scrollSnapType: 'x mandatory',
                  overscrollBehavior: 'contain'
                }}
              >
                {courseSuggestions.map((course) => (
                  <motion.div 
                    key={course._id} 
                    className="flex-none w-[240px] sm:w-[220px]"
                    style={{ scrollSnapAlign: 'start' }}
                    whileHover={{ y: -8 }}
                  >
                    <Card className="border-gray-700 bg-gray-900 h-full flex flex-col overflow-hidden group">
                      <div className="relative h-24 lg:h-20 bg-gradient-to-br from-indigo-600 to-purple-700 p-3 lg:p-2 flex flex-col justify-end">
                        <div className="absolute top-2 lg:top-1.5 right-2 lg:right-1.5 bg-white/10 backdrop-blur-md px-2 py-1 lg:px-1.5 lg:py-0.5 rounded text-[9px] lg:text-[8px] text-white font-bold">
                          {course.credits} CR
                        </div>
                        <span className="text-[9px] lg:text-[8px] font-bold text-blue-200 uppercase mb-1 lg:mb-0.5">{course.courseCode}</span>
                        <h3 className="text-white font-bold text-sm lg:text-xs leading-tight line-clamp-2">{course.courseName}</h3>
                      </div>
                      
                      <CardContent className="p-3 lg:p-2.5 flex-1 flex flex-col">
                        <p className="text-xs lg:text-[10px] text-gray-400 line-clamp-2 mb-2 lg:mb-1.5 leading-relaxed">
                          {course.description || "Dive deep into the core concepts of this subject with expert faculty guidance."}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-2 lg:pt-1.5 border-t border-gray-800">
                          <div className="flex flex-col">
                            <span className="text-[8px] lg:text-[7px] text-gray-500 uppercase">Instructor</span>
                            <span className="text-xs lg:text-[10px] text-gray-200 font-medium">
                              {course.faculty?.firstName && course.faculty?.lastName 
                                ? `${course.faculty.firstName} ${course.faculty.lastName}`
                                : 'TBA'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 lg:gap-0.5 text-gray-400">
                            <Users className="h-3 w-3 lg:h-2.5 lg:w-2.5" />
                            <span className="text-xs lg:text-[10px]">{course.enrollmentCount || 0}</span>
                          </div>
                        </div>
                        <Button className="w-full mt-2 lg:mt-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs lg:text-[10px] font-semibold transition-all py-2 lg:py-1 h-8 lg:h-7">
                          Course Details
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Announcements & Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Announcements */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-gray-700 bg-gray-800 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-white text-lg">Recent Announcements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard?.recentAnnouncements?.length > 0 ? (
                dashboard.recentAnnouncements.map((announcement: any) => (
                  <div key={announcement._id} className="p-3 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-900 transition-colors">
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-bold text-white text-sm">{announcement.title}</h4>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${announcement.priority === 'high' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>
                        {announcement.priority?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                      <span className="font-medium text-blue-400">{announcement.course?.name}</span>
                      <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" /> {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 italic text-sm">No recent announcements</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="border-gray-700 bg-gray-800 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[
                { label: 'My Courses', sub: 'Manage learning', icon: BookOpen, color: 'text-blue-500', href: '/dashboard/courses' },
                { label: 'Assignments', sub: 'Submit work', icon: FileText, color: 'text-purple-500', href: '/dashboard/assignments' },
                { label: 'Announcements', sub: 'Stay updated', icon: Bell, color: 'text-orange-500', href: '/dashboard/announcements' }
              ].map((action, i) => (
                <a key={i} href={action.href} className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-blue-400 text-sm">{action.label}</h4>
                    <p className="text-[10px] text-gray-500">{action.sub}</p>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Inline styles for scrollbar and utilities */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
