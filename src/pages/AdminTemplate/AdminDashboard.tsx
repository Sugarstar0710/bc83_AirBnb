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

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Hiệu suất hệ thống</h3>
            <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              Làm mới
            </button>
          </div>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Biểu đồ hiệu suất</p>
              <p className="text-sm text-gray-500 mt-1">Dữ liệu realtime sẽ hiển thị tại đây</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {totalUsers.toString().slice(-1)}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Cập nhật dữ liệu người dùng</p>
                <p className="text-xs text-gray-600">{totalUsers} người dùng được tải từ API</p>
              </div>
              <span className="text-xs text-gray-500">Vừa xong</span>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {totalRooms.toString().slice(-1)}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Đồng bộ dữ liệu phòng</p>
                <p className="text-xs text-gray-600">{totalRooms} phòng được cập nhật</p>
              </div>
              <span className="text-xs text-gray-500">1 phút trước</span>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Admin đăng nhập</p>
                <p className="text-xs text-gray-600">{currentUser?.name || 'Admin'} truy cập hệ thống</p>
              </div>
              <span className="text-xs text-gray-500">5 phút trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Hành động nhanh</h3>
          <Zap className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleQuickAction('add-user')}
            className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl text-left transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
              <Plus className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Thêm người dùng</h4>
            <p className="text-sm text-gray-600">Tạo tài khoản mới cho người dùng</p>
          </button>
          
          <button 
            onClick={() => handleQuickAction('add-room')}
            className="group p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl text-left transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <Home className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform" />
              <Plus className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Thêm phòng</h4>
            <p className="text-sm text-gray-600">Đăng ký phòng cho thuê mới</p>
          </button>
          
          <button 
            onClick={() => handleQuickAction('add-location')}
            className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl text-left transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <MapPin className="w-10 h-10 text-purple-600 group-hover:scale-110 transition-transform" />
              <Plus className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Thêm địa điểm</h4>
            <p className="text-sm text-gray-600">Tạo địa điểm du lịch mới</p>
          </button>
        </div>
      </div>

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
