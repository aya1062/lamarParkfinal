import { create } from 'zustand';
import { api } from '../utils/api';

interface BookingData {
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  total: number;
}

interface BookingState {
  currentBooking: BookingData | null;
  bookings: any[];
  isLoading: boolean;
  setBookingData: (data: BookingData) => void;
  clearBooking: () => void;
  addBooking: (booking: any) => Promise<boolean>;
  getBookings: () => Promise<any[]>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  currentBooking: null,
  bookings: [],
  isLoading: false,

  setBookingData: (data: BookingData) => {
    set({ currentBooking: data });
  },

  clearBooking: () => {
    set({ currentBooking: null });
  },

  addBooking: async (booking: any) => {
    set({ isLoading: true });
    try {
      const res = await api.createBooking(booking);
      if (res.success && res.booking) {
        set(state => ({
          bookings: [...state.bookings, res.booking],
          isLoading: false
        }));
        return true;
      } else {
        set({ isLoading: false });
        return false;
      }
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },

  getBookings: async () => {
    set({ isLoading: true });
    try {
      const res = await api.getBookings();
      if (res.success && res.data) {
        set({ bookings: res.data, isLoading: false });
        return res.data;
      } else {
        set({ isLoading: false });
        return [];
      }
    } catch (error) {
      set({ isLoading: false });
      return [];
    }
  }
}));