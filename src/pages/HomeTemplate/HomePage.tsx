import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Star, ChevronRight } from 'lucide-react';
import { viTriServices } from '../../services/location.service';
import { phongServices } from '../../services/room.service';
import { authService } from '../../services/auth.service';
import type { Location } from '../../Types/location';
import type { Room } from '../../Types/room';

const HomePage: React.FC = () => {
  const user = authService.getCurrentUser();

  // Fetch locations
  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await viTriServices.getListViTri();
      return response.data.content || [];
    },
  });

  // Fetch rooms
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms-home'],
    queryFn: async () => {
      const response = await phongServices.getListPhong();
      return response.data.content || [];
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-r from-rose-500 to-pink-500">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Tìm chỗ ở hoàn hảo
          </h1>
          <p className="text-xl text-white mb-8">
            Khám phá những trải nghiệm độc đáo tại hơn 1000+ địa điểm trên toàn cầu
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-4xl bg-white rounded-full shadow-2xl p-2 flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Địa điểm"
              className="flex-1 px-6 py-3 rounded-full focus:outline-none"
            />
            <input
              type="date"
              className="flex-1 px-6 py-3 rounded-full focus:outline-none"
            />
            <button className="px-8 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors font-semibold">
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Địa điểm phổ biến</h2>
            <p className="text-gray-600 mt-2">Khám phá những điểm đến được yêu thích</p>
          </div>
          <Link
            to="/locations"
            className="flex items-center text-rose-500 hover:text-rose-600 font-semibold"
          >
            Xem tất cả
            <ChevronRight size={20} className="ml-1" />
          </Link>
        </div>

        {locationsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {locationsData?.slice(0, 8).map((location: Location) => (
              <Link
                key={location.id}
                to={`/rooms?location=${location.id}`}
                className="group cursor-pointer"
              >
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <img
                    src={location.hinhAnh || 'https://via.placeholder.com/400x300'}
                    alt={location.tenViTri}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span className="font-semibold">{location.tenViTri}</span>
                    </div>
                    <p className="text-sm opacity-90">{location.tinhThanh}, {location.quocGia}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Rooms */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Phòng nổi bật</h2>
            <p className="text-gray-600 mt-2">Những lựa chọn tuyệt vời cho kỳ nghỉ của bạn</p>
          </div>
          <Link
            to="/rooms"
            className="flex items-center text-rose-500 hover:text-rose-600 font-semibold"
          >
            Xem tất cả
            <ChevronRight size={20} className="ml-1" />
          </Link>
        </div>

        {roomsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-56 rounded-lg"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {roomsData?.slice(0, 8).map((room: Room) => (
              <Link
                key={room.id}
                to={`/rooms/${room.id}`}
                className="group"
              >
                <div className="relative h-56 rounded-lg overflow-hidden mb-3">
                  <img
                    src={room.hinhAnh || 'https://via.placeholder.com/400x300'}
                    alt={room.tenPhong}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-rose-500 transition-colors truncate">
                  {room.tenPhong}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {room.khach} khách · {room.phongNgu} phòng ngủ
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-gray-900">
                    ${room.giaTien}
                    <span className="text-sm font-normal text-gray-600">/đêm</span>
                  </span>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm">4.8</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section - Only show if not logged in */}
      {!user && (
        <section className="bg-rose-50 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sẵn sàng khám phá?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Đăng ký ngay để nhận được những ưu đãi độc quyền
            </p>
            <Link
              to="/login"
              className="inline-block px-8 py-4 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors font-semibold text-lg"
            >
              Bắt đầu ngay
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
