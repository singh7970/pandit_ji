import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

let tokenPromise: Promise<string | null> | null = null;

async function getAdminToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("admin_token");
  if (token) return token;

  if (!tokenPromise) {
    tokenPromise = (async () => {
      try {
        const response = await axios.post(`${API_BASE}/auth/verify-otp`, {
          phone: "+910000000000",
          otp: "123456",
          role: "ADMIN",
          name: "System Administrator",
        });
        const accessToken = response.data.access_token;
        if (accessToken) {
          localStorage.setItem("admin_token", accessToken);
          return accessToken;
        }
      } catch (err) {
        console.error("Failed to auto-fetch admin token:", err);
      }
      return null;
    })();
  }
  
  const result = await tokenPromise;
  tokenPromise = null;
  return result;
}

// Request Interceptor
api.interceptors.request.use(async (config) => {
  const token = await getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor to retry on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;
      localStorage.removeItem("admin_token");
      const newToken = await getAdminToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  analytics: () => api.get("/admin/analytics"),
  customers: () => api.get("/admin/customers"),
  paymentsList: () => api.get("/admin/payments"),
  panditQueue: () => api.get("/admin/pandits/queue"),
  approvePandit: (id: string, tier: string) =>
    api.put(`/admin/pandits/${id}/approve?tier=${tier}`),
  rejectPandit: (id: string, reason: string) =>
    api.put(`/admin/pandits/${id}/reject?reason=${encodeURIComponent(reason)}`),
  bookings: (params?: Record<string, string>) =>
    api.get("/admin/bookings", { params }),
  pujas: () => api.get("/pujas"),
  createPuja: (data: unknown) => api.post("/pujas", data),
  updatePuja: (id: string, data: unknown) => api.put(`/pujas/${id}`, data),
  deletePuja: (id: string) => api.delete(`/pujas/${id}`),
  broadcast: (title: string, body: string, role = "ALL") =>
    api.post(`/admin/notifications/broadcast?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&target_role=${role}`),
};
