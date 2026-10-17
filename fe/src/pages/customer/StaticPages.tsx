import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Award, 
  CheckCircle2, 
  Search, 
  HelpCircle, 
  FileText, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Clock 
} from 'lucide-react';
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
      <div className="p-8 bg-white rounded-2xl border border-ivory-300 shadow-warm-sm space-y-4 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        <p>
          Gadwal Weaves was established to bridge the gap between discerning saree connoisseurs worldwide and the master pit-loom weavers of Gadwal, Telangana. By eliminating layers of traditional wholesale middlemen, we ensure that artisan weaver families receive fair compensation while customers receive genuine, certified handlooms with complete transparency.
        </p>
        <p>
          Each saree featured on our platform comes directly from registered pit-loom weaver cooperatives and master artisans residing in Gadwal town and surrounding villages in Jogulamba Gadwal district. Every saree is backed by GI (Geographical Indication) tag authentication and Silk Mark certification.
        </p>
      </div>
    </div>
  );
};

export const ContactUs: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase">Customer Support</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">Get in Touch</h1>
        <p className="text-xs text-charcoal-600 max-w-md mx-auto">
          Have inquiries about authentic Gadwal handlooms, custom orders, or delivery status? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-charcoal-900">Headquarters & Artisan Loom Center</h3>
          <div className="space-y-3 text-charcoal-600">
            <div className="flex items-start space-x-2">
              <MapPin size={16} className="text-gold-600 mt-0.5 flex-shrink-0" />
              <span>Weavers Colony, Main Samsthanam Road, Gadwal, Telangana 509125, India</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} className="text-gold-600 flex-shrink-0" />
              <span>+91 98765 43210 / +91 98111 22334</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={16} className="text-gold-600 flex-shrink-0" />
              <span>support@gadwalweaves.in</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gold-600 flex-shrink-0" />
              <span>Monday to Saturday, 9:00 AM - 6:00 PM IST</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          {submitted ? (
            <div className="p-6 text-center space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
              <h4 className="font-serif font-bold text-sm text-charcoal-900">Message Received!</h4>
              <p className="text-xs text-charcoal-600">Our handloom concierge will respond to your inquiry within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Your Full Name</label>
                <input required type="text" placeholder="e.g. Radhika Rao" className="w-full px-3 py-2 border border-ivory-400 rounded outline-none focus:border-brand-700" />
              </div>
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Email Address</label>
                <input required type="email" placeholder="name@domain.com" className="w-full px-3 py-2 border border-ivory-400 rounded outline-none focus:border-brand-700" />
              </div>
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Inquiry / Message</label>
                <textarea required rows={3} placeholder="How can we assist you with Gadwal sarees?" className="w-full px-3 py-2 border border-ivory-400 rounded outline-none focus:border-brand-700" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded font-semibold transition-colors">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const ShippingPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <Truck size={36} className="mx-auto text-gold-600" />
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Shipping & Logistics Policy</h1>
        <p className="text-xs text-charcoal-500">Pan-India insured handloom logistics via Shiprocket Air Express.</p>
      </div>

      <div className="p-8 bg-white rounded-2xl border border-ivory-300 shadow-warm-sm space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        <div>
          <h3 className="font-serif font-bold text-base text-brand-900 mb-2">1. Insured Domestic Shipping</h3>
          <p>We provide free, fully-insured shipping across all 28 states and 8 union territories of India on all handloom orders. Every parcel is packed in multi-layer water-resistant box packaging with tamper-evident security tape.</p>
        </div>
        <div>
          <h3 className="font-serif font-bold text-base text-brand-900 mb-2">2. Dispatch & Delivery Timelines</h3>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><b>Ready to Ship Handlooms:</b> Dispatched from weaver looms in Gadwal within 24 to 48 business hours.</li>
            <li><b>Metro Cities (Hyderabad, Bengaluru, Chennai, Mumbai, Delhi NCR):</b> 2 to 3 business days via BlueDart Air Express.</li>
            <li><b>Rest of India:</b> 3 to 5 business days via Shiprocket priority courier networks.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-serif font-bold text-base text-brand-900 mb-2">3. Tracking & Real-Time Updates</h3>
          <p>As soon as the artisan packs your saree, an official Shiprocket AWB tracking number is generated and synchronized directly to your account. You will receive live status milestones via SMS and WhatsApp.</p>
        </div>
      </div>
    </div>
  );
};

export const ReturnsRefundPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <RotateCcw size={36} className="mx-auto text-gold-600" />
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Returns & Refund Policy</h1>
        <p className="text-xs text-charcoal-500">7-Day Hassle-Free Handloom Authenticity Guarantee.</p>
      </div>

      <div className="p-8 bg-white rounded-2xl border border-ivory-300 shadow-warm-sm space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        <div>
          <h3 className="font-serif font-bold text-base text-brand-900 mb-2">1. 7-Day Return Window</h3>
          <p>We stand behind the authentic craftsmanship of every Gadwal saree. If you are not completely satisfied with your purchase, you may initiate a return request from your Customer Account within 7 days of delivery.</p>
        </div>
        <div>
          <h3 className="font-serif font-bold text-base text-brand-900 mb-2">2. Return Eligibility Conditions</h3>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>The saree must be unworn, unwashed, and undamaged.</li>
            <li>Original Silk Mark / GI tags and handloom seals must remain intact.</li>
            <li>Folded in original muslin packaging with invoice enclosed.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-serif font-bold text-base text-brand-900 mb-2">3. Razorpay Refund Processing</h3>
          <p>Once the returned parcel is received at our inspection facility and verified, our administration initiates a direct refund via Razorpay to your original payment method (Bank Account, UPI, or Card). Refunds reflect within 3 to 5 business days.</p>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <Lock size={36} className="mx-auto text-gold-600" />
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Privacy & Data Protection</h1>
        <p className="text-xs text-charcoal-500">Your privacy is fundamental to our marketplace operations.</p>
      </div>

      <div className="p-8 bg-white rounded-2xl border border-ivory-300 shadow-warm-sm space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        <div>
          <h3 className="font-serif font-bold text-base text-brand-900 mb-2">1. Information We Collect</h3>
          <p>We collect essential order fulfillment details including your name, shipping address, contact phone number, and email. We do not store raw credit card numbers or banking passwords—all transactions are tokenized via PCI-DSS compliant Razorpay servers.</p>
        </div>
        <div>
          <h3 className="font-serif font-bold text-base text-brand-900 mb-2">2. Use of Information</h3>
          <p>Information collected is strictly utilized to process your handloom orders, arrange Shiprocket courier pickup and delivery, generate invoices, and send tracking notifications.</p>
        </div>
      </div>
    </div>
  );
};

export const TermsAndConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <FileText size={36} className="mx-auto text-gold-600" />
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Terms of Service</h1>
        <p className="text-xs text-charcoal-500">Authentic multi-vendor marketplace terms and conditions.</p>
      </div>

      <div className="p-8 bg-white rounded-2xl border border-ivory-300 shadow-warm-sm space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        <div>
          <h3 className="font-serif font-bold text-base text-brand-900 mb-2">1. Handloom Irregularities & Uniqueness</h3>
          <p>Authentic pit-loom Gadwal sarees are handcrafted by human artisans over 12 to 18 days. Slight variations in weave tension, border interlock picks, or zari shades are natural hallmarks of genuine handwoven pit-loom textiles and are not considered manufacturing defects.</p>
        </div>
        <div>
          <h3 className="font-serif font-bold text-base text-brand-900 mb-2">2. Pricing & Payments</h3>
          <p>All prices are listed in Indian Rupees (INR) inclusive of 5% Handloom GST. Prices are set authoritatively by certified weavers and verified by marketplace administrators.</p>
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const faqs = [
    {
      q: 'How do I know if a Gadwal saree is authentic?',
      a: 'Authentic Gadwal sarees feature the distinctive "Kuttu" (interlocked weft) border where the silk/zari border is seamlessly joined with the cotton or silk body by three-shuttle pit-loom weaving. Every saree on our platform carries the official Geographical Indication (GI) tag and Silk Mark certification.'
    },
    {
      q: 'What is the difference between Pure Silk and Sico Gadwal sarees?',
      a: 'Pure Silk Gadwal sarees feature mulberry silk in both warp and weft for a regal, rich drape. Sico (Silk-Cotton) sarees feature a pure unbleached cotton body with a rich pure silk and zari border and pallu, making them lightweight, breathable, and ideal for festive daytime wear.'
    },
    {
      q: 'How should I care for and store my Gadwal handloom?',
      a: 'Always dry-clean authentic Gadwal sarees. Store them wrapped in a clean, soft muslin cloth or pure cotton saree bag. Refold every 3 to 4 months along different crease lines to preserve the zari threads.'
    },
    {
      q: 'Do sarees include a matching blouse piece?',
      a: 'Yes, all standard Gadwal handlooms include an attached running 0.8-meter unstitched blouse piece in matching silk with zari border detailing.'
    },
    {
      q: 'Can I track my courier parcel live?',
      a: 'Yes! Navigate to Track Order in the top navigation bar and enter your Shiprocket AWB tracking number to see live transit events from the Gadwal loom to your doorstep.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <HelpCircle size={36} className="mx-auto text-gold-600" />
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Frequently Asked Questions</h1>
        <p className="text-xs text-charcoal-500">Everything you need to know about authentic Gadwal handlooms and our marketplace.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-6 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-charcoal-900">{faq.q}</h4>
            <p className="text-charcoal-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrackOrderPage: React.FC = () => {
  const [awb, setAwb] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/shipping/track/${awb.trim()}`);
      setTrackingData(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Tracking details unavailable for this reference.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <Truck size={36} className="mx-auto text-gold-600" />
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Track Your Saree Shipment</h1>
        <p className="text-xs text-charcoal-500">Enter your Shiprocket AWB tracking number (e.g. SR7891234567) or Order Reference.</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder="e.g. SR7891234567"
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs rounded border border-ivory-400 font-mono outline-none focus:border-brand-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </form>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs text-center">
          {errorMsg}
        </div>
      )}

      {trackingData && (
        <div className="p-6 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-4">
          <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-charcoal-400">Carrier Partner</span>
              <h4 className="font-bold text-xs text-charcoal-900">{trackingData.courier}</h4>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-800 uppercase tracking-wider">
              {trackingData.status.replace(/_/g, ' ')}
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

          <div className="pt-3 border-t border-ivory-200 text-xs text-charcoal-500 text-center">
            Estimated Delivery: <b>{trackingData.estimated_delivery}</b> (Insured Air Express)
          </div>
        </div>
      )}
    </div>
  );
};
