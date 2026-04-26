// store/productStore.js
import { create } from 'zustand';
import api from '../api/client';

const useProductStore = create((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  totalProducts: 0,
  currentPage: 1,
  totalPages: 1,

  fetchProducts: async (page = 1, limit = 12, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        skip: (page - 1) * limit,
        limit: limit,
        ...filters
      });
      
      const response = await api.get(`/products?${params}`);
      
      // ✅ Handle different response formats safely
      let productsArray = [];
      let totalCount = 0;
      let totalPagesCount = 1;
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          productsArray = response.data;
          totalCount = response.data.length;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          productsArray = response.data.products;
          totalCount = response.data.total || productsArray.length;
          totalPagesCount = response.data.total_pages || 1;
        }
      }
      
      set({
        products: productsArray,
        totalProducts: totalCount,
        currentPage: page,
        totalPages: totalPagesCount,
        isLoading: false
      });
    } catch (error) {
      console.error('Fetch products error:', error);
      set({ 
        products: [],  // ✅ Always set to empty array on error
        totalProducts: 0,
        totalPages: 1,
        error: error.message || 'Failed to fetch products', 
        isLoading: false 
      });
    }
  },
}));

export default useProductStore;