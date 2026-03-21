import axios from "axios";

// Create instance
const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for sending HttpOnly cookies
});

// Variable to prevent infinite loops if refresh fails
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor — attach JWT access token if available in memory
api.interceptors.request.use(
  (config) => {
    // We will inject the token through a closure from AuthContext or simply skip it if managed centrally.
    // For React context patterns, it's sometimes better to have the context provide the token.
    // But since `api` is a module, we can expose a setter.
    if (window.memoryToken) {
      config.headers.Authorization = `Bearer ${window.memoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 globally with silent refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If a 401 occurs and it's NOT the auth explicitly failing (like bad password)
    // and we haven't already retried this original request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = "Bearer " + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return api
        .post("/auth/refresh")
        .then(({ data }) => {
          window.memoryToken = data.token; // Note: user's PRD says accessToken, but existing code uses data.token
          processQueue(null, data.token);
          originalRequest.headers["Authorization"] = "Bearer " + data.token;
          return api(originalRequest);
        })
        .catch((err) => {
          processQueue(err, null);
          window.memoryToken = null;
          if (typeof window.triggerLogout === "function") {
            window.triggerLogout();
          }
          return Promise.reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    return Promise.reject(error);
  },
);

export const setToken = (token) => {
  window.memoryToken = token;
};

export default api;
