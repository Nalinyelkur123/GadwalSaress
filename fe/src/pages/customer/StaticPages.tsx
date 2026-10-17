import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, Award, CheckCircle2, Search } from 'lucide-react';
import { api } from '../../services/api';

export const CraftAndHeritage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase">
          Living Tradition
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          The Craft & Heritage of Gadwal Weaves
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
          Dating back over 300 years to the royal rulers of the Gadwal Samsthanam, Gadwal handlooms represent one of India's most extraordinary weaving achievements.
        </p>
      </div>

      <div className="aspect-video rounded-2xl overflow-hidden shadow-warm-lg">
        <img
          src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1400&auto=format&fit=crop&q=80"
          alt="Weaver at pit loom"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        <h2 className="font-serif text-2xl font-bold text-brand-900">
          The Secret of the 'Kuttu' Interlock
        </h2>
        <p>
          Unlike ordinary mill-woven sarees where borders are printed or sewn onto a fabric body, authentic Gadwal sarees employ the <b>Kuttu</b> (interlocked weft) technique. Two weavers sit across a wooden pit loom operating three shuttles simultaneously.
        </p>
        <p>
          The central body shuttle carries unbleached fine cotton or lightweight mulberry silk, while the two outer border shuttles carry heavy, lustrous silk and pure zari. At every single pick of the loom, the border threads and body threads are painstakingly interlocked by hand, creating a seamless join that will never unravel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-ivory-300">
        <div className="p-5 bg-white rounded-xl border border-ivory-300 space-y-2">
          <Award size={20} className="text-gold-600" />
          <h3 className="font-serif font-bold text-sm text-charcoal-900">GI Tagged</h3>
          <p className="text-xs text-charcoal-600">Geographical Indication (GI) certified under Intellectual Property India.</p>
        </div>
        <div className="p-5 bg-white rounded-xl border border-ivory-300 space-y-2">
          <ShieldCheck size={20} className="text-gold-600" />
          <h3 className="font-serif font-bold text-sm text-charcoal-900">Pure Tested Zari</h3>
          <p className="text-xs text-charcoal-600">Pure silver and gold dipped traditional motifs including the temple kumbha.</p>
        </div>
        <div className="p-5 bg-white rounded-xl border border-ivory-300 space-y-2">
          <CheckCircle2 size={20} className="text-gold-600" />
          <h3 className="font-serif font-bold text-sm text-charcoal-900">12–18 Days per Saree</h3>
          <p className="text-xs text-charcoal-600">Every single saree is a unique masterpiece that takes weeks of pit loom labor.</p>
        </div>
      </div>
    </div>
  );
};

export const AboutUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase">Our Mission</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">About Gadwal Weaves</h1>
      </div>
      <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        Gadwal Weaves was established to bridge the gap between discerning saree connoisseurs worldwide and the master weavers of Gadwal, Telangana. By eliminating layers of traditional wholesale middlemen, we ensure that artisan weaver families receive fair compensation while customers receive genuine, certified handlooms with complete transparency.
      </p>
    </div>
  );
};

export const TrackOrderPage: React.FC = () => {
  const [awb, setAwb] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/shipping/track/${awb.trim()}`);
      setTrackingData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Track Your Saree Shipment</h1>
        <p className="text-xs text-charcoal-500">Enter your Shiprocket AWB tracking number or Order Reference.</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder="e.g. SR7891234567"
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs rounded border border-ivory-400 font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold"
        >
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </form>

      {trackingData && (
        <div className="p-6 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-4">
          <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
            <div>
              <span className="text-xs text-charcoal-500">Courier Partner</span>
              <h4 className="font-bold text-xs text-charcoal-900">{trackingData.courier}</h4>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-800 uppercase tracking-wider">
              {trackingData.status}
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {trackingData.events.map((ev: any, i: number) => (
              <div key={i} className="flex items-start space-x-3 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-700 mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-charcoal-900">{ev.status}</p>
                  <p className="text-[11px] text-charcoal-500">{ev.location} • {new Date(ev.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
