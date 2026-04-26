import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { FiPackage, FiPlusCircle, FiList, FiShoppingBag, FiUsers, FiTrendingUp, FiDollarSign, FiShield, FiClock, FiAlertTriangle } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentOrders: [],
    lowStockProducts: [],
    outOfStockProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch products
      const productsResponse = await api.get('/products/');
      let products = [];
      if (Array.isArray(productsResponse.data)) {
        products = productsResponse.data;
      } else if (productsResponse.data.products) {
        products = productsResponse.data.products;
      }
      
      // Fetch orders
      const ordersResponse = await api.get('/orders/').catch(() => ({ data: [] }));
      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
      
      // Calculate totals
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Get recent orders (last 5)
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      // Get low stock products (stock between 1 and 10)
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
      
      // Get out of stock products (stock = 0)
      const outOfStockProducts = products.filter(p => p.stock === 0);
      
      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        totalUsers: 0,
        recentOrders,
        lowStockProducts,
        outOfStockProducts
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: FiPackage, color: 'bg-terra' },
    { title: 'Total Orders', value: stats.totalOrders, icon: FiShoppingBag, color: 'bg-terra' },
    { title: 'Total Revenue', value: formatMoney(stats.totalRevenue), icon: FiDollarSign, color: 'bg-terra' },
    { title: 'Low Stock Items', value: stats.lowStockProducts.length, icon: FiAlertTriangle, color: 'bg-orange-600' },
  ];

  const adminActions = [
    {
      title: 'Add New Product',
      description: 'Add a new product to your store',
      icon: FiPlusCircle,
      link: '/admin/add-product',
      color: 'bg-terra'
    },
    {
      title: 'Manage Products',
      description: 'Edit or delete existing products',
      icon: FiList,
      link: '/admin/products',
      color: 'bg-terra'
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: FiShoppingBag,
      link: '/orders',
      color: 'bg-terra'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">Admin Dashboard</h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Welcome back! Here's what's happening with your store today.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white border-4 border-black shadow-hard-sm p-6 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ash text-sm font-bold uppercase tracking-wider">{stat.title}</p>
                  <p className="font-h text-3xl font-bold text-black mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 border-4 border-black text-white shadow-hard-sm`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="font-h text-2xl font-bold text-black uppercase mb-6 flex items-center">
          <FiTrendingUp className="mr-2 text-terra" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {adminActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white border-4 border-black shadow-hard-sm p-6 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`${action.color} p-3 border-4 border-black text-white group-hover:scale-110 transition-transform shadow-hard-sm`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-h font-bold text-black text-lg uppercase tracking-wider">{action.title}</h3>
                  <p className="text-sm text-ash mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Inventory Alerts Section */}
        {(stats.lowStockProducts.length > 0 || stats.outOfStockProducts.length > 0) && (
          <div className="mb-8">
            <h2 className="font-h text-2xl font-bold text-black uppercase mb-6 flex items-center">
              <FiAlertTriangle className="mr-2 text-orange-600" />
              Inventory Alerts
            </h2>
            
            {/* Out of Stock - Critical */}
            {stats.outOfStockProducts.length > 0 && (
              <div className="mb-6 bg-red-50 border-4 border-red-500 shadow-hard-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-red-600 p-2 border-2 border-black mr-3">
                    <FiAlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-h text-xl font-bold text-red-700 uppercase">Out of Stock - Immediate Action Required</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.outOfStockProducts.map((product) => (
                    <div key={product.id} className="bg-white border-2 border-red-500 p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-black">{product.name}</p>
                        <p className="text-xs text-ash">Category: {product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">Out of Stock</p>
                        <Link to={`/admin/edit-product/${product.id}`} className="text-xs text-terra hover:text-terra-dark font-bold uppercase">
                          Restock Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Low Stock - Warning */}
            {stats.lowStockProducts.length > 0 && (
              <div className="bg-yellow-50 border-4 border-yellow-500 shadow-hard-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-600 p-2 border-2 border-black mr-3">
                    <FiAlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-h text-xl font-bold text-yellow-700 uppercase">Low Stock - Needs Attention</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.lowStockProducts.map((product) => (
                    <div key={product.id} className="bg-white border-2 border-yellow-500 p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-black">{product.name}</p>
                        <p className="text-xs text-ash">Category: {product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">Only {product.stock} left</p>
                        <Link to={`/admin/edit-product/${product.id}`} className="text-xs text-terra hover:text-terra-dark font-bold uppercase">
                          Restock Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Two Column Layout for Recent Orders and All Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white border-4 border-black shadow-hard-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-h text-xl font-bold text-black uppercase flex items-center">
                <FiShoppingBag className="mr-2 text-terra" />
                Recent Orders
              </h2>
              <Link to="/orders" className="text-terra hover:text-terra-dark text-sm font-bold uppercase tracking-wider transition-colors">
                View All
              </Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-ash">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-terra/5 border-2 border-terra">
                    <div>
                      <p className="font-bold text-black">Order #{order.id}</p>
                      <p className="text-xs text-ash">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-terra">KSh {order.total?.toLocaleString() || 0}</p>
                      <span className={`text-xs px-2 py-0.5 border ${order.status === 'paid' ? 'bg-green-100 text-green-800 border-green-500' : order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-500' : 'bg-yellow-100 text-yellow-800 border-yellow-500'}`}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Products Summary */}
          <div className="bg-white border-4 border-black shadow-hard-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-h text-xl font-bold text-black uppercase flex items-center">
                <FiPackage className="mr-2 text-terra" />
                Products Overview
              </h2>
              <Link to="/admin/products" className="text-terra hover:text-terra-dark text-sm font-bold uppercase tracking-wider transition-colors">
                Manage All
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 border-2 border-green-500">
                <span className="font-bold text-black">Healthy Stock (&gt;10)</span>
                <span className="font-bold text-green-600">{stats.totalProducts - stats.lowStockProducts.length - stats.outOfStockProducts.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 border-2 border-yellow-500">
                <span className="font-bold text-black">Low Stock (1-10)</span>
                <span className="font-bold text-orange-600">{stats.lowStockProducts.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 border-2 border-red-500">
                <span className="font-bold text-black">Out of Stock</span>
                <span className="font-bold text-red-600">{stats.outOfStockProducts.length}</span>
              </div>
            </div>
            
            {/* Quick Restock Button */}
            {(stats.lowStockProducts.length > 0 || stats.outOfStockProducts.length > 0) && (
              <Link
                to="/admin/products"
                className="block w-full mt-6 bg-terra text-white text-center py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Review Inventory
              </Link>
            )}
          </div>
        </div>

        {/* Admin Tips */}
        <div className="mt-8 p-6 bg-terra/10 border-4 border-terra text-center">
          <p className="text-sm text-black font-semibold">
            💡 Pro Tip: Keep your inventory updated and monitor low stock items to ensure timely restocking!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;