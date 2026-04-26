import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
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
  FiChevronLeft,
  FiMapPin,
  FiClock,
  FiCheckCircle
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
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, quantity);
      toast.success(`Added ${quantity} × ${product.name} to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const toggleWishlist = () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    setInWishlist(!inWishlist);
    if (!inWishlist) {
      toast.success('Added to wishlist!');
    } else {
      toast.success('Removed from wishlist!');
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra"></div>
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

  // Get category display name
  const getCategoryName = (category) => {
    const categories = {
      building: 'Building Materials',
      paints: 'Paints',
      hardware: 'Hardware Tools',
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      general: 'General Store'
    };
    return categories[category] || category;
  };

  return (
    <div className="min-h-screen bg-warm">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#E04E00',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-black hover:text-terra transition-colors group"
        >
          <FiChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Products</span>
        </button>

        <div className="bg-white border-4 border-black shadow-hard-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <div>
              <div className="mb-4 overflow-hidden border-4 border-black bg-sand/20">
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
                    className={`overflow-hidden border-4 transition-all ${selectedImage === index ? 'border-terra' : 'border-black hover:border-terra/50'
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
                {/* Category Badge */}
                <div className="inline-block mb-3">
                  <span className="bg-terra/10 text-terra text-xs font-bold uppercase tracking-wider px-3 py-1 border border-terra">
                    {getCategoryName(product.category)}
                  </span>
                </div>
                
                <h1 className="font-h text-3xl lg:text-4xl font-bold text-black mb-2">
                  {product.name}
                </h1>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                      />
                    ))}
                    <span className="ml-2 text-ash">(124 reviews)</span>
                  </div>
                  {product.stock > 0 && (
                    <div className="flex items-center text-green-600">
                      <FiCheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm font-semibold">In Stock</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <span className="font-h text-3xl font-bold text-terra">
                    KSh {product.price.toLocaleString()}
                  </span>
                  {product.old_price && (
                    <span className="ml-2 text-lg text-ash line-through">
                      KSh {product.old_price.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-ash leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 border-4 border-black bg-white hover:bg-terra/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiMinus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-bold w-12 text-center text-black">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2 border-4 border-black bg-white hover:bg-terra/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiPlus className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-ash ml-2">
                      {product.stock} available
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center space-x-2"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className={`px-6 py-3 font-bold uppercase tracking-wider border-4 transition-all flex items-center justify-center space-x-2 ${
                      inWishlist
                        ? 'bg-terra text-white border-terra'
                        : 'border-black hover:border-terra hover:text-terra'
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
                    className="px-6 py-3 font-bold uppercase tracking-wider border-4 border-black hover:border-terra hover:text-terra transition-all flex items-center justify-center space-x-2"
                  >
                    <FiShare2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Delivery & Payment Info */}
                <div className="border-t-4 border-black pt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FiTruck className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">Free delivery on orders over KSh 5,000</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FiShield className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">Secure payment with M-Pesa</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FiRefreshCw className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FiMapPin className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">Located on A1 Highway, Migori</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FiClock className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">Same-day pickup available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="font-h text-2xl md:text-3xl font-bold text-black uppercase mb-2">You Might Also Like</h2>
            <div className="brick-line mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Add related products here - would come from backend */}
            <div className="bg-white border-4 border-black shadow-hard-sm p-8 text-center">
              <p className="text-ash">More products coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;