import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// BC83 pattern - axiosWithAuth
export const axiosWithAuth = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  // BC83 pattern: TokenCybersoft header (chữ T hoa)
  const cyberToken = import.meta.env.VITE_CYBERSOFT_TOKEN;
  if (cyberToken) {
    config.headers["TokenCybersoft"] = cyberToken;
  }

  // Debug logging
  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  console.log('💎 CyberSoft Token:', cyberToken ? `${cyberToken.substring(0, 30)}...` : '❌ MISSING');
  
  if (config.data && config.method !== 'get') {
    console.log('📤 Request data:', config.data);
  }

  return config;
});

// BC83 pattern: axiosWithAuth có thêm Bearer token
axiosWithAuth.interceptors.request.use((config) => {
  // 1. TokenCybersoft header (bắt buộc)
  const cyberToken = import.meta.env.VITE_CYBERSOFT_TOKEN;
  if (cyberToken) {
    config.headers["TokenCybersoft"] = cyberToken;
  }

  // 2. Bearer token từ localStorage (nếu có)
  try {
    const user = localStorage.getItem("user");
    const token = user ? JSON.parse(user)?.accessToken : null;
    if (token) {
      config.headers["token"] = token;
    }
  } catch (error) {
    console.warn('⚠️ Không lấy được Bearer token:', error);
  }

  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  console.log('💎 CyberSoft Token:', cyberToken ? `${cyberToken.substring(0, 30)}...` : '❌ MISSING');
  
  if (config.data && config.method !== 'get') {
    console.log('📤 Request data:', config.data);
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API error:", {
      url: err?.config?.url,
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message,
    });
    return Promise.reject(err);
  }
);

