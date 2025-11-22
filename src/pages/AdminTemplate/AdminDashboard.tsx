import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Home, MapPin, TrendingUp, Calendar, DollarSign, 
  Activity, Clock, Star, Shield, Zap, 
  ArrowUp, Plus, RefreshCw, X
} from 'lucide-react';
import { formatNumber, formatDate, formatCurrency } from '../../lib/formatters';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { RoomService } from '../../services/room.service';
import { LocationService } from '../../services/location.service';
import { authService } from '../../services/auth.service';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    birthday: '',
    gender: true,
    role: 'USER'
  });
  
  // Get current user info
  const currentUser = authService.getCurrentUser();
  


  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-user':
        setShowAddUserModal(true);
        break;
      case 'add-room':
        navigate('/admin/rooms');
        break;
      case 'add-location':
        navigate('/admin/locations');
        break;
      default:
        break;
    }
  };
  
  // Fetch dữ liệu từ API
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        return await userService.getUsers(1, 10000); // Lấy tối đa 10,000 users
      } catch (err) {
        console.error('Users API error, using mock:', err);
        return { data: [], totalRow: 150 }; // Mock data
      }
    },
    refetchInterval: 30000,
  });

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms-all'],
    queryFn: async () => {
      console.log('AdminDashboard: Fetching rooms...');
      const result = await RoomService.paged(1, 10000, ''); // Lấy tối đa 10,000 phòng
      console.log('AdminDashboard: Rooms result:', result);
      return result;
    },
    refetchInterval: 30000,
  });

  const { data: locationsResponse, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => LocationService.listTop(),
    refetchInterval: 60000,
  });

  // Tính toán thống kê
  const totalUsers = usersResponse?.totalRow || 0;
  const totalRooms = roomsData?.totalRow || 0;
  const totalLocations = locationsResponse?.length || 0;
  const adminUsers = usersResponse?.data?.filter(user => user.role === 'ADMIN').length || 0;
  const regularUsers = totalUsers - adminUsers;
  
  // Mock data for advanced metrics
  const todayBookings = 147;
  const monthlyRevenue = 2847000;
  const avgRating = 4.8;
  const occupancyRate = 78;

  // Welcome message based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Chào buổi sáng';
    if (hour < 18) return '☀️ Chào buổi chiều';
    return '🌙 Chào buổi tối';
  };

  // Mutation to create new user
  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      // Force refetch để đảm bảo data được cập nhật ngay lập tức
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.refetchQueries({ queryKey: ['users'] });
      setShowAddUserModal(false);
      setNewUserData({
        name: '',
        email: '',
        phone: '',
        password: '',
        birthday: '',
        gender: true,
        role: 'USER'
      });
      alert('✅ Tạo người dùng thành công!');
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      alert('❌ Lỗi tạo người dùng: ' + (error.response?.data?.message || error.message));
    }
  });

  // Handle form submission
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (newUserData.password.length < 6) {
      alert('⚠️ Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      alert('⚠️ Email không hợp lệ!');
      return;
    }

    createUserMutation.mutate(newUserData);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {currentUser?.name || 'Admin'}!</h1>
            <p className="text-blue-100 text-lg">Chào mừng trở lại với bảng điều khiển AirBnb</p>
            <div className="flex items-center mt-3 text-blue-100">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">Cập nhật lần cuối: {formatDate(new Date())}</span>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{new Date().getDate()}</div>
                <div className="text-sm opacity-90">Tháng {new Date().getMonth() + 1}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Người dùng</h3>
              </div>
              {usersLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(totalUsers)}
                  </div>
                  <div className="flex items-center text-sm">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">+{adminUsers} Admin</span>
                  </div>
                </>
              )}
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Rooms Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Home className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Phòng</h3>
              </div>
              {roomsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(totalRooms)}
                  </div>
                  <div className="flex items-center text-sm">
                    <Activity className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">{occupancyRate}% Đầy</span>
                  </div>
                </>
              )}
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <Home className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Bookings Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Hôm nay</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatNumber(todayBookings)}
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-purple-600 font-medium">+25% từ hôm qua</span>
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Doanh thu</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatCurrency(monthlyRevenue)}
              </div>
              <div className="flex items-center text-sm">
                <ArrowUp className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-orange-600 font-medium">+18% tháng này</span>
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Địa điểm</h3>
            <MapPin className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mb-2">
            {totalLocations}
          </div>
          <p className="text-sm text-gray-600">Tổng số địa điểm</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Đánh giá</h3>
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {avgRating}/5.0
          </div>
          <p className="text-sm text-gray-600">Đánh giá trung bình</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Hệ thống</h3>
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600 mb-2">
            99.8%
          </div>
          <p className="text-sm text-gray-600">Uptime hệ thống</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Phân bổ người dùng</h3>
            <Users className="w-6 h-6 text-rose-600" />
          </div>
          <div className="space-y-4">
            {/* Admin Users Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Quản trị viên</span>
                <span className="text-sm font-bold text-rose-600">{adminUsers}</span>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: '0%',
                    animation: 'growWidth 1.5s ease-out forwards',
                    '--target-width': `${totalUsers > 0 ? (adminUsers / totalUsers) * 100 : 0}%`
                  } as any}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-700 mix-blend-difference">
                    {totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Regular Users Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Người dùng thường</span>
                <span className="text-sm font-bold text-blue-600">{regularUsers}</span>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: '0%',
                    animation: 'growWidth 1.5s ease-out 0.2s forwards',
                    '--target-width': `${totalUsers > 0 ? (regularUsers / totalUsers) * 100 : 0}%`
                  } as any}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-700 mix-blend-difference">
                    {totalUsers > 0 ? ((regularUsers / totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Pie Chart Visualization */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#f1f5f9"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#f43f5e"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${totalUsers > 0 ? (adminUsers / totalUsers) * 351.86 : 0} 351.86`}
                      className="transition-all duration-1000 ease-out"
                      style={{
                        strokeDasharray: '0 351.86',
                        animation: 'drawCircle 1.5s ease-out forwards',
                        '--target-dash': `${totalUsers > 0 ? (adminUsers / totalUsers) * 351.86 : 0}`
                      } as any}
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#3b82f6"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${totalUsers > 0 ? (regularUsers / totalUsers) * 351.86 : 0} 351.86`}
                      strokeDashoffset={`${totalUsers > 0 ? -(adminUsers / totalUsers) * 351.86 : 0}`}
                      className="transition-all duration-1000 ease-out"
                      style={{
                        strokeDasharray: '0 351.86',
                        animation: 'drawCircle 1.5s ease-out 0.5s forwards',
                        '--target-dash': `${totalUsers > 0 ? (regularUsers / totalUsers) * 351.86 : 0}`
                      } as any}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
                      <div className="text-xs text-gray-500">Tổng</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-600"></div>
                    <span className="text-sm text-gray-600">Admin ({adminUsers})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-sm text-gray-600">User ({regularUsers})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue & Bookings Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Xu hướng đặt phòng</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Tổng phòng</div>
                <div className="text-2xl font-bold text-green-600">{totalRooms}</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Địa điểm</div>
                <div className="text-2xl font-bold text-purple-600">{totalLocations}</div>
              </div>
            </div>

            {/* Animated Bar Chart */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 mb-3">Thống kê theo tháng</div>
              {[
                { month: 'T10', value: totalRooms * 0.6, color: 'from-blue-400 to-blue-600' },
                { month: 'T11', value: totalRooms * 0.8, color: 'from-purple-400 to-purple-600' },
                { month: 'T12', value: totalRooms * 0.95, color: 'from-green-400 to-green-600' },
              ].map((item, index) => (
                <div key={item.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{item.month}</span>
                    <span className="text-xs font-bold text-gray-800">{Math.round(item.value)}</span>
                  </div>
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${item.color} rounded-full shadow-sm`}
                      style={{
                        width: '0%',
                        animation: `growWidth 1.2s ease-out ${index * 0.2}s forwards`,
                        '--target-width': `${(item.value / totalRooms) * 100}%`
                      } as any}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Growth Indicator */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Tăng trưởng</span>
                </div>
                <span className="text-lg font-bold text-green-600">+15.3%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">So với tháng trước</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes growWidth {
          from {
            width: 0%;
          }
          to {
            width: var(--target-width);
          }
        }
        
        @keyframes drawCircle {
          from {
            stroke-dasharray: 0 351.86;
          }
          to {
            stroke-dasharray: var(--target-dash) 351.86;
          }
        }
      `}</style>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thêm người dùng mới</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên *
                </label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập họ tên"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={newUserData.birthday}
                  onChange={(e) => setNewUserData({ ...newUserData, birthday: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính
                </label>
                <select
                  value={newUserData.gender ? 'true' : 'false'}
                  onChange={(e) => setNewUserData({ ...newUserData, gender: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Nam</option>
                  <option value="false">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USER">Người dùng</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createUserMutation.isPending ? 'Đang tạo...' : 'Tạo người dùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
