import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Home } from 'lucide-react';
import { authService } from '../services/auth.service';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    birthday: '',
    gender: true
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      navigate('/');
    },
    onError: (error: string) => {
      alert(error);
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      // Call your register API here
      return authService.login({ email: data.email, password: data.password });
    },
    onSuccess: () => {
      navigate('/');
    },
    onError: (error: string) => {
      alert(error);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (isLogin) {
      loginMutation.mutate({ email: formData.email, password: formData.password });
    } else {
      if (!formData.name.trim()) {
        alert('Vui lòng nhập họ tên!');
        return;
      }
      registerMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Graphics */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 relative overflow-hidden">
        {/* Glass Morphism Overlay - Enhanced */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-br from-white/10 to-transparent"></div>
        
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-pink-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-white z-10">
          <div className="max-w-md text-center space-y-6">
            {/* Icon with Strong Glass Effect */}
            <div className="w-40 h-40 bg-white/20 backdrop-blur-xl rounded-full mx-auto flex items-center justify-center mb-8 border-2 border-white/30 shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] relative overflow-hidden">
              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <Home className="w-20 h-20 text-white drop-shadow-2xl relative z-10" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-5xl font-bold mb-4 drop-shadow-2xl" style={{ fontFamily: "'Playfair Display', 'Merriweather', 'Georgia', serif" }}>
              Khám phá những nơi ở tuyệt vời
            </h2>
            
            <p className="text-xl text-white/95 leading-relaxed drop-shadow-lg">
              Hàng triệu chỗ ở độc đáo đang chờ đón bạn trên khắp thế giới
            </p>

            {/* Stats Cards with Strong Glass Effect */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="bg-white/15 backdrop-blur-xl rounded-xl p-5 border border-white/30 shadow-[0_8px_32px_0_rgba(255,255,255,0.15)] hover:bg-white/25 hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                <div className="text-3xl font-bold mb-1 drop-shadow-md relative z-10">1M+</div>
                <div className="text-sm text-white/90 relative z-10">Chỗ ở</div>
              </div>
              <div className="bg-white/15 backdrop-blur-xl rounded-xl p-5 border border-white/30 shadow-[0_8px_32px_0_rgba(255,255,255,0.15)] hover:bg-white/25 hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                <div className="text-3xl font-bold mb-1 drop-shadow-md relative z-10">200+</div>
                <div className="text-sm text-white/90 relative z-10">Quốc gia</div>
              </div>
              <div className="bg-white/15 backdrop-blur-xl rounded-xl p-5 border border-white/30 shadow-[0_8px_32px_0_rgba(255,255,255,0.15)] hover:bg-white/25 hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                <div className="text-3xl font-bold mb-1 drop-shadow-md relative z-10">4.8★</div>
                <div className="text-sm text-white/90 relative z-10">Đánh giá</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-rose-50">
        <div className="max-w-md w-full">
          {/* Form Container with Strong Glass Effect */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border-2 border-white/50 p-8 relative overflow-hidden">
            {/* Glass shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent pointer-events-none"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Welcome Text */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
                </h2>
                <p className="text-gray-600">
                  {isLogin ? 'Đăng nhập để tiếp tục khám phá' : 'Bắt đầu hành trình của bạn với chúng tôi'}
                </p>
              </div>

              {/* Toggle Tabs */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    isLogin
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/50 backdrop-blur-sm text-gray-600 hover:bg-white/70 border border-white/60'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    !isLogin
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/50 backdrop-blur-sm text-gray-600 hover:bg-white/70 border border-white/60'
                  }`}
                >
                  Đăng ký
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Register Only: Name */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/80 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                      placeholder="Nguyễn Văn A"
                      required={!isLogin}
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/80 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Register Only: Phone */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/80 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                      placeholder="0123456789"
                    />
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-12 py-3 bg-white/60 backdrop-blur-sm border border-white/80 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Register Only: Birthday & Gender */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/80 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới tính
                      </label>
                      <select
                        name="gender"
                        value={formData.gender ? 'true' : 'false'}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value === 'true' }))}
                        className="block w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/80 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                      >
                        <option value="true">Nam</option>
                        <option value="false">Nữ</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                  className="w-full bg-rose-500 text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-rose-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  {(loginMutation.isPending || registerMutation.isPending) ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    isLogin ? 'Đăng nhập' : 'Đăng ký'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/40 text-gray-500">hoặc</span>
                </div>
              </div>

              {/* Back to Home */}
              <Link
                to="/"
                className="w-full block text-center py-3 px-4 bg-white/50 backdrop-blur-sm border-2 border-white/70 text-gray-700 rounded-lg font-medium hover:bg-white/70 hover:border-rose-300 hover:text-rose-500 transition-all shadow-sm"
              >
                Quay về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
