import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://mean-shrimps-shop.loca.lt';

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
  sendOtp: (phone: string, mode?: string) => apiClient.post('/auth/send-otp', { phone, mode }),
  verifyOtp: (phone: string, otp: string, name?: string, role?: string) => apiClient.post('/auth/verify-otp', { phone, otp, name, role: role || 'PANDIT' }),
  refreshToken: (refreshToken: string) => apiClient.post('/auth/refresh', { refresh_token: refreshToken }),

  // User
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data: { name: string; city: string }) => apiClient.put('/users/me', data),
  updatePanditProfile: (data: any) => apiClient.put('/pandits/me', data),
  applyPandit: (applicationData: {
    sampraday: string;
    specialisations: string[];
    languages: string[];
    experience_years: number;
    bio: string;
    photo_url?: string;
    document_urls?: string[];
  }) => apiClient.post('/pandits/apply', applicationData),

  // Availability
  setAvailability: (slots: { date: string; start_time: string; end_time: string }[]) => 
    apiClient.put('/pandits/me/availability', { slots }),

  // Bookings Actions
  getMyBookings: () => apiClient.get('/bookings/my'),
  getBookingDetail: (id: string) => apiClient.get(`/bookings/${id}`),
  acceptBooking: (id: string) => apiClient.put(`/bookings/${id}/accept`),
  declineBooking: (id: string) => apiClient.put(`/bookings/${id}/decline`),
  markArrived: (id: string) => apiClient.put(`/bookings/${id}/arrived`),
  startPuja: (id: string) => apiClient.put(`/bookings/${id}/start`),
  completePuja: (id: string) => apiClient.put(`/bookings/${id}/complete`),

  // Payments / Earnings
  getEarnings: () => apiClient.get('/payments/earnings'),

  // Catalogue
  getPujas: () => apiClient.get('/pujas'),
};
