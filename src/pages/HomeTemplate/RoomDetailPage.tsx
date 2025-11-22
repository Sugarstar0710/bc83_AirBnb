import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Users, Bed, Star, Wifi, Car, Tv, Wind } from 'lucide-react';
import { phongServices } from '../../services/room.service';
import { viTriServices } from '../../services/location.service';
import type { Room } from '../../Types/room';
import type { Location } from '../../Types/location';

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch room details
  const { data: room, isLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const response = await phongServices.getPhongById(Number(id));
      return response.data.content as Room;
    },
    enabled: !!id,
  });

  // Fetch location
  const { data: location } = useQuery({
    queryKey: ['location', room?.maViTri],
    queryFn: async () => {
      const response = await viTriServices.getViTriById(room!.maViTri);
      return response.data.content as Location;
    },
    enabled: !!room?.maViTri,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy phòng</h2>
          <Link to="/rooms" className="text-rose-500 hover:text-rose-600">
            Quay lại danh sách phòng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Quay lại</span>
        </button>

        {/* Room Image */}
        <div className="mb-8">
          <img
            src={room.hinhAnh || 'https://via.placeholder.com/1200x600'}
            alt={room.tenPhong}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x600?text=No+Image';
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Room Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Location */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.tenPhong}</h1>
              <div className="flex items-center text-gray-600">
                <MapPin size={18} className="mr-2" />
                <span>
                  {location ? `${location.tenViTri}, ${location.tinhThanh}, ${location.quocGia}` : 'Đang tải vị trí...'}
                </span>
              </div>
            </div>

            {/* Room Stats */}
            <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                <Users size={20} className="mr-2 text-gray-400" />
                <span className="text-gray-700">{room.khach} khách</span>
              </div>
              <div className="flex items-center">
                <Bed size={20} className="mr-2 text-gray-400" />
                <span className="text-gray-700">{room.phongNgu} phòng ngủ</span>
              </div>
              <div className="flex items-center">
                <Bed size={20} className="mr-2 text-gray-400" />
                <span className="text-gray-700">{room.giuong} giường</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-gray-700">{room.phongTam} phòng tắm</span>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Mô tả</h2>
              <p className="text-gray-600 leading-relaxed">
                {room.moTa || 'Phòng nghỉ thoải mái với đầy đủ tiện nghi, phù hợp cho kỳ nghỉ của bạn.'}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tiện nghi</h2>
              <div className="flex flex-wrap gap-2">
                {room.wifi && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <Wifi size={16} className="mr-1.5 text-gray-600" />
                    <span className="text-gray-700 text-sm">Wifi</span>
                  </div>
                )}
                {room.dieuHoa && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <Wind size={16} className="mr-1.5 text-gray-600" />
                    <span className="text-gray-700 text-sm">Điều hòa</span>
                  </div>
                )}
                {room.tivi && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <Tv size={16} className="mr-1.5 text-gray-600" />
                    <span className="text-gray-700 text-sm">Tivi</span>
                  </div>
                )}
                {room.doXe && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <Car size={16} className="mr-1.5 text-gray-600" />
                    <span className="text-gray-700 text-sm">Đỗ xe</span>
                  </div>
                )}
                {room.mayGiat && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <span className="mr-1.5 text-base">🧺</span>
                    <span className="text-gray-700 text-sm">Máy giặt</span>
                  </div>
                )}
                {room.banLa && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <span className="mr-1.5 text-base">👔</span>
                    <span className="text-gray-700 text-sm">Bàn là</span>
                  </div>
                )}
                {room.bep && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <span className="mr-1.5 text-base">🍳</span>
                    <span className="text-gray-700 text-sm">Bếp</span>
                  </div>
                )}
                {room.hoBoi && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <span className="mr-1.5 text-base">🏊</span>
                    <span className="text-gray-700 text-sm">Hồ bơi</span>
                  </div>
                )}
                {room.banUi && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <span className="mr-1.5 text-base">🪑</span>
                    <span className="text-gray-700 text-sm">Bàn ủi</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">
                      ${room.giaTien}
                    </span>
                    <span className="text-gray-600"> /đêm</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-rose-50 px-3 py-1 rounded-full">
                    <Star size={16} fill="#f43f5e" className="text-rose-500" />
                    <span className="font-semibold text-rose-500">4.8</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày nhận phòng
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày trả phòng
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số khách
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                    {Array.from({ length: room.khach }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} khách
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  alert('Chức năng đặt phòng đang được phát triển!');
                }}
                className="w-full py-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-semibold text-lg"
              >
                Đặt phòng
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Bạn sẽ không bị tính phí ngay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
