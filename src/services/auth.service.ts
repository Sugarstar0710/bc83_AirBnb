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
  // Đăng nhập giả lập - chỉ cần CyberSoft token
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('🔐 MOCK LOGIN - CyberSoft Only Mode');
    console.log('Input credentials:', credentials);
    
    // Kiểm tra CyberSoft token
    const cyberToken = import.meta.env.VITE_CYBERSOFT_TOKEN;
    if (!cyberToken) {
      throw new Error('❌ Thiếu CyberSoft Token!');
    }
    
    // Giả lập đăng nhập thành công với bất kỳ email/password nào
    const mockUser = {
      id: 99999,
      name: 'Admin User',
      email: credentials.email,
      role: 'ADMIN',
      avatar: 'https://via.placeholder.com/150'
    };
    
    const mockResponse = {
      user: mockUser,
      token: 'mock-token-cybersoft-only'
    };
    
    // Lưu thông tin user (không cần lưu token vì chỉ dùng CyberSoft token)
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isLoggedIn', 'true');
    
    console.log('✅ Mock login successful:', mockResponse);
    return mockResponse;
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
