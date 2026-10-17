import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ivory-200 border-t border-ivory-300 text-charcoal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-gold-300 font-serif font-bold text-lg border-2 border-gold-400">
                GW
              </div>
              <div>
                <span className="font-serif font-bold text-xl text-brand-900 block leading-tight">
                  Gadwal Weaves
                </span>
                <span className="text-[9px] tracking-[0.2em] text-gold-600 font-semibold block uppercase">
                  Handwoven Authentic Sarees
                </span>
              </div>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed max-w-sm">
              Authentic Gadwal handlooms, directly from weavers. Preserving centuries of heritage, supporting artisan pit-loom weavers in Telangana, and bringing the timeless beauty of authentic kuttu interlock borders directly to your home.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <span className="w-8 h-8 rounded-full bg-brand-700 text-gold-200 flex items-center justify-center text-xs font-bold hover:bg-brand-800 transition-colors cursor-pointer">IG</span>
              <span className="w-8 h-8 rounded-full bg-brand-700 text-gold-200 flex items-center justify-center text-xs font-bold hover:bg-brand-800 transition-colors cursor-pointer">FB</span>
              <span className="w-8 h-8 rounded-full bg-brand-700 text-gold-200 flex items-center justify-center text-xs font-bold hover:bg-brand-800 transition-colors cursor-pointer">PT</span>
              <span className="w-8 h-8 rounded-full bg-brand-700 text-gold-200 flex items-center justify-center text-xs font-bold hover:bg-brand-800 transition-colors cursor-pointer">YT</span>
            </div>
          </div>

          {/* SHOP COLUMN */}
          <div>
            <h4 className="font-serif font-bold text-brand-900 text-sm tracking-wide mb-4">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shop" className="hover:text-brand-700 transition-colors">All Sarees</Link></li>
              <li><Link to="/shop?category=pure-silk-sarees" className="hover:text-brand-700 transition-colors">Pure Silk Sarees</Link></li>
              <li><Link to="/shop?category=silk-cotton-sarees" className="hover:text-brand-700 transition-colors">Silk Cotton (Sico)</Link></li>
              <li><Link to="/shop?category=bridal-collection" className="hover:text-brand-700 transition-colors">Bridal Collection</Link></li>
              <li><Link to="/shop?category=temple-border-sarees" className="hover:text-brand-700 transition-colors">Temple Border Sarees</Link></li>
              <li><Link to="/shop?category=kuttu-sarees" className="hover:text-brand-700 transition-colors">Kuttu Weave Sarees</Link></li>
              <li><Link to="/shop?category=new-arrivals" className="hover:text-brand-700 transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* QUICK LINKS & SUPPORT */}
          <div>
            <h4 className="font-serif font-bold text-brand-900 text-sm tracking-wide mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-brand-700 transition-colors">About Us</Link></li>
              <li><Link to="/weavers" className="hover:text-brand-700 transition-colors">Our Weavers</Link></li>
              <li><Link to="/craft-and-heritage" className="hover:text-brand-700 transition-colors">The Art of Gadwal</Link></li>
              <li><Link to="/track-order" className="hover:text-brand-700 transition-colors">Track Order</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-brand-700 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns-policy" className="hover:text-brand-700 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-brand-700 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-700 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h4 className="font-serif font-bold text-brand-900 text-sm tracking-wide mb-4">Contact Us</h4>
            <div className="space-y-3 text-xs text-charcoal-600">
              <div className="flex items-start space-x-2">
                <MapPin size={15} className="text-gold-600 mt-0.5 flex-shrink-0" />
                <span>Weavers Colony, Gadwal, Telangana 509125, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={15} className="text-gold-600 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={15} className="text-gold-600 flex-shrink-0" />
                <span>support@gadwalweaves.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={15} className="text-gold-600 flex-shrink-0" />
                <span>Mon - Sat, 9:00 AM - 6:00 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM STRIP */}
        <div className="border-t border-ivory-300 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-4">
          <p>© {new Date().getFullYear()} Gadwal Weaves. Handwoven authentic sarees with pride in India.</p>
          <div className="flex items-center space-x-3 text-[11px] font-semibold text-charcoal-600">
            <span className="px-2 py-1 bg-white rounded border border-ivory-300">Razorpay</span>
            <span className="px-2 py-1 bg-white rounded border border-ivory-300">VISA</span>
            <span className="px-2 py-1 bg-white rounded border border-ivory-300">Mastercard</span>
            <span className="px-2 py-1 bg-white rounded border border-ivory-300">UPI / NetBanking</span>
            <span className="px-2 py-1 bg-white rounded border border-ivory-300">Shiprocket Logistics</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
