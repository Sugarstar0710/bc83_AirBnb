import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Users, 
  Home, 
  LogOut, 
  Menu, 
  X, 
  BarChart3,
  User,
  Settings,
  ChevronDown
} from 'lucide-react';
import { authService } from '../../services/auth.service';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLogging, setIsLogging] = useState(false);
  const [loginError, setLoginError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get admin info from auth service
  const [adminInfo, setAdminInfo] = useState(() => {
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
  });

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
    { icon: BarChart3, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Quản lý người dùng', path: '/users' },
    { icon: Home, label: 'Quản lý phòng', path: '/rooms' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
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
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button 
            onClick={() => {
              authService.logout();
              window.location.href = '/';
            }}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Đăng xuất
          </button>
        </div>
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
        <header className="flex items-center justify-between h-16 px-6 bg-white shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
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
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {adminInfo.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
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
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{adminInfo.name}</div>
                    <div className="text-sm text-gray-500">{adminInfo.email}</div>
                  </div>
                  
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User size={16} className="mr-3" />
                    Thông tin cá nhân
                  </button>
                  
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Settings size={16} className="mr-3" />
                    Cài đặt
                  </button>
                  
                  <button 
                    onClick={() => {
                      setShowLoginModal(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <User size={16} className="mr-3" />
                    Chuyển tài khoản admin
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button 
                    onClick={() => {
                      authService.logout();
                      window.location.href = '/';
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Đăng nhập Admin</h3>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginForm({ email: '', password: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsLogging(true);
              setLoginError('');
              
              try {
                // Gọi API đăng nhập thật
                const response = await authService.login(loginForm);
                
                // Cập nhật admin info từ response
                setAdminInfo({
                  name: response.user.name,
                  email: response.user.email,
                  role: response.user.role === 'ADMIN' ? 'Admin' : response.user.role,
                  avatar: response.user.avatar || null
                });
                
                // Đóng modal và reset form
                setShowLoginModal(false);
                setLoginForm({ email: '', password: '' });
                
                // Refresh page để cập nhật UI với user mới
                window.location.reload();
                
              } catch (error: any) {
                console.error('Login failed:', error);
                setLoginError(typeof error === 'string' ? error : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
              } finally {
                setIsLogging(false);
              }
            }}>
              <div className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{loginError}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Admin
                  </label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm({...loginForm, email: e.target.value});
                      setLoginError(''); // Clear error khi user nhập
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@cybersoft.edu.vn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({...loginForm, password: e.target.value});
                      setLoginError(''); // Clear error khi user nhập
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginForm({ email: '', password: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={isLogging}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLogging || !loginForm.email || !loginForm.password}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLogging && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isLogging ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </div>
            </form>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">
                <strong>Chú ý:</strong><br />
                • Chỉ tài khoản có role ADMIN mới có thể đăng nhập<br />
                • Sử dụng email và mật khẩu thật từ hệ thống CyberSoft<br />
                • Sau khi đăng nhập thành công, thông tin admin sẽ được cập nhật
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default AdminLayout;
