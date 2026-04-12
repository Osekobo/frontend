import { create } from 'zustand';
import { addToCart as addToCartApi, getCart, removeFromCart, updateQuantity } from '../api/cart';

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,

  fetchCart: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No token found, skipping cart fetch');
      return;
    }
    
    set({ isLoading: true });
    try {
      const response = await getCart();
      const items = response.data;
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      set({ items, total, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      set({ isLoading: false, items: [], total: 0 });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login to add items to cart');
      window.location.href = '/login';
      return;
    }
    
    try {
      // Send quantity to backend
      await addToCartApi(productId, quantity);
      await get().fetchCart(); // Refresh cart after adding
      alert(`Added ${quantity} item(s) to cart successfully!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      if (error.response?.status === 401) {
        alert('Please login to add items to cart');
        window.location.href = '/login';
      } else {
        alert('Failed to add to cart. Please try again.');
      }
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      alert('Failed to remove item from cart');
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    try {
      await updateQuantity(cartItemId, quantity);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity');
    }
  },

  clearCart: () => {
    set({ items: [], total: 0 });
  },
}));

export default useCartStore;