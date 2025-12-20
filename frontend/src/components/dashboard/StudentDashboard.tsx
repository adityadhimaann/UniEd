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
      const response = await studentService.getMyCourses();
      const coursesData = response?.data || response || [];
      setEnrolledCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setEnrolledCourses([]);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // If the user is scrolling vertically (deltaY), 
    // we move the container horizontally
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
      
      // Optional: Prevent the entire page from scrolling 
      // while the mouse is over this specific section
      // e.preventDefault(); 
    }
  };

  // FIXED SCROLL LOGIC: Uses Ref and Container width for precision
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 350; // Width of one card + gap
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
        <img src="/loadicon.gif" alt="Loading..." className="h-48 w-48" />
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
      className="p-3 lg:p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Student Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm lg:text-base">Welcome back! Here's your academic overview.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants} whileHover={{ y: -5 }}>
              <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</CardTitle>
                  <div className={`p-1.5 rounded-lg ${stat.bgColor}`}><Icon className={`h-4 w-4 ${stat.color}`} /></div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Enrolled Courses Progress */}
      {enrolledCourses.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-gray-700 bg-gray-800 shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-white">My Enrolled Courses</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Track your progress and upcoming deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {enrolledCourses.map((enrollment: any) => {
                const course = enrollment.course;
                if (!course) return null;
                
                return (
                  <Card key={enrollment._id} className="border-gray-700 bg-gray-900/50 overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-blue-400 px-1.5 py-0.5 bg-blue-900/30 rounded">{course.courseCode}</span>
                            <span className="text-[10px] text-green-400">Active</span>
                          </div>
                          <h3 className="text-white font-bold text-base">{course.courseName}</h3>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {course.faculty?.firstName} {course.faculty?.lastName} • {course.credits} Credits
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">0%</div>
                          <p className="text-[10px] text-gray-500">Progress</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-800 rounded-lg p-1.5">
                          <div className="text-xs font-bold text-white">0</div>
                          <p className="text-[9px] text-gray-500">Assignments</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-1.5">
                          <div className="text-xs font-bold text-white">0%</div>
                          <p className="text-[9px] text-gray-500">Attendance</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-1.5">
                          <div className="text-xs font-bold text-white">0</div>
                          <p className="text-[9px] text-gray-500">Grade</p>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-800">
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                          </div>
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                            View Course
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommended Courses Carousel */}
      {courseSuggestions.length > 0 && (
        <motion.div variants={itemVariants} className="relative overflow-hidden">
          <Card className="border-gray-700 bg-gray-800 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl text-white">Recommended for You</CardTitle>
                <CardDescription className="text-gray-400 text-sm">Expand your skills with these top-rated courses</CardDescription>
              </div>
              <div className="flex gap-1.5">
                <Button variant="outline" size="icon" className="border-gray-600 bg-gray-700 hover:bg-gray-600 text-white rounded-full h-8 w-8" onClick={() => scroll('left')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-gray-600 bg-gray-700 hover:bg-gray-600 text-white rounded-full h-8 w-8" onClick={() => scroll('right')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="px-4 pb-4 overflow-hidden">
              <div 
                ref={scrollContainerRef}
                onWheel={handleWheel}
                className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth pt-1 pb-1 -mx-4 px-4"
                style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
              >
                {courseSuggestions.map((course) => (
                  <motion.div 
                    key={course._id} 
                    className="flex-none w-[220px]"
                    style={{ scrollSnapAlign: 'start' }}
                    whileHover={{ y: -8 }}
                  >
                    <Card className="border-gray-700 bg-gray-900 h-full flex flex-col overflow-hidden group">
                      <div className="relative h-20 bg-gradient-to-br from-indigo-600 to-purple-700 p-2 flex flex-col justify-end">
                        <div className="absolute top-1.5 right-1.5 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] text-white font-bold">
                          {course.credits} CR
                        </div>
                        <span className="text-[8px] font-bold text-blue-200 uppercase mb-0.5">{course.courseCode}</span>
                        <h3 className="text-white font-bold text-xs leading-tight line-clamp-2">{course.courseName}</h3>
                      </div>
                      
                      <CardContent className="p-2.5 flex-1 flex flex-col">
                        <p className="text-[10px] text-gray-400 line-clamp-2 mb-1.5 leading-relaxed">
                          {course.description || "Dive deep into the core concepts of this subject with expert faculty guidance."}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-gray-800">
                          <div className="flex flex-col">
                            <span className="text-[7px] text-gray-500 uppercase">Instructor</span>
                            <span className="text-[10px] text-gray-200 font-medium">
                              {course.faculty?.firstName && course.faculty?.lastName 
                                ? `${course.faculty.firstName} ${course.faculty.lastName}`
                                : 'TBA'}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 text-gray-400">
                            <Users className="h-2.5 w-2.5" />
                            <span className="text-[10px]">{course.enrollmentCount || 0}</span>
                          </div>
                        </div>
                        <Button className="w-full mt-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold transition-all py-1 h-7">
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