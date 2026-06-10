import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage
if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

export const endpoints = {
  analytics: () => api.get("/admin/analytics"),
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
