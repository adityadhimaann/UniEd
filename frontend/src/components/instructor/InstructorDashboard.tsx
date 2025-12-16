import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, FileText, Bell, TrendingUp } from 'lucide-react';

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

export default function InstructorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await instructorService.getStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/loadicon.gif" alt="Loading..." className="h-48 w-48" />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      description: `${stats?.activeCourses || 0} active`,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      description: 'Across all courses',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Assignments',
      value: stats?.totalAssignments || 0,
      description: 'Created assignments',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Announcements',
      value: stats?.totalAnnouncements || 0,
      description: 'Posted announcements',
      icon: Bell,
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
          <h1 className="text-3xl font-bold text-white">Instructor Dashboard</h1>
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
              <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg border ${stat.bgColor.replace('bg-', 'border-')}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your courses, assignments, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => window.location.href = '/instructor/courses'}
                className="p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-700 transition-colors text-center group"
              >
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-600" />
                <h3 className="font-semibold text-white">Manage Courses</h3>
                <p className="text-sm text-gray-400 mt-1">Create and edit courses</p>
              </button>

              <button
                onClick={() => window.location.href = '/instructor/assignments'}
                className="p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 hover:bg-gray-700 transition-colors text-center group"
              >
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400 group-hover:text-purple-600" />
                <h3 className="font-semibold text-white">Assignments</h3>
                <p className="text-sm text-gray-400 mt-1">Create and grade</p>
              </button>

              <button
                onClick={() => window.location.href = '/instructor/announcements'}
                className="p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-orange-500 hover:bg-gray-700 transition-colors text-center group"
              >
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400 group-hover:text-orange-600" />
                <h3 className="font-semibold text-white">Announcements</h3>
                <p className="text-sm text-gray-400 mt-1">Post updates</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
