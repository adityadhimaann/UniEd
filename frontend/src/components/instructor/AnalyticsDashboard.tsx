import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, BookOpen, FileText, Bell } from 'lucide-react';

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

export default function AnalyticsDashboard() {
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

  const analyticsCards = [
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      description: `${stats?.activeCourses || 0} active courses`,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-700',
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      description: 'Enrolled students',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700',
    },
    {
      title: 'Assignments',
      value: stats?.totalAssignments || 0,
      description: 'Created assignments',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-700',
    },
    {
      title: 'Announcements',
      value: stats?.totalAnnouncements || 0,
      description: 'Posted announcements',
      icon: Bell,
      color: 'text-orange-500',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-700',
    },
  ];

  return (
    <motion.div 
      className="space-y-6" 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Detailed insights and statistics</p>
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants}>
        {analyticsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
            <Card className={`bg-gray-800 border ${card.borderColor} hover:shadow-lg transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">
                  {card.title}
                </CardTitle>
                <div className={`${card.bgColor} p-2 rounded-lg border ${card.borderColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{card.value}</div>
                <p className="text-xs text-gray-400 mt-1">{card.description}</p>
              </CardContent>
            </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-200">Course Completion Rate</span>
                <span className="text-gray-400">85%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-200">Assignment Submission Rate</span>
                <span className="text-gray-400">92%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-200">Student Engagement</span>
                <span className="text-gray-400">78%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">More analytics coming soon</h3>
          <p className="text-gray-400">
            We're working on detailed charts and graphs for better insights
          </p>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
