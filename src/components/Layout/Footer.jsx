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
    <footer className="bg-black text-white border-t-8 border-terra">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Company Info */}
          <div>
            <Link to="/" className="font-h text-2xl font-bold text-terra mb-4 inline-block">
              Kione Hardware
            </Link>
            <p className="text-sand/70 mb-4 leading-relaxed">
              Your trusted hardware and general store serving Migori County with quality building materials, paint, and everyday essentials.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="bg-terra/20 p-2 border border-terra hover:bg-terra hover:scale-110 transition-all duration-300">
                <FiFacebook className="w-5 h-5 text-terra hover:text-white" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="bg-terra/20 p-2 border border-terra hover:bg-terra hover:scale-110 transition-all duration-300">
                <FiTwitter className="w-5 h-5 text-terra hover:text-white" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="bg-terra/20 p-2 border border-terra hover:bg-terra hover:scale-110 transition-all duration-300">
                <FiInstagram className="w-5 h-5 text-terra hover:text-white" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="bg-terra/20 p-2 border border-terra hover:bg-terra hover:scale-110 transition-all duration-300">
                <FiYoutube className="w-5 h-5 text-terra hover:text-white" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="bg-terra/20 p-2 border border-terra hover:bg-terra hover:scale-110 transition-all duration-300">
                <FiLinkedin className="w-5 h-5 text-terra hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-h text-lg font-bold text-terra mb-4 uppercase">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sand/70 hover:text-terra transition-colors flex items-center group">
                  <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sand/70 hover:text-terra transition-colors flex items-center group">
                  <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sand/70 hover:text-terra transition-colors flex items-center group">
                  <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sand/70 hover:text-terra transition-colors flex items-center group">
                  <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sand/70 hover:text-terra transition-colors flex items-center group">
                  <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-h text-lg font-bold text-terra mb-4 uppercase">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-sand/70 hover:text-terra transition-colors flex items-center group">
                  <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sand/70 hover:text-terra transition-colors flex items-center group">
                  <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sand/70 hover:text-terra transition-colors flex items-center group">
                  <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sand/70 hover:text-terra transition-colors flex items-center group">
                  <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link to="/payment" className="text-sand/70 hover:text-terra transition-colors flex items-center group">
                  <FiChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Payment Methods
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-h text-lg font-bold text-terra mb-4 uppercase">Stay Connected</h3>
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3 text-sand/70">
                <FiMapPin className="w-5 h-5 flex-shrink-0 text-terra" />
                <span>A1 Highway, Migori, Kenya</span>
              </div>
              <div className="flex items-center space-x-3 text-sand/70">
                <FiPhone className="w-5 h-5 flex-shrink-0 text-terra" />
                <a href="tel:0712437715" className="hover:text-terra transition-colors">0712 437 715</a>
              </div>
              <div className="flex items-center space-x-3 text-sand/70">
                <FiMail className="w-5 h-5 flex-shrink-0 text-terra" />
                <a href="mailto:info@kionehardware.com" className="hover:text-terra transition-colors">info@kionehardware.com</a>
              </div>
              <div className="flex items-center space-x-3 text-sand/70">
                <FiClock className="w-5 h-5 flex-shrink-0 text-terra" />
                <span>Mon-Sat: 8AM - 7PM</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-terra mb-2 uppercase tracking-wider">Subscribe to Newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-3 py-2 bg-terra/10 text-white border-2 border-terra focus:outline-none focus:ring-2 focus:ring-terra w-full"
                  disabled={isSubscribing}
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-terra text-white px-4 py-2 border-2 border-terra hover:bg-terra-dark hover:border-terra-dark transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
                >
                  <FiSend className="w-5 h-5" />
                  <span className="hidden sm:inline">{isSubscribing ? '...' : 'Subscribe'}</span>
                  <span className="sm:hidden">{isSubscribing ? '...' : 'Subscribe'}</span>
                </button>
              </form>

              {subscribeMessage && (
                <div className={`mt-3 p-2 border flex items-center space-x-2 text-sm ${
                  messageType === 'success'
                    ? 'bg-green-900/50 text-green-400 border-green-700'
                    : 'bg-red-900/50 text-red-400 border-red-700'
                }`}>
                  {messageType === 'success' ? (
                    <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="break-words">{subscribeMessage}</span>
                </div>
              )}

              <p className="text-xs text-sand/50 mt-2">
                Get exclusive offers and new product alerts!
              </p>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="border-t-2 border-terra/30 pt-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-terra/20 p-3 border border-terra">
                <FiTruck className="w-6 h-6 text-terra" />
              </div>
              <div>
                <h4 className="font-h font-bold text-terra">Free Delivery</h4>
                <p className="text-sm text-sand/50">On orders over KSh 5,000</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-terra/20 p-3 border border-terra">
                <FiShield className="w-6 h-6 text-terra" />
              </div>
              <div>
                <h4 className="font-h font-bold text-terra">Secure Payment</h4>
                <p className="text-sm text-sand/50">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-terra/20 p-3 border border-terra">
                <FiRefreshCw className="w-6 h-6 text-terra" />
              </div>
              <div>
                <h4 className="font-h font-bold text-terra">Quality Guaranteed</h4>
                <p className="text-sm text-sand/50">Authentic products only</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-terra/20 p-3 border border-terra">
                <FiHeart className="w-6 h-6 text-terra" />
              </div>
              <div>
                <h4 className="font-h font-bold text-terra">Trusted Service</h4>
                <p className="text-sm text-sand/50">Since day one in Migori</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="border-t-2 border-terra/30 pt-8">
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
              {/* M-Pesa */}
              <div className="bg-white rounded p-1 h-8 px-3 flex items-center justify-center shadow-sm">
                <span className="text-green-600 font-bold text-sm tracking-wide">M-PESA</span>
              </div>
            </div>
            <div className="text-center text-sand/50 text-sm">
              <p>&copy; {currentYear} Kione Hardware & General Stores. All rights reserved.</p>
              <p className="mt-1">Located on A1 Highway, Migori, Kenya</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;