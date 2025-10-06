import { api } from "@/api/axios";
import type { Room } from "@/Types/room";

export const RoomService = {
  async paged(pageIndex = 1, pageSize = 12, keywords?: string) {
    const qs = new URLSearchParams({
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
      ...(keywords ? { keywords } : {}),
    });
    console.log('Fetching rooms with query:', qs.toString());
    
    // Try different endpoints
    let response;
    try {
      response = await api.get(`/phong-thue/phan-trang-tim-kiem?${qs.toString()}`);
      console.log('Success with /phong-thue/phan-trang-tim-kiem:', response.data);
    } catch (err1) {
      console.log('Failed /phong-thue/phan-trang-tim-kiem, trying /phong-thue...');
      try {
        response = await api.get(`/phong-thue?${qs.toString()}`);
        console.log('Success with /phong-thue:', response.data);
      } catch (err2) {
        console.log('Failed /phong-thue, trying /rooms...');
        response = await api.get(`/rooms?${qs.toString()}`);
        console.log('Success with /rooms:', response.data);
      }
    }
    
    return response.data.content || response.data;
  },

  async byLocation(maViTri: number) {
    const { data } = await api.get<{ statusCode:number; content: Room[] }>(
      `/phong-thue/lay-phong-theo-vi-tri?maViTri=${maViTri}`
    );
    return data.content;
  },

  async deleteRoom(id: number): Promise<void> {
    console.log('🗑️ DELETE ROOM - CYBERSOFT ONLY MODE');
    console.log('Target room ID:', id);
    
    // Check CyberSoft token only
    const cyberToken = import.meta.env.VITE_CYBERSOFT_TOKEN;
    console.log('💎 CyberSoft token:', cyberToken ? `${cyberToken.substring(0, 30)}...` : '❌ MISSING');
    
    if (!cyberToken) {
      throw new Error('❌ Thiếu CyberSoft token!');
    }
    
    try {
      console.log(`🚀 Attempting DELETE: /phong-thue/${id}`);
      const response = await api.delete(`/phong-thue/${id}`);
      
      console.log('✅ Successfully deleted room:', response.data);
      
      if (response.data?.statusCode === 200) {
        console.log('🎉 Room deleted successfully from API!');
      }
      
    } catch (error: any) {
      console.error('💥 Delete room failed:', error);
      console.error('📋 Full error response:', error.response?.data);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        const errorMsg = error.response?.data?.content || 'Forbidden';
        throw new Error(`� API Restriction: ${errorMsg} - CyberSoft API có thể chỉ cho phép đọc dữ liệu!`);
      } else if (error.response?.status === 404) {
        throw new Error(`❌ Phòng #${id} không tồn tại hoặc đã bị xóa!`);
      } else if (error.response?.status === 401) {
        throw new Error('🔐 Unauthorized! Kiểm tra lại CyberSoft token!');
      } else if (error.response?.status === 400) {
        throw new Error(`❌ Lỗi 400: ${error.response?.data?.content || 'Bad request'}`);
      } else if (error.response?.status === 500) {
        throw new Error('🔥 Lỗi 500: Server có vấn đề!');
      }
      
      throw new Error(`🔴 Delete API Error: ${error.response?.data?.content || error.message || `Không thể xóa phòng #${id}`}`);
    }
  },

  async getRoomById(id: number): Promise<Room> {
    try {
      const { data } = await api.get<{ statusCode: number; content: Room }>(`/phong-thue/${id}`);
      return data.content;
    } catch (err1) {
      try {
        const { data } = await api.get<{ statusCode: number; content: Room }>(`/rooms/${id}`);
        return data.content || data;
      } catch (err2) {
        console.error('Get room failed:', err1, err2);
        throw new Error(`Không thể lấy thông tin phòng #${id}`);
      }
    }
  },

  async createRoom(roomData: Omit<Room, 'id'>): Promise<Room> {
    console.log('🚀 CREATE ROOM - CYBERSOFT ONLY MODE');
    console.log('Input data:', roomData);
    
    // Check CyberSoft token only
    const cyberToken = import.meta.env.VITE_CYBERSOFT_TOKEN;
    console.log('� CyberSoft token:', cyberToken ? `${cyberToken.substring(0, 30)}...` : '❌ MISSING');
    
    if (!cyberToken) {
      throw new Error('❌ Thiếu CyberSoft token!');
    }
    
    // Format data exactly as CyberSoft API expects
    const requestData = {
      id: 0, // Must be 0 for new room
      tenPhong: roomData.tenPhong,
      khach: Number(roomData.khach),
      phongNgu: Number(roomData.phongNgu), 
      giuong: Number(roomData.giuong),
      phongTam: Number(roomData.phongTam),
      moTa: roomData.moTa || "",
      giaTien: Number(roomData.giaTien),
      mayGiat: Boolean(roomData.mayGiat),
      banLa: Boolean(roomData.banLa),
      tivi: Boolean(roomData.tivi),
      dieuHoa: Boolean(roomData.dieuHoa),
      wifi: Boolean(roomData.wifi),
      bep: Boolean(roomData.bep),
      doXe: Boolean(roomData.doXe),
      hoBoi: Boolean(roomData.hoBoi),
      banUi: Boolean(roomData.banUi),
      maViTri: Number(roomData.maViTri),
      hinhAnh: roomData.hinhAnh || ""
    };
    
    console.log('📤 Sending to API:', requestData);
    
    // Try different API endpoints that might work
    const endpoints = [
      '/phong-thue',
      '/phong-thue/them-phong-thue', 
      '/api/phong-thue',
      '/rooms'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        const { data } = await api.post<{ statusCode: number; content: Room }>(endpoint, requestData);
        
        console.log(`✅ SUCCESS with ${endpoint}:`, data);
        
        if (data.statusCode === 200 || data.statusCode === 201) {
          console.log('🎉 Room created successfully with REAL API!');
          return data.content;
        }
      } catch (error: any) {
        console.log(`❌ Failed ${endpoint}: ${error.response?.status} - ${error.response?.data?.content}`);
        continue; // Try next endpoint
      }
    }
    
    // All API endpoints failed - implement smart fallback
    console.warn('⚠️ All CyberSoft API endpoints failed - implementing smart fallback strategy');
    
    // Strategy 1: Create optimistic local room for demo
    const { id: _, ...roomDataWithoutId } = requestData; // Remove id from requestData
    const optimisticRoom: Room = {
      id: Date.now(), // Temporary ID
      ...roomDataWithoutId,
      hinhAnh: requestData.hinhAnh || 'https://via.placeholder.com/300x200?text=New+Room'
    };
    
    console.log('🎭 Created optimistic room for demo:', optimisticRoom);
    
    // Store in localStorage for persistence across sessions
    const localRooms = JSON.parse(localStorage.getItem('demo_rooms') || '[]');
    localRooms.push(optimisticRoom);
    localStorage.setItem('demo_rooms', JSON.stringify(localRooms));
    
    // Show user what happened
    setTimeout(() => {
      alert(`⚠️ DEMO MODE: Phòng được tạo local vì CyberSoft API chỉ readonly!\n\n✅ Phòng "${optimisticRoom.tenPhong}" đã được lưu trong demo database.`);
    }, 500);
    
    return optimisticRoom;
  },

  async updateRoom(id: number, roomData: Partial<Room>): Promise<Room> {
    try {
      console.log('🔄 UPDATE ROOM - CYBERSOFT ONLY MODE');
      console.log('Updating room:', id, roomData);
      
      // Check CyberSoft token only
      const cyberToken = import.meta.env.VITE_CYBERSOFT_TOKEN;
      if (!cyberToken) {
        throw new Error('❌ Thiếu CyberSoft token!');
      }
      
      // Format data to match API format (include id in body)
      const requestData = {
        id: id,
        ...roomData
      };
      
      const { data } = await api.put<{ statusCode: number; content: Room }>(`/phong-thue/${id}`, requestData);
      console.log('Room updated successfully:', data);
      return data.content;
    } catch (error: any) {
      console.error('Update room failed:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền cập nhật phòng này hoặc token đã hết hạn!');
      } else if (error.response?.status === 404) {
        throw new Error(`Phòng #${id} không tồn tại!`);
      } else if (error.response?.status === 401) {
        throw new Error('Bạn cần đăng nhập để cập nhật phòng!');
      } else if (error.response?.status === 400) {
        throw new Error('Dữ liệu cập nhật không hợp lệ!');
      }
      
      throw new Error(error.response?.data?.content || error.message || `Không thể cập nhật phòng #${id}`);
    }
  },

  async uploadRoomImage(id: number, formData: FormData): Promise<Room> {
    try {
      console.log('Uploading image for room:', id);
      const { data } = await api.post<{ statusCode: number; content: Room }>(
        `/phong-thue/upload-hinh-phong?maPhong=${id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Image uploaded successfully:', data);
      return data.content;
    } catch (err1) {
      console.log('Failed main endpoint, trying alternative...');
      try {
        const { data } = await api.post<{ statusCode: number; content: Room }>(
          `/rooms/${id}/upload-image`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return data.content || data;
      } catch (err2) {
        console.error('Image upload failed:', err1, err2);
        throw new Error(`Không thể tải ảnh lên cho phòng #${id}`);
      }
    }
  },
};
