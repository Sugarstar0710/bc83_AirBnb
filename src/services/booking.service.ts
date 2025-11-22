import { axiosWithAuth } from '../api/axios';
import type { Booking } from '../Types/booking';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  content: T;
}

export const bookingService = {
  // Get all bookings
  getAllBookings: async () => {
    const response = await axiosWithAuth.get<ApiResponse<Booking[]>>('/dat-phong');
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id: number) => {
    const response = await axiosWithAuth.get<ApiResponse<Booking>>(`/dat-phong/${id}`);
    return response.data;
  },

  // Get bookings by user ID
  getBookingsByUser: async (userId: number) => {
    const response = await axiosWithAuth.get<ApiResponse<Booking[]>>(`/dat-phong/lay-theo-nguoi-dung/${userId}`);
    return response.data;
  },

  // Create new booking
  createBooking: async (booking: Omit<Booking, 'id'>) => {
    const response = await axiosWithAuth.post<ApiResponse<Booking>>('/dat-phong', booking);
    return response.data;
  },

  // Update booking
  updateBooking: async (id: number, booking: Partial<Booking>) => {
    const response = await axiosWithAuth.put<ApiResponse<Booking>>(`/dat-phong/${id}`, booking);
    return response.data;
  },

  // Delete booking
  deleteBooking: async (id: number) => {
    const response = await axiosWithAuth.delete<ApiResponse<null>>(`/dat-phong/${id}`);
    return response.data;
  },
};
