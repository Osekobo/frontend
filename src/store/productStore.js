// store/productStore.js - With request deduplication
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

// Track pending requests to prevent duplicates
let pendingRequests = new Map();

const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,
      totalProducts: 0,
      currentPage: 1,
      totalPages: 1,

      fetchProducts: async (page = 1, limit = 12, filters = {}, skipCache = false) => {
  // Create a unique key for this request
  const requestKey = `${page}-${limit}-${JSON.stringify(filters)}`;
  
  // ✅ Check cache first (only if skipCache is false)
  // if (!skipCache) {
  //   const cachedData = getCachedProducts(requestKey);
  //   if (cachedData) {
  //     console.log('📦 Using cached data');
  //     set({
  //       products: cachedData.products,
  //       totalProducts: cachedData.total,
  //       currentPage: page,
  //       totalPages: cachedData.totalPages,
  //       isLoading: false
  //     });
  //     return cachedData;
  //   }
  // }
  
  // If this exact request is already in progress, return its promise
  if (pendingRequests.has(requestKey)) {
    console.log('⏳ Request already in progress, waiting...');
    return pendingRequests.get(requestKey);
  }
  
  set({ isLoading: true, error: null });
  
  const requestPromise = (async () => {
    try {
      const params = new URLSearchParams({
        skip: (page - 1) * limit,
        limit: limit,
        ...filters
      });
      
      const response = await api.get(`/products?${params}`);
      
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
      
      const result = {
        products: productsArray,
        total: totalCount,
        totalPages: totalPagesCount
      };
      
      // ✅ Cache the result
      // cacheProducts(requestKey, result);
      
      set({
        products: productsArray,
        totalProducts: totalCount,
        currentPage: page,
        totalPages: totalPagesCount,
        isLoading: false
      });
      
      return result;
    } catch (error) {
      console.error('Fetch products error:', error);
      set({ 
        products: [],
        totalProducts: 0,
        totalPages: 1,
        error: error.message || 'Failed to fetch products', 
        isLoading: false 
      });
      throw error;
    } finally {
      pendingRequests.delete(requestKey);
    }
  })();
  
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
},
      
      // Optimized: Fetch only for home page (faster)
      fetchHomeProducts: async () => {
        // Use cache if available
        const cached = get().products;
        if (cached.length > 0 && !get().isLoading) {
          console.log('📦 Using existing products for home page');
          return cached;
        }
        return get().fetchProducts(1, 8);
      },
      
      // Fetch single product with caching
      fetchProductById: async (id) => {
        // Check cache first
        const cachedProduct = get().products.find(p => p.id === parseInt(id));
        if (cachedProduct) {
          console.log('📦 Product found in cache');
          return cachedProduct;
        }
        
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/products/${id}`);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },
      
      // Reset function (useful for logout)
      resetProducts: () => {
        set({
          products: [],
          isLoading: false,
          error: null,
          totalProducts: 0,
          currentPage: 1,
          totalPages: 1
        });
        pendingRequests.clear();
      }
    }),
    {
      name: 'product-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({ 
        totalProducts: state.totalProducts,
        totalPages: state.totalPages
      }),
    }
  )
);

export default useProductStore;