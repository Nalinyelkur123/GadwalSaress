import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Address } from '../../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, appliedCoupon, refreshCart } = useCart();
  const { user, setIsAuthModalOpen } = useAuth();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<Address>({
    full_name: '',
    phone: '',
    street_address: '',
    apartment: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });

  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await api.get('/customer/addresses');
        const list = res.data || [];
        setSavedAddresses(list);
        if (list.length > 0) {
          setSelectedAddressId(list[0].id);
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddresses();
  }, [user]);

  // Fetch authoritative summary from backend
  useEffect(() => {
    const fetchSummary = async () => {
      if (!items || items.length === 0) return;
      try {
        setLoadingSummary(true);
        const res = await api.post('/checkout/summary', {
          items: items.map(i => ({ productId: i.product_id, quantity: i.quantity })),
          couponCode: appliedCoupon?.code,
        });
        setSummary(res.data);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || 'Failed to calculate checkout summary.');
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, [items, appliedCoupon]);

  const getEffectiveShippingAddress = (): Address | null => {
    if (isAddingNewAddress) {
      if (!addressForm.full_name || !addressForm.phone || !addressForm.street_address || !addressForm.city || !addressForm.postal_code) {
        return null;
      }
      return addressForm;
    }
    return savedAddresses.find(a => a.id === selectedAddressId) || null;
  };

  const handlePay = async () => {
    setErrorMsg(null);
    const shippingAddress = getEffectiveShippingAddress();
    if (!shippingAddress) {
      setErrorMsg('Please select or complete your delivery shipping address.');
      return;
    }

    setProcessingPayment(true);
    try {
      // 1. Create Order on Backend
      const orderPayload = {
        items: items.map(i => ({ productId: i.product_id, quantity: i.quantity })),
        shippingAddress,
        couponCode: appliedCoupon?.code,
      };

      const res = await api.post('/checkout/create-order', orderPayload);
      const { orderId, orderNumber, finalAmount, razorpayOrderId, razorpayKeyId } = res.data;

      // 2. Open Razorpay Checkout or Sandbox Simulation
      if (typeof window.Razorpay !== 'undefined' && razorpayKeyId && !razorpayKeyId.includes('mock')) {
        const options = {
          key: razorpayKeyId,
          amount: finalAmount * 100,
          currency: 'INR',
          name: 'Gadwal Weaves',
          description: `Order ${orderNumber}`,
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            await verifyAndCompletePayment({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, orderNumber);
          },
          prefill: {
            name: user?.full_name || shippingAddress.full_name,
            email: user?.email || '',
            contact: shippingAddress.phone,
          },
          theme: {
            color: '#5C101D',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // High-Fidelity Sandbox Simulation for Instant Testing
        const simulatedPaymentId = `pay_sim_${Date.now()}`;
        const simulatedSignature = `simulated_sig_${Date.now()}`;
        await verifyAndCompletePayment({
          orderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: simulatedPaymentId,
          razorpay_signature: simulatedSignature,
        }, orderNumber);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to initialize payment.');
      setProcessingPayment(false);
    }
  };

  const verifyAndCompletePayment = async (verificationPayload: any, orderNumber: string) => {
    try {
      const res = await api.post('/checkout/verify-payment', verificationPayload);
      if (res.data.verified) {
        await refreshCart();
        navigate(`/order-success/${orderNumber}`);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Payment signature verification failed.');
      setProcessingPayment(false);
    }
  };

  if (!items.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-xl font-bold text-charcoal-800">Your bag is empty</h2>
        <button onClick={() => navigate('/shop')} className="mt-4 px-5 py-2 bg-brand-700 text-white rounded text-xs">
          Explore Sarees
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Checkout</h1>
        <p className="text-xs text-charcoal-500 mt-1">Review your order and select your delivery destination.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT FORM (7 cols): Address & Fulfillment Groups */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SHIPPING ADDRESS SELECTION */}
          <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-warm-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2">
              <Truck size={18} className="text-gold-600" />
              <span>1. Shipping Address</span>
            </h2>

            {savedAddresses.length > 0 && !isAddingNewAddress && (
              <div className="space-y-3">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-700 bg-brand-50/40 ring-1 ring-brand-700'
                        : 'border-ivory-300 hover:border-ivory-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id!)}
                          className="accent-brand-700"
                        />
                        <span className="font-bold text-xs text-charcoal-900">{addr.full_name}</span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-ivory-300 text-charcoal-700 px-2 py-0.5 rounded font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-charcoal-500 font-mono">{addr.phone}</span>
                    </div>
                    <p className="text-xs text-charcoal-600 mt-2 pl-6">
                      {addr.street_address}, {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                  </label>
                ))}

                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(true)}
                  className="text-xs text-brand-700 font-semibold hover:underline mt-2 block"
                >
                  + Add New Address
                </button>
              </div>
            )}

            {isAddingNewAddress && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={addressForm.full_name}
                      onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat number, building, road, area"
                    value={addressForm.street_address}
                    onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Hyderabad"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      placeholder="Telangana"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="500034"
                      value={addressForm.postal_code}
                      onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                    />
                  </div>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(false)}
                    className="text-xs text-charcoal-500 hover:underline block"
                  >
                    Cancel & choose saved address
                  </button>
                )}
              </div>
            )}
          </div>

          {/* MULTI-SELLER FULFILLMENT PREVIEW */}
          {summary?.sellerGroups && (
            <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-warm-sm space-y-3">
              <h2 className="font-serif font-bold text-base text-charcoal-900">
                2. Weaver Fulfillment Groups
              </h2>
              <p className="text-xs text-charcoal-500">
                Your order is packed directly at certified weaver looms in Gadwal, Telangana.
              </p>
              <div className="space-y-2 pt-2">
                {summary.sellerGroups.map((g: any) => (
                  <div key={g.sellerId} className="flex justify-between items-center p-3 rounded bg-ivory-100 border border-ivory-300 text-xs">
                    <div>
                      <span className="font-bold text-charcoal-900 block">{g.sellerName}</span>
                      <span className="text-charcoal-500">{g.itemsCount} {g.itemsCount === 1 ? 'item' : 'items'} • Pit loom dispatched</span>
                    </div>
                    <span className="font-serif font-bold text-brand-900">₹{g.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SUMMARY & PAYMENT (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-charcoal-900 border-b border-ivory-300 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-charcoal-500">{items.length} items</span>
            </h2>

            {/* ITEM MINI LIST */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex space-x-3 items-center">
                  <img src={i.product.images[0]} alt={i.product.title} className="w-12 h-14 object-cover object-top rounded border border-ivory-300" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-charcoal-900 truncate">{i.product.title}</p>
                    <p className="text-[11px] text-charcoal-500">Qty: {i.quantity} × ₹{i.unit_price.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="font-serif font-bold text-xs text-brand-900">₹{i.subtotal.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* BREAKDOWN */}
            {summary && (
              <div className="space-y-2 text-xs text-charcoal-700 pt-3 border-t border-ivory-300">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span>₹{summary.totalItemsPrice.toLocaleString('en-IN')}</span>
                </div>
                {summary.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon ({summary.couponCode})</span>
                    <span>-₹{summary.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Handloom GST (5%)</span>
                  <span>₹{summary.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Handloom Delivery</span>
                  <span className="text-emerald-700 font-semibold">FREE (Pan-India)</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-lg text-brand-900 pt-3 border-t border-ivory-300">
                  <span>Payable Amount</span>
                  <span>₹{summary.finalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* PAY BUTTON */}
            <button
              onClick={handlePay}
              disabled={processingPayment || loadingSummary}
              className="w-full py-3.5 bg-brand-700 hover:bg-brand-800 disabled:bg-charcoal-400 text-white font-medium text-xs tracking-wider rounded flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Lock size={14} />
              <span>{processingPayment ? 'Securing Payment...' : `Pay Securely via Razorpay (₹${summary?.finalAmount.toLocaleString('en-IN')})`}</span>
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-charcoal-500 pt-2">
              <ShieldCheck size={14} className="text-gold-600" />
              <span>Razorpay 256-bit SSL Encrypted • Card, UPI, NetBanking</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
