import { api } from "@/api/axios";
import type { Room, RoomsPaged } from "@/Types/room";

export const RoomService = {
  async paged(pageIndex = 1, pageSize = 12, keywords?: string) {
    const qs = new URLSearchParams({
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
      ...(keywords ? { keywords } : {}),
    });
    const { data } = await api.get<{ statusCode:number; content: RoomsPaged }>(
      `/phong-thue/phan-trang-tim-kiem?${qs.toString()}`
    );
    return data.content;
  },

  async byLocation(maViTri: number) {
    const { data } = await api.get<{ statusCode:number; content: Room[] }>(
      `/phong-thue/lay-phong-theo-vi-tri?maViTri=${maViTri}`
    );
    return data.content;
  },
};
