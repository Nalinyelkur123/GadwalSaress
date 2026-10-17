import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartPage: React.FC = () => {
  const {
    items,
    subtotal,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode.trim());
    setCouponMsg({ text: res.message, isError: !res.success });
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const estimatedTax = Math.round(Math.max(0, subtotal - discountAmount) * 0.05);
  const finalTotal = Math.max(0, subtotal - discountAmount) + estimatedTax;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
          <ShoppingBag size={36} />
        </div>
        <h1 className="font-serif text-2xl font-bold text-charcoal-900">Your Handloom Bag is Empty</h1>
        <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
          Explore our authentic handwoven Gadwal sarees directly crafted by master weavers.
        </p>
        <div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-sm"
          >
            <span>Explore Sarees</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-bold text-charcoal-900 mb-8">
        Your Shopping Bag ({items.length} {items.length === 1 ? 'saree' : 'sarees'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ITEM LIST (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-ivory-300 divide-y divide-ivory-300 overflow-hidden shadow-warm-sm">
            {items.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-20 h-24 object-cover object-top rounded border border-ivory-300 flex-shrink-0"
                  />
                  <div>
                    <Link to={`/product/${item.product.slug}`} className="font-serif font-bold text-sm text-charcoal-900 hover:text-brand-800">
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-charcoal-500 mt-0.5">{item.product.fabric}</p>
                    {item.product.seller_name && (
                      <p className="text-[11px] text-gold-600 font-semibold mt-0.5">
                        Weaver: {item.product.seller_name}
                      </p>
                    )}
                    <p className="font-serif font-bold text-sm text-brand-900 mt-2">
                      ₹{item.unit_price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 self-end sm:self-center">
                  <div className="flex items-center border border-ivory-400 rounded bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs text-charcoal-700 hover:bg-ivory-200"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-charcoal-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs text-charcoal-700 hover:bg-ivory-200"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-serif font-bold text-base text-brand-900 w-24 text-right">
                    ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-charcoal-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ORDER SUMMARY (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-charcoal-900 border-b border-ivory-300 pb-3">
              Order Summary
            </h2>

            {/* COUPON */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-xs font-semibold text-charcoal-700">Apply Marketplace Coupon</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. GADWAL10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs rounded border border-ivory-400 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-900 text-gold-300 text-xs font-semibold rounded hover:bg-brand-800"
                >
                  Apply
                </button>
              </div>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-medium">
                <span>Code <b>{appliedCoupon.code}</b> active (-₹{appliedCoupon.discount.toLocaleString('en-IN')})</span>
                <button onClick={removeCoupon} className="text-red-600 font-bold hover:underline">Remove</button>
              </div>
            )}

            {couponMsg && !appliedCoupon && (
              <p className={`text-xs ${couponMsg.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                {couponMsg.text}
              </p>
            )}

            {/* BREAKDOWN */}
            <div className="space-y-2 text-xs text-charcoal-700 pt-3 border-t border-ivory-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span>-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Handloom GST (5%)</span>
                <span>₹{estimatedTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Shipping</span>
                <span className="text-emerald-700 font-semibold">FREE (Pan-India)</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-lg text-brand-900 pt-3 border-t border-ivory-300">
                <span>Total Amount</span>
                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs tracking-wider rounded flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="p-4 bg-ivory-200 rounded-xl border border-ivory-300 space-y-2 text-xs text-charcoal-600">
            <div className="flex items-center gap-2 font-bold text-charcoal-900">
              <ShieldCheck size={16} className="text-gold-600" />
              <span>Authenticity & Buyer Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every saree is woven in Gadwal, Telangana. Inspected for silk mark and authentic kuttu weave before shipment.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
