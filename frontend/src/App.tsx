import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import SetPassword from "./pages/SetPassword";
import Welcome from "./pages/Welcome";
import InstructorPortal from "./pages/InstructorPortal";
import InstructorDashboard from "./components/instructor/InstructorDashboard";
import CoursesManagement from "./components/instructor/CoursesManagement";
import CourseDetails from "./components/instructor/CourseDetails";
import CourseContentPage from "./pages/CourseContentPage";
import AssignmentsManagement from "./components/instructor/AssignmentsManagement";
import AttendanceManagement from "./components/instructor/AttendanceManagement";
import AnnouncementsManagement from "./components/instructor/AnnouncementsManagement";
import AnalyticsDashboard from "./components/instructor/AnalyticsDashboard";
import InstructorProfile from "./pages/instructor/InstructorProfile";
import InstructorSettings from "./pages/instructor/InstructorSettings";
import InstructorMessages from "./components/instructor/InstructorMessages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            
            {/* Instructor Portal Routes */}
            <Route path="/instructor" element={<InstructorPortal />}>
              <Route index element={<InstructorDashboard />} />
              <Route path="courses" element={<CoursesManagement />} />
              <Route path="courses/:courseId" element={<CourseDetails />} />
              <Route path="courses/:courseId/content" element={<CourseContentPage />} />
              <Route path="assignments" element={<AssignmentsManagement />} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="messages" element={<InstructorMessages />} />
              <Route path="announcements" element={<AnnouncementsManagement />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="profile" element={<InstructorProfile />} />
              <Route path="settings" element={<InstructorSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
