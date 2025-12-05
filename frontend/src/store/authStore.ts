import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'manager';
  phone?: string;
  nationalId?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<{ success: boolean; user?: any }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await api.login(email, password);
          if (res.success && res.user) {
            set({ user: { ...res.user, id: res.user._id }, isAuthenticated: true, isLoading: false });
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

      register: async (userData: any) => {
        set({ isLoading: true });
        try {
          const res = await api.register(userData);
          if (res && res.user) {
            set({ user: { ...res.user, id: res.user._id }, isAuthenticated: true, isLoading: false });
            return { success: true, user: res.user };
          } else {
            set({ isLoading: false });
            return { success: false };
          }
        } catch (error) {
          set({ isLoading: false });
          return { success: false };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);