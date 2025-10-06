import { useState, useMemo, useRef, useCallback } from 'react';
import { Search, Plus, Trash2, MapPin, ChevronLeft, ChevronRight, AlertTriangle, Edit, Eye, X, Upload } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoomService } from '../../services/room.service';
import type { Room } from '../../Types/room';
import { formatCurrency } from '../../lib/formatters';
import { authService } from '../../services/auth.service';

// Uncontrolled search component - không bao giờ re-render
const SearchBox = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce search to reduce re-renders
    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  }, [onSearch]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên phòng, mô tả..."
          onChange={handleInput}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

function RoomManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<any>(null);
  
  // CRUD Modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<Partial<Room>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const pageSize = 6;
  const queryClient = useQueryClient();

  // Enhanced room loading with smart fallback strategy
  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['rooms-all'],
    queryFn: async () => {
      try {
        console.log('🔄 Loading rooms from CyberSoft API...');
        const apiRooms = await RoomService.paged(1, 10000);
        
        // Merge with local demo rooms
        const localRooms = JSON.parse(localStorage.getItem('demo_rooms') || '[]');
        console.log(`📊 Found ${apiRooms.data?.length || 0} API rooms + ${localRooms.length} local rooms`);
        
        return {
          ...apiRooms,
          data: [...(apiRooms.data || []), ...localRooms]
        };
      } catch (err) {
        console.warn('⚠️ CyberSoft API failed, using enhanced fallback:', err);
        
        // Fallback: Use local rooms + some demo data
        const localRooms = JSON.parse(localStorage.getItem('demo_rooms') || '[]');
        const demoRooms = [
          { 
            id: 999001, 
            tenPhong: '🏠 Demo Villa Deluxe', 
            khach: 6, 
            phongNgu: 3, 
            giuong: 4,
            phongTam: 2,
            moTa: 'Villa sang trọng với view biển tuyệt đẹp, đầy đủ tiện nghi hiện đại',
            giaTien: 2500000, 
            mayGiat: true,
            banLa: true,
            tivi: true, 
            dieuHoa: true,
            wifi: true,
            bep: true,
            doXe: true,
            hoBoi: true,
            banUi: true,
            maViTri: 1,
            hinhAnh: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
          },
          { 
            id: 999002, 
            tenPhong: '🏨 Demo Apartment Modern', 
            khach: 4, 
            phongNgu: 2,
            giuong: 2, 
            phongTam: 1,
            moTa: 'Căn hộ hiện đại ngay trung tâm thành phố, tiện nghi đầy đủ',
            giaTien: 1200000,
            mayGiat: true,
            banLa: false,
            tivi: true,
            dieuHoa: true, 
            wifi: true,
            bep: true,
            doXe: false,
            hoBoi: false,
            banUi: false,
            maViTri: 2,
            hinhAnh: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'
          }
        ];
        
        return { 
          data: [...localRooms, ...demoRooms],
          pageIndex: 1, 
          pageSize: 1000,
          totalRow: localRooms.length + demoRooms.length
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for better UX
  });

  // Filter rooms based on search term
  const filteredRooms = useMemo(() => {
    if (!roomsData?.data) return [];
    
    if (!searchTerm.trim()) {
      return roomsData.data;
    }
    
    const term = searchTerm.toLowerCase();
    return roomsData.data.filter((room: any) => 
      room.tenPhong?.toLowerCase().includes(term) ||
      room.moTa?.toLowerCase().includes(term) ||
      room.id?.toString().includes(term)
    );
  }, [roomsData?.data, searchTerm]);

  // Paginate filtered results
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRooms.slice(startIndex, startIndex + pageSize);
  }, [filteredRooms, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRooms.length / pageSize);

  // Search handler with pagination reset
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage]);

  // Page change with loading state
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage || isChangingPage) return;
    
    setIsChangingPage(true);
    setCurrentPage(page);
    
    // Smooth transition
    setTimeout(() => {
      setIsChangingPage(false);
    }, 200);
  }, [currentPage, isChangingPage]);

  // Enhanced delete mutation with smart fallback
  const deleteMutation = useMutation({
    mutationFn: async (roomId: number) => {
      // Try API first
      try {
        await RoomService.deleteRoom(roomId);
        return { method: 'api', roomId };
      } catch (error) {
        console.warn(`⚠️ API delete failed for room ${roomId}, trying local delete:`, error);
        
        // Fallback: Remove from localStorage
        const localRooms = JSON.parse(localStorage.getItem('demo_rooms') || '[]');
        const updatedRooms = localRooms.filter((room: any) => room.id !== roomId);
        localStorage.setItem('demo_rooms', JSON.stringify(updatedRooms));
        
        return { method: 'local', roomId };
      }
    },
    onMutate: (roomId) => {
      setDeletingRoomId(roomId);
      console.log('🗑️ Starting enhanced delete for room:', roomId);
    },
    onSuccess: (result) => {
      const { method, roomId } = result;
      console.log(`✅ Delete successful via ${method} for room:`, roomId);
      
      queryClient.refetchQueries({ queryKey: ['rooms-all'] });
      setShowDeleteModal(false);
      setRoomToDelete(null);
      setDeletingRoomId(null);
      
      // Smart success message
      if (method === 'api') {
        alert(`🎉 Xóa phòng #${roomId} thành công từ CyberSoft API!`);
      } else {
        alert(`🎭 DEMO: Phòng #${roomId} đã được xóa khỏi demo database!\n\n💡 Lưu ý: Chỉ có thể xóa phòng demo vì CyberSoft API readonly.`);
      }
    },
    onError: (error: any, roomId) => {
      console.error('❌ Delete error for room:', roomId, error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Lỗi xóa phòng!';
      alert(`🚨 Lỗi xóa phòng #${roomId}: ${errorMessage}`);
      setDeletingRoomId(null);
    },
  });

  // Enhanced create mutation with smart feedback
  const createMutation = useMutation({
    mutationFn: RoomService.createRoom,
    onSuccess: (newRoom) => {
      console.log('✅ Create successful:', newRoom);
      queryClient.refetchQueries({ queryKey: ['rooms-all'] });
      setShowRoomModal(false);
      resetForm();
      
      // Smart success message
      const isDemo = newRoom.id >= 999000 || localStorage.getItem('demo_rooms')?.includes(String(newRoom.id));
      if (isDemo) {
        alert(`🎭 DEMO: Phòng "${newRoom.tenPhong}" đã được tạo thành công trong demo database!\n\n💡 Lưu ý: CyberSoft API chỉ cho phép đọc dữ liệu với student account.`);
      } else {
        alert(`🎉 Tạo phòng "${newRoom.tenPhong}" thành công trên CyberSoft API!`);
      }
    },
    onError: (error: any) => {
      console.error('❌ Create error:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Lỗi tạo phòng!';
      alert(`🚨 Lỗi tạo phòng: ${errorMessage}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Room> }) => RoomService.updateRoom(id, data),
    onSuccess: (updatedRoom, { id }) => {
      console.log('Update successful:', updatedRoom);
      queryClient.refetchQueries({ queryKey: ['rooms-all'] });
      setShowRoomModal(false);
      resetForm();
      alert(`Cập nhật phòng #${id} thành công!`);
    },
    onError: (error: any, { id }) => {
      console.error('Update error:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Lỗi cập nhật phòng!';
      alert(`Lỗi cập nhật phòng #${id}: ${errorMessage}`);
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => RoomService.uploadRoomImage(id, formData),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['rooms-all'] });
      setImageFile(null);
      setImagePreview('');
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      alert(error.message || 'Lỗi tải ảnh!');
    },
  });

  const handleDelete = (room: any) => {
    if (!authService.isAuthenticated()) {
      alert('Bạn cần đăng nhập để xóa phòng!');
      return;
    }
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (roomToDelete) {
      deleteMutation.mutate(roomToDelete.id);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({});
    setSelectedRoom(null);
    setImageFile(null);
    setImagePreview('');
  };

  // Modal handlers
  const openCreateModal = () => {
    if (!authService.isAuthenticated()) {
      alert('Bạn cần đăng nhập để tạo phòng mới!');
      return;
    }
    
    resetForm();
    setModalMode('create');
    setShowRoomModal(true);
  };

  const openEditModal = (room: Room) => {
    if (!authService.isAuthenticated()) {
      alert('Bạn cần đăng nhập để chỉnh sửa phòng!');
      return;
    }
    setFormData(room);
    setSelectedRoom(room);
    setModalMode('edit');
    setShowRoomModal(true);
  };

  const openViewModal = (room: Room) => {
    setSelectedRoom(room);
    setModalMode('view');
    setShowRoomModal(true);
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.tenPhong?.trim()) {
      alert('Vui lòng nhập tên phòng!');
      return;
    }
    
    if (!formData.khach || formData.khach < 1) {
      alert('Số khách phải lớn hơn 0!');
      return;
    }
    
    if (!formData.giaTien || formData.giaTien < 0) {
      alert('Giá tiền không hợp lệ!');
      return;
    }

    try {
      if (modalMode === 'create') {
        console.log('Creating room with data:', formData);
        
        // Ensure required fields have default values
        const roomData = {
          ...formData,
          phongNgu: formData.phongNgu || 1,
          giuong: formData.giuong || 1,
          phongTam: formData.phongTam || 1,
          maViTri: formData.maViTri || 1,
          moTa: formData.moTa || '',
          // Set default amenities to false if not specified
          mayGiat: formData.mayGiat || false,
          banLa: formData.banLa || false,
          tivi: formData.tivi || false,
          dieuHoa: formData.dieuHoa || false,
          wifi: formData.wifi || false,
          bep: formData.bep || false,
          doXe: formData.doXe || false,
          hoBoi: formData.hoBoi || false,
          banUi: formData.banUi || false,
          hinhAnh: '',
        } as Omit<Room, 'id'>;
        
        const newRoom = await createMutation.mutateAsync(roomData);
        
        // Upload image if provided
        if (imageFile && newRoom?.id) {
          try {
            const imageFormData = new FormData();
            imageFormData.append('formFile', imageFile);
            await uploadImageMutation.mutateAsync({ id: newRoom.id, formData: imageFormData });
          } catch (imageError) {
            console.warn('Image upload failed but room created:', imageError);
            alert('Phòng đã được tạo nhưng không thể tải ảnh lên. Bạn có thể chỉnh sửa để thêm ảnh sau.');
          }
        }
        
      } else if (modalMode === 'edit' && selectedRoom) {
        console.log('Updating room with data:', formData);
        
        await updateMutation.mutateAsync({ id: selectedRoom.id, data: formData });
        
        // Upload image if provided
        if (imageFile) {
          try {
            const imageFormData = new FormData();
            imageFormData.append('formFile', imageFile);
            await uploadImageMutation.mutateAsync({ id: selectedRoom.id, formData: imageFormData });
          } catch (imageError) {
            console.warn('Image upload failed but room updated:', imageError);
            alert('Phòng đã được cập nhật nhưng không thể tải ảnh lên.');
          }
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      // Error already handled by mutation onError
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏠 Quản lý phòng</h1>
          <div className="space-y-2">
            <p className="text-gray-600">
              Quản lý thông tin các phòng cho thuê
              {!authService.isAuthenticated() && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  ⚠️ Cần đăng nhập để thực hiện thao tác
                </span>
              )}
            </p>
            
            {/* Smart status indicators */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                📊 {filteredRooms.length} phòng
              </span>
              
              {/* Local demo rooms count */}
              {(() => {
                const localCount = filteredRooms.filter(room => room.id >= 999000).length;
                return localCount > 0 && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                    🎭 {localCount} demo
                  </span>
                );
              })()}
              
              {/* API connection status */}
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                💎 CyberSoft Connected
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openCreateModal}
            disabled={!authService.isAuthenticated()}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              authService.isAuthenticated() 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5" />
            Thêm phòng
          </button>
        </div>
      </div>

      <SearchBox onSearch={handleSearch} />

      {/* Container với chiều cao cố định để tránh layout shift */}
      <div className="min-h-[600px] transition-all duration-300 ease-in-out">
        <div className={`room-cards-grid transition-opacity duration-200 ${isChangingPage ? 'opacity-50' : 'opacity-100'}`}>
        {paginatedRooms.map((room: any) => (
          <div key={room.id} className={`room-card-fixed bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-100 ${deletingRoomId === room.id ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="room-card-image relative bg-gray-200 rounded-t-xl overflow-hidden">
              {room.hinhAnh ? (
                <img src={room.hinhAnh} alt={room.tenPhong} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span className="text-4xl">🏠</span>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-white rounded px-2 py-1 text-sm font-semibold max-w-[80px] truncate">
                #{room.id}
              </div>
              {/* Demo badge for local rooms */}
              {room.id >= 999000 && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  🎭 DEMO
                </div>
              )}
            </div>
            
            <div className="room-card-content">
              {/* Title - Fixed height */}
              <div className="room-card-title">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 w-full">
                  {room.tenPhong}
                </h3>
              </div>
              
              <div className="room-card-info">
                <div>
                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                    <span className="text-sm">Vị trí: {room.maViTri || 'N/A'}</span>
                  </div>
                  
                  {/* Room details */}
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">👥</span>
                      <span>{room.khach} khách</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">🛏️</span>
                      <span>{room.phongNgu} PN</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-orange-600 mr-2">🛌</span>
                      <span>{room.giuong} giường</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-600 mr-2">🚿</span>
                      <span>{room.phongTam} PT</span>
                    </div>
                  </div>
                  
                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.wifi && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">📶 WiFi</span>}
                    {room.dieuHoa && <span className="text-xs bg-cyan-100 text-cyan-600 px-2 py-1 rounded-full">❄️ AC</span>}
                    {room.bep && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">🍳 Bếp</span>}
                    {room.mayGiat && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">👕 ML</span>}
                  </div>
                </div>
              </div>
              
              {/* Price and Actions - Always at bottom */}
              <div className="room-card-actions">
                <div className="text-xl font-bold text-green-600 mb-3 text-center">
                  {formatCurrency(room.giaTien || 0)}/đêm
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openViewModal(room)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs"
                  >
                    <Eye className="w-3 h-3" />
                    Xem
                  </button>
                  
                  <button
                    onClick={() => openEditModal(room)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs"
                  >
                    <Edit className="w-3 h-3" />
                    Sửa
                  </button>
                  
                  <button
                    onClick={() => handleDelete(room)}
                    disabled={deletingRoomId === room.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && filteredRooms.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-sm text-gray-700">
                Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredRooms.length)} trong tổng số {filteredRooms.length} phòng
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isChangingPage}
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
                        onClick={() => handlePageChange(item.value as number)}
                        disabled={isChangingPage}
                        className={`w-10 h-8 border rounded-md text-sm font-medium flex items-center justify-center ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {item.value}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isChangingPage}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Sau
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Không tìm thấy phòng nào' : 'Chưa có phòng nào'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Hãy thử tìm kiếm với từ khóa khác' : 'Hãy thêm phòng mới'}
            </p>
          </div>
        )}
      </div>

      {/* Room CRUD Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {modalMode === 'view' && '👁️ Xem chi tiết phòng'}
                {modalMode === 'create' && '➕ Thêm phòng mới'}
                {modalMode === 'edit' && '✏️ Chỉnh sửa phòng'}
              </h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {modalMode === 'view' ? (
                // View Mode
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedRoom?.hinhAnh || '/placeholder.png'}
                      alt={selectedRoom?.tenPhong}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{selectedRoom?.tenPhong}</h4>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedRoom?.giaTien || 0)}/đêm</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Khách:</strong> {selectedRoom?.khach} người</div>
                      <div><strong>Phòng ngủ:</strong> {selectedRoom?.phongNgu}</div>
                      <div><strong>Giường:</strong> {selectedRoom?.giuong}</div>
                      <div><strong>Phòng tắm:</strong> {selectedRoom?.phongTam}</div>
                    </div>
                    
                    <div>
                      <strong>Mô tả:</strong>
                      <p className="text-gray-600 mt-1">{selectedRoom?.moTa}</p>
                    </div>
                    
                    <div>
                      <strong>Tiện nghi:</strong>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        {selectedRoom?.wifi && <div>✅ WiFi</div>}
                        {selectedRoom?.mayGiat && <div>✅ Máy giặt</div>}
                        {selectedRoom?.banLa && <div>✅ Bàn là</div>}
                        {selectedRoom?.tivi && <div>✅ TV</div>}
                        {selectedRoom?.dieuHoa && <div>✅ Điều hòa</div>}
                        {selectedRoom?.bep && <div>✅ Bếp</div>}
                        {selectedRoom?.doXe && <div>✅ Chỗ đỗ xe</div>}
                        {selectedRoom?.hoBoi && <div>✅ Hồ bơi</div>}
                        {selectedRoom?.banUi && <div>✅ Bàn ủi</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Create/Edit Mode
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {imagePreview || (modalMode === 'edit' && selectedRoom?.hinhAnh) ? (
                          <div className="relative">
                            <img
                              src={imagePreview || selectedRoom?.hinhAnh}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview('');
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Chọn hình ảnh phòng</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng *</label>
                        <input
                          type="text"
                          name="tenPhong"
                          value={formData.tenPhong || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số khách *</label>
                          <input
                            type="number"
                            name="khach"
                            value={formData.khach || ''}
                            onChange={handleInputChange}
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ngủ *</label>
                          <input
                            type="number"
                            name="phongNgu"
                            value={formData.phongNgu || ''}
                            onChange={handleInputChange}
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Giường *</label>
                          <input
                            type="number"
                            name="giuong"
                            value={formData.giuong || ''}
                            onChange={handleInputChange}
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phòng tắm *</label>
                          <input
                            type="number"
                            name="phongTam"
                            value={formData.phongTam || ''}
                            onChange={handleInputChange}
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá tiền (VNĐ/đêm) *</label>
                        <input
                          type="number"
                          name="giaTien"
                          value={formData.giaTien || ''}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="1000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã vị trí *</label>
                        <input
                          type="number"
                          name="maViTri"
                          value={formData.maViTri || ''}
                          onChange={handleInputChange}
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      name="moTa"
                      value={formData.moTa || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tiện nghi</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'wifi', label: 'WiFi' },
                        { key: 'mayGiat', label: 'Máy giặt' },
                        { key: 'banLa', label: 'Bàn là' },
                        { key: 'tivi', label: 'TV' },
                        { key: 'dieuHoa', label: 'Điều hòa' },
                        { key: 'bep', label: 'Bếp' },
                        { key: 'doXe', label: 'Chỗ đỗ xe' },
                        { key: 'hoBoi', label: 'Hồ bơi' },
                        { key: 'banUi', label: 'Bàn ủi' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name={key}
                            checked={formData[key as keyof Room] as boolean || false}
                            onChange={handleCheckboxChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowRoomModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {(createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending) && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      {modalMode === 'create' ? 'Tạo phòng' : 'Cập nhật'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa phòng</h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn xóa phòng <strong>"{roomToDelete?.tenPhong}"</strong>?
                Hành động này không thể hoàn tác.
              </p>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setRoomToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomManagement;
