import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { studentService } from '@/services/studentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, CheckCircle, TrendingUp, Bell, Calendar } from 'lucide-react';

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
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/src/assets/loadicon.gif" alt="Loading..." className="h-48 w-48" />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Enrolled Courses',
      value: dashboard?.enrolledCourses || 0,
      description: 'Active courses',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Assignments',
      value: dashboard?.totalAssignments || 0,
      description: `${dashboard?.pendingAssignments || 0} pending`,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Average Grade',
      value: `${dashboard?.averageGrade || 0}%`,
      description: 'Overall performance',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Attendance',
      value: `${dashboard?.attendancePercentage || 0}%`,
      description: 'Attendance rate',
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's your overview</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card className="border-gray-700 bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <p className="text-sm text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Announcements */}
      {dashboard?.recentAnnouncements && dashboard.recentAnnouncements.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-white">Recent Announcements</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Latest updates from your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.recentAnnouncements.map((announcement: any) => (
                  <div
                    key={announcement._id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-700 bg-gray-900"
                  >
                    <div className="flex-shrink-0">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        announcement.priority === 'high'
                          ? 'bg-red-900 text-red-300'
                          : announcement.priority === 'medium'
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-blue-900 text-blue-300'
                      }`}>
                        {announcement.priority?.toUpperCase() || 'NORMAL'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white">
                        {announcement.title}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="font-medium">
                          {announcement.course?.name} ({announcement.course?.code})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your courses and assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/dashboard/courses"
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 transition-colors"
              >
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-medium text-white">View Courses</h4>
                  <p className="text-sm text-gray-400">Browse enrolled courses</p>
                </div>
              </a>
              <a
                href="/dashboard/assignments"
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-600 hover:border-purple-500 hover:bg-purple-900/20 transition-colors"
              >
                <FileText className="h-6 w-6 text-purple-600" />
                <div>
                  <h4 className="font-medium text-white">Assignments</h4>
                  <p className="text-sm text-gray-400">View and submit work</p>
                </div>
              </a>
              <a
                href="/dashboard/announcements"
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-600 hover:border-orange-500 hover:bg-orange-900/20 transition-colors"
              >
                <Bell className="h-6 w-6 text-orange-600" />
                <div>
                  <h4 className="font-medium text-white">Announcements</h4>
                  <p className="text-sm text-gray-400">Read updates</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
