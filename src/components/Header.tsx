import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { authService } from '../services/auth.service';

const Header: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-5">
        <div className="flex items-center h-16 relative">
          {/* Logo - Left aligned with 20px padding */}
          <Link to="/" className="flex items-center">
            <span className="text-3xl font-bold text-rose-500" style={{ fontFamily: "'Playfair Display', 'Merriweather', 'Georgia', serif", letterSpacing: '-0.5px' }}>
              VietDuongHome
            </span>
          </Link>

          {/* Desktop Navigation - Absolutely centered */}
          <nav className="hidden md:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
            <Link 
              to="/" 
              className="w-32 px-5 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors font-semibold text-base shadow-sm hover:shadow-md text-center"
            >
              Trang chủ
            </Link>
            <Link 
              to="/rooms" 
              className="w-32 px-5 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors font-semibold text-base shadow-sm hover:shadow-md text-center"
              onClick={(e) => {
                if (window.location.pathname === '/rooms') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setTimeout(() => window.location.reload(), 1000);
                } else if (window.location.pathname.startsWith('/rooms/')) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              Phòng
            </Link>
          </nav>

          {/* User Menu - Right aligned */}
          <div className="flex items-center ml-auto gap-4">
            {/* Login Button */}
            {!user && !isLoginPage && (
              <Link
                to="/login"
                className="px-5 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors font-semibold text-base shadow-sm hover:shadow-md"
              >
                Đăng nhập
              </Link>
            )}
            
            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
                >
                  <Menu size={16} />
                  <div className="w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      <span>Hồ Sơ</span>
                    </Link>
                    
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} />
                        <span>Quản trị</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-rose-500 font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/rooms"
                className="text-gray-700 hover:text-rose-500 font-medium"
                onClick={(e) => {
                  setShowMobileMenu(false);
                  if (window.location.pathname === '/rooms') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => window.location.reload(), 1000);
                  } else if (window.location.pathname.startsWith('/rooms/')) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                Phòng
              </Link>
              
              {user && user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-rose-500 font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Quản trị
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
