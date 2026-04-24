import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { 
  FiShoppingCart, 
  FiUser, 
  FiLogOut, 
  FiChevronDown, 
  FiGrid, 
  FiPlusCircle, 
  FiList, 
  FiShoppingBag,
  FiMapPin,
  FiHome,
  FiPackage,
  FiMail,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Always visible */}
            <Link to="/" className="font-h text-2xl font-bold text-terra flex items-center space-x-2 shrink-0">
              <FiPackage className="w-6 h-6" />
              <span className="hidden sm:inline">Kione Hardware</span>
              <span className="sm:hidden">KH</span>
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Home Link */}
              <Link to="/" className="text-black hover:text-terra font-semibold flex items-center space-x-1 transition-colors">
                <FiHome className="w-4 h-4" />
                <span>Home</span>
              </Link>

              {/* Products Link */}
              <Link to="/products" className="text-black hover:text-terra font-semibold transition-colors">
                Products
              </Link>
              
              {/* User Dropdown Menu (for logged in users) */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 text-black hover:text-terra font-semibold focus:outline-none transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Account</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isUserMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white border-4 border-black shadow-hard-sm py-2 z-50">
                        <Link
                          to="/account"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FiUser className="w-4 h-4" />
                            <span>My Account</span>
                          </div>
                        </Link>
                        <Link
                          to="/account#addresses"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FiMapPin className="w-4 h-4" />
                            <span>My Addresses</span>
                          </div>
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FiShoppingBag className="w-4 h-4" />
                            <span>My Orders</span>
                          </div>
                        </Link>
                        <hr className="my-1 border-black" />
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-2 transition-colors"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Admin Dropdown Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="flex items-center space-x-1 text-black hover:text-terra font-semibold focus:outline-none transition-colors"
                  >
                    <FiGrid className="w-5 h-5" />
                    <span>Admin</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isAdminMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAdminMenuOpen(false)}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white border-4 border-black shadow-hard-sm py-2 z-50">
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FiGrid className="w-4 h-4" />
                            <span>Dashboard</span>
                          </div>
                        </Link>
                        <hr className="my-1 border-black" />
                        <Link
                          to="/admin/add-product"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FiPlusCircle className="w-4 h-4" />
                            <span>Add New Product</span>
                          </div>
                        </Link>
                        <Link
                          to="/admin/products"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FiList className="w-4 h-4" />
                            <span>Manage Products</span>
                          </div>
                        </Link>
                        <Link
                          to="/admin/newsletter"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FiMail className="w-4 h-4" />
                            <span>Newsletter</span>
                          </div>
                        </Link>
                        <hr className="my-1 border-black" />
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FiShoppingBag className="w-4 h-4" />
                            <span>All Orders</span>
                          </div>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Cart Icon */}
              {user && (
                <Link to="/cart" className="relative">
                  <FiShoppingCart className="w-6 h-6 text-black hover:text-terra transition-colors" />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-terra text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-black">
                      {items.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Login/Register Buttons */}
              {!user && (
                <div className="space-x-4">
                  <Link to="/login" className="text-black hover:text-terra font-semibold transition-colors">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-terra text-white px-4 py-2 border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button + Cart (Visible on small screens) */}
            <div className="flex items-center space-x-4 md:hidden">
              {/* Cart Icon for Mobile */}
              {user && (
                <Link to="/cart" className="relative">
                  <FiShoppingCart className="w-6 h-6 text-black hover:text-terra transition-colors" />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-terra text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-black">
                      {items.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 border-2 border-black hover:bg-terra/10 transition-colors"
                aria-label="Open menu"
              >
                <FiMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Sidebar */}
        <div
          ref={mobileMenuRef}
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white border-l-4 border-black shadow-hard-sm transition-transform duration-300 transform ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b-4 border-black">
            <span className="font-h text-xl font-bold text-terra">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 border-2 border-black hover:bg-terra/10 transition-colors"
              aria-label="Close menu"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-1 overflow-y-auto h-[calc(100%-65px)]">
            {/* Home */}
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
            >
              <FiHome className="w-5 h-5" />
              <span className="font-semibold">Home</span>
            </Link>

            {/* Products */}
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
            >
              <FiPackage className="w-5 h-5" />
              <span className="font-semibold">Products</span>
            </Link>

            {user && (
              <>
                {/* Account */}
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="font-semibold">My Account</span>
                </Link>

                {/* Addresses */}
                <Link
                  to="/account#addresses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FiMapPin className="w-5 h-5" />
                  <span className="font-semibold">My Addresses</span>
                </Link>

                {/* Orders */}
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FiShoppingBag className="w-5 h-5" />
                  <span className="font-semibold">My Orders</span>
                </Link>

                <hr className="my-2 border-black" />

                {/* Admin Section */}
                <div className="px-4 py-2 text-xs font-semibold text-ash uppercase tracking-wider">
                  Admin
                </div>
                
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FiGrid className="w-5 h-5" />
                  <span className="font-semibold">Dashboard</span>
                </Link>

                <Link
                  to="/admin/add-product"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FiPlusCircle className="w-5 h-5" />
                  <span className="font-semibold">Add Product</span>
                </Link>

                <Link
                  to="/admin/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FiList className="w-5 h-5" />
                  <span className="font-semibold">Manage Products</span>
                </Link>

                <Link
                  to="/admin/newsletter"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FiMail className="w-5 h-5" />
                  <span className="font-semibold">Newsletter</span>
                </Link>

                <hr className="my-2 border-black" />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 border-2 border-transparent hover:bg-red-50 hover:border-red-600 transition-all"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-semibold">Logout</span>
                </button>
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="font-semibold">Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-3 px-4 py-3 bg-terra text-white border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  <span className="font-semibold">Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;