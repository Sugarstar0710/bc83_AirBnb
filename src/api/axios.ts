import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  // Chỉ dùng tokenCybersoft duy nhất
  const cyberToken = import.meta.env.VITE_CYBERSOFT_TOKEN;
  if (cyberToken) {
    config.headers["tokenCybersoft"] = cyberToken;
  }

  // Debug logging
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

