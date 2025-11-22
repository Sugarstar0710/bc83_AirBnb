import { api } from "../api/axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
    birthday?: string;
    gender?: boolean;
  };
  token: string;
}

export const authService = {
  // Đăng nhập với API CyberSoft
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<{ statusCode: number; content: any }>('/auth/signin', {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.statusCode === 200) {
        const userData = response.data.content;
        
        const loginResponse: LoginResponse = {
          user: {
            id: userData.user?.id || userData.id,
            name: userData.user?.name || userData.name,
            email: userData.user?.email || userData.email,
            role: userData.user?.role || userData.role || 'USER',
            avatar: userData.user?.avatar || userData.avatar,
            phone: userData.user?.phone || userData.phone || '',
            birthday: userData.user?.birthday || userData.birthday || '',
            gender: userData.user?.gender ?? userData.gender ?? true
          },
          token: userData.token || userData.accessToken
        };
        
        // Lưu thông tin user và token
        localStorage.setItem('user', JSON.stringify({
          ...loginResponse.user,
          accessToken: loginResponse.token
        }));
        localStorage.setItem('isLoggedIn', 'true');
        
        return loginResponse;
      }
      
      throw new Error('Đăng nhập thất bại');
    } catch (error: any) {
      throw new Error(error.response?.data?.content || 'Email hoặc mật khẩu không đúng!');
    }
  },

  // Đăng ký với API CyberSoft
  register: async (userData: { name: string; email: string; password: string; phone?: string; birthday?: string; gender?: boolean }): Promise<any> => {
    try {
      const response = await api.post<{ statusCode: number; content: any }>('/auth/signup', userData);
      
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data.content;
      }
      
      throw new Error('Đăng ký thất bại');
    } catch (error: any) {
      throw new Error(error.response?.data?.content || 'Đăng ký thất bại!');
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  },

  // Kiểm tra đã đăng nhập chưa - chỉ cần user info
  isAuthenticated: (): boolean => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('user');
    return !!(isLoggedIn && user);
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  // Kiểm tra có phải admin không
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'ADMIN';
  },

  // Cập nhật thông tin user từ API
  refreshUserInfo: async (): Promise<any> => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('Chưa đăng nhập');
      }

      const response = await api.get(`/users/${currentUser.id}`);
      const userData = response.data.content || response.data;

      // Cập nhật localStorage với thông tin đầy đủ
      const updatedUser = {
        ...currentUser,
        ...userData,
        accessToken: currentUser.accessToken // Giữ lại token
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error: any) {
      throw error;
    }
  }
};
