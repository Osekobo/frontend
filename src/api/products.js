import api from './client';

export const getProducts = () => api.get('/products');
export const createProduct = (productData) => api.post('/products', productData);