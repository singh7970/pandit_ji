import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  city: string | null;
  role: 'CUSTOMER' | 'PANDIT' | 'ADMIN';
  is_active: boolean;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  language: 'en' | 'hi';
  isLoading: boolean;
  setLanguage: (lang: 'en' | 'hi') => Promise<void>;
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  language: 'en',
  isLoading: true,

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
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user });
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
