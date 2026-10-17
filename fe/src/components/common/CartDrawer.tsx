import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode.trim());
    setCouponStatus(res.message);
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const estimatedTax = Math.round(Math.max(0, subtotal - discountAmount) * 0.05);
  const finalTotal = Math.max(0, subtotal - discountAmount) + estimatedTax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* BACKDROP */}
      <div 
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-warm-lg flex flex-col">
          
          {/* HEADER */}
          <div className="p-5 border-b border-ivory-300 flex items-center justify-between bg-ivory-100">
            <div className="flex items-center space-x-2">
              <ShoppingBag size={20} className="text-brand-700" />
              <h2 className="font-serif font-bold text-lg text-charcoal-900">
                Your Handloom Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1 rounded-full text-charcoal-500 hover:text-charcoal-800 hover:bg-ivory-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* ITEM LIST */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-700">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="font-serif font-bold text-base text-charcoal-800">Your bag is empty</h3>
                <p className="text-xs text-charcoal-500">
                  Explore our authentic handwoven Gadwal sarees crafted by generational weavers.
                </p>
                <button
                  onClick={() => { setIsCartDrawerOpen(false); navigate('/shop'); }}
                  className="px-5 py-2.5 bg-brand-700 text-white rounded text-xs font-semibold hover:bg-brand-800 transition-colors"
                >
                  Explore Sarees
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex space-x-3.5 pb-4 border-b border-ivory-300">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-20 h-24 object-cover object-top rounded border border-ivory-300"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-semibold text-xs text-charcoal-900 line-clamp-2">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-charcoal-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[11px] text-charcoal-500 mt-0.5">{item.product.fabric}</p>
                      {item.product.seller_name && (
                        <p className="text-[10px] text-gold-600 font-medium">Weaver: {item.product.seller_name}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-ivory-400 rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-charcoal-600 hover:bg-ivory-200"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-semibold text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-charcoal-600 hover:bg-ivory-200"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-serif font-bold text-xs text-brand-900">
                        ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER & CHECKOUT SUMMARY */}
          {items.length > 0 && (
            <div className="p-5 border-t border-ivory-300 bg-ivory-100 space-y-3.5">
              
              {/* COUPON INPUT */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon (e.g. GADWAL10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 text-xs rounded border border-ivory-400 bg-white uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-brand-900 text-gold-300 rounded text-xs font-semibold hover:bg-brand-800 transition-colors"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                  <span>Coupon <b>{appliedCoupon.code}</b> applied (-₹{appliedCoupon.discount.toLocaleString('en-IN')})</span>
                  <button onClick={removeCoupon} className="text-red-600 hover:underline font-bold text-[11px]">Remove</button>
                </div>
              )}

              {couponStatus && !appliedCoupon && (
                <p className="text-[11px] text-amber-800">{couponStatus}</p>
              )}

              {/* PRICE BREAKDOWN */}
              <div className="space-y-1.5 text-xs text-charcoal-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
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
                <div className="flex justify-between font-serif font-bold text-sm text-brand-900 pt-2 border-t border-ivory-300">
                  <span>Estimated Total</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-charcoal-500 justify-center">
                <ShieldCheck size={14} className="text-gold-600" />
                <span>100% Authentic Handloom Guarantee • Verified Weavers</span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => { setIsCartDrawerOpen(false); navigate('/cart'); }}
                  className="w-full py-2.5 px-3 border border-brand-700 text-brand-700 font-medium text-xs rounded hover:bg-brand-50 transition-colors"
                >
                  View Full Bag
                </button>
                <button
                  onClick={() => { setIsCartDrawerOpen(false); navigate('/checkout'); }}
                  className="w-full py-2.5 px-3 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Checkout</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
