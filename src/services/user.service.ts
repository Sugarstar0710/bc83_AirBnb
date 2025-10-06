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
      // Try different endpoints
      console.log('Trying API call to users with params:', qs.toString());
      
      // Try multiple possible endpoints
      let response;
      try {
        response = await api.get(`/users/phan-trang-tim-kiem?${qs.toString()}`);
        console.log('Success with /users/phan-trang-tim-kiem:', response.data);
      } catch (err1) {
        console.log('Failed /users/phan-trang-tim-kiem, trying /users...');
        try {
          response = await api.get(`/users?${qs.toString()}`);
          console.log('Success with /users:', response.data);
        } catch (err2) {
          console.log('Failed /users, trying /nguoi-dung...');
          response = await api.get(`/nguoi-dung?${qs.toString()}`);
          console.log('Success with /nguoi-dung:', response.data);
        }
      }
      
      return response.data.content || response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.content;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Tạo người dùng mới
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    try {
      const response = await api.post("/users", userData);
      return response.data.content;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (userData: UpdateUserRequest): Promise<User> => {
    try {
      const response = await api.put(`/users/${userData.id}`, userData);
      return response.data.content;
    } catch (error) {
      console.error("Error updating user:", error);
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
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Upload avatar cho người dùng
  uploadAvatar: async (file: File): Promise<User> => {
    try {
      console.log('Uploading file:', file.name, file.type, file.size);
      
      // Check if user is authenticated
      const userToken = localStorage.getItem("access_token");
      console.log('User token exists:', !!userToken);
      
      const formData = new FormData();
      formData.append("formFile", file);
      
      // Log FormData contents
      console.log('FormData prepared, contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      console.log('Making API call to upload avatar...');
      
      // Thử các endpoint có thể:
      // 1. /users/upload-avatar
      // 2. /upload-avatar  
      // 3. /users/avatar
      const response = await api.post("/users/upload-avatar", formData);
      
      console.log('Upload response:', response.data);
      return response.data.content;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      console.error("Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      throw error?.response?.data?.message || error?.message || 'Upload failed';
    }
  }
};
