import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  Bell,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  User,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function InstructorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTopProfileMenu, setShowTopProfileMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
    { name: 'Courses', href: '/instructor/courses', icon: BookOpen },
    { name: 'Assignments', href: '/instructor/assignments', icon: FileText },
    { name: 'Attendance', href: '/instructor/attendance', icon: Calendar },
    { name: 'Announcements', href: '/instructor/announcements', icon: Bell },
    { name: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-gray-800 border-r border-gray-700 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'w-16' : 'w-60'}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Logo */}
              <img 
                src="/UniEd.png" 
                alt="UniEd Logo" 
                className={`transition-all duration-300 ${sidebarCollapsed ? 'h-6 w-6' : 'h-8 w-8'} object-contain`}
                onError={(e) => {
                  // Fallback to gradient if logo doesn't load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg items-center justify-center hidden">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-white truncate">UniEd</h2>
                  <p className="text-[10px] text-gray-400 truncate">Instructor Portal</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white flex-shrink-0"
            >
              <X className="h-6 w-6" />
            </button>
            {/* Toggle Collapse Button (Desktop only) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg p-1 flex-shrink-0"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </a>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-2 border-t border-gray-700 relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg w-full text-left transition-colors ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs">
                  {user?.profile?.firstName?.[0] || user?.firstName?.[0]}
                  {user?.profile?.lastName?.[0] || user?.lastName?.[0]}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {user?.profile?.firstName || user?.firstName} {user?.profile?.lastName || user?.lastName}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
              )}
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className={`absolute bottom-full mb-2 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-2 ${
                sidebarCollapsed ? 'left-4 right-4' : 'left-4 right-4'
              }`}>
                <a
                  href="/instructor/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="h-4 w-4" />
                  {!sidebarCollapsed && <span>Profile</span>}
                </a>
                <a
                  href="/instructor/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="h-4 w-4" />
                  {!sidebarCollapsed && <span>Settings</span>}
                </a>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowLogoutDialog(true);
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  {!sidebarCollapsed && <span>Logout</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              {/* Faculty Profile Section with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTopProfileMenu(!showTopProfileMenu)}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {user?.profile?.firstName?.[0] || user?.firstName?.[0]}
                      {user?.profile?.lastName?.[0] || user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">
                      {user?.profile?.firstName || user?.firstName} {user?.profile?.lastName || user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {showTopProfileMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowTopProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-2 z-50">
                      <a
                        href="/instructor/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                        onClick={() => setShowTopProfileMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </a>
                      <a
                        href="/instructor/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                        onClick={() => setShowTopProfileMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </a>
                      <div className="border-t border-gray-600 my-2"></div>
                      <button
                        onClick={() => {
                          setShowTopProfileMenu(false);
                          setShowLogoutDialog(true);
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 w-full text-left transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 bg-gray-900 min-h-screen max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>

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
            <AlertDialogAction onClick={() => { logout(); setShowLogoutDialog(false); }} className="bg-destructive hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
