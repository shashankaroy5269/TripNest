import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const axiosAdmin = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosAdmin.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tripnest_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

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

axiosAdmin.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh for auth endpoints
    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register-admin") ||
      originalRequest?.url?.includes("/auth/refresh-token");

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest?._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosAdmin(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("tripnest_admin_refresh_token")
          : null;

      try {
        const res = await axios.post(
          `${API_BASE}/auth/refresh-token`,
          { refreshToken: currentRefreshToken || undefined },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const newAccessToken =
          res.data?.data?.accessToken || res.data?.accessToken;
        const newRefreshToken =
          res.data?.data?.refreshToken || res.data?.refreshToken;

        if (newAccessToken) {
          if (typeof window !== "undefined") {
            localStorage.setItem("tripnest_admin_token", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("tripnest_admin_refresh_token", newRefreshToken);
            }
            window.dispatchEvent(
              new CustomEvent("tripnest_admin_token_refreshed", {
                detail: newAccessToken,
              })
            );
          }

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          return axiosAdmin(originalRequest);
        } else {
          throw new Error("No access token returned from refresh");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("tripnest_admin_token");
          localStorage.removeItem("tripnest_admin_refresh_token");
          localStorage.removeItem("tripnest_admin_user");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Request failed";
    return Promise.reject(message);
  }
);

export const authApi = {
  login: (credentials) => axiosAdmin.post("/auth/login", credentials),
  registerAdmin: (data) => axiosAdmin.post("/auth/register-admin", data),
  getAdminSetupStatus: () => axiosAdmin.get("/auth/admin/setup-status"),
  getProfile: () => axiosAdmin.get("/auth/me"),
  refreshToken: (refreshToken) =>
    axiosAdmin.post("/auth/refresh-token", { refreshToken }),
  logout: () => axiosAdmin.post("/auth/logout"),
};

export const adminApi = {
  getStats: () => axiosAdmin.get("/admin/stats"),
  getMonthlyRevenue: () => axiosAdmin.get("/admin/reports/monthly-revenue"),
  getPopularDestinations: () => axiosAdmin.get("/admin/reports/popular-destinations"),
  getHotelPerformance: () => axiosAdmin.get("/admin/reports/hotel-performance"),
  getBookingStatus: () => axiosAdmin.get("/admin/reports/booking-status"),
  getUsers: (params) => axiosAdmin.get("/admin/users", { params }),
  createUser: (data) => axiosAdmin.post("/admin/users", data),
  toggleUserStatus: (id) => axiosAdmin.patch(`/admin/users/${id}/toggle-status`),
  getAllBookings: (params) => axiosAdmin.get("/admin/bookings", { params }),
  updateBookingStatus: (id, status) => axiosAdmin.patch(`/admin/bookings/${id}/status`, { status }),
};

export const hotelApi = {
  getAll: (params) => axiosAdmin.get("/hotels", { params }),
  getAdminAll: () => axiosAdmin.get("/hotels/admin/all"),
  getMyHotels: () => axiosAdmin.get("/hotels/my-hotels"),
  getById: (id) => axiosAdmin.get(`/hotels/${id}`),
  create: (data) => axiosAdmin.post("/hotels", data),
  approve: (id) => axiosAdmin.patch(`/hotels/${id}/approve`),
  reject: (id, reason) => axiosAdmin.patch(`/hotels/${id}/reject`, { reason }),
  block: (id) => axiosAdmin.patch(`/hotels/${id}/block`),
  getRoomsByHotel: (hotelId) => axiosAdmin.get(`/hotels/${hotelId}/rooms`),
  createRoom: (data) => {
    const hotelId = data.hotelId || data.id;
    if (hotelId) {
      return axiosAdmin.post(`/rooms/hotel/${hotelId}`, data);
    }
    return axiosAdmin.post("/rooms", data);
  },
  deleteRoom: (id) => axiosAdmin.delete(`/rooms/${id}`),
  uploadImages: (formData) =>
    axiosAdmin.post("/hotels/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const availabilityApi = {
  check: (params) => axiosAdmin.get("/availability/check", { params }),
  calculatePrice: (params) =>
    axiosAdmin.get("/availability/calculate-price", { params }),
};

export const packageApi = {
  getAll: (params) => axiosAdmin.get("/packages", { params }),
  create: (data) => axiosAdmin.post("/packages", data),
  update: (id, data) => axiosAdmin.put(`/packages/${id}`, data),
  delete: (id) => axiosAdmin.delete(`/packages/${id}`),
  getBookings: (id) => axiosAdmin.get(`/packages/${id}/bookings`),
};

export const couponApi = {
  getAll: () => axiosAdmin.get("/coupons"),
  create: (data) => axiosAdmin.post("/coupons", data),
  delete: (id) => axiosAdmin.delete(`/coupons/${id}`),
};

export const inquiryApi = {
  getAll: (params) => axiosAdmin.get("/inquiries", { params }),
  update: (id, data) => axiosAdmin.patch(`/inquiries/${id}`, data),
  delete: (id) => axiosAdmin.delete(`/inquiries/${id}`),
};

export default axiosAdmin;
