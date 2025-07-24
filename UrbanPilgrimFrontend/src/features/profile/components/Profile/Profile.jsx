// src/components/Profile/Profile.jsx
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { logout } from "../../../../slices/authSlice";
import UserProfile from "./UserProfile";
import WellnessGuideProfile from "./WellnessGuideProfile";
import AdminProfile from "./AdminProfile";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);

  // Check authentication on component mount
  useEffect(() => {
    console.log('Profile component - Auth state:', { user, token }); // Debug log
    if (!user || !token) {
      console.log('Not authenticated, redirecting to login'); // Debug log
      navigate('/login', { replace: true });
    }
  }, [user, token, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  // Show loading while checking auth
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const ProfileHeader = () => (
    <div className="bg-white shadow-sm border-b mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Welcome back, {user.firstName} {user.lastName}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Back to Home
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Function to render the appropriate profile component based on user roles
  const renderProfileComponent = () => {
    // Priority order: ADMIN > WELLNESS_GUIDE > USER (default)
    if (user.roles?.includes("ADMIN")) {
      return <AdminProfile user={user} />;
    } else if (user.roles?.includes("WELLNESS_GUIDE")) {
      return <WellnessGuideProfile user={user} />;
    } else {
      return <UserProfile user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderProfileComponent()}
      </div>
    </div>
  );
}