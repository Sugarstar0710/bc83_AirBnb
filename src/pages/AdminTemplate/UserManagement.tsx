import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import type { User } from '../../Types/user';
import { formatNumber } from '../../lib/formatters';

// Component tìm kiếm không bị mất focus
const UserSearchBox: React.FC<{ onSearch: (term: string) => void }> = ({ onSearch }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
        onChange={handleSearch}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
      />
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Query client để invalidate cache
  const queryClient = useQueryClient();

  // Fetch users từ API
  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching users from API...');
      try {
        const result = await userService.getUsers(1, 10000); // Lấy tối đa 10,000 users
        console.log('API Response:', result);
        return result;
      } catch (err) {
        console.error('API Error:', err);
        throw err; // Let TanStack Query handle the error
      }
    },
    retry: 2, // Retry 2 times on error
    refetchInterval: 30000,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => userService.deleteUser(userId),
    onSuccess: () => {
      // Refresh data sau khi xóa thành công
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.refetchQueries({ queryKey: ['users'] });
      alert('✅ Xóa người dùng thành công!');
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      alert(`❌ Có lỗi xảy ra khi xóa người dùng: ${error?.response?.data?.message || error?.message || 'Vui lòng thử lại!'}`);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData: { id: number; name: string; email: string; phone: string; birthday: string; gender: boolean; role: string }) => 
      userService.updateUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.refetchQueries({ queryKey: ['users'] });
      setShowModal(false);
      alert('✅ Cập nhật người dùng thành công!');
    },
    onError: (error: any) => {
      console.error('Update user error:', error);
      alert(`❌ Có lỗi xảy ra khi cập nhật người dùng: ${error?.response?.data?.message || error?.message || 'Vui lòng thử lại!'}`);
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: { name: string; email: string; phone: string; birthday: string; gender: boolean; role: string; password: string }) => 
      userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.refetchQueries({ queryKey: ['users'] });
      setShowModal(false);
      alert('✅ Thêm người dùng thành công!');
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      alert(`Có lỗi xảy ra khi thêm người dùng: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    },
  });

  const users = usersResponse?.data || [];
  
  console.log('UserManagement Debug:', {
    usersResponse,
    users,
    isLoading,
    error
  });

  // Filter users dựa trên search term và role
  const filteredUsers = useMemo(() => {
    return users.filter((user: User) => {
      // Xử lý search term
      if (searchTerm.trim() === '') {
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        return matchesRole;
      }
      
      // Safe check cho name, email và phone
      const userName = user.name || '';
      const userEmail = user.email || '';
      const userPhone = user.phone || '';
      
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = userName.toLowerCase().includes(searchLower) ||
                           userEmail.toLowerCase().includes(searchLower) ||
                           userPhone.toLowerCase().includes(searchLower);
      
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  // Reset về trang 1 khi search hoặc filter thay đổi
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole]);

  // Pagination cho filtered users
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage, usersPerPage]);

  const handleAction = (action: 'add' | 'edit' | 'view' | 'delete', user?: User) => {
    if (action === 'delete') {
      if (confirm(`⚠️ Bạn có chắc chắn muốn xóa người dùng "${user?.name}"?\n\nHành động này không thể hoàn tác!`)) {
        if (user?.id) {
          deleteUserMutation.mutate(user.id);
        }
      }
      return;
    }
    
    setModalType(action);
    setSelectedUser(user || null);
    setShowModal(true);
  };

  const UserModal = () => {
    const [formData, setFormData] = useState({
      name: selectedUser?.name || '',
      email: selectedUser?.email || '',
      phone: selectedUser?.phone || '',
      birthday: selectedUser?.birthday || '',
      gender: selectedUser?.gender || false,
      role: selectedUser?.role || 'USER',
      password: ''
    });

    // Update form data khi selectedUser thay đổi
    React.useEffect(() => {
      if (selectedUser) {
        setFormData({
          name: selectedUser.name || '',
          email: selectedUser.email || '',
          phone: selectedUser.phone || '',
          birthday: selectedUser.birthday || '',
          gender: selectedUser.gender || false,
          role: selectedUser.role || 'USER',
          password: ''
        });
      } else {
        // Reset form cho add user
        setFormData({
          name: '',
          email: '',
          phone: '',
          birthday: '',
          gender: false,
          role: 'USER',
          password: ''
        });
      }
    }, [selectedUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (modalType === 'edit' && selectedUser) {
        // Validate required fields for edit
        if (!formData.name.trim() || !formData.email.trim()) {
          alert('❌ Tên và Email không được để trống!');
          return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          alert('❌ Email không hợp lệ!');
          return;
        }
        
        // Validate phone format (if provided)
        if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
          alert('❌ Số điện thoại không hợp lệ (phải có 10-11 chữ số)!');
          return;
        }
        
        updateUserMutation.mutate({
          id: selectedUser.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          birthday: formData.birthday,
          gender: formData.gender,
          role: formData.role
        });
      } else if (modalType === 'add') {
        // Validate required fields for add
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
          alert('❌ Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Email, Mật khẩu)!');
          return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          alert('❌ Email không hợp lệ!');
          return;
        }
        
        // Validate phone format (if provided)
        if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
          alert('❌ Số điện thoại không hợp lệ (phải có 10-11 chữ số)!');
          return;
        }
        
        // Validate password length
        if (formData.password.length < 6) {
          alert('❌ Mật khẩu phải có ít nhất 6 ký tự!');
          return;
        }
        
        createUserMutation.mutate({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          birthday: formData.birthday,
          gender: formData.gender,
          role: formData.role,
          password: formData.password
        });
      }
    };

    // Render View Modal (Card style)
    if (modalType === 'view' && selectedUser) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white shadow-lg flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{selectedUser.name}</h2>
                  <p className="text-blue-100 text-sm">{selectedUser.email}</p>
                  <div className="flex items-center mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedUser.role === 'ADMIN' 
                        ? 'bg-yellow-500 text-yellow-900' 
                        : 'bg-green-500 text-green-900'
                    }`}>
                      {selectedUser.role === 'ADMIN' ? '👑 Quản trị viên' : '👤 Người dùng'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    📋 Thông tin cá nhân
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">👤</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Họ và tên</p>
                        <p className="font-medium text-gray-800">{selectedUser.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">📧</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{selectedUser.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-sm">📱</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="font-medium text-gray-800">{selectedUser.phone || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    ℹ️ Thông tin bổ sung
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-pink-600 text-sm">🎂</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ngày sinh</p>
                        <p className="font-medium text-gray-800">
                          {selectedUser.birthday ? new Date(selectedUser.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-sm">
                          {selectedUser.gender ? '👨' : '👩'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Giới tính</p>
                        <p className="font-medium text-gray-800">
                          {selectedUser.gender ? 'Nam' : 'Nữ'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 text-sm">🆔</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID người dùng</p>
                        <p className="font-medium text-gray-800">#{selectedUser.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setModalType('edit');
                    // Keep the same selectedUser, just change modal type
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>✏️</span>
                  <span>Chỉnh sửa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Render Add/Edit Modal (Form style)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {modalType === 'add' && 'Thêm người dùng mới'}
            {modalType === 'edit' && 'Chỉnh sửa người dùng'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={modalType === 'view'}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={modalType === 'view'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={modalType === 'view'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={modalType === 'view'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <select
                name="gender"
                value={formData.gender.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value === 'true' }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={modalType === 'view'}
              >
                <option value="true">Nam</option>
                <option value="false">Nữ</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={modalType === 'view'}
              >
                <option value="USER">Người dùng</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>

            {modalType === 'add' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  // Reset form khi đóng modal
                  if (modalType === 'add') {
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      birthday: '',
                      gender: false,
                      role: 'USER',
                      password: ''
                    });
                  }
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              {modalType !== 'view' && (
                <button
                  type="submit"
                  disabled={updateUserMutation.isPending || createUserMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {(updateUserMutation.isPending || createUserMutation.isPending) && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  {modalType === 'add' ? 'Thêm người dùng' : 'Cập nhật'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin người dùng trong hệ thống
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Statistics Card */}
          {usersResponse && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-blue-600 font-semibold text-sm">👥</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(usersResponse?.totalRow || users.length)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Tổng người dùng
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => handleAction('add')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <UserSearchBox onSearch={setSearchTerm} />
          </div>
          <div className="flex items-center space-x-3">
            <Filter size={20} className="text-gray-400" />
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="USER">Người dùng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-red-500 mb-2">❌</div>
          <p className="text-gray-600">Có lỗi xảy ra khi tải dữ liệu</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin liên hệ
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sinh nhật
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giới tính
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover border" 
                            src={user.avatar} 
                            alt={user.name}
                            onError={(e) => {
                              // Fallback to initial if image fails to load
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzQjgyRjYiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4ke3VzZXIubmFtZS5jaGFyQXQoMCl9PC90ZXh0Pgo8L3N2Zz4K';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone || 'Chưa có SĐT'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.birthday || 'Chưa có'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {user.gender ? 'Nam' : 'Nữ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAction('view', user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleAction('edit', user)}
                        className="text-green-600 hover:text-green-800 p-1 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleAction('delete', user)}
                        disabled={deleteUserMutation.isPending}
                        className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa"
                      >
                        {deleteUserMutation.isPending && deleteUserMutation.variables === user.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Empty rows để giữ chiều cao cố định */}
              {Array.from({ length: Math.max(0, usersPerPage - paginatedUsers.length) }).map((_, index) => (
                <tr key={`empty-${index}`} className="h-[73px]">
                  <td className="px-6 py-4">&nbsp;</td>
                  <td className="px-6 py-4">&nbsp;</td>
                  <td className="px-6 py-4">&nbsp;</td>
                  <td className="px-6 py-4">&nbsp;</td>
                  <td className="px-6 py-4">&nbsp;</td>
                  <td className="px-6 py-4">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * usersPerPage) + 1} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} trong tổng số {filteredUsers.length} người dùng
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>
              
              {(() => {
                const items = [];
                
                if (totalPages <= 7) {
                  // Ít trang: hiển thị tất cả
                  for (let i = 1; i <= totalPages; i++) {
                    items.push({ type: 'page', value: i });
                  }
                } else {
                  // Nhiều trang: luôn có trang 1 và trang cuối
                  items.push({ type: 'page', value: 1 });
                  
                  if (currentPage <= 4) {
                    // Gần đầu: 1, 2, 3, 4, 5, ..., last
                    for (let i = 2; i <= 5; i++) {
                      items.push({ type: 'page', value: i });
                    }
                    items.push({ type: 'dots', value: '...' });
                    items.push({ type: 'page', value: totalPages });
                  } else if (currentPage >= totalPages - 3) {
                    // Gần cuối: 1, ..., n-4, n-3, n-2, n-1, n
                    items.push({ type: 'dots', value: '...' });
                    for (let i = totalPages - 4; i <= totalPages; i++) {
                      items.push({ type: 'page', value: i });
                    }
                  } else {
                    // Ở giữa: 1, ..., current-1, current, current+1, ..., last
                    items.push({ type: 'dots', value: '...' });
                    items.push({ type: 'page', value: currentPage - 1 });
                    items.push({ type: 'page', value: currentPage });
                    items.push({ type: 'page', value: currentPage + 1 });
                    items.push({ type: 'dots', value: '...' });
                    items.push({ type: 'page', value: totalPages });
                  }
                }
                
                return items.map((item, index) => {
                  if (item.type === 'dots') {
                    return (
                      <span key={`dots-${index}`} className="px-2 text-gray-400 flex items-center">
                        ...
                      </span>
                    );
                  }
                  
                  const isActive = item.value === currentPage;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setCurrentPage(item.value as number)}
                      className={`w-10 h-8 border rounded-md text-sm font-medium flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {item.value}
                    </button>
                  );
                });
              })()}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && <UserModal />}
    </div>
  );
};

export default UserManagement;
