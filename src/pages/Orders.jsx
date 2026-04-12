import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders';
import api from '../api/client'; // Add this import
import LoadingSpinner from '../components/Common/LoadingSpinner';
import useAuthStore from '../store/authStore';
import { FiPackage, FiCheckCircle, FiTruck, FiClock } from 'react-icons/fi';

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
      // Using the api client for the PUT request
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders(); // Refresh orders
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
        return <FiTruck className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiPackage className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          {user?.isAdmin ? 'All Orders' : 'My Orders'}
        </h1>
        
        {/* Filter tabs for admin */}
        {user?.isAdmin && (
          <div className="flex space-x-2 flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('shipped')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'shipped' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Shipped
            </button>
          </div>
        )}
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No orders found</p>
          {!user?.isAdmin && (
            <Link to="/products" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    {user?.isAdmin && order.user && (
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {order.user.name || order.user.email}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">
                      KSh {order.total?.toLocaleString() || 0}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Items:</h3>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.product_name || `Product #${item.product_id}`} x {item.quantity}</span>
                          <span>KSh {item.price?.toLocaleString() || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {order.mpesa_receipt && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-sm text-gray-600">
                      M-Pesa Receipt: <span className="font-mono">{order.mpesa_receipt}</span>
                    </p>
                  </div>
                )}

                {/* Admin Actions */}
                {user?.isAdmin && order.status !== 'shipped' && (
                  <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end space-x-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'paid')}
                        disabled={updatingStatus === order.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                      >
                        {updatingStatus === order.id ? 'Updating...' : 'Mark as Paid'}
                      </button>
                    )}
                    {order.status === 'paid' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        disabled={updatingStatus === order.id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                      >
                        {updatingStatus === order.id ? 'Updating...' : 'Mark as Shipped'}
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
  );
};

export default Orders;