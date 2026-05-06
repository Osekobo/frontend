// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { login as loginApi, register as registerApi } from '../api/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({  // Added 'get' for accessing current state
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
          
          // Store both in Zustand and localStorage
          set({ token: access_token, user, isLoading: false, error: null });
          localStorage.setItem('access_token', access_token);
          
          return { success: true, user };
        } catch (error) {
          console.error('Login error details:', error);
          
          let errorMessage = 'Login failed';
          if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
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
          console.log('📝 Registering user:', { ...userData, password: '***' });
          
          // Register the user
          const registerResponse = await registerApi(userData);
          console.log('✅ Registration successful');
          
          // Auto-login after registration
          const loginResponse = await loginApi({ 
            email: userData.email, 
            password: userData.password 
          });
          
          const { access_token } = loginResponse.data;
          const user = jwtDecode(access_token);
          
          set({ 
            token: access_token, 
            user, 
            isLoading: false,
            error: null
          });
          localStorage.setItem('access_token', access_token);
          
          return { success: true, user };
          
        } catch (error) {
          console.error('❌ Registration error:', error);
          
          let errorMessage = 'Registration failed';
          if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
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
      
      clearError: () => set({ error: null }),
      
      // ✅ Helper method to check if user is logged in
      isAuthenticated: () => {
        const { token } = get();
        return !!token;
      },
      
      // ✅ Helper method to get user's phone number
      getUserPhone: () => {
        const { user } = get();
        return user?.phone || '';
      },
      
      // ✅ Helper method to check if user is admin
      isAdmin: () => {
        const { user } = get();
        return user?.is_admin === true;
      },
      
      // ✅ Update user info (useful after profile updates)
      updateUser: (updates) => {
        set((state) => ({
          user: { ...state.user, ...updates }
        }));
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
      // ✅ Optional: versioning to handle schema changes
      version: 1,
    }
  )
);

export default useAuthStore;