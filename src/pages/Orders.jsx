import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders';
import api from '../api/client';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import useAuthStore from '../store/authStore';
import { 
  FiPackage, 
  FiCheckCircle, 
  FiTruck, 
  FiClock, 
  FiShoppingBag,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiDollarSign
} from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <FiTruck className="w-5 h-5 text-terra" />;
      case 'pending':
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiPackage className="w-5 h-5 text-ash" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'shipped':
        return 'bg-terra/10 text-terra border-terra';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-ash border-gray-300';
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiPackage className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
            {user?.isAdmin ? 'All Orders' : 'My Orders'}
          </h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">
            {user?.isAdmin ? 'Manage and track customer orders' : 'Track your order status and history'}
          </p>
        </div>
        
        {/* Filter Tabs for Admin */}
        {user?.isAdmin && (
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-2 bg-white border-4 border-black p-2 shadow-hard-sm">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 font-bold uppercase tracking-wider transition-all ${
                  filter === 'all' ? 'bg-terra text-white border-2 border-black' : 'bg-gray-200 text-black hover:bg-terra/10'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 font-bold uppercase tracking-wider transition-all ${
                  filter === 'pending' ? 'bg-yellow-500 text-white border-2 border-black' : 'bg-gray-200 text-black hover:bg-terra/10'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 font-bold uppercase tracking-wider transition-all ${
                  filter === 'paid' ? 'bg-green-600 text-white border-2 border-black' : 'bg-gray-200 text-black hover:bg-terra/10'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setFilter('shipped')}
                className={`px-4 py-2 font-bold uppercase tracking-wider transition-all ${
                  filter === 'shipped' ? 'bg-terra text-white border-2 border-black' : 'bg-gray-200 text-black hover:bg-terra/10'
                }`}
              >
                Shipped
              </button>
            </div>
          </div>
        )}
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white border-4 border-black shadow-hard-lg">
            <FiShoppingBag className="w-20 h-20 text-ash mx-auto mb-4" />
            <p className="font-h text-2xl font-bold text-black uppercase mb-2">No orders found</p>
            <p className="text-ash mb-6">You haven't placed any orders yet.</p>
            {!user?.isAdmin && (
              <Link to="/products" className="inline-block bg-terra text-white px-8 py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border-4 border-black shadow-hard-sm overflow-hidden hover:-translate-y-1 transition-all duration-300">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 border-b-4 border-black pb-4 mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <FiPackage className="w-5 h-5 text-terra" />
                        <p className="font-h font-bold text-black text-lg">Order #{order.id}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <p className="text-sm text-ash flex items-center space-x-1">
                          <FiCalendar className="w-3 h-3" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </p>
                        {user?.isAdmin && order.user && (
                          <p className="text-sm text-ash flex items-center space-x-1">
                            <FiUser className="w-3 h-3" />
                            <span>Customer: {order.user.name || order.user.email}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-h text-2xl font-bold text-terra">
                        KSh {order.total?.toLocaleString() || 0}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 text-xs font-bold uppercase border ${getStatusColor(order.status)}`}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-h font-bold text-black uppercase text-sm mb-3 flex items-center">
                        <FiShoppingBag className="mr-2 text-terra" />
                        Order Items
                      </h3>
                      <div className="space-y-2 bg-warm/30 p-3 border-2 border-black">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-ash">
                              {item.product_name || `Product #${item.product_id}`} 
                              <span className="font-bold ml-1">x {item.quantity}</span>
                            </span>
                            <span className="font-bold text-terra">
                              KSh {item.price?.toLocaleString() || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* M-Pesa Receipt */}
                  {order.mpesa_receipt && (
                    <div className="mb-4 p-3 bg-terra/5 border-2 border-terra">
                      <p className="text-sm text-ash">
                        M-Pesa Receipt: <span className="font-mono font-bold text-terra">{order.mpesa_receipt}</span>
                      </p>
                    </div>
                  )}

                  {/* Admin Actions */}
                  {user?.isAdmin && order.status !== 'shipped' && (
                    <div className="border-t-4 border-black pt-4 mt-4 flex flex-wrap justify-end gap-3">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'paid')}
                          disabled={updatingStatus === order.id}
                          className="px-6 py-2 bg-green-600 text-white font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus === order.id ? 'Updating...' : '✓ Mark as Paid'}
                        </button>
                      )}
                      {order.status === 'paid' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          disabled={updatingStatus === order.id}
                          className="px-6 py-2 bg-terra text-white font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus === order.id ? 'Updating...' : '🚚 Mark as Shipped'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;