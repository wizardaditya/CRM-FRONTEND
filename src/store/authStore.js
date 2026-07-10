import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/api/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      isLoading:   true,

      setAccessToken: (token) => set({ accessToken: token }),

      initAuth: async () => {
        const token = get().accessToken;
        if (!token) { set({ isLoading: false }); return; }
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data, isLoading: false });
        } catch {
          set({ user: null, accessToken: null, isLoading: false });
        }
      },

      login: async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        set({ user: data.data.user, accessToken: data.data.accessToken });
        return data.data;
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* silent */ }
        set({ user: null, accessToken: null });
      },
    }),
    {
      name:    'a5x-auth',
      partialize: (s) => ({ accessToken: s.accessToken }),
    }
  )
);
