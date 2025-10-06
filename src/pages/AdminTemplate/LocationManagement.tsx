import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, MapPin, Globe } from 'lucide-react';
import type { Location } from '../../Types/location';

const LocationManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Mock data
  const mockLocations: Location[] = [
    {
      id: 1,
      tenViTri: 'Quận 1',
      tinhThanh: 'Hồ Chí Minh',
      quocGia: 'Việt Nam',
      hinhAnh: 'https://via.placeholder.com/300'
    },
    {
      id: 2,
      tenViTri: 'Ba Đình',
      tinhThanh: 'Hà Nội',
      quocGia: 'Việt Nam',
      hinhAnh: 'https://via.placeholder.com/300'
    },
    {
      id: 3,
      tenViTri: 'Hải Châu',
      tinhThanh: 'Đà Nẵng',
      quocGia: 'Việt Nam',
      hinhAnh: 'https://via.placeholder.com/300'
    }
  ];

  const filteredLocations = mockLocations.filter(location =>
    location.tenViTri.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.tinhThanh.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.quocGia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (action: 'add' | 'edit' | 'view' | 'delete', location?: Location) => {
    if (action === 'delete') {
      if (confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
        console.log('Delete location:', location?.id);
      }
      return;
    }
    
    setModalType(action);
    setSelectedLocation(location || null);
    setShowModal(true);
  };

  const LocationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {modalType === 'add' && 'Thêm địa điểm mới'}
          {modalType === 'edit' && 'Chỉnh sửa địa điểm'}
          {modalType === 'view' && 'Thông tin địa điểm'}
        </h3>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên vị trí
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue={selectedLocation?.tenViTri || ''}
              disabled={modalType === 'view'}
              placeholder="Ví dụ: Quận 1, Ba Đình..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tỉnh thành
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue={selectedLocation?.tinhThanh || ''}
              disabled={modalType === 'view'}
              placeholder="Ví dụ: Hồ Chí Minh, Hà Nội..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quốc gia
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue={selectedLocation?.quocGia || ''}
              disabled={modalType === 'view'}
              placeholder="Ví dụ: Việt Nam"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh URL
            </label>
            <input
              type="url"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue={selectedLocation?.hinhAnh || ''}
              disabled={modalType === 'view'}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </form>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Hủy
          </button>
          {modalType !== 'view' && (
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {modalType === 'add' ? 'Thêm' : 'Cập nhật'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Locations Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredLocations.length}</span> trong tổng số <span className="font-medium">{filteredLocations.length}</span> kết quả
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              Trước
            </button>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white border border-blue-600 rounded-lg">
              1
            </button>
            <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && <LocationModal />}
    </div>
  );
};

export default LocationManagement;
