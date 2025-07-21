// src/components/Profile/AdminProfile.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function AdminProfile({ user }) {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    console.log('Navigating to admin dashboard...');
    navigate("/admin/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      {/* Admin Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="relative inline-block">
          <img
            src={user.profilePictures?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f59e0b&color=fff`}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-amber-200 object-cover mx-auto"
          />
          <div className="absolute -bottom-2 -right-2 bg-amber-100 rounded-full p-2">
            <ShieldCheckIcon className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mt-6 text-gray-900">{user.name}</h2>
        <p className="text-gray-600 mt-2">{user.email}</p>
        
        <div className="flex items-center justify-center mt-4">
          <span className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 text-sm font-semibold rounded-full border border-amber-300">
            <ShieldCheckIcon className="h-4 w-4 inline mr-2" />
            Platform Administrator
          </span>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleDashboardClick}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Go to Admin Dashboard
          </button>
          
          <button
            onClick={() => navigate("/profile/settings")}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-8 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <CogIcon className="h-5 w-5 mr-2" />
            Profile Settings
          </button>
        </div>
      </div>

      {/* Admin Info */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Administrator Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Role:</span>
            <span className="font-medium text-gray-900">Platform Administrator</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Access Level:</span>
            <span className="font-medium text-green-600">Full Access</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Member Since:</span>
            <span className="font-medium text-gray-900">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}