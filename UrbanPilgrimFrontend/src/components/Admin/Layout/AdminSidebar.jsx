// src/components/Admin/Layout/AdminSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  MapIcon, 
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon // Changed from LogoutIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Pilgrim Experiences', href: '/admin/dashboard/pilgrim-experiences', icon: MapIcon }, // Fixed href
    { name: 'Users', href: '/admin/dashboard/users', icon: UserGroupIcon }, // Fixed href
    { name: 'Analytics', href: '/admin/dashboard/analytics', icon: ChartBarIcon }, // Fixed href
    { name: 'Settings', href: '/admin/dashboard/settings', icon: CogIcon }, // Fixed href
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-amber-900 to-amber-800 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-20 shadow-md border-b border-amber-700">
          <h1 className="text-xl font-bold text-white">Urban Pilgrim Admin</h1>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-amber-700 text-white shadow-lg'
                        : 'text-amber-100 hover:bg-amber-700/50 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-amber-100 rounded-lg hover:bg-amber-700/50 hover:text-white transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" /> {/* Fixed icon */}
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;