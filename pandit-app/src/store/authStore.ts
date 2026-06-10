import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PanditProfile {
  id: string;
  phone: string;
  name: string | null;
  city: string | null;
  role: 'CUSTOMER' | 'PANDIT' | 'ADMIN';
  is_active: boolean;
  pandit_profile?: {
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
    sampraday: string;
    specialisations: string[];
    languages: string[];
    experience_years: number;
    tier: 'VERIFIED' | 'SILVER' | 'GOLD';
    rating_avg: number;
  } | null;
}

interface AuthState {
  user: PanditProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  language: 'en' | 'hi';
  isLoading: boolean;
  isActiveDuty: boolean; // Active/Unavailable toggle on Home
  setLanguage: (lang: 'en' | 'hi') => Promise<void>;
  login: (token: string, user: PanditProfile) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: PanditProfile) => void;
  setIsActiveDuty: (active: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  language: 'en',
  isLoading: true,
  isActiveDuty: false,

  setLanguage: async (lang) => {
    await AsyncStorage.setItem('app_language', lang);
    set({ language: lang });
  },

  login: async (token, user) => {
    await AsyncStorage.setItem('access_token', token);
    await AsyncStorage.setItem('user_profile', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user_profile');
    set({ token: null, user: null, isAuthenticated: false, isActiveDuty: false });
  },

  setUser: (user) => {
    set({ user });
  },

  setIsActiveDuty: (isActiveDuty) => {
    set({ isActiveDuty });
  },

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userStr = await AsyncStorage.getItem('user_profile');
      const lang = await AsyncStorage.getItem('app_language') as 'en' | 'hi';
      
      const user = userStr ? JSON.parse(userStr) : null;
      const language = lang || 'en';

      set({
        token,
        user,
        isAuthenticated: !!token && !!user,
        language,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false });
    }
  },
}));
