import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiLinkedin,
  FiSend,
  FiChevronRight,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiHeart,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { useState } from 'react';
import api from '../../api/client';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessageType('error');
      setSubscribeMessage('Please enter your email address');
      setTimeout(() => {
        setSubscribeMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessageType('error');
      setSubscribeMessage('Please enter a valid email address');
      setTimeout(() => {
        setSubscribeMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    setIsSubscribing(true);
    setSubscribeMessage('');

    try {
      const response = await api.post('/newsletter/subscribe', { email });
      setMessageType('success');
      setSubscribeMessage(response.data.message || 'Successfully subscribed to newsletter!');
      setEmail('');

      setTimeout(() => {
        setSubscribeMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessageType('error');

      if (error.response?.data?.detail) {
        setSubscribeMessage(error.response.data.detail);
      } else if (error.response?.data?.message) {
        setSubscribeMessage(error.response.data.message);
      } else {
        setSubscribeMessage('Something went wrong. Please try again later.');
      }

      setTimeout(() => {
        setSubscribeMessage('');
        setMessageType('');
      }, 4000);
    } finally {
      setIsSubscribing(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Company Info */}
          <div>
            <Link to="/" className="text-2xl font-bold text-blue-400 mb-4 inline-block">
              ShopHub
            </Link>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Your premier online shopping destination. Quality products, competitive prices, and exceptional customer service.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-400 transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition-colors">
                <FiYoutube className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-700 transition-colors">
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FiChevronRight className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FiChevronRight className="w-4 h-4 mr-2" />
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FiChevronRight className="w-4 h-4 mr-2" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FiChevronRight className="w-4 h-4 mr-2" />
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FiChevronRight className="w-4 h-4 mr-2" />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FiChevronRight className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FiChevronRight className="w-4 h-4 mr-2" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FiChevronRight className="w-4 h-4 mr-2" />
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FiChevronRight className="w-4 h-4 mr-2" />
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link to="/payment" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FiChevronRight className="w-4 h-4 mr-2" />
                  Payment Methods
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3 text-gray-400">
                <FiMapPin className="w-5 h-5 flex-shrink-0" />
                <span>123 Business Street, Nairobi, Kenya</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <FiPhone className="w-5 h-5 flex-shrink-0" />
                <span>+254 700 000 000</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <FiMail className="w-5 h-5 flex-shrink-0" />
                <span>info@shophub.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <FiClock className="w-5 h-5 flex-shrink-0" />
                <span>Mon-Sat: 9AM - 6PM</span>
              </div>
            </div>

            {/* Newsletter - Fixed Version */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Subscribe to Newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  disabled={isSubscribing}
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-blue-600 px-4 py-2 rounded-lg sm:rounded-r-lg sm:rounded-l-none hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center space-x-2 whitespace-nowrap"
                >
                  <FiSend className="w-5 h-5" />
                  <span className="hidden sm:inline">{isSubscribing ? '...' : 'Subscribe'}</span>
                  <span className="sm:hidden">{isSubscribing ? '...' : 'Subscribe'}</span>
                </button>
              </form>

              {subscribeMessage && (
                <div className={`mt-3 p-2 rounded-lg flex items-center space-x-2 text-sm ${messageType === 'success'
                  ? 'bg-green-900/50 text-green-400 border border-green-700'
                  : 'bg-red-900/50 text-red-400 border border-red-700'
                  }`}>
                  {messageType === 'success' ? (
                    <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="break-words">{subscribeMessage}</span>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Get exclusive offers, new product alerts, and 10% off your first order!
              </p>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <FiTruck className="w-8 h-8 text-blue-400" />
              <div>
                <h4 className="font-semibold">Free Shipping</h4>
                <p className="text-sm text-gray-400">On orders over KSh 5,000</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiShield className="w-8 h-8 text-blue-400" />
              <div>
                <h4 className="font-semibold">Secure Payment</h4>
                <p className="text-sm text-gray-400">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiRefreshCw className="w-8 h-8 text-blue-400" />
              <div>
                <h4 className="font-semibold">Easy Returns</h4>
                <p className="text-sm text-gray-400">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiHeart className="w-8 h-8 text-blue-400" />
              <div>
                <h4 className="font-semibold">24/7 Support</h4>
                <p className="text-sm text-gray-400">Dedicated customer service</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex space-x-3 flex-wrap gap-2">
              {/* Visa */}
              <img
                src="https://cdn-icons-png.flaticon.com/512/196/196578.png"
                alt="Visa"
                className="h-8 bg-white rounded p-1"
              />
              {/* Mastercard */}
              <img
                src="https://cdn-icons-png.flaticon.com/512/196/196561.png"
                alt="Mastercard"
                className="h-8 bg-white rounded p-1"
              />
              {/* PayPal */}
              <img
                src="https://cdn-icons-png.flaticon.com/512/349/349221.png"
                alt="PayPal"
                className="h-8 bg-white rounded p-1"
              />
              {/* M-Pesa - Text Badge (Always works) */}
              <div className="bg-white rounded p-1 h-8 px-3 flex items-center justify-center shadow-sm">
                <span className="text-green-600 font-bold text-sm tracking-wide">M-PESA</span>
              </div>
            </div>
            <div className="text-center text-gray-400 text-sm">
              <p>&copy; {currentYear} ShopHub. All rights reserved.</p>
              <p className="mt-1">Made with <FiHeart className="w-4 h-4 inline text-red-500" /> for the best shopping experience</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;