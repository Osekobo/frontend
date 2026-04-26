import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';
import { FiPlus, FiPackage, FiDollarSign, FiImage, FiShoppingBag, FiTrash2 } from 'react-icons/fi';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'building',
    subcategory: '',
    image_url: '',
    stock: ''
  });

  const categories = [
    { id: 'building', name: 'Building Materials', icon: '🧱' },
    { id: 'paints', name: 'Paints', icon: '🎨' },
    { id: 'hardware', name: 'Hardware Tools', icon: '🔧' },
    { id: 'plumbing', name: 'Plumbing', icon: '🚰' },
    { id: 'electrical', name: 'Electrical', icon: '⚡' },
    { id: 'general', name: 'General Store', icon: '🏪' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/products/', {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        image_url: formData.image_url || 'https://placehold.co/400x400/D6B896/121518?text=Product',
        stock: parseInt(formData.stock),
        rating: 0
      });

      alert('Product added successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">Add New Product</h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Fill in the details to add a new product to your store</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border-4 border-black shadow-hard-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Product Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPackage className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Subcategory (Optional)
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="e.g., cement, power_tools, interior_paint"
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
              />
            </div>

            {/* Price and Stock Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                  Price (KSh) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="h-5 w-5 text-ash" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                  Stock Quantity *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiShoppingBag className="h-5 w-5 text-ash" />
                  </div>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  />
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Image URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiImage className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                />
              </div>
              <p className="text-xs text-ash mt-1">
                Leave empty to use a placeholder image
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6 border-t-2 border-black">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Adding Product...</span>
                  </div>
                ) : (
                  'Add Product'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="flex-1 bg-gray-300 text-black py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:bg-gray-400 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-ash">
            All fields marked with * are required. Products will be visible immediately after addition.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;