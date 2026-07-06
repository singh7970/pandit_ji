import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Puja {
  id: string;
  name_en: string;
  name_hi?: string;
  description?: string;
  duration_hrs: number;
  base_price: number;
  tier_required?: string;
  samagri_list?: string[];
  deity?: string;
}

// In Expo development, localhost works for iOS simulator, but 10.0.2.2 is needed for Android.
// You can also replace this with your machine's local IP (e.g., http://192.168.1.X:8000)
const BASE_URL = 'https://pandit-ji-e3rz.onrender.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  // Auth
  sendOtp: (phone: string, mode?: string) => apiClient.post('/customer-auth/send-otp', { phone, mode }),
  verifyOtp: (phone: string, otp: string, name?: string, city?: string) => apiClient.post('/customer-auth/verify-otp', { phone, otp, name, city }),

  refreshToken: (refreshToken: string) => apiClient.post('/customer-auth/refresh', { refresh_token: refreshToken }),

  // User
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data: { name?: string; city?: string }) => apiClient.put('/users/me', data),
  addAddress: (address: { title: string; address_line: string; lat: number; lng: number }) => 
    apiClient.post('/users/me/addresses', address),
  deleteAddress: (id: string) => apiClient.delete(`/users/me/addresses/${id}`),

  // Pujas
  getPujas: (params?: { occasion?: string; city?: string; duration?: number; price?: number; q?: string }) => 
    apiClient.get('/pujas', { params }),
  getPujaDetail: (id: string) => apiClient.get(`/pujas/${id}`),

  // Bookings
  createBooking: (bookingData: {
    puja_id: string;
    scheduled_at: string;
    address: string;
    lat: number;
    lng: number;
    pandit_id?: string;
    kit_ordered: boolean;
  }) => apiClient.post('/bookings', bookingData),
  getBookingDetail: (id: string) => apiClient.get(`/bookings/${id}`),
  getMyBookings: () => apiClient.get('/bookings/my'),
  cancelBooking: (id: string, reason: string) => apiClient.put(`/bookings/${id}/cancel`, { cancel_reason: reason }),

  // Payments
  createPaymentOrder: (bookingId: string) => apiClient.post('/payments/create-order', { booking_id: bookingId }),
  verifyPaymentWebhook: (payload: any) => apiClient.post('/payments/webhook', payload),

  // Pandits
  getAvailablePandits: (params: { city: string; scheduled_at: string; puja_id: string }) => 
    apiClient.get('/pandits/available', { params }),
  getPanditProfile: (id: string) => apiClient.get(`/pandits/${id}`),
};
