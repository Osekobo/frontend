// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { login as loginApi, register as registerApi } from '../api/auth';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginApi({ email, password });
          const { access_token } = response.data;
          const user = jwtDecode(access_token);
          set({ token: access_token, user, isLoading: false });
          localStorage.setItem('access_token', access_token);
          return { success: true };
        } catch (error) {
          // Extract meaningful error message
          let errorMessage = 'Login failed';
          
          if (error.response) {
            const data = error.response.data;
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data.detail) {
              errorMessage = data.detail;
            } else if (data.message) {
              errorMessage = data.message;
            } else {
              errorMessage = JSON.stringify(data);
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          await registerApi(userData);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          // Extract meaningful error message
          let errorMessage = 'Registration failed';
          
          if (error.response) {
            const data = error.response.data;
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data.detail) {
              errorMessage = data.detail;
            } else if (data.message) {
              errorMessage = data.message;
            } else {
              errorMessage = JSON.stringify(data);
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, token: null, error: null });
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;