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
  FiMail
} from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center space-x-2">
            <FiPackage className="w-6 h-6" />
            <span>ShopHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {/* Home Link */}
            <Link to="/" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1">
              <FiHome className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {/* Products Link */}
            <Link to="/products" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
            
            {/* User Dropdown Menu (for logged in users) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 focus:outline-none"
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
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {/* My Account Link */}
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4" />
                          <span>My Account</span>
                        </div>
                      </Link>
                      
                      {/* My Addresses Link */}
                      <Link
                        to="/account#addresses"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <FiMapPin className="w-4 h-4" />
                          <span>My Addresses</span>
                        </div>
                      </Link>
                      
                      {/* My Orders Link */}
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <FiShoppingBag className="w-4 h-4" />
                          <span>My Orders</span>
                        </div>
                      </Link>
                      
                      <hr className="my-1" />
                      
                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-2"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Admin Dropdown Menu (for admin users - you can add isAdmin check) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 focus:outline-none"
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
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <FiGrid className="w-4 h-4" />
                          <span>Dashboard</span>
                        </div>
                      </Link>
                      <hr className="my-1" />
                      <Link
                        to="/admin/add-product"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <FiPlusCircle className="w-4 h-4" />
                          <span>Add New Product</span>
                        </div>
                      </Link>
                      <Link
                        to="/admin/products"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <FiList className="w-4 h-4" />
                          <span>Manage Products</span>
                        </div>
                      </Link>
                      <Link
                        to="/admin/newsletter"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <FiMail className="w-4 h-4" />
                          <span>Newsletter</span>
                        </div>
                      </Link>
                      <hr className="my-1" />
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
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
            
            {/* Cart Icon (for logged in users) */}
            {user && (
              <Link to="/cart" className="relative">
                <FiShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-600" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>
            )}

            {/* Login/Register Buttons (for non-logged in users) */}
            {!user && (
              <div className="space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;