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
  };
  token: string;
}

export const authService = {
  // BC83 pattern: Login thật với CyberSoft API
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('🔐 Login with CyberSoft API...');
    
    try {
      const response = await api.post<{ statusCode: number; content: any }>('/auth/signin', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('✅ Login response:', response.data);
      
      if (response.data.statusCode === 200) {
        const userData = response.data.content;
        
        const loginResponse: LoginResponse = {
          user: {
            id: userData.user?.id || userData.id,
            name: userData.user?.name || userData.name,
            email: userData.user?.email || userData.email,
            role: userData.user?.role || userData.role || 'USER',
            avatar: userData.user?.avatar || userData.avatar
          },
          token: userData.token || userData.accessToken
        };
        
        // Lưu user info và token
        localStorage.setItem('user', JSON.stringify({
          ...loginResponse.user,
          accessToken: loginResponse.token
        }));
        localStorage.setItem('isLoggedIn', 'true');
        
        console.log('✅ Login successful!');
        return loginResponse;
      }
      
      throw new Error('Login failed');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.response?.data?.content || 'Email hoặc mật khẩu không đúng!');
    }
  },

  // BC83 pattern: Register với CyberSoft API
  register: async (userData: { name: string; email: string; password: string; phone?: string; birthday?: string; gender?: boolean }): Promise<any> => {
    console.log('📝 Register with CyberSoft API...');
    
    try {
      const response = await api.post<{ statusCode: number; content: any }>('/auth/signup', userData);
      
      console.log('✅ Register response:', response.data);
      
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data.content;
      }
      
      throw new Error('Register failed');
    } catch (error: any) {
      console.error('❌ Register error:', error);
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
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  // Kiểm tra có phải admin không
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'ADMIN';
  }
};
