import { create } from 'zustand';

export interface BookingRequest {
  id: string;
  puja_name: string;
  customer_locality: string;
  scheduled_at: string;
  estimated_earnings: number;
}

interface BookingState {
  activeBooking: any | null;
  incomingRequest: BookingRequest | null;
  setActiveBooking: (booking: any | null) => void;
  setIncomingRequest: (request: BookingRequest | null) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  activeBooking: null,
  incomingRequest: null,

  setActiveBooking: (activeBooking) => set({ activeBooking }),
  setIncomingRequest: (incomingRequest) => set({ incomingRequest }),
}));
