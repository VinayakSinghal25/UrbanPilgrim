// src/features/admin/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/Admin/Layout/AdminLayout';
import PilgrimExperienceList from '../components/Admin/PilgrimExperience/PilgrimExperienceList';
import CreatePilgrimExperience from '../components/Admin/PilgrimExperience/CreatePilgrimExperience';
import EditPilgrimExperience from '../components/Admin/PilgrimExperience/EditPilgrimExperience';
import PendingWellnessGuides from '../components/Admin/WellnessGuide/PendingWellnessGuides';
import WellnessGuideDetail from '../components/Admin/WellnessGuide/WellnessGuideDetail';
import PendingWellnessGuideClasses from '../components/Admin/WellnessGuideClass/PendingWellnessGuideClasses';
import WellnessGuideClassDetail from '../components/Admin/WellnessGuideClass/WellnessGuideClassDetail';
import { 
  ChartBarIcon, 
  UsersIcon, 
  MapIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExperiences: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    console.log('AdminDashboard mounted');
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setStats({
      totalExperiences: 12,
      totalUsers: 245,
      totalBookings: 89,
      totalRevenue: 125000
    });
  };

  const DashboardHome = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <MapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Experiences</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExperiences}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100">
              <CurrencyDollarIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => {
              console.log('Navigate to create experience');
              navigate('/admin/dashboard/pilgrim-experiences/create');
            }}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all duration-200"
          >
            <MapIcon className="h-8 w-8 text-amber-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Create New Experience</h3>
            <p className="text-sm text-gray-600">Add a new pilgrim experience to your platform</p>
          </button>
          
          <button 
            onClick={() => {
              console.log('Navigate to manage experiences');
              navigate('/admin/dashboard/pilgrim-experiences');
            }}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all duration-200"
          >
            <MapIcon className="h-8 w-8 text-amber-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Manage Experiences</h3>
            <p className="text-sm text-gray-600">View and edit existing experiences</p>
          </button>
          
          <button 
            onClick={() => {
              console.log('Navigate to pending wellness guides');
              navigate('/admin/dashboard/pending-wellness-guides');
            }}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all duration-200"
          >
            <UserGroupIcon className="h-8 w-8 text-amber-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Pending Guide Requests</h3>
            <p className="text-sm text-gray-600">Review and approve wellness guide applications</p>
          </button>
          
          <button 
            onClick={() => {
              console.log('Navigate to pending wellness guide classes');
              navigate('/admin/dashboard/pending-wellness-guide-classes');
            }}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all duration-200"
          >
            <AcademicCapIcon className="h-8 w-8 text-amber-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Pending Class Requests</h3>
            <p className="text-sm text-gray-600">Review and approve wellness guide class submissions</p>
          </button>
          
          <button 
            onClick={() => {
              console.log('Navigate to analytics');
              navigate('/admin/dashboard/analytics');
            }}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all duration-200"
          >
            <ChartBarIcon className="h-8 w-8 text-amber-600 mb-2" />
            <h3 className="font-semibold text-gray-900">View Analytics</h3>
            <p className="text-sm text-gray-600">Check detailed analytics and reports</p>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="pilgrim-experiences" element={<PilgrimExperienceList />} />
        <Route path="pilgrim-experiences/create" element={<CreatePilgrimExperience />} />
        <Route path="pilgrim-experiences/edit/:id" element={<EditPilgrimExperience />} />
        <Route path="pending-wellness-guides" element={<PendingWellnessGuides />} />
        <Route path="wellness-guide/:id" element={<WellnessGuideDetail />} />
        <Route path="pending-wellness-guide-classes" element={<PendingWellnessGuideClasses />} />
        <Route path="users" element={<div>Users Management - Coming Soon</div>} />
        <Route path="analytics" element={<div>Analytics - Coming Soon</div>} />
        <Route path="settings" element={<div>Settings - Coming Soon</div>} />
        <Route path="wellness-guide-class/:id" element={<WellnessGuideClassDetail />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;