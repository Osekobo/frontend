import { useState, useEffect } from 'react';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../api/address';
import LocationPicker from '../components/Map/LocationPicker';
import useAuthStore from '../store/authStore';
import {
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheckCircle,
  FiNavigation,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiPackage,
  FiShoppingBag,
  FiClock,
  FiCalendar
} from 'react-icons/fi';

const Account = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address_line1: '',
    city: '',
    county: '',
    is_default: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();
      setAddresses(response.data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleLocationSelect = (locationData) => {
    setSelectedLocation(locationData);
    setFormData({
      ...formData,
      address_line1: locationData.address,
      city: locationData.city || '',
      county: locationData.county || ''
    });
  };

  const handleSaveAddress = async () => {
    if (!selectedLocation) {
      alert('Please select a location on the map');
      return;
    }

    try {
      await createAddress({
        ...formData,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        google_place_id: selectedLocation.place_id
      });
      alert('Address saved successfully!');
      setShowLocationPicker(false);
      setSelectedLocation(null);
      setFormData({
        full_name: '',
        phone_number: '',
        address_line1: '',
        city: '',
        county: '',
        is_default: false
      });
      fetchAddresses();
    } catch (error) {
      console.error('Failed to save address:', error);
      alert('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id);
        fetchAddresses();
        alert('Address deleted successfully');
      } catch (error) {
        console.error('Failed to delete address:', error);
        alert('Failed to delete address');
      }
    }
  };

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiUser className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">My Account</h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Manage your profile and delivery addresses</p>
        </div>

        {/* User Info Section */}
        <div className="bg-white border-4 border-black shadow-hard-sm p-6 mb-6">
          <h2 className="font-h text-xl font-bold text-black uppercase mb-4 flex items-center">
            <FiUser className="mr-2 text-terra" />
            Profile Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-terra/5 border-2 border-terra">
              <FiUser className="w-5 h-5 text-terra" />
              <div>
                <p className="text-xs text-ash uppercase tracking-wider">Full Name</p>
                <p className="font-h font-bold text-black">{user?.name || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-terra/5 border-2 border-terra">
              <FiMail className="w-5 h-5 text-terra" />
              <div>
                <p className="text-xs text-ash uppercase tracking-wider">Email Address</p>
                <p className="font-h font-bold text-black">{user?.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-terra/5 border-2 border-terra">
              <FiPhone className="w-5 h-5 text-terra" />
              <div>
                <p className="text-xs text-ash uppercase tracking-wider">Phone Number</p>
                <p className="font-h font-bold text-black">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-terra/5 border-2 border-terra">
              <FiShield className="w-5 h-5 text-terra" />
              <div>
                <p className="text-xs text-ash uppercase tracking-wider">Account Status</p>
                <p className="font-h font-bold text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Saved Addresses Section */}
        <div className="bg-white border-4 border-black shadow-hard-sm p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="font-h text-xl font-bold text-black uppercase flex items-center">
              <FiMapPin className="mr-2 text-terra" />
              Saved Delivery Addresses
            </h2>
            <button
              onClick={() => setShowLocationPicker(true)}
              className="bg-terra text-white px-4 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add New Address</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-12 bg-terra/5 border-4 border-black">
              <FiMapPin className="w-16 h-16 text-ash mx-auto mb-4" />
              <p className="font-h text-xl font-bold text-black uppercase">No saved addresses</p>
              <p className="text-ash mt-2">Add your delivery address for faster checkout</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border-4 p-4 transition-all hover:-translate-y-1 duration-300 ${
                    address.is_default ? 'border-terra bg-terra/5 shadow-hard-sm' : 'border-black'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
                        <FiMapPin className="w-5 h-5 text-terra" />
                        <h4 className="font-h font-bold text-black">{address.full_name}</h4>
                        {address.is_default && (
                          <span className="bg-terra text-white text-[10px] px-2 py-0.5 font-bold uppercase flex items-center border border-black">
                            <FiCheckCircle className="w-3 h-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-ash text-sm flex items-center space-x-1">
                        <FiPhone className="w-3 h-3" />
                        <span>{address.phone_number}</span>
                      </p>
                      <p className="text-ash text-sm mt-2">{address.address_line1}</p>
                      <p className="text-ash text-sm">{address.city}, {address.county}</p>
                      {address.latitude && address.longitude && (
                        <div className="flex items-center space-x-1 mt-2">
                          <FiNavigation className="w-3 h-3 text-ash" />
                          <p className="text-ash text-[10px]">
                            GPS: {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button className="text-terra hover:text-terra-dark transition-colors">
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border-4 border-black shadow-hard-sm p-4 text-center hover:-translate-y-1 transition-all">
            <FiPackage className="w-8 h-8 text-terra mx-auto mb-2" />
            <p className="font-h text-2xl font-bold text-black">0</p>
            <p className="text-xs text-ash uppercase tracking-wider">Total Orders</p>
          </div>
          <div className="bg-white border-4 border-black shadow-hard-sm p-4 text-center hover:-translate-y-1 transition-all">
            <FiShoppingBag className="w-8 h-8 text-terra mx-auto mb-2" />
            <p className="font-h text-2xl font-bold text-black">0</p>
            <p className="text-xs text-ash uppercase tracking-wider">Items Purchased</p>
          </div>
          <div className="bg-white border-4 border-black shadow-hard-sm p-4 text-center hover:-translate-y-1 transition-all">
            <FiClock className="w-8 h-8 text-terra mx-auto mb-2" />
            <p className="font-h text-2xl font-bold text-black">0</p>
            <p className="text-xs text-ash uppercase tracking-wider">Pending Deliveries</p>
          </div>
        </div>

        {/* Member Since */}
        <div className="mt-6 text-center">
          <p className="text-xs text-ash flex items-center justify-center space-x-1">
            <FiCalendar className="w-3 h-3" />
            <span>Member since {new Date().getFullYear()}</span>
          </p>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-hard-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="font-h text-xl font-bold text-black uppercase mb-4 flex items-center">
                <FiMapPin className="mr-2 text-terra" />
                Pin Your Delivery Location
              </h3>
              
              <LocationPicker onLocationSelect={handleLocationSelect} />
              
              {selectedLocation && (
                <div className="mt-4 space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  />
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                      className="w-4 h-4 border-2 border-black accent-terra"
                    />
                    <span className="text-sm font-bold text-black uppercase tracking-wider">Set as default address</span>
                  </label>
                  <button
                    onClick={handleSaveAddress}
                    className="w-full bg-terra text-white py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    Save Address
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowLocationPicker(false)}
                className="mt-4 w-full bg-gray-300 text-black py-2 font-bold uppercase tracking-wider border-4 border-black hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;