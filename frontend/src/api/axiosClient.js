import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to attach bearer token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tripnest_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Concurrency queue state to prevent race conditions during token rotation
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

// Response interceptor with auto-refresh queue
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh for login, register, or refresh-token endpoints
    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh-token") ||
      originalRequest?.url?.includes("/auth/verify-email");

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest?._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        // Queue concurrent requests while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = localStorage.getItem("tripnest_refresh_token");

      if (!currentRefreshToken) {
        isRefreshing = false;
        processQueue(new Error("No refresh token available"), null);
        localStorage.removeItem("tripnest_token");
        localStorage.removeItem("tripnest_refresh_token");
        localStorage.removeItem("tripnest_user");
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: currentRefreshToken },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const newAccessToken = res.data?.data?.accessToken;
        const newRefreshToken = res.data?.data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem("tripnest_token", newAccessToken);

          // Crucial: Update rotated refresh token in localStorage
          if (newRefreshToken) {
            localStorage.setItem("tripnest_refresh_token", newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          return axiosClient(originalRequest);
        } else {
          throw new Error("No access token returned from refresh");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("tripnest_token");
        localStorage.removeItem("tripnest_refresh_token");
        localStorage.removeItem("tripnest_user");

        // Only redirect if current path is a protected page
        const path = window.location.pathname;
        if (
          path.startsWith("/checkout") ||
          path.startsWith("/payment") ||
          path.startsWith("/profile") ||
          path.startsWith("/bookings")
        ) {
          window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    let errorMessage = "An unexpected error occurred";

    if (error.response && error.response.data) {
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(errorMessage);
  }
);

export default axiosClient;
