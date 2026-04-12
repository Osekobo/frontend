import api from './client';

export const addToCart = (productId, quantity = 1) => 
  api.post(`/cart/add/${productId}`, { quantity });
export const getCart = () => api.get('/cart');
export const removeFromCart = (cartItemId) => api.delete(`/cart/${cartItemId}`);
export const updateQuantity = (cartItemId, quantity) => 
  api.put(`/cart/${cartItemId}`, { quantity });