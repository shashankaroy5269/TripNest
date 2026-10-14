import axiosClient from "./axiosClient";

export const authApi = {
  register: (data) => axiosClient.post("/auth/register", data),
  login: (data) => axiosClient.post("/auth/login", data),
  logout: () => axiosClient.post("/auth/logout"),
  verifyEmail: (token) => axiosClient.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => axiosClient.post("/auth/resend-verification", { email }),
  getProfile: () => axiosClient.get("/auth/me"),
  refreshToken: (refreshToken) => axiosClient.post("/auth/refresh-token", { refreshToken }),
};

export const hotelApi = {
  getAll: (params) => axiosClient.get("/hotels", { params }),
  getById: (id) => axiosClient.get(`/hotels/${id}`),
  getAdminAll: () => axiosClient.get("/hotels/admin/all"),
  create: (data) => axiosClient.post("/hotels", data),
  update: (id, data) => axiosClient.put(`/hotels/${id}`, data),
  approve: (id) => axiosClient.patch(`/hotels/${id}/approve`),
  reject: (id, reason) => axiosClient.patch(`/hotels/${id}/reject`, { reason }),
  getRoomsByHotel: (hotelId) => axiosClient.get(`/hotels/${hotelId}/rooms`),
  getRoomById: (id) => axiosClient.get(`/rooms/${id}`),
  checkAvailability: (params) => axiosClient.get("/availability/check", { params }),
  getHotelRoomsAvailability: (hotelId, params) =>
    axiosClient.get(`/availability/hotel/${hotelId}`, { params }),
  createRoom: (data) => {
    const hotelId = data.hotelId || data.id;
    if (hotelId) {
      return axiosClient.post(`/rooms/hotel/${hotelId}`, data);
    }
    return axiosClient.post("/rooms", data);
  },
  updateRoom: (id, data) => axiosClient.put(`/rooms/${id}`, data),
  deleteRoom: (id) => axiosClient.delete(`/rooms/${id}`),
};

export const packageApi = {
  getAll: (params) => axiosClient.get("/packages", { params }),
  getById: (id) => axiosClient.get(`/packages/${id}`),
  create: (data) => axiosClient.post("/packages", data),
  update: (id, data) => axiosClient.put(`/packages/${id}`, data),
  delete: (id) => axiosClient.delete(`/packages/${id}`),
};

export const bookingApi = {
  create: (data) => axiosClient.post("/bookings", data),
  getMyBookings: () => axiosClient.get("/bookings/my"),
  getById: (id) => axiosClient.get(`/bookings/${id}`),
  cancel: (id, reason) => axiosClient.post(`/bookings/${id}/cancel`, { cancellationReason: reason }),
  createPaymentOrder: (bookingId) => axiosClient.post("/payments/create-order", { bookingId }),
  verifyPayment: (data) => axiosClient.post("/payments/verify", data),
  getInvoiceUrl: (id) => `/api/bookings/${id}/invoice`,
};

export const couponApi = {
  validate: (code, bookingAmount, bookingType) =>
    axiosClient.post("/coupons/validate", { code, bookingAmount, bookingType }),
  getAll: () => axiosClient.get("/coupons"),
  create: (data) => axiosClient.post("/coupons", data),
  delete: (id) => axiosClient.delete(`/coupons/${id}`),
};

export const reviewApi = {
  getByEntity: (params) => axiosClient.get("/reviews", { params }),
  create: (data) => axiosClient.post("/reviews", data),
};

export const wishlistApi = {
  get: () => axiosClient.get("/wishlist"),
  toggle: (entityId, entityType) => axiosClient.post("/wishlist/toggle", { entityId, entityType }),
};

export const inquiryApi = {
  create: (data) => axiosClient.post("/inquiries", data),
};

export const adminApi = {
  getStats: () => axiosClient.get("/admin/stats"),
  getMonthlyRevenue: () => axiosClient.get("/admin/reports/monthly-revenue"),
  getPopularDestinations: () => axiosClient.get("/admin/reports/popular-destinations"),
  getHotelPerformance: () => axiosClient.get("/admin/reports/hotel-performance"),
  getBookingStatusDistribution: () => axiosClient.get("/admin/reports/booking-status"),
  getUsers: () => axiosClient.get("/admin/users"),
  toggleUserStatus: (id) => axiosClient.patch(`/admin/users/${id}/toggle-status`, {}),
};