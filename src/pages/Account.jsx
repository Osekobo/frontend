import { useState, useEffect } from 'react';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../api/address';
import LocationPicker from '../components/Map/LocationPicker';
import { FiMapPin, FiEdit2, FiTrash2, FiPlus, FiCheckCircle, FiNavigation } from 'react-icons/fi';

const Account = () => {
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
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Account</h1>
      
      {/* Saved Addresses Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FiMapPin className="mr-2" />
            Saved Delivery Addresses
          </h2>
          <button
            onClick={() => setShowLocationPicker(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add New Address</span>
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No saved addresses</p>
            <p className="text-gray-500 text-sm">Add your delivery address for faster checkout</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-4 ${
                  address.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiMapPin className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-800">{address.full_name}</h4>
                      {address.is_default && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <FiCheckCircle className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{address.phone_number}</p>
                    <p className="text-gray-600 text-sm mt-1">{address.address_line1}</p>
                    <p className="text-gray-600 text-sm">{address.city}, {address.county}</p>
                    {address.latitude && address.longitude && (
                      <div className="flex items-center space-x-1 mt-2">
                        <FiNavigation className="w-3 h-3 text-gray-400" />
                        <p className="text-gray-400 text-xs">
                          GPS: {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700">
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-600 hover:text-red-700"
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

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Pin Your Delivery Location</h3>
              
              <LocationPicker onLocationSelect={handleLocationSelect} />
              
              {selectedLocation && (
                <div className="mt-4 space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Set as default address</span>
                  </label>
                  <button
                    onClick={handleSaveAddress}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save Address
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowLocationPicker(false)}
                className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
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