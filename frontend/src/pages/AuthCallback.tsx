import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const isNewUser = searchParams.get('isNewUser') === 'true';

      if (error) {
        console.error('OAuth error:', error);
        navigate('/login?error=Authentication failed');
        return;
      }

      if (token) {
        try {
          // Store token in localStorage as accessToken
          localStorage.setItem('accessToken', token);
          
          // Fetch user profile using the token
          const userProfile = await authService.getProfile();
          
          // Transform and store user data
          const userData = {
            id: userProfile._id,
            email: userProfile.email,
            role: userProfile.role,
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
            avatar: userProfile.profilePicture || userProfile.avatar,
            studentId: userProfile.studentId,
            employeeId: userProfile.employeeId,
            department: userProfile.department,
            semester: userProfile.semester,
          };
          
          localStorage.setItem('edu_user', JSON.stringify(userData));
          
          // If new OAuth user, redirect to set password page
          if (isNewUser) {
            navigate('/set-password');
          } else {
            // Redirect to dashboard
            navigate('/dashboard');
            window.location.reload();
          }
        } catch (error) {
          console.error('Token processing error:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('edu_user');
          navigate('/login?error=Authentication failed');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <img src="/loadicon.gif" alt="Loading..." className="h-24 w-24 mx-auto mb-4" />
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
