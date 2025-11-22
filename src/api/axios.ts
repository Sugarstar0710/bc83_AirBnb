import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Axios instance có xác thực
export const axiosWithAuth = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Interceptor cho api - thêm TokenCybersoft và token user
api.interceptors.request.use((config) => {
  const cyberToken = import.meta.env.VITE_CYBERSOFT_TOKEN;
  if (cyberToken) {
    config.headers["TokenCybersoft"] = cyberToken;
  }

  // Thêm token user nếu có
  try {
    const user = localStorage.getItem("user");
    const token = user ? JSON.parse(user)?.accessToken : null;
    if (token) {
      config.headers["token"] = token;
    }
  } catch (error) {
    // Bỏ qua lỗi parse
  }

  return config;
});

// Interceptor cho axiosWithAuth - thêm cả TokenCybersoft và Bearer token
axiosWithAuth.interceptors.request.use((config) => {
  const cyberToken = import.meta.env.VITE_CYBERSOFT_TOKEN;
  if (cyberToken) {
    config.headers["TokenCybersoft"] = cyberToken;
  }

  // Thêm Bearer token từ localStorage
  try {
    const user = localStorage.getItem("user");
    const token = user ? JSON.parse(user)?.accessToken : null;
    if (token) {
      config.headers["token"] = token;
    }
  } catch (error) {
    // Bỏ qua lỗi parse
  }

  return config;
});

// Interceptor xử lý lỗi response
api.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err);
  }
);

