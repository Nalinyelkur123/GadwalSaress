import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, Printer, Truck, ShieldCheck } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      {/* SUCCESS ICON */}
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
        <CheckCircle2 size={44} />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase">
          Order Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Thank You for Supporting Authentic Weavers!
        </h1>
        <p className="text-xs text-charcoal-600 max-w-md mx-auto leading-relaxed">
          Your order has been placed successfully and transmitted directly to the master weavers in Gadwal, Telangana.
        </p>
      </div>

      {/* ORDER NUMBER CARD */}
      <div className="p-6 bg-white rounded-xl border border-ivory-300 shadow-warm-sm max-w-md mx-auto space-y-3">
        <div className="text-xs text-charcoal-500 uppercase tracking-wider font-semibold">
          Order Reference
        </div>
        <div className="font-mono font-bold text-2xl text-brand-900">
          {orderNumber}
        </div>
        <p className="text-[11px] text-charcoal-500">
          A confirmation receipt and courier tracking details will be sent to your email.
        </p>
      </div>

      {/* FULFILLMENT TIMELINE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
        <div className="p-4 rounded-lg bg-ivory-100 border border-ivory-300 space-y-1">
          <span className="text-[10px] font-bold text-brand-800 uppercase block">Step 1</span>
          <h4 className="font-serif font-bold text-xs text-charcoal-900">Loom Packing</h4>
          <p className="text-[11px] text-charcoal-600">Weavers inspect the kuttu borders and carefully wrap in muslin cloth.</p>
        </div>

        <div className="p-4 rounded-lg bg-ivory-100 border border-ivory-300 space-y-1">
          <span className="text-[10px] font-bold text-brand-800 uppercase block">Step 2</span>
          <h4 className="font-serif font-bold text-xs text-charcoal-900">Shiprocket Air Express</h4>
          <p className="text-[11px] text-charcoal-600">Dispatched with full transit insurance and live SMS tracking.</p>
        </div>

        <div className="p-4 rounded-lg bg-ivory-100 border border-ivory-300 space-y-1">
          <span className="text-[10px] font-bold text-brand-800 uppercase block">Step 3</span>
          <h4 className="font-serif font-bold text-xs text-charcoal-900">Doorstep Delivery</h4>
          <p className="text-[11px] text-charcoal-600">Delivered within 2-4 business days across India.</p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to="/account"
          className="px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-sm transition-colors"
        >
          View My Orders
        </Link>
        <Link
          to="/shop"
          className="px-6 py-3 border border-brand-700 text-brand-700 hover:bg-brand-50 rounded text-xs font-semibold transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
