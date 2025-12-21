import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, Users, FileText, TrendingUp, Calendar, Video,
  Clock, Award, Target, Activity, ArrowRight, ChevronRight,
  MessageSquare, Bell, BarChart3, CheckCircle, AlertCircle,
  Star, Zap, PlayCircle, UserCheck, BookMarked, PieChart
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function InstructorDashboardNew() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch instructor statistics
      const statsRes = await api.get('/instructor/statistics');
      setDashboard(statsRes.data.data);
      
      // Fetch courses
      const coursesRes = await api.get('/instructor/courses');
      const coursesData = Array.isArray(coursesRes.data.data) ? coursesRes.data.data : [];
      
      // Enhance courses with additional stats
      const enhancedCourses = await Promise.all(
        coursesData.slice(0, 4).map(async (course: any) => {
          try {
            // Get enrollment count
            const enrollmentRes = await api.get(`/instructor/courses/${course._id}/students`);
            const enrollmentCount = Array.isArray(enrollmentRes.data.data) ? enrollmentRes.data.data.length : 0;
            
            // Get assignment count
            const assignmentsRes = await api.get(`/instructor/courses/${course._id}/assignments`);
            const assignmentCount = Array.isArray(assignmentsRes.data.data) ? assignmentsRes.data.data.length : 0;
            
            return {
              ...course,
              enrollmentCount,
              assignmentCount,
              contentCount: (course.videos?.length || 0) + (course.materials?.length || 0),
              attendanceRate: 85 // Default for now
            };
          } catch (error) {
            return {
              ...course,
              enrollmentCount: 0,
              assignmentCount: 0,
              contentCount: 0,
              attendanceRate: 0
            };
          }
        })
      );
      
      setCourses(enhancedCourses);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <img src="/loadicon.gif" alt="Loading" className="h-32 w-32" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Students',
      value: dashboard?.totalStudents || 0,
      change: 'Across all courses',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      title: 'Active Courses',
      value: dashboard?.activeCourses || 0,
      change: `${dashboard?.totalCourses || 0} total`,
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10'
    },
    {
      title: 'Total Assignments',
      value: dashboard?.totalAssignments || 0,
      change: 'Created',
      icon: FileText,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10'
    },
    {
      title: 'Announcements',
      value: dashboard?.totalAnnouncements || 0,
      change: 'Posted',
      icon: Bell,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10'
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                  Instructor Dashboard
                </h1>
                <p className="text-blue-100 text-sm md:text-lg">
                  Manage your courses and track student progress
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link to="/instructor/virtual-classroom">
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Video className="w-4 h-4 mr-2" />
                  Start Class
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Quick Stats Bar - Hidden on mobile, shown on desktop */}
          <div className="hidden md:grid mt-6 grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Courses', value: dashboard?.totalCourses || 0, icon: Calendar },
              { label: 'Total Students', value: dashboard?.totalStudents || 0, icon: Users },
              { label: 'Assignments', value: dashboard?.totalAssignments || 0, icon: FileText },
              { label: 'Announcements', value: dashboard?.totalAnnouncements || 0, icon: MessageSquare }
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="w-4 h-4 text-white" />
                  <span className="text-xs text-blue-100">{item.label}</span>
                </div>
                <p className="text-xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
              <CardContent className="relative p-4 md:p-6">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Courses & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-xl">My Courses</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage your teaching schedule</p>
              </div>
              <Link to="/instructor/courses">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first course to get started</p>
                  <Link to="/instructor/courses">
                    <Button>Create Course</Button>
                  </Link>
                </div>
              ) : (
                courses.map((course: any) => (
                  <div key={course._id} className="group relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge variant="secondary" className="mb-2">{course.courseCode}</Badge>
                            <h3 className="font-semibold text-lg leading-tight">{course.courseName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {course.credits} Credits • {course.semester}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{course.enrollmentCount || 0}</div>
                            <p className="text-xs text-muted-foreground">Students</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm mt-3">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span>{course.assignmentCount || 0} assignments</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <PlayCircle className="w-4 h-4 text-muted-foreground" />
                            <span>{course.contentCount || 0} materials</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserCheck className="w-4 h-4 text-muted-foreground" />
                            <span>{course.attendanceRate || 0}% attendance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Link to={`/instructor/courses/${course._id}`}>
                      <Button variant="ghost" size="sm" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        Manage
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Course Statistics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course: any) => (
                  <div key={course._id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{course.courseName}</span>
                      <span className="text-muted-foreground">{course.enrollmentCount || 0} students</span>
                    </div>
                    <Progress value={((course.enrollmentCount || 0) / (course.maxStudents || 60)) * 100} className="h-2" />
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No courses yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Summary */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-medium">Total Courses</span>
                </div>
                <span className="text-2xl font-bold">{dashboard?.totalCourses || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="font-medium">Total Students</span>
                </div>
                <span className="text-2xl font-bold">{dashboard?.totalStudents || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="font-medium">Active Courses</span>
                </div>
                <span className="text-2xl font-bold">{dashboard?.activeCourses || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Schedule */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { icon: Video, label: 'Start Virtual Class', color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/instructor/virtual-classroom' },
                { icon: FileText, label: 'Create Assignment', color: 'text-purple-500', bg: 'bg-purple-500/10', href: '/instructor/assignments' },
                { icon: Bell, label: 'Send Announcement', color: 'text-orange-500', bg: 'bg-orange-500/10', href: '/instructor/announcements' },
                { icon: Calendar, label: 'Mark Attendance', color: 'text-green-500', bg: 'bg-green-500/10', href: '/instructor/attendance' },
                { icon: BarChart3, label: 'View Analytics', color: 'text-pink-500', bg: 'bg-pink-500/10', href: '/instructor/analytics' },
                { icon: MessageSquare, label: 'Message Students', color: 'text-cyan-500', bg: 'bg-cyan-500/10', href: '/instructor/messages' }
              ].map((action, i) => (
                <Link key={i} to={action.href}>
                  <Button variant="ghost" className="w-full justify-start h-auto py-3 hover:bg-secondary/80">
                    <div className={`p-2 rounded-lg ${action.bg} mr-3`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="font-medium">{action.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Course Links */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                My Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses.length > 0 ? (
                courses.map((course: any) => (
                  <Link key={course._id} to={`/instructor/courses/${course._id}`}>
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-sm">{course.courseName}</h4>
                            <p className="text-xs text-muted-foreground">{course.courseCode}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">{course.enrollmentCount || 0} students</Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No courses yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Summary */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-500" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div>
                  <h4 className="font-semibold text-sm">Total Assignments</h4>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
                <div className="text-2xl font-bold text-primary">{dashboard?.totalAssignments || 0}</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div>
                  <h4 className="font-semibold text-sm">Announcements</h4>
                  <p className="text-xs text-muted-foreground">Posted</p>
                </div>
                <div className="text-2xl font-bold text-primary">{dashboard?.totalAnnouncements || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
