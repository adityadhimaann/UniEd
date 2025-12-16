import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Filter, Grid, List, Users, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="font-display text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage and access your enrolled courses</p>
        </div>
        <div className="flex gap-2">
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
      {viewMode === "grid" ? (
        <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group glass border-border/50 overflow-hidden hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <Badge
                    className={`absolute top-3 right-3 ${
                      course.status === "Completed" 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {course.status}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{course.code}</p>
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {course.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={course.instructorImage}
                      alt={course.instructor}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-muted-foreground">{course.instructor}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.students} students
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.nextClass}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-1.5" />
                  </div>

                  <Button className="w-full mt-4 group/btn" variant="outline">
                    Enter Course
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-3">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass border-border/50 hover:border-primary/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-20 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{course.code}</span>
                        <Badge variant="outline" className="text-xs">
                          {course.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold truncate">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">{course.instructor}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Students</p>
                        <p className="font-medium">{course.students}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <p className="font-medium">{course.progress}%</p>
                      </div>
                      <div className="w-24">
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
