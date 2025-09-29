import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  // tokenCybersoft (bắt buộc)
  const cyberToken = import.meta.env.VITE_CYBERSOFT_TOKEN;
  if (cyberToken) {
    config.headers["tokenCybersoft"] = cyberToken; // đúng key
  }

  // token user (nếu login)
  const userToken = localStorage.getItem("access_token");
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
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

