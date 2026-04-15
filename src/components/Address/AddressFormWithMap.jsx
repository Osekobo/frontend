import { useState } from 'react';
import { FiMapPin, FiX, FiNavigation } from 'react-icons/fi';
import LocationPicker from '../Map/LocationPicker';

const counties = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", 
  "Uasin Gishu", "Kakamega", "Kilifi", "Garissa", "Kajiado", "Meru"
];

const AddressFormWithMap = ({ address, onSubmit, onClose, isEditing }) => {
  const [formData, setFormData] = useState(address || {
    full_name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    county: 'Nairobi',
    postal_code: '',
    landmark: '',
    is_default: false,
    latitude: null,
    longitude: null,
    google_place_id: null
  });
  const [showMap, setShowMap] = useState(!address?.latitude);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLocationSelect = (locationData) => {
    setFormData({
      ...formData,
      latitude: locationData.lat,
      longitude: locationData.lng,
      google_place_id: locationData.place_id,
      address_line1: locationData.address || formData.address_line1,
      city: locationData.city || formData.city,
      county: locationData.county || formData.county,
      postal_code: locationData.postal_code || formData.postal_code
    });
    setShowMap(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      alert('Please select a location on the map');
      setShowMap(true);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Delivery Address' : 'Add Delivery Address'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Location Picker Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-gray-700">
                Pin Your Location on Map *
              </label>
              {formData.latitude && !showMap && (
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  Change Location
                </button>
              )}
            </div>

            {showMap ? (
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
              />
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <FiNavigation className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Location Selected</p>
                    <p className="text-xs text-green-600 mt-1">
                      Coordinates: {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone_number"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0712345678"
              />
            </div>
          </div>

          {/* Address Details */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Street/Building *
            </label>
            <input
              type="text"
              name="address_line1"
              required
              value={formData.address_line1}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Street name, building name, apartment number"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Info (Optional)
            </label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Near the mall, opposite bank, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                County *
              </label>
              <select
                name="county"
                required
                value={formData.county}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {counties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City/Town *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nairobi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Postal Code (Optional)
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Landmark (Optional)
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Near the mall"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">
              Set as default delivery address
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FiMapPin className="w-5 h-5" />
              <span>{isEditing ? 'Update Address' : 'Save Address'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormWithMap;