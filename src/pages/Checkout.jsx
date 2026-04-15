import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { checkout } from '../api/orders';
import { initiatePayment } from '../api/mpesa';
import { getDefaultAddress, createAddress } from '../api/address';
import LocationPicker from '../components/Map/LocationPicker';
import { 
  FiMapPin, 
  FiCheckCircle, 
  FiNavigation, 
  FiSkipForward,
  FiAlertCircle,
  FiSmartphone,
  FiShield,
  FiClock,
  FiInfo,
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
  FiPercent
} from 'react-icons/fi';

const Checkout = () => {
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [skipAddress, setSkipAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    full_name: '',
    phone_number: '',
    address_line1: '',
    city: '',
    county: ''
  });
  const { items, total, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Calculate order details
  const subtotal = total;
  const shippingFee = subtotal > 5000 ? 0 : 250;
  const tax = subtotal * 0.16; // 16% VAT
  const grandTotal = subtotal + shippingFee + tax;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
    loadDefaultAddress();
  }, [items, navigate]);

  const loadDefaultAddress = async () => {
    try {
      const response = await getDefaultAddress();
      if (response.data) {
        setSelectedLocation({
          lat: response.data.latitude,
          lng: response.data.longitude,
          address: response.data.address_line1
        });
        setAddressDetails({
          full_name: response.data.full_name,
          phone_number: response.data.phone_number,
          address_line1: response.data.address_line1,
          city: response.data.city,
          county: response.data.county
        });
        setPhone(response.data.phone_number);
      }
    } catch (error) {
      console.error('Failed to load default address:', error);
    }
  };

  const handleLocationSelect = (locationData) => {
    setSelectedLocation(locationData);
    setAddressDetails({
      full_name: user?.name || '',
      phone_number: phone,
      address_line1: locationData.address,
      city: locationData.city || '',
      county: locationData.county || ''
    });
  };

  const handleSaveAddress = async () => {
    if (!addressDetails.full_name || !addressDetails.phone_number) {
      alert('Please enter your name and phone number');
      return false;
    }

    try {
      await createAddress({
        full_name: addressDetails.full_name,
        phone_number: addressDetails.phone_number,
        address_line1: selectedLocation?.address || '',
        city: addressDetails.city,
        county: addressDetails.county,
        latitude: selectedLocation?.lat,
        longitude: selectedLocation?.lng,
        is_default: true
      });
      return true;
    } catch (error) {
      console.error('Failed to save address:', error);
      return false;
    }
  };

  const handlePayment = async () => {
    // Validate phone number for M-Pesa
    if (paymentMethod === 'mpesa' && (!phone || phone.length < 10)) {
      alert('Please enter a valid M-Pesa phone number');
      return;
    }

    // If not skipping address, validate location
    if (!skipAddress && !selectedLocation) {
      alert('Please either pick a delivery location or click "Skip Address"');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Save address only if not skipped and location exists
      if (!skipAddress && selectedLocation) {
        await handleSaveAddress();
      }
      
      // Create order
      const orderResponse = await checkout();
      const { order_id, total: orderTotal } = orderResponse.data;

      if (paymentMethod === 'mpesa') {
        // Initiate M-Pesa payment
        const paymentResponse = await initiatePayment(phone, grandTotal, order_id);
        
        if (paymentResponse.data.ResponseCode === '0') {
          alert('Payment initiated! Please check your phone to complete payment.');
          navigate('/orders');
        } else {
          alert('Payment initiation failed. Please try again.');
        }
      } else {
        // Handle other payment methods (cash on delivery, bank transfer, etc.)
        alert('Order placed successfully! You will receive a confirmation email.');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatMoney = (amount) => {
    return `KSh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Delivery Location */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Location Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FiMapPin className="mr-2" />
                Delivery Location
              </h2>
              {!skipAddress && !showMap && !selectedLocation && (
                <button
                  onClick={() => setSkipAddress(true)}
                  className="text-gray-500 hover:text-gray-700 text-sm flex items-center space-x-1"
                >
                  <FiSkipForward className="w-4 h-4" />
                  <span>Skip Address</span>
                </button>
              )}
            </div>
            
            {skipAddress ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Address Skipped</p>
                    <p className="text-gray-600 text-sm">
                      You can continue without providing a delivery address. 
                      Our support team will contact you for delivery details.
                    </p>
                    <button
                      onClick={() => {
                        setSkipAddress(false);
                        setShowMap(false);
                      }}
                      className="mt-2 text-blue-600 text-sm hover:text-blue-700"
                    >
                      Add Address Instead
                    </button>
                  </div>
                </div>
              </div>
            ) : showMap ? (
              <div>
                <p className="text-gray-600 text-sm mb-4">
                  Pin your exact delivery location on the map below:
                </p>
                <LocationPicker 
                  onLocationSelect={handleLocationSelect}
                  initialLocation={selectedLocation}
                />
                {selectedLocation && (
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => setShowMap(false)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Confirm Location
                    </button>
                    <button
                      onClick={() => {
                        setShowMap(false);
                        setSkipAddress(true);
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Skip Address
                    </button>
                  </div>
                )}
              </div>
            ) : selectedLocation ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <FiNavigation className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Delivery Address</p>
                      <p className="text-gray-600 text-sm">{selectedLocation?.address}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Coordinates: {selectedLocation?.lat?.toFixed(6)}, {selectedLocation?.lng?.toFixed(6)}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMap(true)}
                      className="text-blue-600 text-sm hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={addressDetails.full_name}
                      onChange={(e) => setAddressDetails({...addressDetails, full_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0712345678"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No delivery address selected</p>
                <p className="text-gray-500 text-sm mb-4">You can either add an address or skip this step</p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => setShowMap(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Address
                  </button>
                  <button
                    onClick={() => setSkipAddress(true)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center space-x-2"
                  >
                    <FiSkipForward className="w-4 h-4" />
                    <span>Skip Address</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Methods Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Methods</h2>
            
            {/* Payment Method Options */}
            <div className="space-y-4 mb-6">
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'mpesa' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setPaymentMethod('mpesa')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiSmartphone className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-800">M-Pesa</p>
                      <p className="text-sm text-gray-500">Pay using your M-Pesa account</p>
                    </div>
                  </div>
                  {paymentMethod === 'mpesa' && <FiCheckCircle className="w-6 h-6 text-green-600" />}
                </div>
              </div>

              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiCreditCard className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  {paymentMethod === 'card' && <FiCheckCircle className="w-6 h-6 text-blue-600" />}
                </div>
              </div>

              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiDollarSign className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && <FiCheckCircle className="w-6 h-6 text-purple-600" />}
                </div>
              </div>
            </div>

            {/* M-Pesa Payment Details */}
            {paymentMethod === 'mpesa' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiInfo className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-gray-800">M-Pesa Instructions</p>
                </div>
                <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                  <li>Enter your M-Pesa registered phone number below</li>
                  <li>Click "Pay with M-Pesa" to initiate payment</li>
                  <li>You will receive an STK Push prompt on your phone</li>
                  <li>Enter your M-Pesa PIN to complete the transaction</li>
                  <li>Wait for confirmation and you'll be redirected</li>
                </ol>
                
                <div className="mt-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    M-Pesa Phone Number *
                  </label>
                  <div className="relative">
                    <FiSmartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712345678"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Make sure this number is registered for M-Pesa
                  </p>
                </div>
              </div>
            )}

            {/* Card Payment Details */}
            {paymentMethod === 'card' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiInfo className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-gray-800">Card Payment Details</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your card information is secure and encrypted
                  </p>
                </div>
              </div>
            )}

            {/* Cash on Delivery Details */}
            {paymentMethod === 'cod' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiInfo className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-gray-800">Cash on Delivery</p>
                </div>
                <p className="text-sm text-gray-600">
                  Pay in cash when your order arrives at your doorstep. 
                  Please have the exact amount ready for the delivery person.
                </p>
                <div className="mt-3 bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> A small delivery fee may apply for Cash on Delivery orders.
                  </p>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start space-x-2">
              <FiShield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Your payment information is secure. All transactions are encrypted and protected.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            
            {/* Items List */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto border-b border-gray-200 pb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="font-medium">{item.product.name}</span>
                    <span className="text-gray-500 ml-1">x {item.quantity}</span>
                  </div>
                  <span className="font-semibold">
                    {formatMoney(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Price Breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Fee</span>
                <span className="text-gray-800">
                  {shippingFee === 0 ? 'Free' : formatMoney(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (16%)</span>
                <span className="text-gray-800">{formatMoney(tax)}</span>
              </div>
              {subtotal < 5000 && (
                <div className="bg-yellow-50 p-2 rounded-lg text-xs text-yellow-800">
                  <FiTrendingUp className="inline mr-1" />
                  Add KSh {formatMoney(5000 - subtotal)} more to get free shipping!
                </div>
              )}
            </div>
            
            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">{formatMoney(grandTotal)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Including VAT and shipping fees
              </p>
            </div>

            {/* Delivery Estimate */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center space-x-2">
              <FiClock className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600">
                Estimated delivery: 2-4 business days after payment confirmation
              </p>
            </div>

            {/* Delivery Address Summary */}
            {selectedLocation && !skipAddress && !showMap && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs font-semibold text-green-800 mb-1">Delivering to:</p>
                <p className="text-xs text-green-700">{addressDetails.city || 'Selected location'}</p>
              </div>
            )}

            {skipAddress && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800 flex items-center">
                  <FiAlertCircle className="w-3 h-3 mr-1" />
                  No delivery address provided
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Our team will contact you for delivery details
                </p>
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 font-semibold"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Place Order - ${formatMoney(grandTotal)}`
              )}
            </button>

            {/* Trust Badges */}
            <div className="mt-4 text-center">
              <div className="flex justify-center space-x-4 text-gray-400 text-xs">
                <span className="flex items-center space-x-1">
                  <FiShield className="w-3 h-3" />
                  <span>Secure Payment</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FiClock className="w-3 h-3" />
                  <span>Fast Delivery</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FiPercent className="w-3 h-3" />
                  <span>Best Price</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;