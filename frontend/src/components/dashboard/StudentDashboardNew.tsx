import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { studentService } from '@/services/studentService';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, FileText, TrendingUp, CheckCircle, Clock, Calendar,
  Award, Target, Activity, Zap, ArrowRight, Video, MessageSquare,
  Bell, Star, ChevronRight, Users, PlayCircle, BookMarked, Trophy
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentDashboardNew() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, coursesRes] = await Promise.all([
        studentService.getDashboard(),
        studentService.getEnrolledCoursesWithProgress()
      ]);
      
      setDashboard(dashboardRes.data);
      setEnrolledCourses(Array.isArray(coursesRes.data) ? coursesRes.data.slice(0, 4) : []);
      
      // Fetch upcoming virtual classes (optional - fail silently if not available)
      try {
        const virtualClassesRes = await api.get('/student/virtual-classes');
        const upcomingClasses = virtualClassesRes.data.data?.filter((vc: any) => 
          vc.status === 'scheduled' && new Date(vc.scheduledStartTime) > new Date()
        ).slice(0, 3) || [];
        setUpcomingClasses(upcomingClasses);
      } catch (error) {
        // Virtual classes endpoint not available - this is okay
        setUpcomingClasses([]);
      }
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
      title: 'Active Courses',
      value: dashboard?.enrolledCourses || 0,
      change: '+2 this semester',
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      title: 'Assignments',
      value: dashboard?.totalAssignments || 0,
      change: `${dashboard?.pendingAssignments || 0} pending`,
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10'
    },
    {
      title: 'Average Grade',
      value: `${dashboard?.averageGrade || 0}%`,
      change: '+5% from last month',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10'
    },
    {
      title: 'Attendance',
      value: `${dashboard?.attendancePercentage || 0}%`,
      change: 'Excellent record',
      icon: CheckCircle,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10'
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
          <div className="flex items-center gap-3 mb-1 md:mb-2">
            <div className="p-2 md:p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              Welcome Back!
            </h1>
          </div>
          <p className="text-blue-100 text-sm md:text-lg">
            Ready to continue your learning journey?
          </p>
          
          {/* Quick Stats Bar - Hidden on mobile, shown on desktop */}
          <div className="hidden md:grid mt-6 grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Study Streak', value: '12 days', icon: Zap },
              { label: 'Hours This Week', value: '24h', icon: Clock },
              { label: 'Total Courses', value: dashboard?.enrolledCourses || 0, icon: Trophy },
              { label: 'Avg Grade', value: `${dashboard?.averageGrade || 0}%`, icon: Star }
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
        {/* Left Column - Courses & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Courses */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-xl">Active Courses</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Your current learning path</p>
              </div>
              <Link to="/dashboard/courses">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start your learning journey today</p>
                  <Link to="/dashboard/courses">
                    <Button>Browse Courses</Button>
                  </Link>
                </div>
              ) : (
                enrolledCourses.map((enrollment: any) => {
                  const course = enrollment.course;
                  const progress = enrollment.contentProgress?.overallContentProgress || 0;
                  
                  return (
                    <div key={enrollment._id} className="group relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
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
                                {course.faculty?.firstName} {course.faculty?.lastName}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">{progress}%</div>
                              <p className="text-xs text-muted-foreground">Complete</p>
                            </div>
                          </div>
                          
                          <Progress value={progress} className="h-2 mb-3" />
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <PlayCircle className="w-4 h-4 text-muted-foreground" />
                              <span>{enrollment.contentProgress?.videosWatched || 0}/{enrollment.contentProgress?.totalVideos || 0} videos</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span>{enrollment.assignmentStats?.submitted || 0}/{enrollment.assignmentStats?.total || 0} assignments</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Link to={`/dashboard/courses/${course._id}`}>
                        <Button variant="ghost" size="sm" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Learning Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recentAnnouncements && dashboard.recentAnnouncements.length > 0 ? (
                  dashboard.recentAnnouncements.map((announcement: any) => (
                    <div key={announcement._id} className="p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-semibold text-sm">{announcement.title}</h4>
                        <Badge variant={announcement.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-primary">{announcement.course?.courseName}</span>
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No recent announcements</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Updates */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { icon: Video, label: 'Join Virtual Class', color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/dashboard/virtual-classes' },
                { icon: FileText, label: 'Submit Assignment', color: 'text-purple-500', bg: 'bg-purple-500/10', href: '/dashboard/assignments' },
                { icon: MessageSquare, label: 'Message Faculty', color: 'text-green-500', bg: 'bg-green-500/10', href: '/dashboard/messages' },
                { icon: Calendar, label: 'View Schedule', color: 'text-orange-500', bg: 'bg-orange-500/10', href: '/dashboard/calendar' },
                { icon: TrendingUp, label: 'Check Grades', color: 'text-pink-500', bg: 'bg-pink-500/10', href: '/dashboard/grades' },
                { icon: BookMarked, label: 'Study Materials', color: 'text-cyan-500', bg: 'bg-cyan-500/10', href: '/dashboard/courses' }
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

          {/* Upcoming Deadlines */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingClasses.length > 0 ? (
                upcomingClasses.map((item: any, i: number) => {
                  const daysUntil = Math.ceil((new Date(item.scheduledStartTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const urgent = daysUntil <= 2;
                  
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                      <div className={`p-2 rounded-lg ${urgent ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                        <Clock className={`w-4 h-4 ${urgent ? 'text-red-500' : 'text-blue-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.course?.courseName || 'Virtual Class'}</p>
                        <p className={`text-xs mt-1 ${urgent ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No upcoming deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="font-medium">Average Grade</span>
                </div>
                <span className="text-2xl font-bold text-primary">{dashboard?.averageGrade || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-medium">Attendance</span>
                </div>
                <span className="text-2xl font-bold text-primary">{dashboard?.attendancePercentage || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="font-medium">Pending Work</span>
                </div>
                <span className="text-2xl font-bold text-primary">{dashboard?.pendingAssignments || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
