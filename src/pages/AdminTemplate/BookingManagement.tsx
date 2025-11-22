import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, Calendar, User, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/booking.service';
import { userService } from '../../services/user.service';
import { phongServices } from '../../services/room.service';
import type { Booking, BookingWithDetails } from '../../Types/booking';

// Modal component
interface BookingModalProps {
  showModal: boolean;
  modalType: 'add' | 'edit' | 'view';
  formData: Partial<Booking>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({
  showModal,
  modalType,
  formData,
  onInputChange,
  onSubmit,
  onClose,
  isSubmitting
}) => {
  if (!showModal) return null;

  // View mode
  if (modalType === 'view') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Chi tiết đặt phòng</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã đặt phòng</p>
                <p className="font-semibold text-gray-900">#{formData.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã phòng</p>
                <p className="font-semibold text-gray-900">#{formData.maPhong}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã người dùng</p>
                <p className="font-semibold text-gray-900">#{formData.maNguoiDung}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số lượng khách</p>
                <p className="font-semibold text-gray-900">{formData.soLuongKhach} khách</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày đến</p>
                <p className="font-semibold text-gray-900">
                  {formData.ngayDen ? new Date(formData.ngayDen).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày đi</p>
                <p className="font-semibold text-gray-900">
                  {formData.ngayDi ? new Date(formData.ngayDi).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add/Edit mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {modalType === 'add' ? 'Thêm đặt phòng mới' : 'Chỉnh sửa đặt phòng'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã phòng *
              </label>
              <input
                type="number"
                name="maPhong"
                value={formData.maPhong || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Nhập mã phòng..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã người dùng *
              </label>
              <input
                type="number"
                name="maNguoiDung"
                value={formData.maNguoiDung || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Nhập mã người dùng..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày đến *
              </label>
              <input
                type="date"
                name="ngayDen"
                value={formData.ngayDen || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày đi *
              </label>
              <input
                type="date"
                name="ngayDi"
                value={formData.ngayDi || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng khách *
              </label>
              <input
                type="number"
                name="soLuongKhach"
                value={formData.soLuongKhach || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Nhập số lượng khách..."
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : (modalType === 'add' ? 'Thêm' : 'Cập nhật')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookingManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<Partial<Booking>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  
  const pageSize = 10;
  const queryClient = useQueryClient();

  // Load all users for mapping
  const { data: usersData } = useQuery({
    queryKey: ['users-all'],
    queryFn: async () => {
      const response = await userService.getUsers(1, 1000); // Get large page size to get all users
      return response.data;
    },
  });

  // Load all rooms for mapping
  const { data: roomsData } = useQuery({
    queryKey: ['rooms-all'],
    queryFn: async () => {
      const response = await phongServices.getListPhong();
      console.log('🏠 Rooms response:', response.data);
      return response.data.content || [];
    },
  });

  // Load bookings
  const { data: bookingsData } = useQuery({
    queryKey: ['bookings-all'],
    queryFn: async () => {
      console.log('🔄 Loading bookings...');
      const response = await bookingService.getAllBookings();
      console.log('✅ Bookings loaded:', response.content);
      return response.content;
    },
  });

  // Enrich bookings with user and room names
  const enrichedBookings = useMemo<BookingWithDetails[]>(() => {
    if (!bookingsData || !usersData || !roomsData) return [];
    
    return bookingsData.map((booking: Booking) => {
      const user = usersData.find((u: any) => u.id === booking.maNguoiDung);
      const room = roomsData.find((r: any) => r.id === booking.maPhong);
      
      return {
        ...booking,
        tenNguoiDung: user?.name || `User #${booking.maNguoiDung}`,
        tenPhong: room?.tenPhong || `Room #${booking.maPhong}`,
      };
    });
  }, [bookingsData, usersData, roomsData]);

  // Create booking mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Booking, 'id'>) => {
      const response = await bookingService.createBooking(data);
      return response.content;
    },
    onSuccess: (newBooking) => {
      console.log('✅ Create successful:', newBooking);
      queryClient.refetchQueries({ queryKey: ['bookings-all'] });
      setShowModal(false);
      resetForm();
      alert(`🎉 Thêm đặt phòng #${newBooking.id} thành công!`);
    },
    onError: (error: any) => {
      console.error('❌ Create error:', error);
      const errorMessage = error?.response?.data?.content || error?.message || 'Lỗi tạo đặt phòng!';
      alert(`🚨 Lỗi tạo đặt phòng: ${errorMessage}`);
    },
  });

  // Update booking mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Booking> }) => {
      const response = await bookingService.updateBooking(id, data);
      return response.content;
    },
    onSuccess: (updatedBooking, { id }) => {
      console.log('✅ Update successful:', updatedBooking);
      queryClient.refetchQueries({ queryKey: ['bookings-all'] });
      setShowModal(false);
      resetForm();
      alert(`🎉 Cập nhật đặt phòng #${id} thành công!`);
    },
    onError: (error: any, { id }) => {
      console.error('❌ Update error:', error);
      const errorMessage = error?.response?.data?.content || error?.message || 'Lỗi cập nhật đặt phòng!';
      alert(`🚨 Lỗi cập nhật đặt phòng #${id}: ${errorMessage}`);
    },
  });

  // Delete booking mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await bookingService.deleteBooking(id);
      return id;
    },
    onSuccess: (id) => {
      console.log('✅ Delete successful:', id);
      queryClient.refetchQueries({ queryKey: ['bookings-all'] });
      setShowDeleteModal(false);
      setBookingToDelete(null);
      alert(`🎉 Xóa đặt phòng #${id} thành công!`);
    },
    onError: (error: any) => {
      console.error('❌ Delete error:', error);
      const errorMessage = error?.response?.data?.content || error?.message || 'Lỗi xóa đặt phòng!';
      alert(`🚨 ${errorMessage}`);
    },
  });

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (!enrichedBookings) return [];
    
    let filtered = enrichedBookings;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((booking) =>
        booking.id?.toString().includes(term) ||
        booking.maPhong?.toString().includes(term) ||
        booking.maNguoiDung?.toString().includes(term) ||
        booking.tenNguoiDung?.toLowerCase().includes(term) ||
        booking.tenPhong?.toLowerCase().includes(term)
      );
    }
    
    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((booking) => new Date(booking.ngayDen) >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      filtered = filtered.filter((booking) => new Date(booking.ngayDi) <= toDate);
    }
    
    return filtered;
  }, [enrichedBookings, searchTerm, dateFrom, dateTo]);

  // Paginate filtered results
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBookings.slice(startIndex, startIndex + pageSize);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resetForm = () => {
    setFormData({});
    setSelectedBooking(null);
  };

  const handleAction = (type: 'add' | 'edit' | 'view' | 'delete', booking?: Booking) => {
    if (type === 'delete' && booking) {
      setBookingToDelete(booking);
      setShowDeleteModal(true);
    } else if (type !== 'delete') {
      setModalType(type);
      if (booking) {
        setSelectedBooking(booking);
        setFormData(booking);
      } else {
        resetForm();
      }
      setShowModal(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.maPhong || !formData.maNguoiDung || !formData.ngayDen || !formData.ngayDi || !formData.soLuongKhach) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (modalType === 'add') {
      createMutation.mutate(formData as Omit<Booking, 'id'>);
    } else if (modalType === 'edit' && selectedBooking) {
      updateMutation.mutate({ id: selectedBooking.id, data: formData });
    }
  };

  const confirmDelete = () => {
    if (bookingToDelete) {
      deleteMutation.mutate(bookingToDelete.id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Calculate number of nights
  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt phòng</h1>
          <p className="text-gray-600 mt-1">Quản lý các đơn đặt phòng trong hệ thống</p>
        </div>
        <button
          onClick={() => handleAction('add')}
          className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Thêm đặt phòng
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đặt phòng, tên phòng, tên người dùng..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm hover:shadow transition-shadow"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Date filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm hover:shadow transition-shadow"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm hover:shadow transition-shadow"
              />
            </div>
            {(dateFrom || dateTo) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Xóa lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {paginatedBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Grid layout for info */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-[120px_1fr_1fr_200px] gap-6">
                {/* Booking ID */}
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Mã đặt phòng</p>
                  <p className="font-bold text-gray-900">#{booking.id}</p>
                </div>

                {/* Room Info */}
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Phòng</p>
                  <div className="flex items-start gap-1.5">
                    <Home size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm break-words">{booking.tenPhong}</p>
                      <p className="text-xs text-gray-500">Mã phòng: #{booking.maPhong}</p>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Người đặt</p>
                  <div className="flex items-start gap-1.5">
                    <User size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{booking.tenNguoiDung}</p>
                      <p className="text-xs text-gray-500">ID: #{booking.maNguoiDung}</p>
                    </div>
                  </div>
                </div>

                {/* Check-in / Check-out */}
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Thời gian</p>
                  <div className="flex items-start gap-1.5">
                    <Calendar size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Đi:</span>
                          <span className="font-semibold text-gray-900 ml-2">
                            {new Date(booking.ngayDi).toLocaleDateString('vi-VN', { 
                              day: '2-digit', 
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Đến:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(booking.ngayDen).toLocaleDateString('vi-VN', { 
                              day: '2-digit', 
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {calculateNights(booking.ngayDen, booking.ngayDi)} đêm
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Guest count and Actions */}
              <div className="flex items-center gap-3">
                {/* Guests badge */}
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                  👥 {booking.soLuongKhach} khách
                </span>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction('view', booking)}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => handleAction('edit', booking)}
                    className="px-3 py-1.5 text-sm text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleAction('delete', booking)}
                    className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy đặt phòng nào
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách thêm đặt phòng đầu tiên'}
          </p>
          <button
            onClick={() => handleAction('add')}
            className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Thêm đặt phòng mới
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> đến{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, filteredBookings.length)}</span> trong tổng số{' '}
            <span className="font-medium">{filteredBookings.length}</span> kết quả
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} className="mr-1" />
              Trước
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-rose-600 text-white border border-rose-600'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BookingModal
        showModal={showModal}
        modalType={modalType}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa đặt phòng <span className="font-semibold">#{bookingToDelete.id}</span>?
              <br />
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setBookingToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
