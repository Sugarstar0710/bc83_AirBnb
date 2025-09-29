export type Location = {
  id: number;
  tenViTri: string;
  tinhThanh: string;
  quocGia: string;
  hinhAnh: string;
};

export type LocationsPaged = {
  pageIndex: number;
  pageSize: number;
  totalRow: number;
  keywords: string | null;
  data: Location[];
};
