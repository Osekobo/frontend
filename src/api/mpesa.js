// import api from './client';

// export const initiatePayment = (phone, amount, orderId) => 
//   api.post('/mpesa/stkpush', { phone, amount, order_id: orderId });

// src/api/mpesa.js
import api from './client';

export const initiatePayment = (phoneNumber, amount, orderId) => {
  return api.post('/mpesa/stkpush', {
    phone_number: phoneNumber,
    amount: amount,
    order_id: orderId
  });
};