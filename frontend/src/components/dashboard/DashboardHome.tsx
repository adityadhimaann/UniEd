import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboardNew from './StudentDashboardNew';

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect faculty to instructor portal
    if (user?.role === 'faculty') {
      navigate('/instructor', { replace: true });
    }
  }, [user, navigate]);

  // Don't render student dashboard for faculty
  if (user?.role === 'faculty') {
    return null;
  }

  return <StudentDashboardNew />;
}
