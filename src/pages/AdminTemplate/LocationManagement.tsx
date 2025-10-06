import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, MapPin, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viTriServices } from '../../services/location.service';
import { authService } from '../../services/auth.service';
import type { Location } from '../../Types/location';

// Tách LocationModal ra ngoài để tránh re-render mất focus
interface LocationModalProps {
  showModal: boolean;
  modalType: 'add' | 'edit' | 'view';
  formData: Partial<Location>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const LocationModal: React.FC<LocationModalProps> = ({
  showModal,
  modalType,
  formData,
  onInputChange,
  onSubmit,
  onClose,
  isSubmitting
}) => {
  if (!showModal) return null;

  // View mode - Hiển thị đẹp như User Management
  if (modalType === 'view') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Chi tiết vị trí</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Hình ảnh vị trí */}
            {formData.hinhAnh && (
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={formData.hinhAnh}
                  alt={formData.tenViTri}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=No+Image';
                  }}
                />
              </div>
            )}

            {/* Thông tin chi tiết */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tên vị trí</p>
                    <p className="font-semibold text-gray-800 text-lg">{formData.tenViTri}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-lg">🏙️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tỉnh thành</p>
                    <p className="font-semibold text-gray-800 text-lg">{formData.tinhThanh}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quốc gia</p>
                    <p className="font-semibold text-gray-800 text-lg">{formData.quocGia}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 text-lg">🆔</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID vị trí</p>
                    <p className="font-semibold text-gray-800">#{formData.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add/Edit mode - Form style
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {modalType === 'add' && 'Thêm vị trí mới'}
          {modalType === 'edit' && 'Chỉnh sửa vị trí'}
        </h3>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên vị trí *
            </label>
            <input
              type="text"
              name="tenViTri"
              value={formData.tenViTri || ''}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Quận 1, Ba Đình..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tỉnh thành *
            </label>
            <input
              type="text"
              name="tinhThanh"
              value={formData.tinhThanh || ''}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Hồ Chí Minh, Hà Nội..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quốc gia *
            </label>
            <input
              type="text"
              name="quocGia"
              value={formData.quocGia || ''}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Việt Nam"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh URL
            </label>
            <input
              type="url"
              name="hinhAnh"
              value={formData.hinhAnh || ''}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : (modalType === 'add' ? 'Thêm' : 'Cập nhật')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LocationManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<Partial<Location>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  
  const pageSize = 8; // 8 locations per page
  const queryClient = useQueryClient();

  // BC83 pattern - Load locations
  const { data: locationsData } = useQuery({
    queryKey: ['locations-all'],
    queryFn: async () => {
      console.log('🔄 Loading locations...');
      const response = await viTriServices.getListViTri();
      console.log('✅ Response:', response.data);
      return response.data.content || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  // BC83 Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const response = await viTriServices.deleteViTri(locationId);
      return response.data;
    },
    onSuccess: (data, locationId) => {
      console.log('✅ Delete successful:', data);
      queryClient.refetchQueries({ queryKey: ['locations-all'] });
      setShowDeleteModal(false);
      setLocationToDelete(null);
      alert(`🎉 Xóa vị trí #${locationId} thành công!`);
    },
    onError: (error: any, locationId) => {
      console.error('❌ Delete error:', error);
      const errorMessage = error?.response?.data?.content || error?.message || 'Lỗi xóa vị trí!';
      alert(`🚨 Lỗi xóa vị trí #${locationId}: ${errorMessage}`);
    },
  });

  // BC83 Create mutation
  const createMutation = useMutation({
    mutationFn: async (locationData: Omit<Location, 'id'>) => {
      const response = await viTriServices.createViTri(locationData);
      return response.data.content;
    },
    onSuccess: (newLocation) => {
      console.log('✅ Create successful:', newLocation);
      queryClient.refetchQueries({ queryKey: ['locations-all'] });
      setShowModal(false);
      resetForm();
      alert(`🎉 Tạo vị trí "${newLocation.tenViTri}" thành công!`);
    },
    onError: (error: any) => {
      console.error('❌ Create error:', error);
      const errorMessage = error?.response?.data?.content || error?.message || 'Lỗi tạo vị trí!';
      alert(`🚨 Lỗi tạo vị trí: ${errorMessage}`);
    },
  });

  // BC83 Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Location> }) => {
      const response = await viTriServices.updateViTri(id, data);
      return response.data.content;
    },
    onSuccess: (updatedLocation, { id }) => {
      console.log('✅ Update successful:', updatedLocation);
      queryClient.refetchQueries({ queryKey: ['locations-all'] });
      setShowModal(false);
      resetForm();
      alert(`🎉 Cập nhật vị trí #${id} thành công!`);
    },
    onError: (error: any, { id }) => {
      console.error('❌ Update error:', error);
      const errorMessage = error?.response?.data?.content || error?.message || 'Lỗi cập nhật vị trí!';
      alert(`🚨 Lỗi cập nhật vị trí #${id}: ${errorMessage}`);
    },
  });

  const filteredLocations = useMemo(() => {
    if (!locationsData) return [];
    
    if (!searchTerm.trim()) {
      return locationsData;
    }
    
    const term = searchTerm.toLowerCase();
    return locationsData.filter((location: Location) =>
      location.tenViTri?.toLowerCase().includes(term) ||
      location.tinhThanh?.toLowerCase().includes(term) ||
      location.quocGia?.toLowerCase().includes(term)
    );
  }, [locationsData, searchTerm]);

  // Paginate filtered results
  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLocations.slice(startIndex, startIndex + pageSize);
  }, [filteredLocations, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLocations.length / pageSize);

  // Search handler with pagination reset
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage]);

  // Page change
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, totalPages]);

  const resetForm = () => {
    setFormData({});
    setSelectedLocation(null);
  };

  const handleAction = (action: 'add' | 'edit' | 'view' | 'delete', location?: Location) => {
    if (!authService.isAuthenticated() && action !== 'view') {
      alert('Bạn cần đăng nhập để thực hiện thao tác này!');
      return;
    }

    if (action === 'delete') {
      setLocationToDelete(location || null);
      setShowDeleteModal(true);
      return;
    }
    
    setModalType(action);
    setSelectedLocation(location || null);
    if (location) {
      setFormData(location);
    } else {
      setFormData({});
    }
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tenViTri || !formData.tinhThanh || !formData.quocGia) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (modalType === 'add') {
      createMutation.mutate(formData as Omit<Location, 'id'>);
    } else if (modalType === 'edit' && selectedLocation) {
      updateMutation.mutate({ id: selectedLocation.id, data: formData });
    }
  };

  const confirmDelete = () => {
    if (locationToDelete) {
      deleteMutation.mutate(locationToDelete.id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý địa điểm</h1>
          <p className="text-gray-600 mt-1">Quản lý các địa điểm du lịch trong hệ thống</p>
        </div>
        <button
          onClick={() => handleAction('add')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Thêm địa điểm
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên vị trí, tỉnh thành hoặc quốc gia..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Locations Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedLocations.map((location) => (
              <div key={location.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={location.hinhAnh}
                    alt={location.tenViTri}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {location.tenViTri}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-gray-400" />
                      {location.tinhThanh}
                    </div>
                    <div className="flex items-center">
                      <Globe size={16} className="mr-2 text-gray-400" />
                      {location.quocGia}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">ID: {location.id}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAction('view', location)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleAction('edit', location)}
                        className="text-green-600 hover:text-green-800 p-1 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleAction('delete', location)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy địa điểm nào
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách thêm địa điểm đầu tiên'}
          </p>
          <button
            onClick={() => handleAction('add')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Thêm địa điểm mới
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredLocations.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> đến{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, filteredLocations.length)}</span> trong tổng số{' '}
            <span className="font-medium">{filteredLocations.length}</span> kết quả
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
                // Show first, last, current, and adjacent pages
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
                          ? 'bg-blue-600 text-white border border-blue-600'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                // Show ellipsis
                if (page === currentPage - 2 || page === currentPage + 2) {
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && locationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Xác nhận xóa vị trí
                </h3>
                <p className="text-gray-600 mb-4">
                  Bạn có chắc chắn muốn xóa vị trí <strong>"{locationToDelete.tenViTri}"</strong>?
                  <br />Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setLocationToDelete(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={deleteMutation.isPending}
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
          </div>
        </div>
      )}

      {/* Modal */}
      <LocationModal
        showModal={showModal}
        modalType={modalType}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default LocationManagement;
