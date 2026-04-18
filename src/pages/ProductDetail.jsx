import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useProductStore from '../store/productStore';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import {
  FiShoppingCart,
  FiStar,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeart,
  FiShare2,
  FiMinus,
  FiPlus,
  FiChevronLeft
} from 'react-icons/fi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, fetchProducts } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    } else {
      const foundProduct = products.find(p => p.id === parseInt(id));
      setProduct(foundProduct);
    }
  }, [products, id, fetchProducts]);

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }
    try {
      // Pass the quantity to addToCart
      await addToCart(product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const toggleWishlist = () => {
    if (!user) {
      alert('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    setInWishlist(!inWishlist);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mock product images (in production, would come from backend)
  const productImages = [
    product.image_url || `https://picsum.photos/seed/${product.id}/600/600`,
    `https://picsum.photos/seed/${product.id}1/600/600`,
    `https://picsum.photos/seed/${product.id}2/600/600`,
    `https://picsum.photos/seed/${product.id}3/600/600`,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <FiChevronLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <div>
              <div className="mb-4 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-lg border-2 transition-all ${selectedImage === index ? 'border-blue-600' : 'border-transparent'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                      />
                    ))}
                    <span className="ml-2 text-gray-600">(124 reviews)</span>
                  </div>
                  <div className="text-gray-400">|</div>
                  {/* Stock display removed - no longer showing "X in stock" */}
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-blue-600">
                    KSh {product.price.toLocaleString()}
                  </span>
                  {product.old_price && (
                    <span className="ml-2 text-lg text-gray-400 line-through">
                      KSh {product.old_price.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiMinus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiPlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className={`px-6 py-3 rounded-lg font-semibold border-2 transition-colors flex items-center justify-center space-x-2 ${inWishlist
                      ? 'bg-red-50 border-red-500 text-red-600'
                      : 'border-gray-300 hover:border-red-500 hover:text-red-600'
                      }`}
                  >
                    <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                    <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const productUrl = window.location.href;
                      const shareText = `Check out this product: ${product.name}!\n\nPrice: KSh ${product.price.toLocaleString()}\n\n${productUrl}`;
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-green-600 hover:text-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiShare2 className="w-5 h-5" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>

                {addedToCart && (
                  <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg text-center animate-bounce">
                    Product added to cart successfully!
                  </div>
                )}

                {/* Shipping Info */}
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <FiTruck className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Free delivery on orders over KSh 5,000</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FiShield className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Secure payment with M-Pesa</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FiRefreshCw className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">30-day money-back guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Add related products here - would come from backend */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;