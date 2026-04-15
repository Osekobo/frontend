import api from './client';

// Get all addresses for the logged-in user
export const getAddresses = () => api.get('/address');

// Get default address
export const getDefaultAddress = () => api.get('/address/default');

// Create a new address
export const createAddress = (addressData) => api.post('/address', addressData);

// Update an existing address
export const updateAddress = (addressId, addressData) => api.put(`/address/${addressId}`, addressData);

// Delete an address
export const deleteAddress = (addressId) => api.delete(`/address/${addressId}`);