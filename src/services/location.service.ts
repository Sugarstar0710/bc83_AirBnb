import { api, axiosWithAuth } from "@/api/axios";
import type { Location, LocationsPaged } from "@/Types/location";

export const LocationService = {
  async listTop(limit = 8) {
    const { data } = await api.get<{ statusCode:number; content: Location[] }>(`/vi-tri`);
    return data.content.slice(0, limit);
  },
  async paged(pageIndex = 1, pageSize = 10, keywords?: string) {
    const qs = new URLSearchParams({
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
      ...(keywords ? { keywords } : {}),
    });
    const { data } = await api.get<{ statusCode:number; content: LocationsPaged }>(
      `/vi-tri/phan-trang-tim-kiem?${qs.toString()}`
    );
    return data.content;
  },
};

// BC83 pattern - viTriServices
export const viTriServices = {
  getListViTri: () => {
    return axiosWithAuth.get<{ statusCode: number; content: Location[] }>("/vi-tri");
  },

  getViTriById: (id: number) => {
    return axiosWithAuth.get<{ statusCode: number; content: Location }>(`/vi-tri/${id}`);
  },

  createViTri: (viTriData: Omit<Location, 'id'>) => {
    const requestData = {
      id: 0,
      tenViTri: viTriData.tenViTri,
      tinhThanh: viTriData.tinhThanh,
      quocGia: viTriData.quocGia,
      hinhAnh: viTriData.hinhAnh || ""
    };
    
    return axiosWithAuth.post<{ statusCode: number; content: Location }>("/vi-tri", requestData);
  },

  updateViTri: (id: number, viTriData: Partial<Location>) => {
    const requestData = {
      id: id,
      ...viTriData
    };
    
    return axiosWithAuth.put<{ statusCode: number; content: Location }>(`/vi-tri/${id}`, requestData);
  },

  deleteViTri: (id: number) => {
    return axiosWithAuth.delete<{ statusCode: number; content: string }>(`/vi-tri/${id}`);
  },

  uploadHinhViTri: (maViTri: number, formData: FormData) => {
    return axiosWithAuth.post<{ statusCode: number; content: Location }>(
      `/vi-tri/upload-hinh-vitri?maViTri=${maViTri}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Tìm kiếm với phân trang
  findViTri: (pageIndex: number, pageSize: number, keyword: string) => {
    return axiosWithAuth.get<{ statusCode: number; content: LocationsPaged }>(
      `/vi-tri/phan-trang-tim-kiem?pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}`
    );
  },
};
