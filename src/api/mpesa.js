import api from './client';

export const initiatePayment = (phone, amount, orderId) => 
  api.post('/mpesa/stkpush', { phone, amount, order_id: orderId });