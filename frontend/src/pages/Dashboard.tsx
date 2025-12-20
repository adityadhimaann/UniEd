import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  User,
  LogOut,
  Search,
  Menu,
  X,
  GraduationCap,
  ChevronRight,
  Users,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { CoursesPage } from "@/components/dashboard/CoursesPage";
import { AssignmentsPage } from "@/components/dashboard/AssignmentsPage";
import { GradesPage } from "@/components/dashboard/GradesPage";
import { CalendarPage } from "@/components/dashboard/CalendarPage";
import { MessagesPage } from "@/components/dashboard/MessagesPage";
import { SettingsPage } from "@/components/dashboard/SettingsPage";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import sidebarIcon from "@/assets/sidebar.png";
import logo from "@/assets/UniEdlogoo.png";

const studentNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "Courses", path: "/dashboard/courses" },
  { icon: FileText, label: "Assignments", path: "/dashboard/assignments" },
  { icon: TrendingUp, label: "Grades", path: "/dashboard/grades" },
  { icon: Calendar, label: "Calendar", path: "/dashboard/calendar" },
  { icon: MessageSquare, label: "Messages", path: "/dashboard/messages" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const facultyNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "My Courses", path: "/dashboard/courses" },
  { icon: FileText, label: "Assignments", path: "/dashboard/assignments" },
  { icon: TrendingUp, label: "Grades", path: "/dashboard/grades" },
  { icon: Users, label: "Students", path: "/dashboard/students" },
  { icon: Calendar, label: "Calendar", path: "/dashboard/calendar" },
  { icon: MessageSquare, label: "Messages", path: "/dashboard/messages" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Users", path: "/dashboard/users" },
  { icon: BookOpen, label: "Courses", path: "/dashboard/courses" },
  { icon: Shield, label: "Admin Panel", path: "/dashboard/admin" },
  { icon: Calendar, label: "Calendar", path: "/dashboard/calendar" },
  { icon: MessageSquare, label: "Messages", path: "/dashboard/messages" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      toast.error("Please login to access the dashboard");
    } else if (user?.role === "faculty") {
      // Redirect faculty users directly to instructor portal
      navigate("/instructor");
    }
  }, [isAuthenticated, navigate, user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const sidebarItems = user.role === "admin" 
    ? adminNavItems 
    : user.role === "faculty" 
      ? facultyNavItems 
      : studentNavItems;

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
    setShowLogoutDialog(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        className="hidden lg:flex flex-col border-r border-border bg-card/50 backdrop-blur-xl fixed left-0 top-0 h-screen z-40"
      >
        {/* Logo */}
        <Link to="/" className="p-3 flex items-center gap-2 border-b border-border hover:bg-secondary/50 transition-colors">
          <img 
            src={logo} 
            alt="UniEd Logo" 
            className="w-10 h-10 object-contain shrink-0"
          />
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-display text-xl font-bold"
            >
              UniEd
            </motion.span>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-base"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && sidebarOpen && (
                  <ChevronRight className="w-5 h-5 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        {sidebarOpen && (
          <div className="p-2 border-t border-border">
            <Link 
              to="/dashboard/settings"
              className="block transition-all hover:scale-[0.98]"
            >
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          </div>
        )}

        {/* Toggle button */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full justify-center group"
          >
            <img 
              src={sidebarIcon} 
              alt="Toggle Sidebar" 
              className="w-5 h-5 object-contain transition-all duration-200 group-hover:brightness-0" 
            />
          </Button>
        </div>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: mobileMenuOpen ? 0 : "-100%" }}
        className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 lg:hidden"
      >
        <div className="p-3 flex items-center justify-center border-b border-border relative">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
            <img 
              src={logo} 
              alt="UniEd Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="font-display text-xl font-bold">UniEd</span>
          </Link>
          <Button variant="ghost" size="icon" className="absolute right-3" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main content */}
      <main className={`flex-1 ${sidebarOpen ? "lg:ml-[240px]" : "lg:ml-16"} transition-all duration-300`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-3 lg:px-6 h-14">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses, assignments..."
                  className="pl-10 bg-secondary/50 border-border/50"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Instructor Portal Link (for faculty) */}
              {user.role === "faculty" && (
                <Link to="/instructor">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Users className="w-4 h-4 mr-2" />
                    Instructor Portal
                  </Button>
                </Link>
              )}
              
              {/* Notifications */}
              <NotificationBell />

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-gradient-to-r from-primary to-accent hover:backdrop-blur-sm transition-all duration-200 group">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium group-hover:text-white transition-colors">{user.name}</div>
                      <div className="text-xs text-muted-foreground/80 capitalize group-hover:text-white transition-colors">{user.role}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="hover:bg-secondary/40 transition-colors">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="hover:bg-secondary/40 transition-colors">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-3 lg:p-6 max-w-[1600px]">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="grades" element={<GradesPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardHome />} />
          </Routes>
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of your account and redirected to the home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-destructive hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
