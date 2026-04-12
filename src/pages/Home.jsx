import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useProductStore from '../store/productStore';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { 
  FiShoppingCart, 
  FiStar, 
  FiTruck, 
  FiShield, 
  FiRefreshCw, 
  FiChevronRight,
  FiChevronLeft,
  FiHeart,
  FiEye,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiHeadphones,
  FiUser,
  FiMessageSquare
} from 'react-icons/fi';

const Home = () => {
  const { products, isLoading, fetchProducts } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  
  // State for carousels
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState({});

  // Hero slides data
  const heroSlides = [
    {
      id: 1,
      title: "Summer Collection 2026",
      subtitle: "Discover the latest trends at unbeatable prices",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
      cta: "Shop Now",
      color: "from-blue-600 to-purple-600"
    },
    {
      id: 2,
      title: "Electronics Sale",
      subtitle: "Up to 40% off on premium gadgets",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200",
      cta: "Explore Deals",
      color: "from-green-600 to-teal-600"
    },
    {
      id: 3,
      title: "Free Shipping",
      subtitle: "On all orders over KSh 5,000",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
      cta: "Shop Now",
      color: "from-orange-600 to-red-600"
    }
  ];

  // Why Choose Us data
  const whyChooseUs = [
    {
      icon: <FiTruck className="w-8 h-8" />,
      title: "Free Delivery",
      description: "Free shipping on orders over KSh 5,000",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Secure Payment",
      description: "100% secure payment with M-Pesa",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <FiRefreshCw className="w-8 h-8" />,
      title: "Easy Returns",
      description: "30-day money-back guarantee",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <FiHeadphones className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Dedicated customer service team",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Best Prices",
      description: "Price match guarantee",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Quality Products",
      description: "100% authentic products",
      color: "bg-yellow-100 text-yellow-600"
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "John Mwangi",
      location: "Nairobi, Kenya",
      rating: 5,
      text: "Absolutely love shopping at ShopHub! The delivery was fast, and the product quality exceeded my expectations. Will definitely be buying more from here.",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      date: "March 2026"
    },
    {
      id: 2,
      name: "Sarah Kamau",
      location: "Mombasa, Kenya",
      rating: 5,
      text: "Best online shopping experience in Kenya! The M-Pesa payment integration is seamless, and customer support is very responsive. Highly recommended!",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      date: "February 2026"
    },
    {
      id: 3,
      name: "David Ochieng",
      location: "Kisumu, Kenya",
      rating: 5,
      text: "I've bought electronics from ShopHub twice now. The products are authentic, prices are competitive, and shipping is quick. 10/10 experience!",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      date: "January 2026"
    },
    {
      id: 4,
      name: "Grace Wanjiku",
      location: "Nakuru, Kenya",
      rating: 4,
      text: "Great selection of products and excellent customer service. The return policy is fair and hassle-free. Will continue shopping here.",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
      date: "December 2025"
    },
    {
      id: 5,
      name: "Michael Otieno",
      location: "Eldoret, Kenya",
      rating: 5,
      text: "The best part about ShopHub is the variety of products. Found everything I needed in one place. Delivery was prompt and well-packaged.",
      image: "https://randomuser.me/api/portraits/men/5.jpg",
      date: "November 2025"
    }
  ];

  // Partners data
  const partners = [
    {
      id: 1,
      name: "Safaricom",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Safaricom_logo.svg/2560px-Safaricom_logo.svg.png",
      description: "Official M-Pesa Partner",
      website: "https://www.safaricom.co.ke"
    },
    {
      id: 2,
      name: "Visa",
      logo: "https://cdn-icons-png.flaticon.com/512/196/196578.png",
      description: "Payment Partner",
      website: "https://www.visa.com"
    },
    {
      id: 3,
      name: "Mastercard",
      logo: "https://cdn-icons-png.flaticon.com/512/196/196561.png",
      description: "Payment Partner",
      website: "https://www.mastercard.com"
    },
    {
      id: 4,
      name: "Aramex",
      logo: "https://1000logos.net/wp-content/uploads/2021/05/Aramex-logo.png",
      description: "Delivery Partner",
      website: "https://www.aramex.com"
    },
    {
      id: 5,
      name: "GLS",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/GLS_Logo.svg/2560px-GLS_Logo.svg.png",
      description: "Logistics Partner",
      website: "https://www.gls-group.eu"
    },
    {
      id: 6,
      name: "Cloudinary",
      logo: "https://res.cloudinary.com/demo/image/upload/v1/samples/cloudinary_logo",
      description: "Image Hosting",
      website: "https://cloudinary.com"
    },
    {
      id: 7,
      name: "Kenya Airways",
      logo: "https://1000logos.net/wp-content/uploads/2018/11/Kenya-Airways-Logo.png",
      description: "Cargo Partner",
      website: "https://www.kenya-airways.com"
    },
    {
      id: 8,
      name: "Jumia",
      logo: "https://1000logos.net/wp-content/uploads/2021/05/Jumia-Logo.png",
      description: "Strategic Partner",
      website: "https://www.jumia.co.ke"
    }
  ];

  // Categories data
  const categories = [
    { name: "Electronics", icon: "💻", color: "bg-blue-100", textColor: "text-blue-600", count: "120+ products" },
    { name: "Fashion", icon: "👕", color: "bg-pink-100", textColor: "text-pink-600", count: "250+ products" },
    { name: "Home & Living", icon: "🏠", color: "bg-green-100", textColor: "text-green-600", count: "80+ products" },
    { name: "Sports", icon: "⚽", color: "bg-orange-100", textColor: "text-orange-600", count: "60+ products" },
    { name: "Books", icon: "📚", color: "bg-purple-100", textColor: "text-purple-600", count: "150+ products" },
    { name: "Toys", icon: "🎮", color: "bg-yellow-100", textColor: "text-yellow-600", count: "90+ products" }
  ];

  // Partners carousel settings
  const partnersPerView = 4;
  const visiblePartners = partners.slice(currentPartnerIndex, currentPartnerIndex + partnersPerView);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Auto-rotate hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const nextPartners = () => {
    if (currentPartnerIndex + partnersPerView < partners.length) {
      setCurrentPartnerIndex(currentPartnerIndex + partnersPerView);
    } else {
      setCurrentPartnerIndex(0);
    }
  };

  const prevPartners = () => {
    if (currentPartnerIndex - partnersPerView >= 0) {
      setCurrentPartnerIndex(currentPartnerIndex - partnersPerView);
    } else {
      setCurrentPartnerIndex(Math.max(0, partners.length - partnersPerView));
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(product.id);
      setAddedToCart({ [product.id]: true });
      setTimeout(() => {
        setAddedToCart({});
      }, 2000);
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  // Get latest products
  const latestProducts = products?.slice(0, 8) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. Hero Carousel Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-700 ease-in-out transform ${
                index === currentSlide ? 'translate-x-0' : 'translate-x-full'
              } ${index < currentSlide ? '-translate-x-full' : ''}`}
              style={{ 
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                      {slide.subtitle}
                    </p>
                    <Link
                      to="/products"
                      className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors group"
                    >
                      {slide.cta}
                      <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose ShopHub?
            </h2>
            <p className="text-gray-600 text-lg">We provide the best shopping experience in Kenya</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="text-center group hover:transform hover:scale-105 transition-all duration-300 p-6 rounded-xl bg-gray-50"
              >
                <div className={`inline-flex p-4 ${item.color} rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Shop by Category Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to="/products"
                className={`${category.color} rounded-xl p-6 text-center hover:shadow-lg transition-all transform hover:-translate-y-1`}
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className={`font-semibold ${category.textColor}`}>{category.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Latest Arrivals Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Latest Arrivals
              </h2>
              <p className="text-gray-600">Check out our newest products</p>
            </div>
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center group"
            >
              View All
              <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  <div className={`absolute inset-0 bg-black/50 flex items-center justify-center space-x-3 transition-opacity duration-300 ${
                    hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-2 bg-white rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="p-2 bg-white rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <FiEye className="w-5 h-5" />
                    </Link>
                  </div>

                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      Low Stock
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                    New
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">
                        KSh {product.price.toLocaleString()}
                      </span>
                    </div>
                    {addedToCart[product.id] && (
                      <span className="text-green-600 text-sm font-semibold animate-bounce">
                        Added!
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">(24 reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. What Our Customers Say Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 text-lg">Join thousands of satisfied customers in Kenya</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="absolute top-4 left-4 text-6xl text-blue-100">"</div>
              
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <FiStar key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 text-lg md:text-xl text-center italic mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </p>

              <div className="flex flex-col items-center text-center">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-blue-500 mb-4"
                />
                <h4 className="text-xl font-semibold text-gray-800">
                  {testimonials[currentTestimonial].name}
                </h4>
                <p className="text-gray-500 text-sm">
                  {testimonials[currentTestimonial].location}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {testimonials[currentTestimonial].date}
                </p>
              </div>

              <button
                onClick={prevTestimonial}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-lg p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-lg p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>

              <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTestimonial ? 'w-8 bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-blue-600">1,000+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-blue-600">4.8/5</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Products Sold</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Our Trusted Partners Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Trusted Partners
            </h2>
            <p className="text-gray-600 text-lg">We collaborate with industry leaders to serve you better</p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {visiblePartners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-20 flex items-center justify-center mb-3">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/100x60?text=${partner.name}`;
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{partner.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{partner.description}</p>
                </a>
              ))}
            </div>

            {partners.length > partnersPerView && (
              <>
                <button
                  onClick={prevPartners}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white shadow-lg p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPartners}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white shadow-lg p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          <div className="text-center mt-12 p-6 bg-blue-50 rounded-xl">
            <p className="text-gray-700">
              🤝 <span className="font-semibold">100+ partners</span> trust us with their business
            </p>
          </div>
        </div>
      </section>

      {/* 7. Call to Action Banner for Non-Logged-in Users */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Shopping?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Create an account and get 10% off your first purchase
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. Trust Badges Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="flex items-center space-x-2">
              <FiShield className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">100% Secure Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiTruck className="w-6 h-6 text-blue-600" />
              <span className="text-gray-700">Free Delivery Over KSh 5,000</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiClock className="w-6 h-6 text-orange-600" />
              <span className="text-gray-700">Fast Delivery Nationwide</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiAward className="w-6 h-6 text-purple-600" />
              <span className="text-gray-700">Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;