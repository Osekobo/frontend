import api from './client';

export const checkout = () => api.post('/orders/checkout');
export const getOrders = () => api.get('/orders');
export const getOrderDetails = (orderId) => api.get(`/orders/${orderId}`);