import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, Users, Clock, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseDetailModal } from "./CourseDetailModal";
import { studentService } from "@/services/studentService";

const courses = [
  {
    id: 1,
    name: "Data Structures & Algorithms",
    code: "CS 201",
    instructor: "Dr. Sarah Chen",
    instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600",
    students: 45,
    progress: 72,
    status: "In Progress",
    nextClass: "Mon, 10:00 AM",
  },
  {
    id: 2,
    name: "Calculus II",
    code: "MATH 202",
    instructor: "Prof. Michael Torres",
    instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600",
    students: 38,
    progress: 58,
    status: "In Progress",
    nextClass: "Tue, 2:00 PM",
  },
  {
    id: 3,
    name: "Introduction to Physics",
    code: "PHY 101",
    instructor: "Dr. Emily Watson",
    instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600",
    students: 52,
    progress: 85,
    status: "In Progress",
    nextClass: "Wed, 9:00 AM",
  },
  {
    id: 4,
    name: "English Literature",
    code: "ENG 102",
    instructor: "Prof. James Park",
    instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600",
    students: 30,
    progress: 45,
    status: "In Progress",
    nextClass: "Thu, 11:00 AM",
  },
  {
    id: 5,
    name: "Web Development",
    code: "CS 301",
    instructor: "Dr. Lisa Martinez",
    instructorImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600",
    students: 42,
    progress: 90,
    status: "In Progress",
    nextClass: "Fri, 1:00 PM",
  },
  {
    id: 6,
    name: "Organic Chemistry",
    code: "CHEM 201",
    instructor: "Dr. Robert Kim",
    instructorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600",
    students: 35,
    progress: 100,
    status: "Completed",
    nextClass: "Completed",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function CoursesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "enrolled">("all");

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const response = await studentService.getAvailableCourses();
      console.log('Available courses response:', response);
      // API returns { success, data, message } - data contains the courses array
      const coursesData = response?.data || response || [];
      console.log('Courses data:', coursesData);
      setAvailableCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error fetching available courses:', error);
      setAvailableCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = availableCourses.filter(course =>
    course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.faculty?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.faculty?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enrolledCourses = filteredCourses.filter(course => course.isEnrolled);
  const notEnrolledCourses = filteredCourses.filter(course => !course.isEnrolled);
  
  const displayCourses = activeTab === "enrolled" ? enrolledCourses : filteredCourses;

  const handleCourseClick = (course: typeof courses[0]) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCourse(null), 300);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/loadicon.gif" alt="Loading..." className="h-48 w-48" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Browse and manage all courses created by faculty</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
          >
            All Courses ({filteredCourses.length})
          </Button>
          <Button
            variant={activeTab === "enrolled" ? "default" : "outline"}
            onClick={() => setActiveTab("enrolled")}
          >
            My Enrolled ({enrolledCourses.length})
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48 bg-secondary/50 border-border/50">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Courses grid/list */}
      {displayCourses.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-gray-700 bg-gray-800">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {activeTab === "enrolled" ? "No courses enrolled" : "No courses available"}
              </h3>
              <p className="text-gray-400">
                {activeTab === "enrolled" 
                  ? "Start exploring and enroll in courses to begin your learning journey"
                  : "Check back later for new courses"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayCourses.map((course, index) => (
            <motion.div
              key={course._id || course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group glass border-border/50 overflow-hidden hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600">
                  {course.titleImage && (
                    <img 
                      src={course.titleImage} 
                      alt={course.courseName}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
                    <Badge className="bg-primary text-primary-foreground">
                      {course.courseCode}
                    </Badge>
                    {course.isEnrolled && (
                      <Badge className="bg-green-600 text-white">
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <h3 className="text-white font-bold text-lg line-clamp-1 drop-shadow-lg">
                      {course.courseName}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-full">
                      <p className="text-xs text-muted-foreground mb-1">
                        {course.credits} Credits • Semester {course.semester}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                      <span className="text-xs text-white font-bold">
                        {course.faculty?.firstName?.[0]}{course.faculty?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Instructor</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {course.faculty?.firstName} {course.faculty?.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.maxStudents} Max
                    </span>
                    <span>
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {course.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {course.description}
                    </p>
                  )}

                  <Button 
                    className="w-full mt-4 group/btn" 
                    variant={course.isEnrolled ? "outline" : "default"}
                    onClick={() => handleCourseClick(course)}
                  >
                    {course.isEnrolled ? "View Course" : "View Details"}
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          {displayCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass border-border/50 overflow-hidden hover:border-primary/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {course.titleImage ? (
                        <img 
                          src={course.titleImage} 
                          alt={course.courseName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-base mb-1 line-clamp-1">
                            {course.courseName}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {course.courseCode} • {course.credits} Credits • Semester {course.semester}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course.department}
                          </p>
                        </div>
                        {course.isEnrolled && (
                          <Badge className="bg-green-600 text-white">
                            Enrolled
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2 p-2 rounded bg-secondary/30">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-xs text-white font-bold">
                            {course.faculty?.firstName?.[0]}{course.faculty?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Instructor</p>
                          <p className="text-sm font-medium">
                            {course.faculty?.firstName} {course.faculty?.lastName}
                          </p>
                        </div>
                      </div>
                      {course.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {course.description}
                        </p>
                      )}
                      <Button 
                        size="sm" 
                        variant={course.isEnrolled ? "outline" : "default"}
                        onClick={() => handleCourseClick(course)}
                      >
                        {course.isEnrolled ? "View Course" : "View Details"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {selectedCourse && (
        <CourseDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          course={selectedCourse}
        />
      )}
    </motion.div>
  );
}
