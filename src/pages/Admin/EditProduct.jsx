import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';
import { 
  FiPackage, 
  FiDollarSign, 
  FiImage, 
  FiShoppingBag, 
  FiTrash2, 
  FiSave, 
  FiX,
  FiTag,
  FiFolder
} from 'react-icons/fi';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  // Fetch product details on load
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'building',
        subcategory: product.subcategory || '',
        image_url: product.image_url || '',
        stock: product.stock || ''
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product details');
      navigate('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.put(`/products/${id}`, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        image_url: formData.image_url || 'https://placehold.co/400x400/D6B896/121518?text=Product',
        stock: parseInt(formData.stock)
      });

      alert('Product updated successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await api.delete(`/products/${id}`);
        alert('Product deleted successfully!');
        navigate('/admin/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-warm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiPackage className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">Edit Product</h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Update product information and inventory</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border-4 border-black shadow-hard-lg p-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-4 border-black">
            <h2 className="font-h text-xl font-bold text-black uppercase">Product Details</h2>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2"
            >
              <FiTrash2 className="w-5 h-5" />
              <span>Delete Product</span>
            </button>
          </div>
          
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

            {/* Category and Subcategory Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                  Category *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFolder className="h-5 w-5 text-ash" />
                  </div>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                  Subcategory (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTag className="h-5 w-5 text-ash" />
                  </div>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    placeholder="e.g., cement, power_tools, interior_paint"
                    className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  />
                </div>
              </div>
            </div>

            {/* Price and Stock Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Current Image Preview */}
            {formData.image_url && (
              <div className="mt-2">
                <p className="text-sm font-bold text-black uppercase tracking-wider mb-2">Current Image:</p>
                <div className="w-24 h-24 border-2 border-black overflow-hidden">
                  <img 
                    src={formData.image_url} 
                    alt={formData.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x400/D6B896/121518?text=Image+Not+Found';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-4 pt-6 border-t-2 border-black">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="flex-1 bg-gray-300 text-black py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:bg-gray-400 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center space-x-2"
              >
                <FiX className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-ash">
            All fields marked with * are required. Changes will be reflected immediately on the store.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;