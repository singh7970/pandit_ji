import { create } from 'zustand';

export interface Puja {
  id: string;
  name_en: string;
  name_hi: string;
  description: string;
  duration_hrs: number;
  base_price: number;
  tier_required?: string;
  samagri_list?: string[];
  deity?: string;
  image_url?: string;
}

export interface Pandit {
  id: string;
  name: string;
  rating_avg: number;
  experience_years: number;
  languages: string[];
  sampraday?: string;
  photo_url?: string;
}

interface BookingState {
  selectedPuja: Puja | null;
  scheduledAt: Date | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  kitOrdered: boolean;
  selectedPandit: Pandit | null;
  currentStep: number;
  
  setSelectedPuja: (puja: Puja | null) => void;
  setScheduledAt: (date: Date | null) => void;
  setAddress: (address: string | null, lat: number | null, lng: number | null) => void;
  setKitOrdered: (kitOrdered: boolean) => void;
  setSelectedPandit: (pandit: Pandit | null) => void;
  setCurrentStep: (step: number) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedPuja: null,
  scheduledAt: null,
  address: null,
  lat: null,
  lng: null,
  kitOrdered: false,
  selectedPandit: null,
  currentStep: 1,

  setSelectedPuja: (selectedPuja) => set({ selectedPuja }),
  setScheduledAt: (scheduledAt) => set({ scheduledAt }),
  setAddress: (address, lat, lng) => set({ address, lat, lng }),
  setKitOrdered: (kitOrdered) => set({ kitOrdered }),
  setSelectedPandit: (selectedPandit) => set({ selectedPandit }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  resetBooking: () => set({
    selectedPuja: null,
    scheduledAt: null,
    address: null,
    lat: null,
    lng: null,
    kitOrdered: false,
    selectedPandit: null,
    currentStep: 1,
  }),
}));
