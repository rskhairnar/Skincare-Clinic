// store/authStore.js

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrated: false,

      // Set auth data
      setAuth: (user, token) => {
        console.log('Setting auth:', { user: user?.email, tokenExists: !!token });
        set({ user, token });
      },

      // Logout
      logout: () => {
        console.log('Logging out');
        set({ user: null, token: null });
      },

      // Check if authenticated
      isAuthenticated: () => {
        const { token, user } = get();
        return !!(token && user);
      },

      // Get user role
      getRole: () => {
        return get().user?.role || null;
      },

      // Set hydration complete
      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage on client
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return dummy storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth hydration error:', error);
        } else {
          console.log('Auth hydrated:', { user: state?.user?.email, tokenExists: !!state?.token });
          state?.setHydrated();
        }
      },
    }
  )
);