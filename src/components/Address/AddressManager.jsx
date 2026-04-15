import { useState, useEffect } from 'react';
import { FiMapPin, FiEdit2, FiTrash2, FiPlus, FiCheckCircle, FiNavigation } from 'react-icons/fi';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../../api/address';
import AddressFormWithMap from './AddressFormWithMap';

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();
      setAddresses(response.data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAddress = async (addressData) => {
    try {
      await createAddress(addressData);
      await fetchAddresses();
      setShowForm(false);
      alert('Address added successfully!');
    } catch (error) {
      console.error('Failed to create address:', error);
      alert('Failed to add address');
    }
  };

  const handleUpdateAddress = async (addressData) => {
    try {
      await updateAddress(editingAddress.id, addressData);
      await fetchAddresses();
      setShowForm(false);
      setEditingAddress(null);
      alert('Address updated successfully!');
    } catch (error) {
      console.error('Failed to update address:', error);
      alert('Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId);
        await fetchAddresses();
        alert('Address deleted successfully!');
      } catch (error) {
        console.error('Failed to delete address:', error);
        alert('Failed to delete address');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Delivery Addresses</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add New Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No addresses saved yet</p>
          <p className="text-gray-500 text-sm">Add your delivery address to checkout faster</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 transition-all ${
                address.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
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
                  {address.address_line2 && (
                    <p className="text-gray-600 text-sm">{address.address_line2}</p>
                  )}
                  <p className="text-gray-600 text-sm">
                    {address.city}, {address.county}
                  </p>
                  {address.landmark && (
                    <p className="text-gray-500 text-xs mt-1">Landmark: {address.landmark}</p>
                  )}
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
                  <button
                    onClick={() => {
                      setEditingAddress(address);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
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

      {showForm && (
        <AddressFormWithMap
          address={editingAddress}
          onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
          onClose={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
          isEditing={!!editingAddress}
        />
      )}
    </div>
  );
};

export default AddressManager;