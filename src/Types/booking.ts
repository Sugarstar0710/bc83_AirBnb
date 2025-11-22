export type Booking = {
  id: number;
  maPhong: number;
  ngayDen: string;
  ngayDi: string;
  soLuongKhach: number;
  maNguoiDung: number;
};

// Extended booking with user and room info for display
export type BookingWithDetails = Booking & {
  tenNguoiDung?: string;
  tenPhong?: string;
};

export type BookingsPaged = {
  pageIndex: number;
  pageSize: number;
  totalRow: number;
  keywords: string | null;
  data: Booking[];
};
