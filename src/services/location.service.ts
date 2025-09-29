import { api } from "@/api/axios";
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
