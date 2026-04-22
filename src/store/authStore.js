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
          console.error('Login error details:', error);
          let errorMessage = 'Login failed';
          
          if (error.response) {
            // Log the full error response for debugging
            console.error('Error response data:', error.response.data);
            console.error('Error status:', error.response.status);
            
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
          console.log('Sending registration data:', userData);
          
          // First, register the user
          const registerResponse = await registerApi(userData);
          console.log('Registration response:', registerResponse);
          
          // After successful registration, automatically log them in
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
          console.error('Registration error details:', error);
          
          let errorMessage = 'Registration failed';
          
          if (error.response) {
            // Log the full error response for debugging
            console.error('Error response data:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
            
            const data = error.response.data;
            
            // Try to extract the most helpful error message
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data.detail) {
              errorMessage = data.detail;
            } else if (data.message) {
              errorMessage = data.message;
            } else if (data.errors && Array.isArray(data.errors)) {
              errorMessage = data.errors.map(e => e.msg || e).join(', ');
            } else {
              errorMessage = JSON.stringify(data);
            }
          } else if (error.request) {
            // Request was made but no response received
            errorMessage = 'No response from server. Please check your connection.';
            console.error('No response received:', error.request);
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
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);

export default useAuthStore;