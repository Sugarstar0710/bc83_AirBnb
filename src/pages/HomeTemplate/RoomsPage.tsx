import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, MapPin, Users, Bed, Star, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { phongServices } from '../../services/room.service';
import { viTriServices } from '../../services/location.service';
import type { Room } from '../../Types/room';
import type { Location } from '../../Types/location';

const RoomsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [guests, setGuests] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 10;

  // Fetch rooms
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await phongServices.getListPhong();
      return response.data.content || [];
    },
  });

  // Fetch locations
  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await viTriServices.getListViTri();
      return response.data.content || [];
    },
  });

  // Filter rooms
  const filteredRooms = useMemo(() => {
    if (!roomsData) return [];
    
    return roomsData.filter((room: Room) => {
      if (selectedLocation && room.maViTri !== Number(selectedLocation)) return false;
      if (room.giaTien < priceRange[0] || room.giaTien > priceRange[1]) return false;
      if (guests && room.khach < Number(guests)) return false;
      return true;
    });
  }, [roomsData, selectedLocation, priceRange, guests]);

  // Paginate rooms
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * roomsPerPage;
    return filteredRooms.slice(startIndex, startIndex + roomsPerPage);
  }, [filteredRooms, currentPage, roomsPerPage]);

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, priceRange, guests]);

  // Scroll to top when page changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const getLocationName = (maViTri: number) => {
    const location = locationsData?.find((loc: Location) => loc.id === maViTri);
    return location ? `${location.tenViTri}, ${location.tinhThanh}` : `Location #${maViTri}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Khám phá phòng</h1>
          <p className="text-gray-600">
            {filteredRooms.length} phòng có sẵn
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-700 font-semibold mb-4 md:hidden"
          >
            <Filter size={20} />
            <span>Bộ lọc</span>
            <ChevronDown size={16} className={showFilters ? 'rotate-180' : ''} />
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Địa điểm
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Tất cả địa điểm</option>
                  {locationsData?.map((location: Location) => (
                    <option key={location.id} value={location.id}>
                      {location.tenViTri}, {location.tinhThanh}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá ($/đêm)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users size={16} className="inline mr-1" />
                  Số khách
                </label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Số khách"
                  min="1"
                />
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedLocation('');
                    setPriceRange([0, 10000]);
                    setGuests('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        {roomsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-56 rounded-lg"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Không tìm thấy phòng phù hợp</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedRooms.map((room: Room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-80 h-64 md:h-auto flex-shrink-0">
                      <img
                        src={room.hinhAnh || 'https://via.placeholder.com/400x300'}
                        alt={room.tenPhong}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        {/* Title & Rating */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {room.tenPhong}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin size={14} className="mr-1" />
                              {getLocationName(room.maViTri)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 bg-rose-50 px-3 py-1 rounded-full">
                            <Star size={16} fill="#f43f5e" className="text-rose-500" />
                            <span className="font-semibold text-rose-500">4.8</span>
                          </div>
                        </div>

                        {/* Room Details */}
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Users size={18} className="mr-2 text-gray-400" />
                            <span className="text-sm">{room.khach} khách</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Bed size={18} className="mr-2 text-gray-400" />
                            <span className="text-sm">{room.phongNgu} phòng ngủ</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Bed size={18} className="mr-2 text-gray-400" />
                            <span className="text-sm">{room.giuong} giường</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="text-sm">{room.phongTam} phòng tắm</span>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {room.mayGiat && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              🧺 Máy giặt
                            </span>
                          )}
                          {room.banLa && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              👔 Bàn là
                            </span>
                          )}
                          {room.tivi && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              📺 Tivi
                            </span>
                          )}
                          {room.dieuHoa && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              ❄️ Điều hòa
                            </span>
                          )}
                          {room.wifi && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              📶 Wifi
                            </span>
                          )}
                          {room.bep && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              🍳 Bếp
                            </span>
                          )}
                          {room.doXe && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              🚗 Đỗ xe
                            </span>
                          )}
                          {room.hoBoi && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              🏊 Hồ bơi
                            </span>
                          )}
                          {room.banUi && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              🪑 Bàn ủi
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-3xl font-bold text-gray-900">
                            ${room.giaTien}
                          </span>
                          <span className="text-gray-600"> /đêm</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/rooms/${room.id}`}
                            className="px-6 py-3 border border-rose-500 text-rose-500 rounded-lg hover:bg-rose-50 transition-colors font-medium"
                          >
                            Xem phòng
                          </Link>
                          <button
                            className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                            onClick={() => {
                              // TODO: Implement booking
                              alert('Chức năng đặt phòng đang được phát triển!');
                            }}
                          >
                            Đặt phòng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Trước
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-rose-500 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;
