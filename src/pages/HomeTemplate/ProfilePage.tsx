import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Camera, User, Mail, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const initialUser = authService.getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  
  if (!initialUser) {
    navigate('/login');
    return null;
  }

  // Fetch full user info from API
  const { data: user, isLoading } = useQuery({
    queryKey: ['userProfile', initialUser.id],
    queryFn: () => authService.refreshUserInfo(),
    initialData: initialUser
  });
  
  // Format birthday to YYYY-MM-DD for input
  const formatBirthday = (birthday: string) => {
    if (!birthday) return '';
    const date = new Date(birthday);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthday: formatBirthday(user?.birthday || ''),
    gender: user?.gender ?? true
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthday: formatBirthday(user.birthday || ''),
        gender: user.gender ?? true
      });
    }
  }, [user]);

  // Mutation cập nhật thông tin người dùng
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => {
      return userService.updateUser({
        id: user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        birthday: data.birthday,
        gender: data.gender,
        role: user.role
      });
    },
    onSuccess: (response: any) => {
      const updatedUser = response.content || response;
      
      // Cập nhật localStorage với thông tin mới
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const newUserData = {
          ...currentUser,
          name: updatedUser.name || formData.name,
          phone: updatedUser.phone || formData.phone,
          birthday: updatedUser.birthday || formData.birthday,
          gender: updatedUser.gender ?? formData.gender
        };
        localStorage.setItem('user', JSON.stringify(newUserData));
      }
      alert('Cập nhật thông tin thành công!');
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 500);
    },
    onError: (error: any) => {
      alert('Cập nhật thất bại: ' + (error?.response?.data?.message || error?.message || 'Vui lòng thử lại'));
    }
  });

  // Mutation upload avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => {
      return userService.uploadAvatar(file);
    },
    onSuccess: async (response: any) => {
      let avatarUrl = '';
      
      if (typeof response === 'string') {
        avatarUrl = response;
      } else if (response?.avatar) {
        avatarUrl = response.avatar;
      } else if (response?.content) {
        avatarUrl = typeof response.content === 'string' ? response.content : response.content.avatar;
      }
      
      // Cập nhật localStorage với avatar mới
      const currentUser = authService.getCurrentUser();
      if (currentUser && avatarUrl) {
        const newUserData = {
          ...currentUser,
          avatar: avatarUrl
        };
        localStorage.setItem('user', JSON.stringify(newUserData));
        
        await authService.refreshUserInfo();
        
        alert('Cập nhật avatar thành công!');
        setTimeout(() => window.location.reload(), 500);
      } else {
        alert('Upload thành công nhưng không thể cập nhật hiển thị. Vui lòng tải lại trang.');
      }
    },
    onError: (error: any) => {
      alert('Upload avatar thất bại: ' + (error?.response?.data?.content || error?.response?.data?.message || error?.message || error || 'Vui lòng thử lại'));
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gender' ? value === 'true' : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadAvatarMutation.mutate(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Quay lại</span>
        </button>

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-white/50 p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin...</p>
            </div>
          </div>
        ) : (
          <>
        {/* Profile Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-white/50 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-rose-400 via-rose-500 to-pink-600 h-32 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-gray-400" />
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Cập nhật avatar"
                  disabled={uploadAvatarMutation.isPending}
                >
                  {uploadAvatarMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <Mail size={16} />
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors font-semibold shadow-sm hover:shadow-md"
              >
                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
              </button>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email - Read Only */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                    title="Email không thể chỉnh sửa"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-2" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Chưa cập nhật"
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Birthday */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender ? 'true' : 'false'}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>

                {/* Role - Only show for ADMIN */}
                {user.role === 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vai trò
                    </label>
                    <input
                      type="text"
                      value="Quản trị viên"
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {isEditing && (
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    disabled={updateProfileMutation.isPending}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
