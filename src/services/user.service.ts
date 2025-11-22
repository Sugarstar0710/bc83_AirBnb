import { api } from "../api/axios";
import type { User, UsersPaged, CreateUserRequest, UpdateUserRequest } from "../Types/user";

export const userService = {
  // Lấy danh sách người dùng với phân trang
  getUsers: async (pageIndex = 1, pageSize = 10, keyword = ""): Promise<UsersPaged> => {
    try {
      const qs = new URLSearchParams({
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
        ...(keyword ? { keyword } : {}),
      });
      
      // Thử nhiều endpoint khác nhau
      let response;
      try {
        response = await api.get(`/users/phan-trang-tim-kiem?${qs.toString()}`);
      } catch (err1) {
        try {
          response = await api.get(`/users?${qs.toString()}`);
        } catch (err2) {
          response = await api.get(`/nguoi-dung?${qs.toString()}`);
        }
      }
      
      return response.data.content || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.content;
    } catch (error) {
      throw error;
    }
  },

  // Tạo người dùng mới
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    try {
      const response = await api.post("/users", userData);
      return response.data.content;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (userData: UpdateUserRequest): Promise<User> => {
    try {
      const response = await api.put(`/users/${userData.id}`, userData);
      return response.data.content;
    } catch (error) {
      throw error;
    }
  },

  // Xóa người dùng
  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users`, {
        params: { id }
      });
    } catch (error) {
      throw error;
    }
  },

  // Upload avatar cho người dùng
  uploadAvatar: async (file: File): Promise<User> => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.accessToken) {
        throw new Error('Không tìm thấy người dùng hoặc token. Vui lòng đăng nhập lại.');
      }
      
      const formData = new FormData();
      formData.append("formFile", file);
      
      const response = await api.post("/users/upload-avatar", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'token': user.accessToken
        }
      });
      
      const result = response.data.content || response.data;
      return result;
    } catch (error: any) {
      let errorMessage = 'Upload thất bại';
      if (error?.response?.data?.content) {
        errorMessage = error.response.data.content;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      throw errorMessage;
    }
  }
};
