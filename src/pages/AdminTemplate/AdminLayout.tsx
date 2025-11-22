import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { 
  Users, 
  Home, 
  LogOut, 
  Menu, 
  X, 
  BarChart3,
  User,
  Settings,
  ChevronDown,
  MapPin,
  Calendar
} from 'lucide-react';
import { authService } from '../../services/auth.service';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get admin info from auth service
  const adminInfo = (() => {
    const currentUser = authService.getCurrentUser();
    return currentUser ? {
      name: currentUser.name || 'Admin User',
      email: currentUser.email || 'admin@airbnb.com',
      role: currentUser.role === 'ADMIN' ? 'Admin' : (currentUser.role || 'Admin'),
      avatar: currentUser.avatar || null
    } : {
      name: 'Admin User',
      email: 'admin@airbnb.com',
      role: 'Admin',
      avatar: null
    };
  })();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Quản lý người dùng', path: '/admin/users' },
    { icon: Home, label: 'Quản lý phòng', path: '/admin/rooms' },
    { icon: MapPin, label: 'Quản lý địa điểm', path: '/admin/locations' },
    { icon: Calendar, label: 'Quản lý đặt phòng', path: '/admin/bookings' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-rose-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl shadow-xl border-r border-white/50 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-rose-500 via-rose-500 to-pink-600">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
                  isActive ? 'bg-rose-50 text-rose-600 border-r-4 border-rose-600' : ''
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/50">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 text-gray-600 hover:text-rose-500"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              Quản trị hệ thống
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Admin Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 text-gray-700 hover:text-rose-600 focus:outline-none transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                    {adminInfo.avatar ? (
                      <img 
                        src={adminInfo.avatar} 
                        alt={adminInfo.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {adminInfo.name?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{adminInfo.name || 'Admin User'}</div>
                    <div className="text-xs text-gray-500">{adminInfo.role || 'Admin'}</div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-white/50 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{adminInfo.name}</div>
                    <div className="text-sm text-gray-500">{adminInfo.email}</div>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User size={16} className="mr-3" />
                    Thông tin cá nhân
                  </Link>
                  
                  <Link
                    to="/"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Home size={16} className="mr-3" />
                    Trang chủ
                  </Link>
                  
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <Settings size={16} className="mr-3" />
                    Cài đặt
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button 
                    onClick={() => {
                      authService.logout();
                      window.location.href = '/';
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-rose-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};



export default AdminLayout;
