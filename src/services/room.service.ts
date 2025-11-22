import { axiosWithAuth } from "../api/axios";
import type { Room } from "../Types/room";

// BC83 pattern - Simple and clean
export const phongServices = {
  getListPhong: () => {
    return axiosWithAuth.get<{ statusCode: number; content: Room[] }>("/phong-thue");
  },
  
  createPhong: (phongData: Omit<Room, 'id'>) => {
    const requestData = {
      id: 0, // Must be 0 for new room
      tenPhong: phongData.tenPhong,
      khach: Number(phongData.khach),
      phongNgu: Number(phongData.phongNgu), 
      giuong: Number(phongData.giuong),
      phongTam: Number(phongData.phongTam),
      moTa: phongData.moTa || "",
      giaTien: Number(phongData.giaTien),
      mayGiat: Boolean(phongData.mayGiat),
      banLa: Boolean(phongData.banLa),
      tivi: Boolean(phongData.tivi),
      dieuHoa: Boolean(phongData.dieuHoa),
      wifi: Boolean(phongData.wifi),
      bep: Boolean(phongData.bep),
      doXe: Boolean(phongData.doXe),
      hoBoi: Boolean(phongData.hoBoi),
      banUi: Boolean(phongData.banUi),
      maViTri: Number(phongData.maViTri),
      hinhAnh: phongData.hinhAnh || ""
    };
    
    return axiosWithAuth.post<{ statusCode: number; content: Room }>("/phong-thue", requestData);
  },
  
  updatePhong: (id: number, phongData: Partial<Room>) => {
    // Đảm bảo gửi đầy đủ các field bắt buộc
    const requestData = {
      id: id,
      tenPhong: phongData.tenPhong,
      khach: Number(phongData.khach),
      phongNgu: Number(phongData.phongNgu), 
      giuong: Number(phongData.giuong),
      phongTam: Number(phongData.phongTam),
      moTa: phongData.moTa || "",
      giaTien: Number(phongData.giaTien),
      mayGiat: Boolean(phongData.mayGiat),
      banLa: Boolean(phongData.banLa),
      tivi: Boolean(phongData.tivi),
      dieuHoa: Boolean(phongData.dieuHoa),
      wifi: Boolean(phongData.wifi),
      bep: Boolean(phongData.bep),
      doXe: Boolean(phongData.doXe),
      hoBoi: Boolean(phongData.hoBoi),
      banUi: Boolean(phongData.banUi),
      maViTri: Number(phongData.maViTri),
      hinhAnh: phongData.hinhAnh || ""
    };
    
    return axiosWithAuth.put<{ statusCode: number; content: Room }>(`/phong-thue/${id}`, requestData);
  },
  
  deletePhong: (id: number) => {
    return axiosWithAuth.delete<{ statusCode: number; content: string }>(`/phong-thue/${id}`);
  },

  // Additional helper methods
  getPhongById: (id: number) => {
    return axiosWithAuth.get<{ statusCode: number; content: Room }>(`/phong-thue/${id}`);
  },

  uploadHinhPhong: (maPhong: number, formData: FormData) => {
    return axiosWithAuth.post<{ statusCode: number; content: Room }>(
      `/phong-thue/upload-hinh-phong?maPhong=${maPhong}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Legacy methods for compatibility
  byLocation: async (maViTri: number) => {
    const response = await axiosWithAuth.get<{ statusCode: number; content: Room[] }>(
      `/phong-thue/lay-phong-theo-vi-tri?maViTri=${maViTri}`
    );
    return response.data.content;
  },

  paged: async (pageIndex = 1, pageSize = 12, keywords?: string) => {
    const qs = new URLSearchParams({
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
      ...(keywords ? { keyword: keywords } : {}),
    });
    
    const response = await axiosWithAuth.get<{ statusCode: number; content: { data: Room[]; totalRow: number } }>(
      `/phong-thue/phan-trang-tim-kiem?${qs.toString()}`
    );
    
    return {
      data: response.data.content.data,
      pageIndex,
      pageSize,
      totalRow: response.data.content.totalRow
    };
  },
};

// Export alias for backward compatibility
export const RoomService = phongServices;
