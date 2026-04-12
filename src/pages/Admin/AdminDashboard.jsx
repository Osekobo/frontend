import { Link } from 'react-router-dom';
import { FiPackage, FiPlusCircle, FiList, FiShoppingBag, FiUsers, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

const AdminDashboard = () => {
  // Sample stats - these would come from your backend in production
  const stats = [
    { title: 'Total Products', value: '0', icon: FiPackage, color: 'bg-blue-500' },
    { title: 'Total Orders', value: '0', icon: FiShoppingBag, color: 'bg-green-500' },
    { title: 'Total Revenue', value: 'KSh 0', icon: FiDollarSign, color: 'bg-yellow-500' },
    { title: 'Total Users', value: '0', icon: FiUsers, color: 'bg-purple-500' },
  ];

  const adminActions = [
    {
      title: 'Add New Product',
      description: 'Add a new product to your store',
      icon: FiPlusCircle,
      link: '/admin/add-product',
      color: 'bg-green-500'
    },
    {
      title: 'Manage Products',
      description: 'Edit or delete existing products',
      icon: FiList,
      link: '/admin/products',
      color: 'bg-blue-500'
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: FiShoppingBag,
      link: '/orders',
      color: 'bg-purple-500'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {adminActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all group transform hover:-translate-y-1"
            >
              <div className="flex items-start space-x-4">
                <div className={`${action.color} p-3 rounded-full text-white group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{action.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-gray-600">No recent activity to display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;