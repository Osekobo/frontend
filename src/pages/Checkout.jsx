import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FiPercent,
  FiShoppingBag,
  FiTruck,
  FiArrowLeft
} from 'react-icons/fi';

const Checkout = () => {
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [skipAddress, setSkipAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [addressDetails, setAddressDetails] = useState({
    full_name: '',
    phone_number: '',
    address_line1: '',
    city: '',
    county: ''
  });
  const [orderId, setOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  
  const { items, total, fetchCart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Calculate order details
  const subtotal = total;
  const shippingFee = subtotal > 5000 ? 0 : 250;
  const grandTotal = subtotal + shippingFee;

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

  const pollPaymentStatus = async (checkoutRequestId, maxAttempts = 15) => {
    let attempts = 0;
    
    const poll = setInterval(async () => {
      attempts++;
      try {
        const response = await fetch(`https://hardware-backend-12qj.onrender.com/mpesa/status/${checkoutRequestId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        const data = await response.json();
        
        if (data.status === 'paid') {
          clearInterval(poll);
          setPaymentStatus('success');
          alert('Payment successful! Your order has been confirmed.');
          await clearCart();
          navigate('/orders');
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          setPaymentStatus('timeout');
          alert('Payment confirmation is taking longer than expected. Please check your orders page later.');
          navigate('/orders');
        }
      } catch (error) {
        console.error('Status check error:', error);
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setPaymentStatus('error');
        }
      }
    }, 3000);
  };

  const handleCreateOrder = async () => {
    // First, create the order
    const orderItems = items.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const orderResponse = await fetch('https://hardware-backend-12qj.onrender.com/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        items: orderItems,
        total: grandTotal
      })
    });

    const orderData = await orderResponse.json();
    return orderData;
  };

  const handlePayment = async () => {
    if (paymentMethod === 'mpesa' && (!phone || phone.length < 10)) {
      alert('Please enter a valid M-Pesa phone number');
      return;
    }

    if (!skipAddress && !selectedLocation) {
      alert('Please either pick a delivery location or click "Skip Address"');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Save address if not skipped
      if (!skipAddress && selectedLocation) {
        await handleSaveAddress();
      }

      // Create order first
      const orderResponse = await fetch('https://hardware-backend-12qj.onrender.com/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          items: items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          total: grandTotal
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error('Failed to create order');
      }

      const orderId = orderData.order_id;

      if (paymentMethod === 'mpesa') {
        // Initiate M-Pesa STK Push
        const paymentResponse = await fetch('https://hardware-backend-12qj.onrender.com/mpesa/stkpush', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            amount: grandTotal,
            phone_number: phone,
            order_id: orderId
          })
        });

        const paymentData = await paymentResponse.json();

        if (paymentData.success) {
          setCheckoutRequestId(paymentData.checkout_request_id);
          alert(`STK push sent to ${phone}. Please check your phone and enter your PIN to complete payment.`);
          
          // Start polling for payment status
          pollPaymentStatus(paymentData.checkout_request_id);
        } else {
          alert(`Payment initiation failed: ${paymentData.message}`);
          setPaymentStatus('failed');
          setIsProcessing(false);
        }
      } else {
        // Handle other payment methods
        alert('Order placed successfully! You will receive a confirmation email.');
        await clearCart();
        navigate('/orders');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
      setPaymentStatus('failed');
    } finally {
      if (paymentMethod !== 'mpesa') {
        setIsProcessing(false);
      }
    }
  };

  const formatMoney = (amount) => {
    return `KSh ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md mx-auto bg-white border-4 border-black shadow-hard-lg p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-terra/10 border-4 border-terra mb-6">
            <FiShoppingBag className="w-10 h-10 text-terra" />
          </div>
          <h2 className="font-h text-2xl font-bold text-black uppercase mb-4">Your cart is empty</h2>
          <p className="text-ash mb-6">Add some products to your cart before checking out.</p>
          <Link to="/products" className="inline-block bg-terra text-white px-8 py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-24 md:left-8 md:top-28 text-black hover:text-terra transition-colors flex items-center space-x-1 group"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">Checkout</h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Complete your purchase securely</p>
        </div>

        {/* Payment Status Indicator */}
        {paymentStatus === 'processing' && (
          <div className="mb-6 p-4 bg-yellow-50 border-4 border-yellow-500 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 mx-auto mb-2"></div>
            <p className="text-yellow-800 font-semibold">Processing payment... Please check your phone for the STK prompt.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Delivery Location */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Location Section */}
            <div className="bg-white border-4 border-black shadow-hard-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-h text-xl font-bold text-black uppercase flex items-center">
                  <FiMapPin className="mr-2 text-terra" />
                  Delivery Location
                </h2>
                {!skipAddress && !showMap && !selectedLocation && (
                  <button
                    onClick={() => setSkipAddress(true)}
                    className="text-terra hover:text-terra-dark text-sm flex items-center space-x-1 font-semibold"
                  >
                    <FiSkipForward className="w-4 h-4" />
                    <span>Skip Address</span>
                  </button>
                )}
              </div>

              {skipAddress ? (
                <div className="bg-yellow-50 border-2 border-yellow-500 p-4">
                  <div className="flex items-start space-x-3">
                    <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-bold text-black">Address Skipped</p>
                      <p className="text-ash text-sm">
                        You can continue without providing a delivery address.
                        Our support team will contact you for delivery details.
                      </p>
                      <button
                        onClick={() => {
                          setSkipAddress(false);
                          setShowMap(false);
                        }}
                        className="mt-2 text-terra text-sm font-semibold hover:text-terra-dark"
                      >
                        Add Address Instead
                      </button>
                    </div>
                  </div>
                </div>
              ) : showMap ? (
                <div>
                  <p className="text-ash text-sm mb-4">
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
                        className="flex-1 bg-terra text-white py-2 font-bold border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                      >
                        Confirm Location
                      </button>
                      <button
                        onClick={() => {
                          setShowMap(false);
                          setSkipAddress(true);
                        }}
                        className="flex-1 bg-gray-300 text-black py-2 font-bold border-4 border-black hover:bg-gray-400 transition-all"
                      >
                        Skip Address
                      </button>
                    </div>
                  )}
                </div>
              ) : selectedLocation ? (
                <div>
                  <div className="bg-green-50 border-2 border-green-500 p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <FiNavigation className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-black">Delivery Address</p>
                        <p className="text-ash text-sm">{selectedLocation?.address}</p>
                        <p className="text-ash/50 text-xs mt-1">
                          Coordinates: {selectedLocation?.lat?.toFixed(6)}, {selectedLocation?.lng?.toFixed(6)}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowMap(true)}
                        className="text-terra text-sm font-semibold hover:text-terra-dark"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={addressDetails.full_name}
                        onChange={(e) => setAddressDetails({ ...addressDetails, full_name: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                        placeholder="0712345678"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiMapPin className="w-12 h-12 text-ash mx-auto mb-3" />
                  <p className="text-ash">No delivery address selected</p>
                  <p className="text-ash/60 text-sm mb-4">You can either add an address or skip this step</p>
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={() => setShowMap(true)}
                      disabled={true}  // ✅ This disables the button
                      className="bg-terra text-white px-4 py-2 font-bold border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                    >
                      Add Address
                    </button>
                    <button
                      onClick={() => setSkipAddress(true)}
                      className="bg-gray-300 text-black px-4 py-2 font-bold border-4 border-black hover:bg-gray-400 flex items-center space-x-2 transition-all"
                    >
                      <FiSkipForward className="w-4 h-4" />
                      <span>Skip Address</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Methods Section */}
            <div className="bg-white border-4 border-black shadow-hard-sm p-6">
              <h2 className="font-h text-xl font-bold text-black uppercase mb-4 flex items-center">
                <FiSmartphone className="mr-2 text-terra" />
                Payment Methods
              </h2>

              <div className="space-y-4 mb-6">
                {/* M-Pesa Option */}
                <div
                  className={`border-4 cursor-pointer transition-all p-4 ${paymentMethod === 'mpesa' ? 'border-terra bg-terra/10' : 'border-black hover:border-terra/50'
                    }`}
                  onClick={() => setPaymentMethod('mpesa')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FiSmartphone className="w-6 h-6 text-terra" />
                      <div>
                        <p className="font-h font-bold text-black">M-Pesa</p>
                        <p className="text-sm text-ash">Pay using your M-Pesa account</p>
                      </div>
                    </div>
                    {paymentMethod === 'mpesa' && <FiCheckCircle className="w-6 h-6 text-terra" />}
                  </div>
                </div>

                {/* Card Option */}
                <div
                  className={`border-4 cursor-pointer transition-all p-4 ${paymentMethod === 'card' ? 'border-terra bg-terra/10' : 'border-black hover:border-terra/50'
                    }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FiCreditCard className="w-6 h-6 text-terra" />
                      <div>
                        <p className="font-h font-bold text-black">Credit/Debit Card</p>
                        <p className="text-sm text-ash">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                    {paymentMethod === 'card' && <FiCheckCircle className="w-6 h-6 text-terra" />}
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  className={`border-4 cursor-pointer transition-all p-4 ${paymentMethod === 'cod' ? 'border-terra bg-terra/10' : 'border-black hover:border-terra/50'
                    }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FiDollarSign className="w-6 h-6 text-terra" />
                      <div>
                        <p className="font-h font-bold text-black">Cash on Delivery</p>
                        <p className="text-sm text-ash">Pay when you receive your order</p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && <FiCheckCircle className="w-6 h-6 text-terra" />}
                  </div>
                </div>
              </div>

              {/* M-Pesa Payment Details */}
              {paymentMethod === 'mpesa' && (
                <div className="bg-terra/5 border-2 border-terra p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiInfo className="w-5 h-5 text-terra" />
                    <p className="font-bold text-black">M-Pesa Instructions</p>
                  </div>
                  <ol className="space-y-1 text-sm text-ash list-decimal list-inside">
                    <li>Enter your M-Pesa registered phone number below</li>
                    <li>Click "Pay with M-Pesa" to initiate payment</li>
                    <li>You will receive an STK Push prompt on your phone</li>
                    <li>Enter your M-Pesa PIN to complete the transaction</li>
                    <li>Wait for confirmation and you'll be redirected</li>
                  </ol>

                  <div className="mt-4">
                    <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                      M-Pesa Phone Number *
                    </label>
                    <div className="relative">
                      <FiSmartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ash" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0712345678"
                        className="w-full pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    <p className="text-xs text-ash mt-1">
                      Make sure this number is registered for M-Pesa
                    </p>
                  </div>
                </div>
              )}

              {/* Card Payment Details */}
              {paymentMethod === 'card' && (
                <div className="bg-terra/5 border-2 border-terra p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiInfo className="w-5 h-5 text-terra" />
                    <p className="font-bold text-black">Card Payment Details</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-ash">
                      Your card information is secure and encrypted
                    </p>
                  </div>
                </div>
              )}

              {/* Cash on Delivery Details */}
              {paymentMethod === 'cod' && (
                <div className="bg-terra/5 border-2 border-terra p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiInfo className="w-5 h-5 text-terra" />
                    <p className="font-bold text-black">Cash on Delivery</p>
                  </div>
                  <p className="text-sm text-ash">
                    Pay in cash when your order arrives at your doorstep.
                    Please have the exact amount ready for the delivery person.
                  </p>
                  <div className="mt-3 bg-yellow-50 border-2 border-yellow-500 p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> A small delivery fee may apply for Cash on Delivery orders.
                    </p>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-terra/5 border-2 border-terra flex items-start space-x-2">
                <FiShield className="w-5 h-5 text-terra flex-shrink-0 mt-0.5" />
                <p className="text-xs text-black">
                  Your payment information is secure. All transactions are encrypted and protected.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-4 border-black shadow-hard-lg p-6 sticky top-20">
              <h2 className="font-h text-xl font-bold text-black uppercase text-center mb-4">Order Summary</h2>
              <div className="brick-line mx-auto mb-6"></div>

              {/* Items List */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto border-b-2 border-black pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-bold text-black">{item.product.name}</span>
                      <span className="text-ash ml-1">x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-terra">
                      {formatMoney(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ash">Subtotal</span>
                  <span className="font-bold text-black">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ash">Shipping Fee</span>
                  <span className="font-bold text-black">
                    {shippingFee === 0 ? 'Free' : formatMoney(shippingFee)}
                  </span>
                </div>
                {subtotal < 5000 && (
                  <div className="bg-yellow-50 border-2 border-yellow-500 p-2 text-xs text-yellow-800">
                    <FiTrendingUp className="inline mr-1" />
                    Add {formatMoney(5000 - subtotal)} more to get free shipping!
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t-2 border-black pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="font-h text-black">Total</span>
                  <span className="font-h text-2xl text-terra">{formatMoney(grandTotal)}</span>
                </div>
                <p className="text-xs text-ash mt-1">
                  Including shipping fees. No VAT charged.
                </p>
              </div>

              {/* Delivery Estimate */}
              <div className="bg-terra/5 border-2 border-terra p-3 mb-4 flex items-center space-x-2">
                <FiTruck className="w-4 h-4 text-terra" />
                <p className="text-xs text-black font-semibold">
                  Estimated delivery: 2-4 business days after payment confirmation
                </p>
              </div>

              {/* Delivery Address Summary */}
              {selectedLocation && !skipAddress && !showMap && (
                <div className="mb-4 p-3 bg-green-50 border-2 border-green-500">
                  <p className="text-xs font-bold text-green-800 mb-1">Delivering to:</p>
                  <p className="text-xs text-green-700">{addressDetails.city || 'Selected location'}</p>
                </div>
              )}

              {skipAddress && (
                <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-500">
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
                className="w-full bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>{paymentMethod === 'mpesa' ? 'Initiating Payment...' : 'Processing...'}</span>
                  </div>
                ) : (
                  `Place Order - ${formatMoney(grandTotal)}`
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-4 text-center">
                <div className="flex justify-center space-x-4 text-ash text-xs">
                  <span className="flex items-center space-x-1">
                    <FiShield className="w-3 h-3 text-terra" />
                    <span>Secure Payment</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FiClock className="w-3 h-3 text-terra" />
                    <span>Fast Delivery</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FiPercent className="w-3 h-3 text-terra" />
                    <span>Best Price</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;