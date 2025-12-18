import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import authService, { type RegisterData } from "@/services/authService";
import { initializeSocket, disconnectSocket } from "@/lib/socket";

export type UserRole = "student" | "faculty" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  name: string;
  avatar?: string;
  studentId?: string;
  employeeId?: string;
  department?: string;
  semester?: number;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string;
  employeeId?: string;
  department?: string;
  semester?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("edu_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize socket when user is logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && user) {
      initializeSocket(token);
    }

    return () => {
      disconnectSocket();
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      // Store tokens
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Transform backend user to frontend user format
      const userData: User = {
        id: response.user._id,
        email: response.user.email,
        role: response.user.role,
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        name: `${response.user.firstName || ''} ${response.user.lastName || ''}`.trim(),
        avatar: response.user.profilePicture,
        studentId: response.user.studentId,
        employeeId: response.user.employeeId,
        department: response.user.department,
        semester: response.user.semester,
      };

      setUser(userData);
      localStorage.setItem("edu_user", JSON.stringify(userData));

      // Initialize socket with token
      initializeSocket(response.accessToken);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setIsLoading(true);
      const registerData: RegisterData = {
        email: data.email,
        password: data.password,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        studentId: data.studentId,
        employeeId: data.employeeId,
        department: data.department,
        semester: data.semester,
      };

      const response = await authService.register(registerData);

      // Store tokens
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Transform backend user to frontend user format
      const userData: User = {
        id: response.user._id,
        email: response.user.email,
        role: response.user.role,
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        name: `${response.user.firstName || ''} ${response.user.lastName || ''}`.trim(),
        avatar: response.user.profilePicture,
        studentId: response.user.studentId,
        employeeId: response.user.employeeId,
        department: response.user.department,
        semester: response.user.semester,
      };

      setUser(userData);
      localStorage.setItem("edu_user", JSON.stringify(userData));

      // Initialize socket with token
      initializeSocket(response.accessToken);
    } catch (error: any) {
      console.error("Signup error:", error);
      console.error("Error response:", error.response?.data);
      
      // Handle validation errors with detailed field messages
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors
          .map((err: { field: string; message: string }) => `${err.field}: ${err.message}`)
          .join(", ");
        throw new Error(errorMessages);
      }
      
      throw new Error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      localStorage.removeItem("edu_user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      disconnectSocket();
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      await authService.deleteAccount();
      
      // Clear local state after successful deletion
      setUser(null);
      localStorage.removeItem("edu_user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      disconnectSocket();
    } catch (error: any) {
      console.error("Delete account error:", error);
      throw new Error(error.response?.data?.message || "Failed to delete account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("edu_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, deleteAccount, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
